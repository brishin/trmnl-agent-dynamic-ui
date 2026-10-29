import fs from 'node:fs';
import assert from 'node:assert/strict';
import {withRenderer} from '../scripts/render.mjs';
import {classes,compose,weather,iconUrl,tokens} from '../src/screen.mjs';
const root=new URL('../',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const output=new URL('artifacts/design/',root);
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});

const examples=Object.fromEntries(fs.readdirSync(new URL('examples/screens/',root)).filter(f=>f.endsWith('.html')).map(f=>[f.slice(0,-5),read('examples/screens/'+f)]));
const head=title=>`<header class="l-row l-justify-between l-align-center e-top-thick l-pad-y-sm"><h1 class="t-label">${title}</h1><span class="t-label" data-updated>Tue 27 Oct · 7:30 AM · Sample</span></header>`;
const W=n=>'Wide Mammoth Words '.repeat(20).slice(0,n).trim();
const conditions=Object.keys(weather.conditions);
const steps=tokens.ink.fills.gray_steps;
const stress={
 'stress-type-scale':head('Every style')+`<main class="l-stack l-grow-1 l-gap-xs">${Object.keys(tokens.typography.styles).reverse().map(k=>`<p class="t-${k}${['title','headline','display'].includes(k)?' t-serif':''} t-nowrap">${W(k==='display'?14:k==='headline'?24:40)}</p>`).join('')}</main>`,
 'stress-figures':head('Every figure')+`<main class="l-row l-grow-1 l-gap-md l-align-baseline">${Object.keys(tokens.typography.figures).map(k=>`<span class="f-${k} l-none">88<span class="f-unit">%</span></span>`).join('')}</main>`,
 'stress-icons':head('Every condition')+`<main class="l-grid l-grow-1 l-gap-xs" style="--cols:6">${conditions.map(c=>`<span class="t-label l-row l-align-center l-gap-xs"><img class="i-icon i-s" src="${iconUrl(c)}" alt="">${c.slice(0,7)}</span>`).join('')}</main>`,
 'stress-bars':head('Every fill')+`<main class="l-row l-grow-1 l-gap-lg"><div class="l-stack l-grow-1 l-justify-between">${steps.map((s,i)=>`<div class="s-bar s-bar-lg"><span class="s-bar-fill bg--gray-${s}" style="--from:${i*5};--to:${60+i*5}"><b>${s}</b></span></div>`).join('')}</div><div class="l-row l-grow-2 l-gap-xs">${steps.map((s,i)=>`<div class="s-bar-v s-bar-min-l"><span class="s-bar-fill bg--gray-${s}" style="--from:${i*10};--to:${i*10}"><img class="i-icon i-m" src="${iconUrl(conditions[i])}" alt=""><b class="t-subtitle">-9°</b></span></div>`).join('')}<div class="s-bar-v"><span class="s-bar-fill" style="--from:0;--to:100"></span></div></div></main>`,
 'stress-eight-columns':head('Eight columns')+`<main class="l-row l-grow-1 d-thin l-gap-sm e-top-medium">${Array.from({length:8},(_,i)=>`<div class="l-stack l-grow-1 l-gap-xs${i===3?' s-inverse':''}"><span class="t-label">Wed</span><span class="f-m">${i+24}</span><p>Swim 4:15</p><span class="l-spacer"></span><span class="s-badge">Off</span></div>`).join('')}</main>`,
 'stress-nesting':head('Nested')+`<main class="l-row l-grow-1 l-gap-md"><div class="l-stack l-grow-1 l-gap-sm"><div class="l-row l-gap-sm d-thin"><div class="l-stack l-grow-1"><div class="l-grid l-gap-xs" style="--cols:3"><span style="--span:2" class="t-label">Span two</span><span class="s-ring">9</span><span>a</span><span>b</span><span>c</span></div></div><div class="l-stack l-grow-1"><ol class="s-list s-list-number"><li>One</li><li>Two</li></ol></div></div></div><div class="l-stack l-grow-1 s-inverse s-round l-pad-md"><span class="s-badge s-badge-filled">Inside</span><ul class="s-list s-list-check"><li class="s-done">Done</li><li>Open</li></ul></div></main>`
};
// Each rejection names the fragment and a fragment of the expected error.
const ok=examples.spotlight;
const rejections={
 'script tag':[ok+'<script>alert(1)</script>','Tag <script>'],
 'style tag':[ok+'<style>.dui{color:red}</style>','Tag <style>'],
 'link tag':[ok+'<a class="t-label">x</a>','Tag <a>'],
 'event handler':[ok.replace('<main ','<main onclick="x()" '),'Attribute onclick'],
 'external image':[ok+'<img class="i-icon" src="https://example.com/a.svg" alt="">','not a weather icon'],
 'unknown class':[ok.replace('l-grow-1','l-grow-1 hero'),'Class hero'],
 'framework gray text':[ok.replace('<p>','<p class="text--gray-50">'),'Class text--gray-50'],
 'inline color':[ok.replace('<p>','<p style="color:#888">'),'Inline style color'],
 'fill out of range':[ok.replace('</main>','<div class="s-bar"><span class="s-bar-fill" style="--from:0;--to:150"></span></div></main>'),'--to must be a number'],
 'gray outside a bar':[ok.replace('<p>','<p class="bg--gray-45">'),'Gray fills are only'],
 'missing timestamp':[ok.replace(' data-updated',''),'data-updated'],
 'overflow':[head('Too much')+`<main class="l-stack l-grow-1"><p class="t-headline">${W(300)}</p></main>`,'Overflows'],
 'too wide':[head('Too wide')+'<main class="l-row l-grow-1"><span class="f-xxl">888888888888</span></main>','Overflows'],
 'empty':['','empty']
};

