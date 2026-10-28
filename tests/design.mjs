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
const conditions=JSON.parse(read('src/schemas/v2.json')).definitions.condition.enum;
const W=n=>'Wide Mammoth Words '.repeat(12).slice(0,n);
const leaf={month:'SEPT',day:'30',weekday:'WED',until:W(12),text:W(36)};
Object.assign(gallery,{
'stress-almanac':{schema_version:2,layout:'almanac',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'month',title:W(18),first_weekday:7,days_in_month:31,today:31,marked:[1,2,3,4,5,6,7,8,9,10]},{type:'dates',title:W(32),items:[leaf,leaf,leaf]}]},
'stress-weekahead':{schema_version:2,layout:'weekahead',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'week',title:W(32),days:Array.from({length:7},(_,i)=>({weekday:'WED',day:'30',today:i===3,items:[W(18),W(18)]}))},{type:'brief',title:W(24),text:W(120)}]},
'stress-outlook-range':{schema_version:2,layout:'outlook',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'forecast',title:W(32),unit:'°F',mode:'range',now:{temp:119,label:W(10),trend:'rising'},periods:conditions.slice(0,7).map((c,i)=>({label:'WED 30',condition:c,low:-99+i*20,high:-99+i*20+i*15}))},{type:'brief',title:W(24),text:W(120)}]},
'stress-outlook-point':{schema_version:2,layout:'outlook',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'forecast',title:W(32),unit:'°C',mode:'point',now:{temp:-99,label:W(10),trend:'falling'},periods:conditions.slice(7,14).map((c,i)=>({label:'12 AM',condition:c,low:-40+i*9}))},{type:'brief',title:W(24),text:W(120)}]},
'stress-outlook-flat':{schema_version:2,layout:'outlook',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'forecast',title:W(32),unit:'°F',mode:'range',now:{temp:50,label:W(10)},periods:conditions.slice(14,21).map(c=>({label:'WED 30',condition:c,low:50,high:50}))},{type:'brief',title:W(24),text:W(120)}]},
'stress-trend':{schema_version:2,layout:'trend',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'range',title:W(32),unit:'kWh·',now:{value:-999,label:W(10),trend:'steady'},bars:Array.from({length:7},(_,i)=>({label:'WED 30',low:-999,high:9999-i,level:i%4}))},{type:'brief',title:W(24),text:W(120)}]},
'stress-inline-icons':{schema_version:2,layout:'timeline',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'agenda',title:W(32),items:Array.from({length:3},()=>({time:'12:30',icon:conditions[21],text:W(38)}))},{type:'list',title:W(32),items:Array.from({length:3},()=>({text:W(48),icon:'thunderstorm'}))}]},
'stress-countdown':{schema_version:2,layout:'countdown',heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'brief',title:W(32),text:W(120)},{type:'dates',title:W(32),items:[leaf,leaf,leaf,leaf]}]}});
// Fill every column count to the validator's limits: widest allowed labels and values, then parts until the height budget refuses more.
const fit=JSON.parse(read('src/design/columns.json'));
const kinds=['text','event','metric','list','badge','range'];
const part=(kind,L,i)=>({text:{kind,text:W(L),icon:'thunderstorm'},event:{kind,time:'12:30',text:W(Math.min(L,48)),icon:'hail'},metric:{kind,value:'88888'.slice(0,Math.max(1,Math.min(5,L/4|0))),text:W(Math.min(L,24)),icon:'snow'},list:{kind,items:[W(Math.min(L,24)),W(Math.min(L,24)),W(Math.min(L,24))]},badge:{kind,text:W(Math.min(L,12))},range:{kind,low:-i,high:i*13,level:i%4}})[kind];
const fitted=(layout,n)=>{
 const inner=fit.row_px/n-fit.column_inset_px,p={schema_version:2,layout,heading:W(30),updated_at:'TUE 27 OCT · 7:30 AM · SAMPLE',blocks:[{type:'columns',title:W(32),unit:'°',columns:Array.from({length:n},(_,i)=>({label:W(Math.min(12,inner/14|0)).trimEnd(),...((inner-32)/24>=1?{value:'8888'.slice(0,Math.min(4,(inner-32)/24|0)),icon:'heavy-rain'}:{icon:'heavy-rain'}),highlight:i===1,content:[]}))}]};
 if(layout==='weekahead')p.blocks.push({type:'brief',title:W(24),text:W(120)});
 p.blocks[0].columns.forEach((c,i)=>{for(let j=0;j<12&&c.content.length<6;j++)for(const L of [60,24,12,6,4]){c.content.push(part(kinds[(i+j)%6],L,i));try{validate(p);break;}catch{c.content.pop();}}});
 return p;};
