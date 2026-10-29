import fs from 'node:fs';
import {compose} from '../src/screen.mjs';
// Wraps a screen without rendering it; prefer `npm run check`, which also validates and renders.
const file=process.argv[2];
if(!file){console.error('Usage: npm run compose -- screen.html');process.exit(2);}
fs.mkdirSync(new URL('../dist/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../dist/full.liquid',import.meta.url),compose(fs.readFileSync(file,'utf8')));
console.log('Wrote dist/full.liquid (unchecked)');
