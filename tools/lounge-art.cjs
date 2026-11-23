'use strict';
// Drawn directly on the same native pixel grid as the fleet and map sprites.
module.exports = function drawLounge({sheet,shade,noise,rnd,TAU}) {
  const ink='191625', shadow='57394b', bronze='915a45', brass='c88e57', gold='eed19a', ivory='fff0cc';
  const petrol='254351', jade='23786e', mint='75c9a5', frost='d0f0ce';
  const shine=(g,x,y,f)=>{
    const size=[0,1,2,1][f]; g.pixel(x,y,f===0?gold:ivory);
    if(size){g.line(x-size,y,x+size,y,f===3?gold:ivory);g.line(x,y-size,x,y+size,ivory);}
    if(f===3)g.pixel(x+2,y-2,gold);
  };
  function gem(g,x,y,r,p) {
    const corners=[[x,y-r],[x+r-1,y-r/2],[x+r,y+r/3],[x,y+r],[x-r,y+r/3],[x-r+1,y-r/2]];
    g.poly(corners,p[0]);
    for(let i=0;i<6;i++)g.poly([corners[i],corners[(i+1)%6],[x-1,y-1]],p[[2,1,0,1,2,3][i]]);
    g.line(x-r+2,y-r/2,x,y-r+1,p[3]);
  }
  function tiltedRing(g,x,y,rx,ry,angle,color,first=0,last=TAU){
    let prev;
    for(let i=0;i<=100;i++){
      const t=first+(last-first)*i/100,a=rx*Math.cos(t),b=ry*Math.sin(t);
      const next=[Math.round(x+a*Math.cos(angle)-b*Math.sin(angle)),Math.round(y+a*Math.sin(angle)+b*Math.cos(angle))];
      if(prev)g.line(...prev,...next,color);prev=next;
    }
  }
  sheet('luxYacht',64,48,6,(g,f)=>{
    // A deck of sweeping continuous balconies atop a long swept crescent hull.
    g.poly([[7,27],[22,25],[40,24],[59,18],[56,24],[47,29],[28,34],[15,34],[8,31]],ink);
    g.poly([[7,26],[22,24],[38,23],[58,18],[55,23],[41,29],[23,32],[12,31]],'998a83');
    g.poly([[9,25],[16,23],[35,22],[58,17],[53,22],[39,26],[19,30],[10,29]],'decda9');
    g.line(11,28,20,29,ivory);g.line(21,29,42,24,ivory);g.line(42,24,57,18,ivory);
    g.line(18,31,37,28,brass);g.line(37,28,47,25,brass);
    for(let i=0;i<9;i++)g.pixel(18+i*3,29-Math.floor(i*.65),petrol);
    g.poly([[16,24],[21,19],[31,17],[37,19],[45,20],[37,23],[24,26]],ivory);
    g.poly([[19,24],[23,20],[32,18],[37,20],[32,23],[25,25]],petrol);
    g.poly([[21,22],[25,20],[32,19],[34,20],[28,22]],mint);
    for(let i=0;i<3;i++)g.line(24+i*4,21-i,25+i*4,23-i,bronze);
    g.poly([[13,24],[16,17],[18,14],[19,20],[22,23]],brass);g.line(16,18,18,15,ivory);
    g.line(33,19,31,12,brass);g.line(29,13,35,11,gold);
    g.poly([[14,28],[18,28],[17,31],[11,33],[8,32],[10,30]],petrol);
    g.line(8,32,4-f,34+(f%2),jade);g.line(11,31,7-f,33,mint);
    shine(g,45,22,f);
  });
  sheet('luxBrooch',64,48,4,(g,f)=>{
    // Feathered gold wings and a pear-cut emerald suspended below the mount.
    for(const side of [-1,1]){
      const pts=p=>p.map(([x,y])=>[32+side*x,y]);
      g.poly(pts([[4,21],[11,20],[17,16],[25,10],[24,19],[17,25],[11,27],[7,31],[4,30]]),shadow);
      for(let i=0;i<4;i++){
        g.poly(pts([[4+i,21+i],[14+i*2,18+i],[24-i*2,11+i*4],[21-i,18+i*3],[10,26+i]]),i%2?brass:gold);
        g.line(32+side*(9+i),23+i,32+side*(20-i),17+i*3,bronze);
      }
      g.ell(32+side*9,29,2,2,bronze);g.pixel(32+side*9,28,gold);
    }
    gem(g,32,23,10,[bronze,brass,gold,ivory]);gem(g,32,23,8,['184a4e',jade,mint,frost]);
    g.line(32,33,32,36,gold);gem(g,32,38,3,[petrol,jade,mint,frost]);shine(g,29,18,f);
  });
  sheet('luxAstrolabe',64,48,4,(g,f)=>{
    g.ell(32,39,14,3,ink);g.ell(32,38,13,3,bronze);g.ell(32,37,11,2,gold);
    g.poly([[28,36],[31,30],[34,29],[35,34],[39,37]],brass);
    tiltedRing(g,32,21,19,16,-.4,bronze);tiltedRing(g,32,20,18,16,-.4,gold);
    g.line(20,34,44,6,brass);g.ell(32,21,9,9,petrol);g.ell(30,19,7,7,'386b73');g.ell(28,17,4,4,'639192');
    for(let i=0;i<13;i++)g.pixel(26+Math.floor(rnd(i,1)*12),16+Math.floor(rnd(i,2)*11),i%3?gold:mint);
    tiltedRing(g,32,21,21,5,-.45,brass);tiltedRing(g,32,20,21,5,-.45,gold);
    tiltedRing(g,32,20,7,16,-.38,brass);tiltedRing(g,31,20,7,16,-.38,gold);
    for(let i=0;i<12;i++){const a=i*TAU/12+.1;g.pixel(32+Math.cos(a)*18,20+Math.sin(a)*15,ivory);}
    const phase=f*TAU/4;g.ell(32+15*Math.cos(phase),21+5*Math.sin(phase)-5*Math.cos(phase),2,2,gold);
    shine(g,43,7,f);
  });
  sheet('luxRing',64,48,4,(g,f)=>{
    for(let i=0;i<5;i++)tiltedRing(g,31+i*.25,28,13-i*.62,10-i*.58,-.60,[shadow,bronze,brass,gold,bronze][i]);
    tiltedRing(g,31,27,13,10,-.6,ivory,Math.PI,Math.PI*1.55);
    g.poly([[30,15],[36,10],[45,11],[49,18],[45,24],[36,26],[30,22]],bronze);
    gem(g,39,18,9,[bronze,brass,gold,ivory]);
    gem(g,39,18,7,['a34442','d36d43','f3ad65','ffe9ad']);
    for(const [x,y] of [[32,14],[46,15],[43,24],[34,23]]){g.rect(x,y,2,3,brass);g.pixel(x,y,ivory);}
    shine(g,36,13,f);
  });
  for(const [key,harbor] of [['luxPainting',false],['luxPrint',true]])sheet(key,64,48,3,(g,f)=>{
    g.rect(5,5,54,38,ink);g.rect(6,5,52,36,bronze);g.rect(7,6,50,34,gold);g.rect(9,8,46,30,shadow);
    g.rect(10,9,44,28,harbor?'e8d8ad':brass);g.rect(12,11,40,24,harbor?'89acaf':'504666');
    for(let i=0;i<7;i++)g.line(12,16+i,51,16+i,harbor?shade('a4c6c0','dfc29f',i/7):shade('73567b','d89c7d',i/7));
    if(harbor){
      g.rect(12,24,40,11,'437785');
      g.poly([[12,24],[16,22],[17,19],[20,20],[21,23],[23,22],[24,17],[26,16],[28,22],[35,23],[38,19],[41,18],[43,23],[47,22],[51,24]],'365b6d');
      g.poly([[35,27],[35,15],[28,25]],ivory);g.poly([[36,18],[41,25],[36,26]],gold);g.line(28,27,41,27,petrol);
      for(let i=0;i<16;i++){let x=12+(i*7)%34,y=29+i%5;g.line(x,y,x+2,y,i%2?'76a5a5':'b5c9b9');}
    }else{
      g.ell(23,16,4,4,'f7d1a0');g.ell(41,14,2,2,'d3c8c3');
      g.poly([[12,27],[19,21],[22,23],[29,20],[37,25],[43,21],[51,24],[51,34],[12,34]],'785f72');
      g.poly([[12,28],[21,25],[28,28],[37,26],[43,28],[51,25],[51,34],[12,34]],'453c57');
      g.poly([[34,27],[38,27],[30,29],[33,30],[25,31],[31,32],[23,34],[16,34],[24,31],[21,31]],'ae898b');
    }
    for(const [x,y] of [[7,6],[54,6],[7,37],[54,37]]){g.rect(x,y,3,3,brass);g.pixel(x,y,ivory);}
    shine(g,48,7,f);
  });
  sheet('lounge-window',480,160,0,(g)=>{
    // Space beyond the panoramic vaulted glass. A tilted dust lane and
    // correlated colour noise give the sky clustered light and dark regions.
    for(let y=0;y<160;y++)for(let x=0;x<480;x++){
      const nebulosity=noise(x/52,y/23,9)*.6+noise(x/20,y/15,62)*.3+noise(x/7,y/6,42)*.1;
      const lane=Math.max(0,1-Math.abs(y-(130-x*.23+13*Math.sin(x/63)))/65);
      const t=Math.floor(Math.max(0,nebulosity*lane-.18)*12+(x+y)%2*.26)/8;
      g.pixel(x,y,shade('201d39','926575',t));
      const n=rnd(x,y);if(n>.994)g.pixel(x,y,n>.9993?'f9d9b0':n>.997?'c9a2b0':'857b9b');
      if(n>.99980){g.line(x-2,y,x+2,y,'a594a6');g.line(x,y-1,x,y+1,'d0b7ba');g.pixel(x,y,ivory);}
    }
    // Saturn-like world behind the station. Rings pass behind and in front
    // of the globe, with the Cassini gap visible even at native resolution.
    const px=306,py=54,r=34,tilt=-.29;
    function rings(front){
      for(let y=-36;y<=36;y++)for(let x=-81;x<=81;x++){
        const u=x*Math.cos(tilt)+y*Math.sin(tilt),v=-x*Math.sin(tilt)+y*Math.cos(tilt);
        const d=Math.hypot(u/77,v/16);
        if((v>0)!==front||d<.60||d>1||d>.82&&d<.85||d>.93&&d<.945)continue;
        const band=Math.sin(d*244)*.2+Math.sin(d*68)*.13+.60;
        g.pixel(px+x,py+y,shade('79546b',front?'e6bc92':'b18b8c',Math.floor(band*8)/8));
      }
    }
    rings(false);
    for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){
      const d=(x*x+y*y)/r**2;if(d>1)continue;
      const z=Math.sqrt(1-d),nx=x/r,ny=y/r,lat=ny+.23*nx+.16*(1-z);
      const whorl=.8*noise(nx*4+3,ny*7,19)+.3*Math.sin(nx*5);
      const bands=.51+.12*Math.sin(lat*21+whorl)+.08*Math.sin(lat*51+whorl*1.7);
      const light=.40+.48*(-.63*nx-.38*ny+.60*z);
      const t=Math.min(1,Math.max(0,light+bands-.47));
      let color=shade('644563','f2c594',Math.floor(t*10+(x+y)%2*.30)/10);
      if(d>.92&&nx+ny<-.5)color=gold;
      g.pixel(px+x,py+y,color);
    }
    rings(true);
    // A small distant industrial station, dot-lit along the nearer ring.
    const sx=178,sy=68;
    g.line(sx-13,sy+4,sx+15,sy-5,bronze);
    for(let i=-1;i<=1;i+=2){g.poly([[sx+20*i,sy-5],[sx+25*i,sy-8],[sx+28*i,sy-6],[sx+22*i,sy-3]],'765a70');g.line(sx,sy,sx+23*i,sy-6,'94747c');}
    g.ell(sx,sy+3,17,4,'3a354d');g.ell(sx,sy+1,18,4,'b89485');
    g.ell(sx,sy,11,2,'4c425d');g.rect(sx-4,sy-6,8,7,'86788a');
    g.line(sx,sy-8,sx,sy-17,'a2828e');g.line(sx-4,sy-4,sx-1,sy-9,'dbc5aa');
    for(let i=-12;i<=12;i+=4)g.pixel(sx+i,sy+4-Math.floor(Math.abs(i)/8),'ffc88a');
    g.line(201,85,214,81,'9c7d88');g.line(210,82,215,80,'e9c6a6');
    // Art-deco brass frames and pinkish mullion bevels with nested rebates.
    const beam=(points,dx,dy)=>{
      g.poly(points,'322638');for(let i=0;i<points.length-1;i++){
        const a=points[i],b=points[i+1];g.line(...a,...b,'78565b');g.line(a[0]+dx,a[1]+dy,b[0]+dx,b[1]+dy,brass);
      }
    };
    beam([[0,0],[479,0],[455,7],[345,10],[185,10],[39,7]],0,1);
    beam([[0,0],[36,6],[58,34],[58,37],[51,37],[28,13],[0,11]],0,1);
    beam([[478,0],[442,8],[422,29],[421,34],[429,31],[453,11],[479,10]],0,1);
    for(const [x,end] of [[98,111],[388,370]]){
      g.poly([[x-5,6],[x+2,8],[end+2,109],[end-3,109]],'3c2c40');
      g.line(x-4,8,end-2,107,'a97d70');g.line(x+2,8,end+3,106,'644e5d');
    }
    // Hardwood sill, ventilation grille and velvet floor with inset brass.
    g.poly([[0,99],[94,106],[378,106],[480,94],[480,119],[0,128]],'68505a');
    g.line(0,99,94,106,brass);g.line(94,106,378,106,gold);g.line(378,106,480,94,brass);
    g.poly([[0,109],[95,113],[375,113],[480,100],[479,132],[0,140]],'362735');
    g.line(92,113,375,113,bronze);for(let i=0;i<37;i++)g.line(94+i*7,116,97+i*7,116,'68505b');
    g.poly([[0,134],[90,120],[377,120],[480,109],[479,159],[0,159]],'46323e');
    for(let i=0;i<14;i++)g.line(142+i*13,120,-93+i*48,159,'60434c');
    for(const y of [128,142,155])g.line(0,y,479,y,'553c45');
    // A stepped ceiling and left wall sconces reflected on lacquered wood.
    g.poly([[0,0],[27,0],[27,87],[17,105],[0,112]],'342636');
    g.poly([[0,0],[11,0],[11,96],[0,108]],'513849');
    for(let x=3;x<26;x+=5)g.line(x,3,x,89-(x%3),x%2?'77545a':'61434e');
    g.rect(12,31,9,24,'37262f');g.rect(13,31,7,21,bronze);g.rect(14,32,5,18,gold);g.line(16,32,16,47,ivory);
    for(const y of [32,35,48,51])g.line(12,y,20,y,brass);
    // Large left planter, each frond drawn leaf by leaf with a warm edge.
    g.ell(43,137,18,4,'332633');g.poly([[31,108],[54,108],[50,131],[45,135],[37,132]],'80605a');
    g.poly([[31,109],[41,111],[41,132],[36,130]],'ad7962');g.ell(42,108,12,3,brass);g.ell(42,107,10,2,'302b38');
    for(const [x,y,arc] of [[24,60,-4],[51,57,3],[69,72,3],[15,81,-3],[35,52,-3],[61,90,2],[33,77,-1],[50,74,3]]){
      let bx=42,by=106;
      for(let i=1;i<=10;i++){
        const u=i/10,ex=42+(x-42)*u+arc*Math.sin(u*Math.PI),ey=106+(y-106)*u;
        g.line(bx,by,ex,ey,'547067');const leaf=Math.sin(Math.PI*u)*(x<42?-8:8);
        g.poly([[ex,ey+2],[ex+leaf,ey-5],[ex+leaf*1.35,ey-7],[ex+leaf*.5,ey-1]],i%2?'536963':'647d6b');
        g.line(ex,ey+1,ex+leaf*.8,ey-4,i%3?'625f60':'849078');bx=ex;by=ey;
      }
    }
    // Low velvet settee with piping, button tufting and gold tapered feet.
    g.ell(397,147,61,5,'2a222f');
    g.poly([[331,126],[341,105],[350,101],[415,94],[434,97],[441,119],[429,136],[348,143]],'382534');
    g.poly([[341,122],[344,108],[350,104],[415,97],[428,99],[433,115],[423,121],[351,132]],'795161');
    for(let i=0;i<8;i++){const x=350+i*10,y=107-i;g.line(x,y,x+3,y+14,'64414f');g.pixel(x+3,y+5,'ad826f');}
    g.poly([[342,128],[353,122],[421,114],[431,119],[424,128],[346,138]],'a37172');
    g.line(348,135,422,126,'cb9380');g.line(354,124,417,117,'bf8b7a');
    g.poly([[331,124],[337,118],[345,119],[350,133],[349,142],[337,141]],'8a5963');
    g.line(333,124,338,120,'cc957f');g.line(342,141,342,147,brass);
    g.poly([[425,117],[430,110],[438,110],[443,122],[439,132],[423,134]],'805461');g.line(429,114,436,111,'bf9079');g.line(435,133,435,140,brass);
    // Cocktail table, open book and lit glass decanter.
    g.ell(253,145,29,5,'332936');g.ell(252,141,11,3,bronze);g.ell(252,140,9,2,brass);g.rect(250,125,4,14,bronze);
    g.ell(252,126,27,7,shadow);g.ell(252,124,27,6,brass);g.ell(252,123,25,5,'855d57');
    g.poly([[233,122],[245,119],[251,121],[239,125]],'c5a58e');g.line(240,124,250,121,ivory);
    g.poly([[259,122],[258,118],[260,115],[260,110],[264,110],[264,115],[266,118],[266,122]],'bb9482');g.rect(260,118,5,4,bronze);g.line(260,117,260,121,gold);
    g.ell(262,109,2,1,ivory);g.rect(251,116,4,5,'9b8c8c');g.line(251,116,254,116,gold);
    // Fringed opal art-deco standard lamp in front of the end wall.
    g.rect(455,62,3,67,bronze);g.line(455,66,455,129,gold);g.ell(456,130,9,3,bronze);g.ell(456,129,7,2,brass);
    g.poly([[441,65],[445,57],[450,52],[462,52],[468,57],[472,65],[471,69],[442,69]],brass);
    g.poly([[443,65],[447,58],[452,54],[460,54],[466,58],[470,65]],'e7b587');
    for(const x of [445,451,460,466])g.line(455+(x-455)*.5,54,x,66,gold);
    g.rect(443,67,27,2,gold);g.line(468,70,468,74,brass);
  },1);
};
