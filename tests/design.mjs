import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Liquid} from 'liquidjs';
import {chromium} from 'playwright';
import {validate} from '../src/validate-v2.mjs';
const root=new URL('../',import.meta.url);
const output=new URL('artifacts/design/',root);
fs.mkdirSync(output,{recursive:true});
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const gallery={...JSON.parse(read('examples/v2/gallery.json')),...JSON.parse(read('examples/v2/use-cases.json'))};
const W=n=>'Wide Mammoth Words '.repeat(12).slice(0,n);
const leaf={month:'SEPT',day:'30',weekday:'WED',until:W(12),text:W(36)};
Object.assign(gallery,{
'stress-almanac':{schema_version:2,layout:'almanac',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'month',title:W(18),first_weekday:7,days_in_month:31,today:31,marked:[1,2,3,4,5,6,7,8,9,10]},{type:'dates',title:W(32),items:[leaf,leaf,leaf]}]},
'stress-weekahead':{schema_version:2,layout:'weekahead',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'week',title:W(32),days:Array.from({length:7},(_,i)=>({weekday:'WED',day:'30',today:i===3,items:[W(18),W(18)]}))},{type:'brief',title:W(24),text:W(120)}]},
'stress-countdown':{schema_version:2,layout:'countdown',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'brief',title:W(32),text:W(120)},{type:'dates',title:W(32),items:[leaf,leaf,leaf,leaf]}]}});
const reject=(name,edit)=>{const p=structuredClone(gallery[name]);edit(p);assert.throws(()=>validate(p));};
reject('08-weekahead',p=>p.blocks[0].days[0].today=true);
reject('08-weekahead',p=>p.blocks.reverse());
reject('08-weekahead',p=>p.blocks[0].days.push(p.blocks[0].days[0]));
reject('07-almanac',p=>p.blocks[0].marked.push(32));
reject('07-almanac',p=>{p.blocks[0].days_in_month=30;p.blocks[0].today=31;});
reject('07-almanac',p=>p.blocks[1].items.push(p.blocks[1].items[0]));
reject('09-countdown',p=>p.blocks[1].items[0].day='8th');
const typography=JSON.parse(read('src/design/tokens.json')).typography;
const css=read('vendor/trmnl/plugins.css');
const font=fs.readFileSync(new URL('vendor/trmnl/Inter.ttf',root)).toString('base64');
const engine=new Liquid();
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
const page=await browser.newPage({viewport:{width:800,height:480},deviceScaleFactor:1});
await page.route('**/*',r=>r.abort());
const results=[];
for(const [name,data] of Object.entries(gallery)){
validate(data);
fs.writeFileSync(new URL(name+".json",output),JSON.stringify(data,null,2)+"\n");
const markup=await engine.parseAndRender(read('dist/full.liquid'),data);
const doc=`<!doctype html><html><head><meta charset="utf-8"><style>${css}@font-face{font-family:"Inter Variable";font-style:normal;font-weight:100 900;src:url(data:font/ttf;base64,${font})}</style></head><body class="environment trmnl"><div class="screen"><div class="view view--full">${markup}</div></div></body></html>`;
await page.setContent(doc,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const readability=await page.evaluate(()=>[...document.querySelectorAll('.dui *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>{const s=getComputedStyle(e);return {text:e.textContent.trim().slice(0,35),size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight)};}));
assert(readability.every(t=>t.size>=typography.minimum_font_size_px && (t.size>typography.small_text_max_size_px || t.weight>=typography.small_text_min_weight)),'Readability floor violated: '+JSON.stringify(readability));
assert.equal(await page.locator('.dui-footer').count(),0,'Decorative footer must not return');
const bounds=await page.evaluate(()=>[...document.querySelectorAll('.dui-block')].map(e=>({height:e.clientHeight,scroll:e.scrollHeight,width:e.clientWidth,scrollWidth:e.scrollWidth})));
await page.screenshot({path:new URL(name+'.png',output).pathname});
console.log(name,JSON.stringify(bounds));
assert(bounds.every(b=>b.scroll<=b.height+1&&b.scrollWidth<=b.width+1),'Overflow in '+name);
fs.writeFileSync(new URL(name+'.html',output),doc.replace(/<style>[\s\S]*?<\/style>/,`<link rel="stylesheet" href="../../vendor/trmnl/plugins.css"><style>@font-face{font-family:"Inter Variable";font-style:normal;font-weight:100 900;src:url(../../vendor/trmnl/Inter.ttf)}</style>`));
results.push({name,pass:true,bounds});
}
fs.writeFileSync(new URL('render-results.json',output),JSON.stringify(results,null,2));
}finally{await browser.close();}
