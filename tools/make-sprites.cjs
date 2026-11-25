// Deterministic pixel-art source. Run with Node.js from any directory.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const out = path.resolve(__dirname, '../game/assets');
fs.mkdirSync(out, {recursive: true});
const manifest = {};
const TAU = 2 * Math.PI;
const mix = (a,b,t) => a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const rgb = s => typeof s === 'string' ? [0,2,4].map(i=>parseInt(s.slice(i,i+2),16)) : s;
const shade = (a,b,t) => mix(rgb(a),rgb(b),Math.max(0,Math.min(1,t)));
const rnd = (x,y,s=17) => {
  let v=Math.imul(x+1921*s,374761393)+Math.imul(y+2581,668265263);
  v=Math.imul(v^(v>>>13),1274126177); return ((v^(v>>>16))>>>0)/4294967296;
};
const smooth = t=>t*t*(3-2*t);
function noise(x,y,s=17) {
  const X=Math.floor(x),Y=Math.floor(y),u=smooth(x-X),v=smooth(y-Y);
  return (1-v)*((1-u)*rnd(X,Y,s)+u*rnd(X+1,Y,s))+v*((1-u)*rnd(X,Y+1,s)+u*rnd(X+1,Y+1,s));
}
class Canvas {
  constructor(w,h){this.w=w;this.h=h;this.bytes=Buffer.alloc(w*h*4);}
  pixel(x,y,c,a=255) {
    x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=this.w||y>=this.h)return;
    const i=(y*this.w+x)*4, v=rgb(c);
    for(let k=0;k<3;k++)this.bytes[i+k]=v[k];this.bytes[i+3]=a;
  }
  rect(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.pixel(i+x,j+y,c);}
  line(x1,y1,x2,y2,c) {
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))));
    for(let i=0;i<=steps;i++)this.pixel(x1+(x2-x1)*i/steps,y1+(y2-y1)*i/steps,c);
  }
  poly(p,c) {
    const ys=p.map(v=>v[1]);
    for(let y=Math.ceil(Math.min(...ys));y<=Math.max(...ys);y++) {
      const crossings=[];
      for(let i=0;i<p.length;i++){
        const a=p[i], b=p[(i+1)%p.length];
        if((a[1]>y)!==(b[1]>y))crossings.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      crossings.sort((a,b)=>a-b);for(let k=0;k+1<crossings.length;k+=2)this.line(Math.ceil(crossings[k]),y,Math.floor(crossings[k+1]),y,c);
    }
    for(let i=0;i<p.length;i++)this.line(...p[i],...p[(i+1)%p.length],c);
  }
  ell(cx,cy,rx,ry,c) {
    for(let y=Math.ceil(cy-ry);y<=cy+ry;y++){
      const dx=rx*Math.sqrt(Math.max(0,1-((y-cy)/ry)**2));this.line(Math.ceil(cx-dx),y,Math.floor(cx+dx),y,c);
    }
  }
  arc(cx,cy,rx,ry,start,end,c){
    const count=Math.ceil(Math.abs(end-start)*Math.max(rx,ry)*1.5);
    for(let i=0;i<=count;i++){const t=start+(end-start)*i/count;this.pixel(cx+rx*Math.cos(t),cy+ry*Math.sin(t),c);}
  }
}
const crcTable=Uint32Array.from({length:256},(_,x)=>{for(let i=0;i<8;i++)x=(x&1)?(0xedb88320^(x>>>1)):(x>>>1);return x>>>0;});
function chunk(type,data) {
  const buf=Buffer.alloc(12+data.length);buf.writeUInt32BE(data.length,0);buf.write(type,4);data.copy(buf,8);
  let crc=0xffffffff;for(const b of buf.subarray(4,8+data.length))crc=crcTable[(crc^b)&255]^(crc>>>8);
  buf.writeUInt32BE((crc^0xffffffff)>>>0,8+data.length);return buf;
}
function sheet(key,w,h,fps,draw,frames=4) {
  const width=w*frames,raw=Buffer.alloc((1+width*4)*h);
  for(let f=0;f<frames;f++){
    const canvas=new Canvas(w,h);draw(canvas,f);
    for(let y=0;y<h;y++)canvas.bytes.copy(raw,y*(1+width*4)+1+w*4*f,y*w*4,(y+1)*w*4);
  }
  const hdr=Buffer.alloc(13);hdr.writeUInt32BE(width,0);hdr.writeUInt32BE(h,4);hdr[8]=8;hdr[9]=6;
  function writePng(filename,pixels){
    fs.writeFileSync(filename,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',zlib.deflateSync(pixels,{level:9})),chunk('IEND',Buffer.alloc(0))]));
  }
  writePng(path.join(out,key+'.png'),raw);
  if(/^ship[1-3]$/.test(key)){
    const black=Buffer.from(raw);
    for(let y=0;y<h;y++)for(let x=0;x<width;x++){
      const i=y*(1+width*4)+1+x*4;
      for(let k=0;k<3;k++)black[i+k]=Math.round(black[i+k]*black[i+3]/255);
      black[i+3]=255;
    }
    writePng(path.join(out,key+'-black.png'),black);
  }
  if(frames>1)manifest[key]={src:'assets/'+key+'.png',w,h,frames,fps};
}
// Each planet uses a spherical surface and a looping four-position rotation.
// Dithered terminators, coastlines and latitude bands stay on the sphere.
const worlds=[
  ['planetTeal','rock', ['152d4c','1f5874','1e8f91','57c4a4','a6ecd0'],38],
  ['planetRust','rock', ['3a2343','71394e','af5144','e28a57','ffd195'],56],
  ['planetBlue','water',['172d62','244d9a','298ac3','64c2d6','c0f6de'],72],
  ['planetPurple','gas',['2e234b','533564','986aab','ca94cb','f3c4e3'],86],
  ['planetRing','ring',['322e51','68506b','a67e8a','d8b197','f4d9ae'],7],
  ['planetAmber','rock',['33222f','744730','b87b35','efd57b','fff0aa'],43],
  ['planetPearl','ice',['302e53','565a83','8e91ac','d4bbcf','f5e9ef'],75],
  ['planetMoss','rock',['172d2e','305947','55805a','9fae74','d7d6a1'],59],
  ['planetIce','ice',['253a64','3f6892','74a6c5','abd6d4','def4eb'],31],
];
for(const [key,kind,pal,seed] of worlds) {
  const ring=kind==='ring',w=ring?84:64,cx=ring?42:32,cy=31,r=ring?17:22;
  sheet(key,w,64,2,(g,f)=>{
    const ringPass=front=>{
      for(let y=-25;y<26;y++)for(let x=-42;x<43;x++){
        const a=.38,X=x*Math.cos(a)-y*Math.sin(a),Y=x*Math.sin(a)+y*Math.cos(a);
        const v=Math.sqrt((X/39)**2+(Y/9.5)**2);
        if((Y>=0)!==front||v<.66||v>1||v>.88&&v<.90)continue;
        const idx=Math.floor((v-.66)*48);
        g.pixel(cx+x,cy+y,shade(pal[(idx%7===0)?1:idx%4===0?4:3],pal[1],front?.13:.42));
      }
    };
    if(ring)ringPass(false);
    for(let y=-r-4;y<=r+4;y++)for(let x=-r-4;x<=r+4;x++) {
      const d=Math.hypot(x,y),n=x/r,m=y/r;
      if(d>r){
        if(d<r+3+f%2)g.pixel(cx+x,cy+y,pal[2],Math.floor((1-(d-r)/4)*38));
        continue;
      }
      const z=Math.sqrt(Math.max(0,1-n*n-m*m)),lat=Math.asin(m);
      const lon=Math.atan2(n,z)+f*.055;
      const sx=4.2*Math.sin(lon)*Math.cos(lat),sy=4.2*m;
      const n1=noise(sx,sy,seed),n2=noise(sx*3+.6,sy*3+6,seed+7);
      const terrain=.70*n1+.30*n2, light=Math.max(0,-.62*n-.65*m+.55*z);
      let v;
      if(kind==='gas'||ring) {
        const warp=Math.sin(lon*2+lat*4)*.7+Math.sin(lon*4+.5)*.3;
        v=.39+.17*Math.sin(13*lat+warp)+.14*Math.sin(28*lat+warp*2)+.17*n1;
        if(Math.hypot((n+.32)/.25,(m-.23)/.12)<1)v+=.18;
      } else if(kind==='ice') v=.38+terrain*.42+(Math.abs(n1-n2)<.10?.15:0);
      else v=.20+.38*terrain+(terrain>.50?.26:0)+(terrain>.64?.10:0);
      if(kind==='water'&&Math.sin(lat*19+lon*3)>1.48-terrain)v+=.27;
      v=v*.72+light*.55-.21+(x+y)%2*.017;
      const index=Math.max(0,Math.min(4,Math.floor(v*5)));
      let col=pal[index];
      if(d>r-1.2&&light>.55)col=pal[4];
      if(z<.30&&light<.30)col=shade(pal[0],'141832',.24);
      g.pixel(cx+x,cy+y,col);
    }
    if(ring)ringPass(true);
  });
}
// Three-quarter orbital hub. Annular platforms have raised plates, contact
// shadows, bridge piers, windows, docking arms and a separate reactor dome.
const navy='101b31', dark='1b3248', steel='426273',silver='94b4bb',white='d9eee4', copper='a9713d',gold='e6b768',lightGold='ffe2a0',teal='2ba3a5',lightTeal='83f7db';
const polar=(cx,cy,rx,ry,a)=>[Math.round(cx+Math.cos(a)*rx),Math.round(cy+Math.sin(a)*ry)];
function deck(g,cx,cy,rx,ry,inside,thick,f) {
  const at=(scale,t,y=0)=>polar(cx,cy+y,rx*scale,ry*scale,t);
  for(let i=0;i<28;i++){
    const a=(i+f/4)*TAU/28,b=(i+1+f/4)*TAU/28,sh=Math.sin(a);
    g.poly([at(1,a),at(1,b),at(1,b,thick),at(1,a,thick)],sh>0?dark:navy);
    g.poly([at(inside,a),at(inside,b),at(inside,b,thick),at(inside,a,thick)],navy);
  }
  for(let i=0;i<28;i++) {
    const a=(i+f/4)*TAU/28,b=(i+1+f/4)*TAU/28,lum=(1-Math.cos(a+1.0))/2;
    g.poly([at(inside,a),at(1,a),at(1,b),at(inside,b)],shade('405666','97b1ae',.2+.5*lum));
    g.line(...at(.99,a),...at(.99,b),shade(steel,white,lum));
    g.line(...at(inside,a),...at(inside,b),navy);
    g.line(...at(inside+.02,a),...at(.98,a),dark);
    if(i%4!==3)g.line(...at(.93,a+.035),...at(.93,b-.035),i%7===f?lightGold:gold);
    if(i%2===0)g.line(...at(inside+.07,a+.05),...at(inside+.07,b-.04),i%6===f?lightTeal:teal);
    if(Math.sin(a)>.10)g.line(...at(1,a+.05,2),...at(1,b-.05,2),i%3===0?gold:teal);
  }
}
sheet('hq',116,100,4,(g,f)=>{
  const cx=57,cy=52;
  // Piers radiating from the core, including paired solar collectors.
  for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
    const X=cx+dx*41,Y=cy+dy*23;
    g.poly([[cx-2,cy+1],[cx+2,cy-3],[X+4,Y-2],[X+4,Y+3],[X,Y+5]],navy);
    g.line(cx,cy,X,Y,silver);g.line(cx,cy+2,X,Y+2,steel);
    for(let i=0;i<2;i++){
      const x=X+dx*i*5,y=Y+dy*i*3;
      const p=[[x-4,y-3],[x+1,y-6],[x+8,y-2],[x+3,y+1]];
      g.poly(p,dark);g.line(...p[0],...p[1],gold);g.line(...p[1],...p[2],silver);
      g.line(x-1,y-3,x+5,y,teal);
    }
  }
  deck(g,cx,cy,41,24,.68,5,f);
  for(let i=0;i<8;i++){
    const a=i*TAU/8+.13, p=polar(cx,cy,17,10,a),q=polar(cx,cy,31,18,a);
    g.line(p[0],p[1]+1,q[0],q[1]+1,navy);g.line(...p,...q,steel);
  }
  // Docked payload pods around the ring are rendered in depth order.
  const pod=(x,y,w)=>{
    g.poly([[x-w,y],[x,y-4],[x+w,y],[x+w,y+6],[x,y+10],[x-w,y+6]],navy);
    g.poly([[x-w,y],[x,y+4],[x,y+8],[x-w,y+4]],steel);
    g.poly([[x,y+4],[x+w,y],[x+w,y+4],[x,y+8]],dark);
    g.poly([[x-w,y],[x,y-4],[x+w,y],[x,y+4]],silver);
    g.line(x-w+2,y,x,y-3,white);g.line(x-3,y,x+1,y-2,steel);
    g.line(x-w+2,y+3,x-2,y+5,gold);
  };
  pod(25,42,6);pod(87,40,7);
  g.ell(cx,cy+4,21,12,navy);g.ell(cx,cy,21,12,steel);g.ell(cx,cy-3,21,12,silver);
  g.arc(cx,cy-3,20,11,0,Math.PI,copper);
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8,p=polar(cx,cy-3,19,10,a),q=polar(cx,cy-3,14,7,a);
    g.line(...p,...q,dark); if(Math.sin(a)>0)g.pixel(p[0],p[1]+4,lightTeal);
  }
  g.ell(cx,cy-5,15,9,dark);g.ell(cx,cy-7,14,8,gold);g.ell(cx,cy-8,12,7,navy);
  g.poly([[cx-10,cy-8],[cx-9,cy-17],[cx-2,cy-24],[cx+6,cy-21],[cx+11,cy-13],[cx+9,cy-7],[cx,cy-3]],dark);
  g.poly([[cx-9,cy-10],[cx-8,cy-17],[cx-2,cy-23],[cx,cy-13],[cx-3,cy-5]],'50c7ba');
  g.poly([[cx-2,cy-23],[cx+6,cy-20],[cx+10,cy-13],[cx,cy-13]],'3295a7');
  g.poly([[cx,cy-13],[cx+10,cy-13],[cx+8,cy-8],[cx-2,cy-5]],'206782');
  g.line(cx-8,cy-16,cx-2,cy-22,lightTeal);g.line(cx-9,cy-10,cx-4,cy-6,white);
  for(let i=0;i<4;i++){const t=(i+f*.25)*TAU/4, p=polar(cx,cy-6,13,7,t);g.rect(p[0],p[1],2,2,lightGold);}
  // Offset comms array and antenna, solar panel blades and beacon mast.
  g.rect(70,21,2,19,dark);g.line(70,20,70,36,silver);g.ell(70,22,5,2,steel);
  const antenna=[5,2,-5,-2][f];
  g.line(70-antenna,19,70+antenna,23,white);g.line(70,21,70+antenna,17,gold);g.pixel(70+antenna,16,f%2?'fc875b':gold);
  pod(30,65,7);pod(83,65,7);pod(55,75,8);
  g.line(54,83,54,89,dark);g.pixel(54,89,f%2?lightTeal:teal);
});
// Ships point right along +X so routes can rotate them about frame centres.
for(let tier=1;tier<=3;tier++)sheet('ship'+tier,48,32,8,(g,f)=>{
  const boost=[0,3,1,4][f],p=tier===1?'4c8098':tier===2?'41879d':'80768c';
  for(const side of [-1,1]){
    const y=16+side*(4+tier);
    g.poly([[12,y-2],[8,y-2],[1+(4-boost),y],[8,y+2],[12,y+1]],tier===3?'be534f':'c65e40');
    g.line(6+boost%3,y,12,y,gold);g.line(9,y,13,y,lightGold);
    const wing=[[14,16+side*3],[10,16+side*(6+tier*2)],[11,16+side*(8+tier*2)],[20,16+side*(7+tier)],[31,16+side*3]];
    g.poly(wing,navy);g.poly(wing.map(([x,y])=>[x,y-side]),p);g.line(...wing[2],...wing[3],gold);
    g.rect(11,y-2,10,4,dark);g.rect(13,y-2,6,2,silver);g.line(11,y-1,11,y+1,lightTeal);
    if(tier>=2){
      const wingY=16+side*(tier+6);
      g.poly([[13,wingY],[18,wingY-side*2],[23+tier,wingY],[20,wingY+side*2],[12,wingY+side]],steel);
      g.line(14,wingY,19,wingY-side,silver);g.pixel(12,wingY,lightGold);
    }
    if(tier===3){
      const podY=16+side*11;
      g.line(18,16+side*6,19,podY,gold);
      g.poly([[13,podY],[16,podY-side*2],[23,podY-side],[25,podY],[21,podY+side*2],[13,podY+side]],dark);
      g.line(15,podY-side,21,podY-side,silver);g.line(13,podY,8-boost/2,podY,'ff8c5c');
      g.pixel(14,podY,lightTeal);
    }
  }
  g.poly([[10,15],[14,12],[24,10],[35,12],[43,15],[44,17],[32,21],[17,21],[11,18]],navy);
  g.poly([[12,15],[18,12],[26,11],[35,13],[42,15],[34,17],[18,17],[13,16]],silver);
  g.poly([[13,17],[32,17],[42,15],[39,18],[31,20],[18,20]],steel);
  g.line(18,12,26,11,white);g.line(31,12,40,15,lightGold);
  g.poly([[25,14],[30,12],[36,14],[32,16],[26,16]],dark);
  g.line(27,14,31,13,lightTeal);g.line(31,13,34,14,teal);
  g.rect(15,14,6+tier,2,dark);g.rect(17,14,2,1,gold);
  for(let i=0;i<tier;i++)g.pixel(21+i*3,18,lightGold);
});
// Isometric, bevelled construction tiles use the same orbital architecture.
function block(g,x,y,w,d,h,roof,left,right){
  g.poly([[x-w,y],[x,y+d],[x,y+d+h],[x-w,y+h]],left);
  g.poly([[x,y+d],[x+w,y],[x+w,y+h],[x,y+d+h]],right);
  g.poly([[x-w,y],[x,y-d],[x+w,y],[x,y+d]],roof);
  g.line(x-w,y,x,y-d,shade(roof,white,.5));g.line(x-w,y+h,x,y+d+h,navy);
}
for(const type of ['spaceport','refinery','resort','lab','hologram'])sheet(type,48,48,4,(g,f)=>{
  block(g,24,29,20,9,5,steel,dark,navy);block(g,24,27,18,8,2,'577a82',steel,dark);
  if(type==='spaceport'){
    block(g,24,24,13,5,3,silver,steel,dark);g.line(14,24,23,20,white);
    for(let i=0;i<5;i++){g.pixel(21+i*3,26-i,lightGold);g.pixel(15+i*3,24-i,lightTeal);}
    block(g,30,15,4,2,9,silver,steel,dark);block(g,30,12,6,3,3,gold,teal,dark);
    g.line(30,12,30,5,silver);g.line(30,7,30+[3,-1,-3,1][f],5,lightGold);g.pixel(30,5,f%2?'ff845d':lightGold);
  }else if(type==='refinery'){
    for(const [x,y,h] of [[18,23,10],[29,24,14],[23,29,8]]){
      g.rect(x-4,y-h,9,h,steel);g.rect(x+1,y-h,4,h,dark);g.ell(x,y,4,2,dark);
      g.ell(x,y-h,4,2,gold);g.ell(x,y-h-1,3,1,navy);
      g.rect(x-4,y-4,8,1,copper);g.pixel(x-3,y-3,lightGold);
      for(let j=0;j<3;j++)g.pixel(x-1+(j+f)%3,y-h-3-j*2-(f===3?1:0),j===0?'ff9a65':steel);
    }
  }else if(type==='resort'){
    block(g,23,22,11,5,6,silver,steel,dark);block(g,23,17,8,4,6,'9ca3a3',steel,dark);
    block(g,24,12,5,3,5,gold,steel,dark);g.line(24,12,24,4,gold);
    for(let i=0;i<5;i++){g.pixel(14+i*2,24+i,lightTeal);g.pixel(24+i*2,28-i,lightGold);}
    g.rect(11,25,2,4,copper);g.ell(11,24,3,2,teal);
    g.pixel(15+f*2,24+f,white);g.pixel(28-f,17+f,lightGold);
  }else if(type==='lab'){
    g.ell(24,26,12,6,dark);g.ell(24,24,12,6,gold);
    g.ell(24,21,10,8,teal);g.ell(21,18,5,4,'6ccac4');g.arc(24,21,9,7,Math.PI,Math.PI*1.6,lightTeal);
    g.line(17,16,22,22,steel);g.line(22,22,33,20,steel);g.line(22,22,21,27,steel);
    g.arc(24,23,8,4,f*Math.PI/2,f*Math.PI/2+.65,lightTeal);g.pixel(24,24,f%2?lightGold:teal);
  }else{
    block(g,24,25,7,3,3,silver,steel,dark);g.rect(22,17,4,8,teal);
    g.poly([[9,9],[36,6],[36,20],[9,23]],dark);
    for(let i=0;i<12;i++)g.line(10,10+i,35,7+i,i%4===f?'57d8c2':'327080');
    g.line(15,18,20,13,lightGold);g.line(20,13,24,16,lightGold);g.line(24,16,31,10,lightGold);
  }
});
// 32-pixel inventory silhouettes, all with moving specular highlights.
for(const key of ['stock','ad','chip','deed','credits'])sheet(key,32,32,4,(g,f)=>{
  if(key==='credits'){
    for(const [x,y] of [[11,22],[21,19],[16,14]]){
      g.ell(x,y+2,8,4,navy);g.ell(x,y+1,8,4,copper);g.ell(x,y-1,8,4,gold);
      g.arc(x,y-1,7,3,Math.PI,2*Math.PI,lightGold);g.line(x-3,y,x+3,y-2,copper);
    }
  }else if(key==='stock'||key==='deed'){
    const isDeed=key==='deed';
    g.poly([[5,5],[23,5],[27,9],[27,26],[5,26]],navy);g.rect(5,5,20,19,isDeed?'b1c6ac':'a4c8bd');
    g.rect(7,7,16,15,isDeed?'719090':'527f81');g.rect(8,8,14,13,isDeed?'c2d5b4':'b4d8c8');
    g.line(10,10,19,10,steel);g.line(10,12,16,12,steel);
    if(isDeed){g.ell(14,17,4,3,teal);g.line(9,19,20,15,steel);}
    else{g.line(10,18,14,15,teal);g.line(14,15,16,17,teal);g.line(16,17,20,13,teal);}
    g.poly([[19,21],[25,21],[26,29],[23,27],[21,29]],copper);g.ell(22,21,4,4,gold);g.ell(22,21,2,2,copper);
  }else if(key==='ad'){
    g.rect(3,6,26,18,navy);g.rect(4,7,24,14,silver);g.rect(5,8,22,12,'277884');
    for(let j=0;j<5;j++)g.line(6,9+j*2,25,9+j*2,'328e94');
    g.poly([[9,13],[13,13],[19,10],[19,18],[13,16],[9,16]],lightGold);
    g.line(12,16,13,19,copper);g.rect(14,24,4,2,steel);g.rect(10,26,12,1,silver);
  }else{
    for(let i=0;i<5;i++){g.rect(6+i*4,5,2,21,gold);g.rect(4,7+i*4,23,2,copper);}
    g.rect(6,6,20,20,navy);g.rect(7,7,18,17,'37787c');g.rect(9,9,14,13,steel);
    g.poly([[10,16],[15,11],[22,15],[17,20]],lightTeal);g.line(13,16,16,13,teal);g.line(16,13,19,15,teal);
  }
  g.pixel(10+f*3,8+(key==='credits'?3:0),white);
});
require('./lounge-art.cjs')({sheet, shade, noise, rnd, TAU});
require('./confluence-art.cjs')({sheet,shade,noise,rnd,TAU});
require('./registry-art.cjs')({sheet,TAU});
require('./collection-art.cjs')({sheet,shade,TAU});
fs.writeFileSync(path.join(out,'sprites.js'),'window.SPRITES = '+JSON.stringify(manifest,null,2)+';\n');
console.log('Generated '+Object.keys(manifest).length+' four-frame sprite sheets.');
