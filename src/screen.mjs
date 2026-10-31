import fs from 'node:fs';
const read=n=>fs.readFileSync(new URL(n,import.meta.url),'utf8');
export const tokens=JSON.parse(read('design/tokens.json'));
export const weather=JSON.parse(read('design/weather.json'));
const ty=tokens.typography,sp=tokens.spacing.scale,px=v=>v+'px';
const fills=tokens.ink.fills.gray_steps,dark=fills.filter(s=>s<=tokens.ink.fills.inverse_at_or_below);
const each=(o,f)=>Object.entries(o).map(([k,v])=>f(k,v)).join('\n');
const sides=['top','bottom','left','right'];

export const css=`/* Screen design system. Generated from src/design/tokens.json; screens may only use these classes. */
.dui,.dui * {box-sizing:border-box;margin:0;padding:0;min-width:0;font-family:${ty.sans}!important;}
.dui {position:relative;width:100%;height:100%;padding:${px(tokens.screen.inset_px)};display:flex;flex-direction:column;overflow:hidden;background:${tokens.ink.background};color:${tokens.ink.foreground};font-size:${px(ty.styles.body.size)};line-height:${px(ty.styles.body.line_height)};font-weight:${ty.styles.body.weight};}
.dui :where(h1,h2,h3,p,ul,ol,li,table,th,td,b,strong,em) {font:inherit;color:inherit;list-style:none;text-align:inherit;}
.dui :where(b,strong) {font-weight:700;}
.dui :where(em) {font-style:italic;}
.dui :where(table) {border-collapse:collapse;width:100%;}
.dui :where(th,td) {padding:6px 12px 6px 0;vertical-align:baseline;text-align:left;}
.dui > * {flex:0 1 auto;min-height:0;}
${each(ty.styles,(k,s)=>`.dui .t-${k} {font-size:${px(s.size)};line-height:${px(s.line_height)};font-weight:${s.weight};letter-spacing:${px(s.tracking)};${s.uppercase?'text-transform:uppercase;':''}}`)}
.dui .t-serif {font-family:${ty.serif}!important;}
.dui .t-serif:is(.t-title,.t-headline,.t-display) {font-weight:${ty.serif_display_weight};}
.dui .t-bold {font-weight:700;}
.dui .t-caps {text-transform:uppercase;letter-spacing:1px;}
.dui .t-center {text-align:center;}
.dui .t-end {text-align:right;}
.dui .t-nowrap {white-space:nowrap;}
${each(ty.figures,(k,v)=>`.dui .f-${k} {font-size:${px(v)};line-height:1.12;font-weight:${ty.figure_weight};letter-spacing:${ty.figure_tracking_em}em;white-space:nowrap;}`)}
.dui .f-unit {font-size:max(${px(ty.minimum_font_size_px)},.4em);font-weight:700;letter-spacing:0;margin-left:.08em;}
.dui :is(.l-row,.l-stack,.l-grid) {min-height:0;overflow:hidden;}
.dui .l-row {display:flex;flex-direction:row;}
.dui .l-stack {display:flex;flex-direction:column;}
.dui .l-grid {--cols:2;display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));}
.dui .l-grid > * {--span:1;grid-column:span var(--span);}
.dui .l-rows-equal {grid-auto-rows:minmax(0,1fr);}
.dui .l-place-center {place-items:center;}
.dui :is(.l-row,.l-stack) > * {flex:0 1 auto;min-height:0;--pg:0px;}
${Array.from({length:12},(_,i)=>`.dui .l-grow-${i+1} {flex:${i+1} 1 0%;}`).join('\n')}
.dui .l-none {flex:none;}
.dui .l-spacer {flex:1 1 0%;}
${['start','center','end','stretch','baseline'].map(a=>`.dui .l-align-${a} {align-items:${a==='start'||a==='end'?'flex-'+a:a};}\n.dui .l-self-${a} {align-self:${a==='start'||a==='end'?'flex-'+a:a};}`).join('\n')}
${['start','center','end','between','around','evenly'].map(j=>`.dui .l-justify-${j} {justify-content:${j==='start'||j==='end'?'flex-'+j:['between','around','evenly'].includes(j)?'space-'+j:j};}`).join('\n')}
${each(tokens.rules,(k,v)=>`.dui .d-${k} {--d:${px(v)};}
.dui .r-${k} {flex:none;align-self:stretch;justify-self:stretch;border-top:${px(v)} solid currentColor;}
.dui .l-row > .r-${k} {border-top:0;border-left:${px(v)} solid currentColor;}
${sides.map(s=>`.dui .e-${s}${k==='thin'?'':'-'+k} {border-${s}:${px(v)} solid currentColor;}`).join('\n')}`)}
.dui .l-row:is(.d-thin,.d-medium,.d-thick) > * + * {border-left:var(--d) solid currentColor;padding-left:var(--pg);}
.dui .l-stack:is(.d-thin,.d-medium,.d-thick) > * + * {border-top:var(--d) solid currentColor;padding-top:var(--pg);}
.dui .s-inverse {background:#000;color:#fff;}
.dui .s-round {border-radius:12px;}
.dui .s-badge {display:inline-block;align-self:flex-start;font-size:${px(ty.minimum_font_size_px)};font-weight:700;line-height:22px;letter-spacing:.6px;text-transform:uppercase;white-space:nowrap;border:2px solid currentColor;border-radius:4px;padding:1px 7px;}
.dui .s-badge-filled {background:#000;color:#fff;border-color:#000;}
.dui .s-inverse .s-badge-filled {background:#fff;color:#000;border-color:#fff;}
.dui .s-ring {display:inline-flex;align-items:center;justify-content:center;width:1.9em;height:1.9em;border:2px solid currentColor;border-radius:50%;}
.dui .s-ring.s-inverse {border-color:#000;}
.dui .s-list {display:flex;flex-direction:column;gap:${px(sp.sm)};counter-reset:dui-li;}
.dui .s-list > li {display:flex;gap:.5em;align-items:baseline;}
.dui .s-list-bullet > li::before {content:'•';flex:none;}
.dui .s-list-dash > li::before {content:'–';flex:none;}
.dui .s-list-number > li::before {counter-increment:dui-li;content:counter(dui-li,decimal-leading-zero);flex:none;font-weight:700;min-width:1.4em;}
.dui .s-list-check > li::before {content:'';flex:none;align-self:flex-start;width:.8em;height:.8em;margin-top:.3em;border:2px solid currentColor;}
.dui .s-list-check > li.s-done::before {background:currentColor;}
.dui .s-bar {position:relative;flex-shrink:0;height:${px(tokens.bars.height_px)};border:2px solid currentColor;border-radius:999px;overflow:hidden;--minw:8px;}
.dui .s-bar-lg {height:${px(tokens.bars.large_height_px)};--minw:56px;}
.dui .s-bar-bare {border:0;}
.dui .s-bar-v {position:relative;flex:1 1 0%;align-self:stretch;min-height:0;overflow:hidden;--minh:8px;}
${each(tokens.bars.min,(k,v)=>`.dui .s-bar-min-${k} {--minh:${px(v)};}`)}
.dui .s-bar-fill {position:absolute;display:flex;align-items:center;justify-content:center;gap:4px;border-radius:999px;overflow:hidden;white-space:nowrap;}
.dui .s-bar-fill:not([class*="bg--gray-"]) {background:#000;color:#fff;}
.dui .s-bar > .s-bar-fill {top:0;bottom:0;left:calc(var(--from,0) * 1%);width:calc((var(--to,100) - var(--from,0)) * 1%);min-width:var(--minw);}
.dui .s-bar-v > .s-bar-fill {left:0;right:0;flex-direction:column;justify-content:space-evenly;padding:6px 0;top:min(calc((100 - var(--to,100)) * 1%),calc(100% - var(--minh)));height:max(calc((var(--to,100) - var(--from,0)) * 1%),var(--minh));}
.dui .s-bar-fill:is(${dark.map(s=>'.bg--gray-'+s).join(',')}) {color:#fff;text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,0 1px 0 #000,0 -1px 0 #000,1px 0 0 #000,-1px 0 0 #000;}
.dui .i-icon {display:inline-block;width:1.25em;height:1.25em;object-fit:contain;vertical-align:-.28em;flex:none;}
${each(tokens.icons,(k,v)=>`.dui .i-${k} {width:${px(v)};height:${px(v)};vertical-align:middle;}`)}
/* Pixel images are 1-bit PNGs shown at their own size: never scaled, so each pixel lands on one device pixel. */
.dui .p-image {display:block;flex:none;object-fit:none;image-rendering:pixelated;}
.dui .s-inverse .p-image {filter:invert(1);}
/* Icons are black remote SVGs: invert them on black ground, outlining first so they survive dithered fills. */
.dui :is(.s-inverse,.s-bar-fill:not([class*="bg--gray-"])) .i-icon {filter:invert(1);}
.dui .s-bar-fill:is(${dark.map(s=>'.bg--gray-'+s).join(',')}) .i-icon {filter:drop-shadow(1px 1px 0 #fff) drop-shadow(-1px -1px 0 #fff) drop-shadow(-1px 1px 0 #fff) drop-shadow(1px -1px 0 #fff) invert(1);}
${each(sp,(k,v)=>`.dui .l-gap-${k} {gap:${px(v)};}
.dui .l-gap-${k} > * {--pg:${px(v)};}
.dui .l-pad-${k} {padding:${px(v)};}
.dui .l-pad-x-${k} {padding-left:${px(v)};padding-right:${px(v)};}
.dui .l-pad-y-${k} {padding-top:${px(v)};padding-bottom:${px(v)};}
.dui .l-mt-${k} {margin-top:${px(v)};}
.dui .l-mb-${k} {margin-bottom:${px(v)};}`)}
`;

