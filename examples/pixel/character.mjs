// A front-facing character in weather outfits, 80x136 px. Draw order is back to front:
// body, clothes, head and hat, then shade(), then small details so they cast no shadow.
import {Pixels,tone} from '../../src/pixel.mjs';
export const size=[80,136];
export const drawings=['warm','jacket','winter','rain'];
const HEAD=[26,10,54,42],HAND=[9,82,19,93];
const ARM=[[26,48],[16,51],[10,84],[19,86],[22,62]];
const LEG=[[27,86],[39,86],[39,121],[29,121]];
const SHOE=[[27,119],[39,119],[39,129],[21,129],[22,124]];
const BOOT=[[28,108],[39,108],[39,129],[21,129],[22,123],[28,120]];
const TORSO=[[28,46],[52,46],[57,52],[55,90],[25,90],[23,52]];
const SKIN=235;

export function figure(style,{arms=SKIN}={}){
 const p=new Pixels(...size,{style});
 p.poly(LEG,{fill:tone.denim,mirror:true});
 if(arms!==null)p.poly(ARM,{fill:arms,mirror:true});
 p.ellipse(HAND,{fill:SKIN,mirror:true});
 p.rect([36,38,44,48],{fill:SKIN});
 return p;
}
export const face=p=>p.rect([33,26,34,29],{fill:0,stroke:0}).rect([45,26,46,29],{fill:0,stroke:0}).line([[38,35],[42,35]]);
export const head=p=>p.ellipse(HEAD,{fill:240});
export function hair(p){
 p.ellipse([24,7,56,40],{fill:0,stroke:0,half:'top'});
 p.poly([[24,24],[28,18],[29,34],[25,32]],{fill:tone.ink});
}
export function beanie(p){
 p.ellipse([23,4,57,36],{fill:90,half:'top'});
 p.rect([23,16,57,23],{fill:0,stroke:0});
 p.ellipse([35,0,45,9],{fill:90});
 for(let x=27;x<55;x+=4)p.line([[x,18],[x,21]],{ink:tone.paper});
}
export function scarf(p){
 p.rect([28,40,52,49],{fill:185});
 p.poly([[42,46],[50,46],[51,70],[43,70]],{fill:185});
 for(const y of [55,62])p.line([[43,y],[50,y]]);
}

// Around 65° and up: tee, jeans, sneakers.
export function warm(style='lineart'){
 const p=figure(style);
 p.poly([[26,47],[15,50],[13,65],[23,66],[23,56]],{fill:245,mirror:true});
 p.poly(TORSO,{fill:245});
 p.poly(SHOE,{fill:245,mirror:true}).line([[22,127],[39,127]],{width:2,mirror:true});
 head(p);hair(p);p.shade();face(p);
 return p.line([[36,47],[40,52],[44,47]]);
}
// 40–60°: zip jacket, scarf, beanie, jeans, boots.
export function jacket(style='lineart'){
 const p=figure(style,{arms:null});
 p.poly(ARM,{fill:tone.mid,mirror:true}).poly(BOOT,{fill:40,mirror:true});
 p.poly([[26,46],[54,46],[58,52],[57,94],[23,94],[22,52]],{fill:tone.mid});
 head(p);beanie(p);scarf(p);p.shade();face(p);
 p.line([[40,49],[40,94]]).line([[41,49],[41,94]]);
 p.line([[28,78],[33,72]],{width:2,mirror:true}).line([[23,89],[57,89]]);
 return p.line([[11,79],[20,80]],{mirror:true});
}
// Below about 35°: long puffer, beanie, scarf, mittens, boots.
export function winter(style='lineart'){
 const p=figure(style,{arms:null});
 p.poly(ARM,{fill:175,mirror:true}).poly(BOOT,{fill:40,mirror:true});
 p.poly([[25,46],[55,46],[60,54],[60,108],[20,108],[20,54]],{fill:175});
 for(let y=58;y<108;y+=10)p.line([[21,y],[59,y]]);
 p.line([[40,50],[40,108]],{width:2});
 head(p);beanie(p);scarf(p);p.ellipse(HAND,{fill:tone.dark,mirror:true});p.shade();face(p);
 return p;
}
// Rain: hooded raincoat, boots, umbrella.
export function rain(style='lineart'){
 const p=figure(style,{arms:null});
 p.line([[64,14],[64,88]],{width:2});
 p.ellipse([42,0,79,34],{fill:style==='lineart'?tone.paper:tone.dark,half:'top'});
 p.line([[54,17],[60,1]]).line([[66,17],[64,1]]);
 p.poly(ARM,{fill:205,mirror:true}).poly(BOOT,{fill:40,mirror:true});
 p.poly([[25,46],[55,46],[59,54],[61,106],[19,106],[21,54]],{fill:205});
 p.ellipse([22,6,58,46],{fill:205});
 p.ellipse([28,13,52,41],{fill:240});p.shade();face(p);
 for(const [x,y] of [[8,30],[12,50],[6,68],[72,46],[74,66],[10,92],[72,96],[4,112],[76,116]])p.line([[x,y],[x-2,y+5]]);
 p.line([[40,50],[40,106]]);
 for(let y=56;y<104;y+=8)p.rect([38,y,39,y+1],{fill:0,stroke:0});
 return p;
}
