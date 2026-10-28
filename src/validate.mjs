import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import Ajv from 'ajv';
import {validate as validateV2} from './validate-v2.mjs';
const check=new Ajv({allErrors:true}).compile(JSON.parse(fs.readFileSync(new URL('./schemas/v1.json',import.meta.url))));
export function validate(payload){
 if(payload.schema_version===2)return validateV2(payload);
 if(!check(payload))throw new Error(JSON.stringify(check.errors));
 if(Buffer.byteLength(JSON.stringify({merge_variables:payload}),'utf8')>5000)throw new Error('Payload exceeds the 5 kB webhook budget');
 let slots=0;
 for(const b of payload.blocks){
  if(b.width==='full'){if(slots%2)slots++;slots+=2;}else slots++;
  if(b.type==='table'&&b.rows.some(r=>r.length!==b.headers.length))throw new Error('Table rows must match headers');
 }
 if(slots>4)throw new Error('Layout exceeds two rows; a full block starts a new row');
 return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 try{validate(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));console.log('Valid screen payload');}catch(e){console.error(e.message);process.exitCode=1;}
}