for(let n=2;n<=8;n++){gallery['stress-board-'+n]=fitted('board',n);gallery['stress-weekahead-columns-'+n]=fitted('weekahead',n);}
const reject=(name,edit)=>{const p=structuredClone(gallery[name]);edit(p);assert.throws(()=>validate(p));};
reject('08-weekahead',p=>p.blocks[0].days[0].today=true);
reject('08-weekahead',p=>p.blocks.reverse());
reject('08-weekahead',p=>p.blocks[0].days.push(p.blocks[0].days[0]));
reject('07-almanac',p=>p.blocks[0].marked.push(32));
reject('07-almanac',p=>{p.blocks[0].days_in_month=30;p.blocks[0].today=31;});
reject('07-almanac',p=>p.blocks[1].items.push(p.blocks[1].items[0]));
reject('10-outlook',p=>p.blocks.reverse());
reject('10-outlook',p=>p.blocks[0].periods[0].low=99);
reject('10-outlook',p=>p.blocks[0].periods[0].condition='windy');
reject('10-outlook',p=>p.blocks[0].periods.push(p.blocks[0].periods[0]));
reject('10-outlook',p=>p.blocks[0].now.temp=1000);
reject('uc-13-hourly-outlook',p=>p.blocks[0].periods[0].high=12);
reject('11-trend',p=>p.blocks[0].bars[0].low=99);
reject('11-trend',p=>p.blocks[0].now.value=12.25);
reject('uc-14-saturday-plans',p=>p.blocks[0].items[0].icon='sunny');
reject('12-board',p=>p.blocks[0].columns[0].highlight=true);
reject('12-board',p=>p.blocks[0].columns[2].content.push({kind:'text',text:'Another long errand to run'},{kind:'text',text:'And one more after that'},{kind:'badge',text:'Today'}));
reject('12-board',p=>p.blocks[0].columns[0].content[0]={kind:'columns',content:[]});
reject('12-board',p=>p.blocks[0].columns[0].content[0].content=[]);
reject('12-board',p=>p.blocks.push({type:'brief',title:'Extra',text:'Board takes columns only.'}));
reject('uc-18-eight-day-temps',p=>p.blocks[0].columns[0].label='SUNDAY');
reject('uc-18-eight-day-temps',p=>p.blocks[0].columns[0].content[0].low=99);
reject('uc-18-eight-day-temps',p=>p.blocks[0].columns.push(p.blocks[0].columns[1]));
reject('uc-17-school-week',p=>p.blocks[0].columns[1].content[0].text='Election day');
reject('09-countdown',p=>p.blocks[1].items[0].day='8th');
const typography=JSON.parse(read('src/design/tokens.json')).typography;
const css=read('vendor/trmnl/plugins.css');
const font=fs.readFileSync(new URL('vendor/trmnl/Inter.ttf',root)).toString('base64');
const engine=new Liquid();
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
const page=await browser.newPage({viewport:{width:800,height:480},deviceScaleFactor:1});
await page.route('**/*',r=>{const icon=r.request().url().match(/^https:\/\/trmnl\.com\/images\/plugins\/weather\/(wi-[a-z-]+\.svg)$/);return icon?r.fulfill({contentType:'image/svg+xml',body:fs.readFileSync(new URL('vendor/weather-icons/'+icon[1],root))}):r.abort();});
const results=[],iconFiles=new Set();
for(const [name,data] of Object.entries(gallery)){
validate(data);
fs.writeFileSync(new URL(name+".json",output),JSON.stringify(data,null,2)+"\n");
const markup=await engine.parseAndRender(read('dist/full.liquid'),data);
const doc=`<!doctype html><html><head><meta charset="utf-8"><style>${css}@font-face{font-family:"Inter Variable";font-style:normal;font-weight:100 900;src:url(data:font/ttf;base64,${font})}</style></head><body class="environment trmnl"><div class="screen"><div class="view view--full">${markup}</div></div></body></html>`;
await page.setContent(doc,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const readability=await page.evaluate(()=>[...document.querySelectorAll('.dui *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>{const s=getComputedStyle(e);return {text:e.textContent.trim().slice(0,35),size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight)};}));
assert(readability.every(t=>t.size>=typography.minimum_font_size_px && (t.size>typography.small_text_max_size_px || t.weight>=typography.small_text_min_weight)),'Readability floor violated: '+JSON.stringify(readability));
const inks=await page.evaluate(()=>[...document.querySelectorAll('.dui *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>getComputedStyle(e).color));
assert(inks.every(c=>c==='rgb(0, 0, 0)'||c==='rgb(255, 255, 255)'),'Text must be black or white: '+[...new Set(inks)]);
await page.evaluate(()=>Promise.all([...document.images].map(i=>i.complete||new Promise(r=>{i.onload=i.onerror=r;}))));
const icons=await page.evaluate(()=>[...document.querySelectorAll('.dui-wx')].map(e=>{const r=e.getBoundingClientRect();return {src:e.getAttribute('src'),w:r.width,h:r.height,loaded:e.complete&&e.naturalWidth>0};}));
assert(icons.every(i=>i.w>0&&i.h>0&&i.loaded),'Weather icons must load and render: '+JSON.stringify(icons));
for(const i of icons)iconFiles.add(i.src);
assert.equal(await page.locator('.dui-footer').count(),0,'Decorative footer must not return');
const bounds=await page.evaluate(()=>[...document.querySelectorAll('.dui-block')].map(e=>({height:e.clientHeight,scroll:e.scrollHeight,width:e.clientWidth,scrollWidth:e.scrollWidth})));
await page.screenshot({path:new URL(name+'.png',output).pathname});
console.log(name,JSON.stringify(bounds));
assert(bounds.every(b=>b.scroll<=b.height+1&&b.scrollWidth<=b.width+1),'Overflow in '+name);
fs.writeFileSync(new URL(name+'.html',output),doc.replace(/<style>[\s\S]*?<\/style>/,`<link rel="stylesheet" href="../../vendor/trmnl/plugins.css"><style>@font-face{font-family:"Inter Variable";font-style:normal;font-weight:100 900;src:url(../../vendor/trmnl/Inter.ttf)}</style>`));
results.push({name,pass:true,bounds});
}
assert.equal(iconFiles.size,fs.readdirSync(new URL('vendor/weather-icons/',root)).filter(f=>f.endsWith('.svg')).length,'Every vendored icon must be reachable from a condition: '+[...iconFiles]);
fs.writeFileSync(new URL('render-results.json',output),JSON.stringify(results,null,2));
}finally{await browser.close();}
