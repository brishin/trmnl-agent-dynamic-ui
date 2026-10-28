import fs from 'node:fs';
const root=new URL('./',import.meta.url);
fs.writeFileSync(new URL('full.liquid',root),fs.readFileSync(new URL('v1.liquid',root),'utf8'));
