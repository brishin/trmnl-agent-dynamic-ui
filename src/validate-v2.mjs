import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import Ajv from 'ajv';
const check=new Ajv({allErrors:true}).compile(JSON.parse(fs.readFileSync(new URL('schemas/v2.json',import.meta.url))));
export const shapes={editorial:['brief','metric','list'],spotlight:['metric','brief','agenda'],timeline:['agenda','list'],scoreboard:['metric','metric','metric','metric','brief'],focus:['brief','list'],dispatch:['brief','table','agenda']};
export function validate(p){
 if(!check(p))throw Error(JSON.stringify(check.errors));
 if(p.blocks.map(b=>b.type).join(',')!==shapes[p.layout].join(','))throw Error('Components must match this composition: '+shapes[p.layout].join(', '));
 if(Buffer.byteLength(JSON.stringify({merge_variables:p}))>5000)throw Error('Webhook exceeds 5 kB');
 for(const b of p.blocks)if(b.type==='table'&&b.rows.some(r=>r.length!==b.headers.length))throw Error('Table rows must match headers');
 const hero=p.blocks[0];
 if(p.layout==='spotlight'&&hero.value.length>3)throw Error('Spotlight needs a short value, at most 3 characters');
 if(p.layout==='scoreboard'&&p.blocks.slice(0,4).some(b=>b.value.length>4))throw Error('Scoreboard values must be at most 4 characters');
 if(p.layout==='focus'&&hero.title.length>24)throw Error('Focus headline must be at most 24 characters');
 return p;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{validate(JSON.parse(fs.readFileSync(process.argv[2])));console.log('Valid v2 screen');}catch(e){console.error(e.message);process.exitCode=1;}}
