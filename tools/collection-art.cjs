'use strict';
const {items,ships}=require('../game/js/collection.js');

module.exports=function drawCollection({sheet,shade,TAU}){
  const inks=[
    ['ac7850','f1c078','4a918e'],['708387','c7e6d7','a85860'],
    ['705c99','dcc9f0','509fb0'],['b25648','f3c89b','467581'],
    ['61876c','d5e1aa','bd9270'],['b69b71','fff0c2','536c9a']
  ];
  const dark='20263b',white='fff4d7';
  function sparkle(g,x,y,f,color){
    g.pixel(x,y,white);
    if(f===1||f===2){g.line(x-1,y,x+1,y,color);g.line(x,y-1,x,y+1,color);g.pixel(x,y,white);}
    if(f===2)g.pixel(x+2,y-2,white);
    if(f===3)g.pixel(x-2,y+1,color);
  }
  function ship(g,item,f,p){
    const [metal,bright,glass]=p,v=item.variant;
    const x=9+(v%3),y=29-v%2,nose=51+v,spine=21-v%3;
    const plate=(points,color)=>g.poly(points,color);
    const fin=(x,y,dx,dy)=>{
      plate([[x,y],[x+dx,y+dy],[x+dx+5,y+dy+1],[x+10,y+1]],metal);
      g.line(x,y,x+dx,y+dy,bright);
    };
    if(item.form==='foil'){
      fin(28,23,-17,-12-v);fin(27,29,-14,9+v);g.line(12,14,25,12,glass);
    }else if(item.form==='sail'){
      g.line(25,29,29,4,bright);plate([[29,5],[27,22],[11,25]],metal);
      plate([[31,6],[44+v,19],[30,22]],glass);for(let j=0;j<4;j++)g.line(28-j,10+j*3,18+j,23,bright);
    }else if(item.form==='dome'){
      g.ell(31,22,14+v,12,metal);g.ell(31,21,12+v,10,glass);
      g.arc(31,21,10+v,9,3.4,5.5,bright);g.arc(31,22,5,10,Math.PI,TAU,bright);
      fin(20,27,-12,5);
    }else if(item.form==='twinhull'){
      for(const k of [-8,8]){
        plate([[7,26+k],[13,21+k],[44+v,15+k],[55,17+k],[45,22+k],[10,30+k]],metal);
        g.line(12,23+k,44+v,16+k,bright);g.line(9,27+k,3+f,29+k,glass);
      }
      plate([[20,17],[28,15],[36,31],[27,34]],glass);
    }else if(item.form==='clipper'){
      fin(21,24,-13,-15);fin(19,29,-12,9);g.line(35,22,60,14,metal);
    }else if(item.form==='rotunda'){
      g.ell(31,24,22+v,12,dark);g.ell(31,22,22+v,10,metal);
      g.arc(31,21,19+v,8,0,TAU,bright);g.ell(32,18,13,7,glass);
      for(let j=0;j<10;j++)g.rect(12+j*4,24+Math.round(3*Math.sin(j*.35)),2,2,bright);
    }else{
      g.rect(20,14,27,10,glass);for(let j=0;j<5;j++)g.rect(20+j*6,13,2,10,bright);
      plate([[13,15],[24,8-v%3],[42,6],[51,10],[47,13],[22,16]],metal);
      g.line(23,9-v%3,42,7,bright);
    }
    plate([[x,y-5],[22,spine],[nose-5,16],[nose+3,17],[nose,23],[32,31],[x+1,y+4]],dark);
    plate([[x+1,y-4],[23,spine],[nose,16],[nose+2,18],[39,25],[17,29],[x+1,y]],metal);
    g.line(17,25,48,18,bright);g.line(21,28,47,22,glass);
    for(let j=0;j<=v+2;j++){let xx=23+j*3;g.rect(xx,24-Math.floor(j*.65),2,2,glass);g.pixel(xx,23-Math.floor(j*.65),white);}
    for(let j=0;j<1+v%3;j++){
      const ex=x-j,ey=y-1+j*2;
      g.line(ex,ey,Math.max(0,ex-4-((f+j)%4)),ey+1,glass);g.line(ex,ey,ex-2,ey+1,white);
    }
  }
  function object(g,item,f,p){
    const [metal,bright,accent]=p,v=item.variant,h=2*(v%3),cx=32;
    switch(item.form){
      case 'vase':case 'ampoule':{
        const bottle=item.form==='ampoule',w=(bottle?7:11)+v%3*2,top=7+h,mid=27;
        g.ell(cx,mid,w,12,metal);g.poly([[cx-w,mid],[cx-w+2,21],[27,top+7],[27,top],[37,top],[37,top+7],[cx+w-2,21],[cx+w,mid]],metal);
        g.ell(cx,top,6,2,bright);g.rect(26,37,12,2,bright);
        if(bottle){g.rect(28,top-4,8,4,accent);g.ell(cx,mid+2,w-2,6,accent);g.line(cx-w+2,24,cx-w+3,32,white);}
        else for(let j=0;j<=v%3+1;j++)g.arc(cx,25+j*3,w-1,3,0,Math.PI,accent);
        g.line(29,top+4,28,18,bright);break;
      }
      case 'textile':case 'panel':case 'tablet':{
        const cloth=item.form==='textile',stone=item.form==='tablet',left=stone?16:9+h/2,top=8;
        g.rect(left,top,64-2*left,30,metal);g.rect(left+2,top+2,60-2*left,26,accent);
        if(stone){
          for(let row=0;row<4;row++)for(let col=0;col<4;col++){
            let x=left+4+col*6,y=14+row*5;g.line(x,y,x+2+(v+row)%3,y-1,bright);if((col+v)%2)g.line(x+2,y-1,x+1,y+2,bright);
          }
          g.line(39,11,36,17,dark);g.line(36,17,39,19,dark);
        }else{
          g.ell(19+v*4,16,3+v%2,3,bright);
          g.poly([[left+3,31],[left+3,26],[21,20+v%3],[32,28],[44,17+v],[60-left,23],[60-left,34],[left+3,34]],metal);
          for(let j=0;j<10;j++)g.pixel(left+4+(j*7)%(54-2*left),28+(j*5)%6,bright);
          if(cloth){g.rect(left-2,6,68-2*left,2,bright);for(let j=left+1;j<63-left;j+=3)g.line(j,37,j,41+(j+v)%3,metal);}
          else for(let j=left+4;j<60-left;j+=5)for(let y=12;y<34;y+=5)g.pixel(j+(y%2),y,dark);
        }break;
      }
      case 'jewel':case 'seal':{
        const pin=item.form==='jewel',count=5+v;
        if(!pin){g.poly([[20,26],[44,26],[43,34],[49,38],[47,40],[17,40],[16,38],[22,34]],metal);g.rect(17,38,31,2,bright);}
        else g.line(16,36,48,13,bright);
        for(let j=0;j<count;j++){
          const a=j*TAU/count,x=cx+Math.cos(a)*(9+v%3),y=22+Math.sin(a)*8;g.ell(x,y,5,5,metal);g.ell(x,y-1,3,3,accent);g.pixel(x-1,y-2,bright);
        }
        g.poly([[32,12],[40,21],[32,29],[24,21]],bright);g.poly([[32,14],[37,21],[32,26],[27,21]],accent);break;
      }
      case 'casket':{
        const x=12-v%2,z=50+v%3;
        g.poly([[x,20],[z-7,15],[z+2,20],[z+2,33],[x+9,38],[x,32]],metal);
        g.poly([[x,20],[x+8,15-h],[z-8,10-h],[z+2,19],[x+9,26]],bright);
        g.poly([[x+9,26],[z+2,20],[z+2,32],[x+9,38]],accent);
        g.line(x+9,29,z+2,23,bright);g.rect(31,25,5,5,metal);g.pixel(33,26,white);
        for(let j=0;j<3+v;j++)g.line(18+j*3,19,20+j*3,20,metal);break;
      }
      case 'kinetic':case 'fork':{
        g.ell(cx,38,12,3,metal);g.rect(30,14,4,24,bright);
        if(item.form==='fork'){
          g.arc(cx,21,8+v,9,0,Math.PI,metal);
          for(const side of [-1,1]){let x=cx+side*(8+v);g.rect(x-1,6+h,3,16-h,metal);g.line(x-1,7+h,x-1,20,bright);}
          g.ell(cx,35,4,3,accent);
        }else for(let j=0;j<3+v%3;j++){const y=12+j*4,x=13+(j*9+v*3)%34;g.line(cx,y-2,x,y,bright);g.line(x,y,x,y+5,metal);g.ell(x,y+6,3+j%2,2,accent);}
        break;
      }
      case 'dial':case 'lens':{
        const lens=item.form==='lens',rx=13+v%3,ry=11+v%4;
        g.rect(28,28,8,10,metal);g.ell(cx,39,14,2,metal);g.ell(cx,22,rx+3,ry+3,metal);g.ell(cx,21,rx,ry,accent);
        g.arc(cx,21,rx+1,ry+1,0,TAU,bright);
        if(lens){g.arc(cx,20,rx-3,ry-3,3.4,5.6,white);g.arc(cx+2,22,rx-5,ry-5,.1,2.1,bright);g.ell(32+v%2,21,2,2,white);}
        else{for(let j=0;j<12;j++)g.pixel(cx+Math.cos(j*TAU/12)*(rx-2),21+Math.sin(j*TAU/12)*(ry-2),bright);g.line(cx,21,24+v*3,14,white);g.line(cx,21,38,25-v%3,metal);}
        break;
      }
      case 'gate':{
        const w=11+v;
        g.arc(cx,24,w,14,Math.PI,TAU,bright);g.arc(cx,24,w-2,12,Math.PI,TAU,metal);
        for(const side of [-1,1]){
          let x=cx+side*w;g.rect(x-2,22,5,14,metal);g.rect(x-4,36,9,3,bright);
          for(let j=0;j<3;j++)g.line(x-2,24+j*4,x+2,23+j*4,accent);
        }
        g.poly([[32,5],[37,11],[32,17],[27,11]],metal);g.pixel(32,10,white);
        for(let j=0;j<4+v;j++)g.pixel(24+((j*13+f)%17),17+j*2,accent);break;
      }
    }
    // Reflections are anchored on the object, including the narrow open-centre pieces.
    let shineX=0,shineY=0;
    for(let y=8;y<30&&!shineX;y++)for(let x=21;x<43;x++){
      if(g.bytes[(y*g.w+x)*4+3]){shineX=x;shineY=y;break;}
    }
    sparkle(g,shineX,shineY,f,bright);
  }
  for(const item of items){
    const familySeed=Array.from(item.form).reduce((n,c)=>n+c.charCodeAt(0),0);
    const p=inks[(familySeed+item.variant)%inks.length];
    sheet(item.art,64,48,5,(g,f)=>{
      if(ships[item.id])ship(g,item,f,p);else object(g,item,f,p);
      const source=Buffer.from(g.bytes);
      for(let y=1;y<47;y++)for(let x=1;x<63;x++){
        const offset=(y*64+x)*4;
        if(!source[offset+3])continue;
        const depth=!source[offset+64*4+3] ? .42 : ((x+y)%4===0?.10:0);
        if(depth)g.pixel(x,y,shade(Array.from(source.subarray(offset,offset+3)),dark,depth));
      }
    });
  }
};
