import fs from 'node:fs';
import {css,contract,classes,compose} from '../src/screen.mjs';
const root=new URL('../',import.meta.url);
const write=(n,s)=>fs.writeFileSync(new URL('dist/'+n,root),s);
fs.rmSync(new URL('dist/',root),{recursive:true,force:true});
fs.mkdirSync(new URL('dist/',root),{recursive:true});
write('screen.css',css);
write('AI-CONTRACT.liquid',contract());
// Composing an empty screen applies the upload size guard to the fixed parts alone.
const frame=compose('');
console.log(`Built ${classes.length} classes; frame is ${Buffer.byteLength(frame)} bytes.`);
