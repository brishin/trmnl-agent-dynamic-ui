import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Liquid} from 'liquidjs';
import {chromium} from 'playwright';
import {validate} from './validate.mjs';
const root=new URL('./',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const gallery=JSON.parse(read('gallery.json'));
const typography=JSON.parse(read('../design-system.json')).typography;
const css=read('../assets/plugins.css');
const font=fs.readFileSync(new URL('../assets/Inter.ttf',root)).toString('base64');
const engine=new Liquid();
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
const page=await browser.newPage({viewport:{width:800,height:480},deviceScaleFactor:1});
await page.route('**/*',r=>r.abort());
const results=[];
for(const [name,data] of Object.entries(gallery)){
validate(data);
fs.writeFileSync(new URL(name+".json",root),JSON.stringify(data,null,2)+"\n");
const markup=await engine.parseAndRender(read('../full.liquid'),data);
const doc=`<!doctype html><html><head><meta charset="utf-8"><style>${css}@font-face{font-family:"Inter Variable";font-style:normal;font-weight:100 900;src:url(data:font/ttf;base64,${font})}</style></head><body class="environment trmnl"><div class="screen"><div class="view view--full">${markup}</div></div></body></html>`;
await page.setContent(doc,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const readability=await page.evaluate(()=>[...document.querySelectorAll('.dui *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>{const s=getComputedStyle(e);return {text:e.textContent.trim().slice(0,35),size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight)};}));
assert(readability.every(t=>t.size>=typography.minimum_font_size_px && (t.size>typography.small_text_max_size_px || t.weight>=typography.small_text_min_weight)),'Readability floor violated: '+JSON.stringify(readability));
assert.equal(await page.locator('.dui-footer').count(),0,'Decorative footer must not return');
const bounds=await page.evaluate(()=>[...document.querySelectorAll('.dui-block')].map(e=>({height:e.clientHeight,scroll:e.scrollHeight,width:e.clientWidth,scrollWidth:e.scrollWidth})));
await page.screenshot({path:new URL(name+'.png',root).pathname});
console.log(name,JSON.stringify(bounds));
assert(bounds.every(b=>b.scroll<=b.height+1&&b.scrollWidth<=b.width+1),'Overflow in '+name);
fs.writeFileSync(new URL(name+'.html',root),doc.replace(/<style>[\s\S]*?<\/style>/,`<link rel="stylesheet" href="../assets/plugins.css"><style>@font-face{font-family:"Inter Variable";font-style:normal;font-weight:100 900;src:url(../assets/Inter.ttf)}</style>`));
results.push({name,pass:true,bounds});
}
fs.writeFileSync(new URL('render-results.json',root),JSON.stringify(results,null,2));
}finally{await browser.close();}