// Every class a screen may use: the generated ones plus the framework's gray fills.
export const classes=[...new Set([...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/\.([a-z][a-z0-9-]*)/g)].map(m=>m[1]).filter(c=>c!=='dui'&&!c.startsWith('bg--')))].concat(fills.map(s=>'bg--gray-'+s));
export const iconUrl=c=>weather.icon_url.replace('{icon}',weather.conditions[c].icon);
export const policy={
 tags:['div','section','header','main','footer','span','p','h1','h2','h3','ul','ol','li','table','thead','tbody','tr','th','td','img','b','strong','em','br'],
 attributes:['class','alt','src','style','data-updated'],
 style_properties:{'--from':[0,100],'--to':[0,100],'--cols':[1,12],'--span':[1,12]},
 icon_sources:[...new Set(Object.keys(weather.conditions).map(iconUrl))],
 pixel_images:tokens.pixel_images,
 fill_classes:fills.map(s=>'bg--gray-'+s),
 limits:tokens.limits
};

export const BEGIN='<!-- SCREEN:BEGIN -->',END='<!-- SCREEN:END -->';
export function contract(){
 const icons=Object.fromEntries(Object.entries(weather.conditions).map(([k,c])=>[k,{file:'wi-'+c.icon+'.svg',wmo:c.wmo}]));
 return read('contract.liquid')
  .replace('@@CLASSES@@',classes.join(' '))
  .replace('@@POLICY_JSON@@',JSON.stringify({tags:policy.tags,attributes:policy.attributes,style_properties:policy.style_properties,pixel_images:policy.pixel_images,limits:policy.limits}))
  .replace('@@ICONS_JSON@@',JSON.stringify({url:weather.icon_url,conditions:icons}))
  .replace('@@TOKENS_JSON@@',JSON.stringify({screen:tokens.screen,typography:tokens.typography,spacing:tokens.spacing.scale,rules:tokens.rules}));
}
// The raw block keeps TRMNL from evaluating Liquid-looking text inside the screen.
export function compose(fragment){
 if(/\{%-?\s*endraw/.test(fragment))throw Error('Screen must not contain an endraw tag');
 if(fragment.includes(BEGIN)||fragment.includes(END))throw Error('Screen must not contain the SCREEN markers');
 const full=`${contract()}<style>\n${css}</style>\n<div class="dui">{% raw %}${BEGIN}\n${fragment.trim()}\n${END}{% endraw %}</div>\n`;
 const bytes=Buffer.byteLength(full);
 // writeMarkup rejected an 85 kB upload with HTTP 413; keep a margin below it.
 if(bytes>tokens.limits.max_markup_bytes)throw Error(`Composed markup is ${bytes} bytes; keep it under ${tokens.limits.max_markup_bytes} for writeMarkup`);
 return full;
}
