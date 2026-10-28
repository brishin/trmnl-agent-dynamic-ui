import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import Ajv from 'ajv';
const check=new Ajv({allErrors:true}).compile(JSON.parse(fs.readFileSync(new URL('schemas/v2.json',import.meta.url))));
export const shapes={editorial:['brief','metric','list'],spotlight:['metric','brief','agenda'],timeline:['agenda','list'],scoreboard:['metric','metric','metric','metric','brief'],focus:['brief','list'],dispatch:['brief','table','agenda'],almanac:['month','dates'],weekahead:['week','brief'],countdown:['brief','dates']};
export function validate(p){
 if(!check(p))throw Error(JSON.stringify(check.errors));
 if(p.blocks.map(b=>b.type).join(',')!==shapes[p.layout].join(','))throw Error('Components must match this composition: '+shapes[p.layout].join(', '));
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
 if(p.layout==='countdown'&&p.blocks[0].text.length>120)throw Error('Countdown brief text must be at most 120 characters');
 if(p.layout==='almanac'&&p.blocks[1].items.length>3)throw Error('Almanac rail holds at most 3 dates');
 return p;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{validate(JSON.parse(fs.readFileSync(process.argv[2])));console.log('Valid v2 screen');}catch(e){console.error(e.message);process.exitCode=1;}}
