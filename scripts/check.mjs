import fs from 'node:fs';
import path from 'node:path';
import {withRenderer} from './render.mjs';
const files=process.argv.slice(2);
if(!files.length){console.error('Usage: npm run check -- screen.html');process.exit(2);}
const root=new URL('../',import.meta.url),out=new URL('artifacts/check/',root);
fs.mkdirSync(out,{recursive:true});
let failed=false;
await withRenderer(async render=>{
 for(const file of files){
  const name=path.basename(file,'.html'),png=new URL(name+'.png',out).pathname;
  let result;
  try{result=await render(fs.readFileSync(file,'utf8'),{png});}catch(e){console.error(`✗ ${file}: ${e.message}`);failed=true;continue;}
  for(const w of result.warnings)console.warn(`! ${w}`);
  if(result.errors.length){failed=true;console.error(`✗ ${file}\n`+result.errors.map(e=>'  - '+e).join('\n')+`\n  Render: ${png}`);continue;}
  // Only a screen that passes becomes the upload candidate.
  if(files.length===1){fs.mkdirSync(new URL('dist/',root),{recursive:true});fs.writeFileSync(new URL('dist/full.liquid',root),result.full);}
  console.log(`✓ ${file} (${Buffer.byteLength(result.full)} bytes)\n  Render: ${png}`+(files.length===1?'\n  Upload: dist/full.liquid':''));
 }
});
process.exitCode=failed?1:0;
