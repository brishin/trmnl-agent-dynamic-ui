import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import Ajv from 'ajv';
const check=new Ajv({allErrors:true}).compile(JSON.parse(fs.readFileSync(new URL('schemas/v2.json',import.meta.url))));
export const shapes={editorial:['brief','metric','list'],spotlight:['metric','brief','agenda'],timeline:['agenda','list'],scoreboard:['metric','metric','metric','metric','brief'],focus:['brief','list'],dispatch:['brief','table','agenda'],almanac:['month','dates'],weekahead:['week|columns','brief'],countdown:['brief','dates'],outlook:['forecast','brief'],trend:['range','brief'],board:['columns']};
const fit=JSON.parse(fs.readFileSync(new URL('design/columns.json',import.meta.url)));
// Greedy wrap at whole words; a word longer than a line breaks anywhere, as overflow-wrap does.
const lines=(s,chars)=>{let n=1,used=0;for(const w of s.split(' ')){const need=used?used+1+w.length:w.length;if(need<=chars)used=need;else{n+=(used?1:0)+Math.ceil(w.length/chars)-1;used=w.length%chars||chars;}}return n;};
export function columnsFit(b,layout){
 const n=b.columns.length,inner=fit.row_px/n-fit.column_inset_px,g=fit.glyph_px,c=fit.cost_px,chars=Math.floor(inner/g.body),iconChars=Math.ceil(fit.icon_px.inline/g.body);
 const wide=(ok,what)=>{if(!ok)throw Error(what+' is too wide for '+n+' columns; body lines fit '+chars+' characters');};
 if(b.columns.filter(x=>x.highlight).length>1)throw Error('Columns highlight at most one column');
 for(const col of b.columns){
  wide(col.label.length*g.label<=inner,'Column label '+JSON.stringify(col.label));
  wide((col.value?.length??0)*g.value+(col.icon?fit.icon_px.value:0)<=inner,'Column value');
  let h=c.label+(col.value||col.icon?c.value:0);
  for(const p of col.content??[]){
   const t=(x,icon)=>lines((icon?'x'.repeat(iconChars)+' ':'')+x,chars)*c.line;
   if(p.kind==='text')h+=c.part+t(p.text,p.icon);
   if(p.kind==='event')h+=c.part+t(p.time)+t(p.text,p.icon);
   if(p.kind==='metric'){wide(p.value.length*g.metric+(p.icon?fit.icon_px.value:0)<=inner,'Metric value');h+=c.part+c.metric_value+t(p.text);}
   if(p.kind==='list')h+=c.part+p.items.reduce((a,x)=>a+lines(x,chars-1)*c.line,0);
   if(p.kind==='badge'){wide(p.text.length*g.badge+16<=inner,'Badge');h+=c.badge;}
   if(p.kind==='range'){if(p.low>p.high)throw Error('Range parts need low <= high');wide(String(p.low+'–'+p.high+(b.unit??'')).length*g.body<=inner,'Range text');h+=c.part+c.line+c.bar;}
  }
  if(h>fit.height_px[layout])throw Error('Column '+JSON.stringify(col.label)+' needs about '+h+'px; '+layout+' columns hold '+fit.height_px[layout]+'px');
 }
}
export function validate(p){
 if(!check(p))throw Error(JSON.stringify(check.errors));
 if(p.blocks.length!==shapes[p.layout].length||p.blocks.some((b,i)=>!shapes[p.layout][i].split('|').includes(b.type)))throw Error('Components must match this composition: '+shapes[p.layout].join(', '));
 if(Buffer.byteLength(JSON.stringify({merge_variables:p}))>5000)throw Error('Webhook exceeds 5 kB');
 for(const b of p.blocks)if(b.type==='table'&&b.rows.some(r=>r.length!==b.headers.length))throw Error('Table rows must match headers');
 const hero=p.blocks[0];
 if(p.layout==='spotlight'&&hero.value.length>3)throw Error('Spotlight needs a short value, at most 3 characters');
 if(p.layout==='scoreboard'&&p.blocks.slice(0,4).some(b=>b.value.length>4))throw Error('Scoreboard values must be at most 4 characters');
 if(p.layout==='focus'&&hero.title.length>24)throw Error('Focus headline must be at most 24 characters');
 for(const b of p.blocks){
  if(b.type==='week'&&b.days.filter(d=>d.today).length>1)throw Error('A week marks at most one day as today');
  if(b.type==='month'&&[b.today??1,...(b.marked??[])].some(d=>d>b.days_in_month))throw Error('Month days must not exceed days_in_month');
 }
 if(p.layout==='almanac'&&p.blocks[0].title.length>18)throw Error('Almanac month title must be at most 18 characters');
 if(p.layout==='weekahead'&&(p.blocks[1].title.length>24||p.blocks[1].text.length>120))throw Error('Weekahead brief must be at most 24/120 characters');
 if(p.layout==='countdown'&&p.blocks[0].text.length>120)throw Error('Countdown brief text must be at most 120 characters');
 if((p.layout==='outlook'||p.layout==='trend')&&(p.blocks[1].title.length>24||p.blocks[1].text.length>120))throw Error('Outlook and trend briefs must be at most 24/120 characters');
 for(const b of p.blocks){
  if(b.type==='forecast'){
   if(b.mode==='point'&&b.periods.some(x=>'high' in x))throw Error('Point forecasts give one temperature per period as low');
   if(b.mode==='range'&&b.periods.some(x=>!('high' in x)||x.low>x.high))throw Error('Range forecasts need low <= high in every period');
  }
  if(b.type==='columns')columnsFit(b,p.layout);
  if(b.type==='range'&&b.bars.some(x=>x.low>x.high))throw Error('Range bars need low <= high');
  if(b.type==='forecast'&&[b.now?.temp,...b.periods.flatMap(x=>[x.low,x.high])].some(v=>v!==undefined&&String(Math.round(v)).length>3))throw Error('Forecast temperatures display at most 3 characters');
  if(b.type==='range'&&[b.now?.value,...b.bars.flatMap(x=>[x.low,x.high])].some(v=>v!==undefined&&String(v).length>4))throw Error('Range values display at most 4 characters, e.g. 14.2 or -999');
 }
 if(p.layout==='almanac'&&p.blocks[1].items.length>3)throw Error('Almanac rail holds at most 3 dates');
 return p;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{validate(JSON.parse(fs.readFileSync(process.argv[2])));console.log('Valid v2 screen');}catch(e){console.error(e.message);process.exitCode=1;}}
