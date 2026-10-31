import zlib from 'node:zlib';
// 1-bit pixel art for the screen: shapes are filled with tones (0 black … 254 paper), a style maps
// and shades the tones, and a 4x4 ordered dither turns them into crisp black/white PNG pixels.
const BG=255,PAPER=254;
const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
export const tone={ink:0,dark:60,denim:120,mid:150,light:200,paper:PAPER};

export class Pixels{
 constructor(width,height,{style='lineart'}={}){
  if(!['lineart','shaded'].includes(style))throw Error('style must be lineart or shaded');
  Object.assign(this,{width,height,style,px:new Uint8Array(width*height).fill(BG)});
 }
 get(x,y){return x<0||y<0||x>=this.width||y>=this.height?BG:this.px[y*this.width+x];}
 set(x,y,v){if(x>=0&&y>=0&&x<this.width&&y<this.height)this.px[y*this.width+x]=v;}
 // Line art keeps near-black parts as ink, turns mid tones (denim, shadow) into a light dot, and the rest into paper.
 map(t){return this.style==='shaded'?t:t<80?0:t<140?200:PAPER;}
 mirror(pts){return pts.map(([x,y])=>[this.width-1-x,y]);}

 // Fills every pixel the test covers, then inks a stroke-wide band just inside its edge.
 shape(inside,[x0,y0,x1,y1],{fill=PAPER,stroke=2}={}){
  const hit=new Set();
  for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++)if(inside(x,y))hit.add(y*this.width+x);
  const edge=(x,y)=>{for(let j=-stroke+1;j<stroke;j++)for(let i=-stroke+1;i<stroke;i++)if(x+i<0||x+i>=this.width||!hit.has((y+j)*this.width+x+i))return true;return false;};
  for(const k of hit){const x=k%this.width,y=(k-x)/this.width;this.set(x,y,stroke&&edge(x,y)?0:this.map(fill));}
  return this;
 }
 poly(pts,opts={}){
  for(const p of opts.mirror?[pts,this.mirror(pts)]:[pts]){
   const xs=p.map(q=>q[0]),ys=p.map(q=>q[1]);
   this.shape((x,y)=>inPolygon(p,x,y),[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],opts);
  }
  return this;
 }
 rect([x0,y0,x1,y1],opts={}){return this.poly([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],opts);}
 // An ellipse in a bounding box; half:'top' or 'bottom' keeps one half (hats, umbrellas, hoods).
 ellipse(box,opts={}){
  for(const [x0,y0,x1,y1] of opts.mirror?[box,[this.width-1-box[2],box[1],this.width-1-box[0],box[3]]]:[box]){
   const cx=(x0+x1)/2,cy=(y0+y1)/2,rx=(x1-x0+1)/2,ry=(y1-y0+1)/2;
   this.shape((x,y)=>((x-cx)/rx)**2+((y-cy)/ry)**2<=1&&(opts.half!=='top'||y<=cy)&&(opts.half!=='bottom'||y>=cy),[x0,y0,x1,y1],opts);
  }
  return this;
 }
 line(pts,{ink=0,width=1,mirror=false}={}){
  for(const p of mirror?[pts,this.mirror(pts)]:[pts])for(let i=1;i<p.length;i++){
   let [x,y]=p[i-1].map(Math.round);const [x1,y1]=p[i].map(Math.round),dx=Math.abs(x1-x),dy=-Math.abs(y1-y),sx=x<x1?1:-1,sy=y<y1?1:-1;
   for(let err=dx+dy;;){
    for(let j=0;j<width;j++)for(let k=0;k<width;k++)this.set(x+k-(width>>1),y+j-(width>>1),this.map(ink));
    if(x===x1&&y===y1)break;
    const e2=2*err;if(e2>=dy){err+=dy;x+=sx;}if(e2<=dx){err+=dx;y+=sy;}
   }
  }
  return this;
 }
 // Form shadow: light comes from the upper left, so each part darkens inside its right edge
 // (line art: a light dot) and, when shaded, brightens inside its left edge. Call before small details.
 shade(){
  const src=this.px.slice(),at=(x,y)=>x<0||x>=this.width?BG:src[y*this.width+x];
  for(let y=0;y<this.height;y++)for(let x=0;x<this.width;x++){
   const v=at(x,y);if(v===0||v===BG)continue;
   const right=[1,2,3,4,5].some(k=>at(x+k,y)===0),left=[1,2].some(k=>at(x-k,y)===0);
   if(this.style==='lineart'){if(right&&v===PAPER)this.set(x,y,200);}
   else this.set(x,y,right?Math.max(20,v-55):left?Math.min(PAPER,v+35):v);
  }
  return this;
 }
 bits(){return Array.from({length:this.height},(_,y)=>Array.from({length:this.width},(_,x)=>{const v=this.px[y*this.width+x];return v>=PAPER||(v>0&&v/255*16>BAYER[y%4][x%4]);}));}
 png(scale=1){const b=this.bits();return png(this.width*scale,this.height*scale,(x,y)=>b[Math.floor(y/scale)][Math.floor(x/scale)]?255:0);}
 dataUri(){return 'data:image/png;base64,'+this.png().toString('base64');}
 img(alt=''){return `<img class="p-image" src="${this.dataUri()}" alt="${alt.replace(/[&"<>]/g,c=>`&#${c.charCodeAt(0)};`)}">`;}
}

function inPolygon(p,x,y){
 let inside=false;
 for(let i=0,j=p.length-1;i<p.length;j=i++){
  const [xi,yi]=p[i],[xj,yj]=p[j],len=Math.hypot(xj-xi,yj-yi)||1,t=Math.max(0,Math.min(1,((x-xi)*(xj-xi)+(y-yi)*(yj-yi))/len**2));
  if(Math.hypot(x-xi-t*(xj-xi),y-yi-t*(yj-yi))<=.5)return true;
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
 }
 return inside;
}

// Grayscale PNG: depth 1 packs eight pixels per byte (1 = white); depth 8 is used by tests for gray fixtures.
export function png(width,height,get,depth=1){
 const chunk=(type,data)=>{const len=Buffer.alloc(4),crc=Buffer.alloc(4),td=Buffer.concat([Buffer.from(type),data]);len.writeUInt32BE(data.length);crc.writeUInt32BE(zlib.crc32(td));return Buffer.concat([len,td,crc]);};
 const stride=Math.ceil(width*depth/8),raw=Buffer.alloc((stride+1)*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const v=get(x,y),o=y*(stride+1)+1;
  if(depth===8)raw[o+x]=v;else if(v>=128)raw[o+(x>>3)]|=0x80>>(x&7);
 }
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=depth;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
