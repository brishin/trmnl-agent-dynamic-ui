import fs from 'node:fs';
const root=new URL('./',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const write=(n,s)=>fs.writeFileSync(new URL(n,root),s);
const t=JSON.parse(read('design-system.json')),ty=t.typography;
const css=`/* Shared readability tokens. Generated from design-system.json. */
.dui,.agent-screen,.agent-footer {
 --ui-text-min:${ty.minimum_font_size_px}px; --ui-meta-size:${ty.metadata.size}px; --ui-meta-weight:${ty.metadata.weight}; --ui-meta-leading:${ty.metadata.line_height}px;
 --ui-body-size:${ty.body.size}px; --ui-body-weight:${ty.body.weight}; --ui-body-leading:${ty.body.line_height}px;
 --ui-section-size:${ty.section.size}px; --ui-section-weight:${ty.section.weight}; --ui-section-leading:${ty.section.line_height}px;
 --ui-ink:${t.ink.foreground}; --ui-paper:${t.ink.background}; --ui-space:${t.spacing.unit_px}px;
}
`;
write('design-system.css',css);
for(const name of ['v2/full.liquid','v1.liquid']){
 const source=read(name).replace(/\/\* Shared readability tokens\.[\s\S]*?\n\}\n/,css);
 write(name,source);
}
write('full.liquid','{% if schema_version == 2 %}\n'+read('v2/full.liquid')+'\n{% else %}\n'+read('v1.liquid')+'\n{% endif %}\n');
