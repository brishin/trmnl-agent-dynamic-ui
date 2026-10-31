import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
// Renders drawings from a module: functions of (style) returning a Pixels canvas, named in its `drawings` export or on the command line.
const [file,...names]=process.argv.slice(2);
if(!file){console.error('Usage: npm run pixel -- drawing.mjs [drawing ...] [--style=lineart|shaded]');process.exit(2);}
const style=(names.find(n=>n.startsWith('--style='))||'--style=lineart').slice(8);
const mod=await import(pathToFileURL(path.resolve(file)));
const picked=names.filter(n=>!n.startsWith('--'));
const out=new URL('../artifacts/pixel/',import.meta.url);
fs.mkdirSync(out,{recursive:true});
for(const name of picked.length?picked:mod.drawings||[]){
 if(typeof mod[name]!=='function'){console.error(`${file} has no drawing ${name}`);process.exitCode=1;continue;}
 const p=mod[name](style),base=new URL(`${name}-${style}`,out).pathname;
 // A 4x preview for looking at pixels, and the img tag to paste into a screen.
 fs.writeFileSync(base+'@4x.png',p.png(4));
 fs.writeFileSync(base+'.html',p.img()+'\n');
 console.log(`${name} (${style}) ${p.width}x${p.height}, ${p.png().length} bytes\n  Preview: ${base}@4x.png\n  Tag: ${base}.html`);
}
