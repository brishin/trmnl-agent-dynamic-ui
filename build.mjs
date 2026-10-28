import fs from 'node:fs';
const root=new URL('./',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
fs.writeFileSync(new URL('full.liquid',root),'{% if schema_version == 2 %}\n'+read('v2/full.liquid')+'\n{% else %}\n'+read('v1.liquid')+'\n{% endif %}\n');