await withRenderer(async render=>{
 const iconFiles=new Set();
 for(const [name,fragment] of Object.entries({...examples,...stress})){
  const r=await render(fragment,{png:new URL(name+'.png',output).pathname,html:new URL(name+'.html',output).pathname});
  assert.deepEqual(r.errors,[],`${name} must pass the render check`);
  if(name in examples)assert.deepEqual(r.warnings,[],`${name} is a canonical example and must not warn`);
  for(const m of r.markup.matchAll(/src="([^"]+)"/g))iconFiles.add(m[1]);
  console.log('✓',name,r.warnings.length?'('+r.warnings.join('; ')+')':'');
 }
 assert.equal(iconFiles.size,fs.readdirSync(new URL('vendor/weather-icons/',root)).filter(f=>f.endsWith('.svg')).length,'Every vendored icon must be reachable from a condition');
 for(const [name,[fragment,expected]] of Object.entries(rejections)){
  const r=await render(fragment);
  assert(r.errors.some(e=>e.includes(expected)),`${name} must be rejected with "${expected}"; got ${JSON.stringify(r.errors)}`);
  console.log('✓ rejects',name);
 }
 const liquid=await render(ok.replace('<p>','<p>{{ 7 | times: 7 }} {% if true %}x{% endif %} &lt;b&gt;'));
 assert(liquid.markup.includes('{{ 7 | times: 7 }} {% if true %}x{% endif %}'),'Liquid in a screen must render literally');
 assert(!liquid.markup.includes('<b>&gt;')&&liquid.markup.includes('&lt;b&gt;'),'Escaped text must stay escaped');
});
assert.throws(()=>compose(ok+'{% endraw %}'),/endraw/);
assert.throws(()=>compose(ok+'<!-- SCREEN:END -->'),/markers/);
assert.throws(()=>compose(ok.repeat(40)),/bytes/);

// The skill must describe every class and point at every canonical example.
const skill='.claude/skills/trmnl-screen/';
const doc=read(skill+'references/classes.md');
const undocumented=classes.filter(c=>!doc.includes('`'+c+'`')&&!doc.includes('`'+c.replace(/-[^-]+$/,'-*')+'`'));
assert.deepEqual(undocumented,[],'classes.md must document every class');
for(const c of conditions)assert(doc.includes('`'+c+'`'),'classes.md must list condition '+c);
const patterns=read(skill+'references/patterns.md'),cited=new Set([...patterns.matchAll(/examples\/screens\/([a-z-]+)\.html/g)].map(m=>m[1]));
assert.deepEqual([...cited].filter(n=>!(n in examples)),[],'patterns.md cites missing examples');
assert.deepEqual(Object.keys(examples).filter(n=>!cited.has(n)),[],'patterns.md must cite every example');
for(const f of ['SKILL.md','references/fit.md'])assert(fs.existsSync(new URL(skill+f,root)),skill+f+' must exist');
console.log(`Design checks passed: ${Object.keys(examples).length} examples, ${Object.keys(stress).length} stress cases, ${Object.keys(rejections).length} rejections.`);
