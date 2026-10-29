import fs from 'node:fs';
import {Liquid} from 'liquidjs';
import {chromium} from 'playwright';
import {compose,policy,tokens,classes} from '../src/screen.mjs';
const root=new URL('../',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root));
const frameworkCss=read('vendor/trmnl/plugins.css').toString();
const font=read('vendor/trmnl/Inter.ttf').toString('base64');
const engine=new Liquid();
export const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Runs in the page: markup policy errors and design-lint warnings.
function lint({policy,ty}){
 const errors=[],warnings=[],screen=document.querySelector('.dui');
 const where=e=>e.tagName.toLowerCase()+(e.className?'.'+[...e.classList].join('.'):'')+(e.textContent.trim()?' "'+e.textContent.trim().slice(0,30)+'"':'');
 const all=[...screen.querySelectorAll('*')];
 if(!all.length||!screen.textContent.trim())errors.push('Screen is empty');
 for(const e of all){
  const tag=e.tagName.toLowerCase();
  if(!policy.tags.includes(tag)){errors.push('Tag <'+tag+'> is not allowed');continue;}
  for(const a of e.attributes){
   if(!policy.attributes.includes(a.name))errors.push('Attribute '+a.name+' is not allowed on '+where(e));
  }
  for(const c of e.classList){
   if(!policy.classes.includes(c))errors.push('Class '+c+' is not in the design system ('+where(e)+')');
   else if(c.startsWith('bg--gray-')&&!e.classList.contains('s-bar-fill'))errors.push('Gray fills are only for .s-bar-fill, not '+where(e));
  }
  if(e.hasAttribute('style')){
   for(let i=0;i<e.style.length;i++){
    const name=e.style[i],range=policy.style_properties[name],value=e.style.getPropertyValue(name).trim();
    if(!range)errors.push('Inline style '+name+' is not allowed on '+where(e));
    else if(!/^-?\d+(\.\d+)?$/.test(value)||+value<range[0]||+value>range[1])errors.push(name+' must be a number from '+range[0]+' to '+range[1]+', not "'+value+'"');
   }
  }
  if(tag==='img'&&!policy.icon_sources.includes(e.getAttribute('src')))errors.push('Image source '+e.getAttribute('src')+' is not a weather icon');
  if(tag==='img'&&!e.classList.contains('i-icon'))errors.push('Icons need class i-icon');
 }
 const stamp=screen.querySelector('[data-updated]');
 if(!stamp||!stamp.textContent.trim())errors.push('One element needs data-updated with the honest content time');
 const inverse=all.filter(e=>e.classList.contains('s-inverse')&&!e.matches('.s-ring,.s-badge')&&!e.parentElement.closest('.s-inverse'));
 if(inverse.length>policy.limits.max_inverse_regions)warnings.push(inverse.length+' inverse regions; keep one focal inverse region');
 const sizes=new Set(all.filter(e=>!e.classList.contains('f-unit')&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>getComputedStyle(e).fontSize));
 if(sizes.size>policy.limits.max_type_sizes)warnings.push(sizes.size+' text sizes ('+[...sizes].join(', ')+'); use at most '+policy.limits.max_type_sizes);
 for(const e of screen.querySelectorAll('.t-display,.t-headline'))if(e.textContent.trim().length>policy.limits.max_display_chars)warnings.push('Display text over '+policy.limits.max_display_chars+' characters: '+where(e));
 return {errors,warnings};
}

// Runs in the page: readability, ink, icon and overflow errors.
function measure({ty}){
 const errors=[],screen=document.querySelector('.dui'),box=screen.getBoundingClientRect();
 const where=e=>e.tagName.toLowerCase()+(e.className?'.'+[...e.classList].join('.'):'')+(e.textContent.trim()?' "'+e.textContent.trim().slice(0,30)+'"':'');
 for(const e of screen.querySelectorAll('*')){
  const s=getComputedStyle(e);
  if([...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())){
   const size=parseFloat(s.fontSize),weight=parseFloat(s.fontWeight);
   if(size<ty.minimum_font_size_px||(size<=ty.small_text_max_size_px&&weight<ty.small_text_min_weight))errors.push('Text below the readability floor ('+size+'px/'+weight+'): '+where(e));
   if(s.color!=='rgb(0, 0, 0)'&&s.color!=='rgb(255, 255, 255)')errors.push('Text must be black or white, not '+s.color+': '+where(e));
  }
  if(e.tagName==='IMG'&&!(e.complete&&e.naturalWidth>0))errors.push('Icon did not load: '+e.getAttribute('src'));
  const r=e.getBoundingClientRect();
  if(r.width&&r.height&&(r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1))errors.push('Outside the screen: '+where(e));
  // Clipping containers report content that no longer fits; glyph ink past a line box is not overflow.
  if(s.overflow!=='visible'&&e.clientHeight>0&&(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1))errors.push(`Overflows by ${Math.max(e.scrollWidth-e.clientWidth,0)}x${Math.max(e.scrollHeight-e.clientHeight,0)}px: `+where(e));
 }
 if(screen.scrollHeight>screen.clientHeight+1||screen.scrollWidth>screen.clientWidth+1)errors.push('Screen content overflows the 800x480 frame');
 return errors;
}

export async function withRenderer(fn){
 const browser=await chromium.launch({executablePath:CHROME,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:tokens.screen.width_px,height:tokens.screen.height_px},deviceScaleFactor:1});
  // Serve the remote weather icons from the vendored copies; block every other request.
  await page.route('**/*',r=>{const icon=r.request().url().match(/^https:\/\/trmnl\.com\/images\/plugins\/weather\/(wi-[a-z-]+\.svg)$/);return icon?r.fulfill({contentType:'image/svg+xml',body:read('vendor/weather-icons/'+icon[1])}):r.abort();});
  return await fn(async(fragment,{png,html}={})=>{
   const full=compose(fragment);
   const markup=await engine.parseAndRender(full,{});
   const doc=`<!doctype html><html><head><meta charset="utf-8"><style>${frameworkCss}@font-face{font-family:"Inter Variable";font-style:normal;font-weight:100 900;src:url(data:font/ttf;base64,${font})}</style></head><body class="environment trmnl"><div class="screen"><div class="view view--full">${markup}</div></div></body></html>`;
   await page.setContent(doc,{waitUntil:'load'});
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>Promise.all([...document.images].map(i=>i.complete||new Promise(r=>{i.onload=i.onerror=r;}))));
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const args={policy:{...policy,classes},ty:tokens.typography};
   const {errors,warnings}=await page.evaluate(lint,args);
   errors.push(...await page.evaluate(measure,args));
   if(png)await page.screenshot({path:png});
   if(html)fs.writeFileSync(html,doc.replace(/<style>[\s\S]*?<\/style>/,`<link rel="stylesheet" href="${new URL('vendor/trmnl/plugins.css',root).pathname}">`));
   return {full,markup,errors:[...new Set(errors)],warnings};
  });
 }finally{await browser.close();}
}
