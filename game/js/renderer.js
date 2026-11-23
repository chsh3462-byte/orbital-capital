'use strict';
window.PixelArt=(()=>{
  const cache={};
  function load(){
    for(const [key,spec] of Object.entries(window.SPRITES||{})){
      const im=new Image();im.src=spec.src;cache[key]=im;
    }
  }
  function sprite(ctx,key,cx,cy,w,t,angle=0){
    const spec=window.SPRITES?.[key],im=cache[key];
    if(!spec||!im?.complete||!im.naturalWidth)return;
    const frame=Math.floor(t*spec.fps)%spec.frames;
    const h=Math.round(w*spec.h/spec.w);
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(cx),Math.round(cy));
    if(angle)ctx.rotate(angle);
    ctx.drawImage(im,frame*spec.w,0,spec.w,spec.h,-Math.round(w/2),-Math.round(h/2),w,h);ctx.restore();
  }
  function thumb(key,size=40){return '<canvas class="sprite-thumb" width="'+size+'" height="'+size+'" data-sprite="'+key+'" aria-hidden="true"></canvas>';}
  function noise(x,y){
    let n=Math.imul(x+12345,374761393)+Math.imul(y+1327,668265263);n=Math.imul(n^(n>>>13),1274126177);
    return ((n^(n>>>16))>>>0)/4294967295;
  }
  function cloud(x,y){
    const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
    const a=fx*fx*(3-2*fx),b=fy*fy*(3-2*fy);
    return (noise(ix,iy)*(1-a)+noise(ix+1,iy)*a)*(1-b)+(noise(ix,iy+1)*(1-a)+noise(ix+1,iy+1)*a)*b;
  }
  function sky(w,h){
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d'),img=ctx.createImageData(w,h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      let f=0,a=1,k=1/79;for(let j=0;j<5;j++){f+=a*cloud(x*k+7,y*k+13);a*=.52;k*=2.12;}
      const ribbon=Math.exp(-Math.pow((y/h-.86+x/w*.61-.12*Math.sin(x/w*7))/.23,2));
      const v=Math.max(0,f-.6)*(.27+.82*ribbon);
      const i=(y*w+x)*4,mag=.5+.5*Math.sin(x/w*7+y/h*3);
      img.data[i]=6+v*(27+mag*26);img.data[i+1]=12+v*(19+(1-mag)*18);img.data[i+2]=27+v*(65+mag*22);img.data[i+3]=255;
    }
    ctx.putImageData(img,0,0);
    for(let i=0;i<w*h/285;i++){
      const x=noise(i,1)*w|0,y=noise(i,2)*h|0,b=noise(i,3);
      ctx.fillStyle=b>.96?'#cee0ef':b>.7?'#7599bd':b>.4?'#59607e':'#343f57';ctx.fillRect(x,y,1,1);
      if(b>.988){ctx.fillStyle='#6d81a5';ctx.fillRect(x-2,y,5,1);ctx.fillRect(x,y-2,1,5);ctx.fillStyle='#dceaff';ctx.fillRect(x,y,1,1);}
    }
    return c;
  }
  const HQ={id:'hq',x:.49,y:.48,name:'오르빗 본사',sprite:'hq'};
  const nodes=[...GameData.planets,HQ];
  const colors={player:'#5ee8d2',HEL:'#ffb375',NVA:'#bfa1ff',AXM:'#7dbdff',free:'#8e9eaf'};
  // Three-by-five bitmaps keep the settlement amount aligned to the map's pixel grid.
  const digits={'0':[7,5,5,5,7],'1':[2,6,2,2,7],'2':[7,1,7,4,7],'3':[7,1,7,1,7],
    '4':[5,5,7,1,1],'5':[7,4,7,1,7],'6':[7,4,7,5,7],'7':[7,1,1,1,1],'8':[7,5,7,5,7],
    '9':[7,5,7,1,7],'+':[0,2,7,2,0],',':[0,0,0,2,4],' ':[0,0,0,0,0],C:[7,4,4,4,7],R:[6,5,6,5,5]};
  function pixelText(ctx,text,x,y){
    let left=Math.round(x-text.length*2);
    for(const char of text){
      const rows=digits[char]||digits[' '];
      for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(rows[j]&(4>>i))ctx.fillRect(left+i,Math.round(y)+j,1,1);
      left+=4;
    }
  }
  class StarMap{
    constructor(canvas,labels,select){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.labels=labels;this.zoom=1;this.routes=true;this.pulses=[];this.transit=0;
      this.buttons={};
      for(const p of nodes){
        const b=document.createElement('button');b.className='node-label'+(p.id==='hq'?' hq-tag':'');
        b.textContent=p.name;b.addEventListener('click',()=>select(p.id));labels.append(b);this.buttons[p.id]=b;
      }
      canvas.addEventListener('click',e=>{
        const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)*this.w/rect.width,y=(e.clientY-rect.top)*this.h/rect.height;
        for(const p of [...nodes].reverse()){const a=this.point(p);if(Math.hypot(a.x-x,a.y-y)<(p.id==='hq'?42:24)*this.zoom){select(p.id);break;}}
      });
    }
    point(p){return {x:((p.x-.5)*this.zoom+.5)*this.w,y:((p.y-.5)*this.zoom+.5)*this.h};}
    payout(net){this.pulses.push({t:this.time||0,net});}
    draw(s,t,dt){
      this.time=t;this.transit+=dt*(1+s.tech.warp*.18);
      const c=this.canvas,ctx=this.ctx;
      const w=Math.min(790,Math.max(420,Math.round(c.clientWidth/1.25))),h=Math.max(200,Math.round(w*c.clientHeight/Math.max(c.clientWidth,1)));
      if(!this.bg||w!==this.w||h!==this.h){this.w=c.width=w;this.h=c.height=h;this.bg=sky(w,h);}
      ctx.imageSmoothingEnabled=false;ctx.drawImage(this.bg,0,0);
      ctx.lineWidth=1;
      const home=this.point(HQ),routes=[];
      GameData.planets.forEach((p,i)=>{
        const dest=this.point(p),middle={x:(home.x+dest.x)/2+(i%2?8:-12),y:(home.y+dest.y)/2-(i%2?17:-11)};
        const at=u=>({x:(1-u)**2*home.x+2*u*(1-u)*middle.x+u*u*dest.x,y:(1-u)**2*home.y+2*u*(1-u)*middle.y+u*u*dest.y});
        routes.push(at);
        if(this.routes){
          ctx.strokeStyle=i===0?'#51a89e':'#576488';ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(home.x,home.y);ctx.quadraticCurveTo(middle.x,middle.y,dest.x,dest.y);ctx.stroke();ctx.setLineDash([]);
        }
      });
      ctx.strokeStyle='#396d76';ctx.setLineDash([2,5]);ctx.beginPath();ctx.ellipse(home.x,home.y+2,58*this.zoom,19*this.zoom,-.12,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      for(const p of nodes){
        const a=this.point(p),isHQ=p.id==='hq',width=(isHQ?106:p.id==='lyra'?59:p.id==='orion'?44:41)*this.zoom;
        const state=s.planets.find(x=>x.id===p.id),color=colors[isHQ?'player':state.owner||'free'];
        sprite(ctx,p.sprite,a.x,a.y,width,t+p.x);
        const btn=this.buttons[p.id];btn.style.left=a.x/w*100+'%';btn.style.top=((a.y+width*(isHQ?.39:p.id==='lyra'?.28:.40))/h*100)+'%';btn.style.setProperty('--node',color);
        if(!isHQ&&state.buildings.length>1)sprite(ctx,state.buildings.at(-1),a.x+width*.43,a.y-3,16*this.zoom,t);
      }
      if(s.ads.length)sprite(ctx,'hologram',home.x+47*this.zoom,home.y-14,28*this.zoom,t);
      for(let i=0;i<Economy.fleet(s);i++){
        const route=routes[(i*2+Math.floor(i/3))%routes.length],phase=(this.transit/(14+i*2)+.21+i*.23)%2;
        const forward=phase<1,u=forward?phase:2-phase,a=route(u),b=route(u+.012);
        const angle=Math.atan2(b.y-a.y,b.x-a.x)+(forward?0:Math.PI);
        for(let j=1;j<=6;j++){ctx.fillStyle='rgba(103,222,240,'+(.36-j*.047)+')';ctx.fillRect(Math.round(a.x-Math.cos(angle)*(9+j*1.6)),Math.round(a.y-Math.sin(angle)*(9+j*1.6)),2,1);}
        sprite(ctx,'ship'+Economy.tier(s),a.x,a.y,25*this.zoom,t+i,Math.round(angle/(Math.PI/16))*Math.PI/16);
      }
      this.pulses=this.pulses.filter(p=>t-p.t<2.2);
      for(const p of this.pulses){
        const age=Math.max(0,t-p.t);ctx.globalAlpha=Math.min(1,(2.2-age)*2);ctx.fillStyle='#a3ffe5';pixelText(ctx,'+'+p.net.toLocaleString('en-US')+' CR',home.x,home.y-37-age*10);
        for(let j=0;j<9;j++){const a=j*2.4;ctx.fillRect(home.x+Math.cos(a)*(10+age*18),home.y-20+Math.sin(a)*(5+age*10),2,2);}ctx.globalAlpha=1;
      }
    }
  }
  return {load,sprite,thumb,StarMap};
})();
