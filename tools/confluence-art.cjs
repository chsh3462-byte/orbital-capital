'use strict';
module.exports=function confluence({sheet,shade,noise,rnd,TAU}){
  const ink='171b2c', dark='293247', steel='527080', silver='9cb5b8', ice='d5e8dc', ivory='fff1cf',
    brass='bd895f', gold='efc98d', bronze='885953', coral='e88b71', red='bb5059', wine='76374a',
    deep='29405d', blue='42649a', cyan='6db7c0', mint='88d3b2', jade='428881', plum='624d68';
  function gleam(g,x,y,f){
    const n=[0,1,2,1][f];g.pixel(x,y,ivory);
    if(n){g.line(x-n,y,x+n,y,f===3?gold:ivory);g.line(x,y-n,x,y+n,ivory);}
    if(f===3)g.pixel(x+2,y-2,ice);
  }
  function skiff(g,f){
    g.poly([[9,24],[11,12],[14,11],[24,21],[40,21],[56,15],[48,24],[25,32],[10,31]],wine);
    g.poly([[9,24],[14,14],[19,21],[29,21],[24,26],[12,28]],red);
    g.poly([[12,26],[43,19],[58,14],[55,18],[44,23],[22,29],[11,29]],coral);
    g.poly([[20,27],[30,20],[39,18],[44,19],[37,23],[28,26]],deep);
    g.line(26,24,36,20,cyan);g.line(45,20,56,16,gold);
    g.poly([[19,29],[30,27],[24,31],[12,35],[15,31]],red);g.line(13,34,20,32,ivory);
    for(let i=0;i<3;i++)g.line(16+i*3,24-i,19+i*3,23-i,'f3a083');
    g.line(11,28,2+f,32,jade);g.line(13,28,7-f%2,30,mint);gleam(g,41,21,f);
  }
  function observatory(g,f){
    g.poly([[7,29],[13,24],[20,23],[26,17],[44,18],[51,22],[56,27],[52,32],[35,37],[15,35],[7,32]],dark);
    g.poly([[9,27],[17,23],[42,21],[54,25],[53,29],[36,34],[16,32],[9,30]],blue);
    g.line(12,31,28,33,silver);g.line(32,33,50,28,cyan);
    g.ell(32,23,14,7,steel);g.ell(32,21,13,8,'517e90');g.ell(31,20,11,9,'73a9b3');
    g.ell(28,17,6,4,'a7cac6');g.arc(31,21,12,10,Math.PI,TAU,ice);g.arc(31,21,12,6,0,Math.PI,brass);
    g.line(23,13,29,22,steel);g.line(29,22,42,18,steel);g.line(29,22,30,26,steel);
    g.rect(9,25,5,3,brass);g.rect(43,25,5,2,deep);
    g.line(17,23,13,17,silver);g.line(10,16,17,18,ice);g.line(12,17,12,14,brass);
    for(let i=0;i<4;i++)g.pixel(35+i*3,31-i,ice);g.line(9,30,4-f,31,cyan);gleam(g,27,14,f);
  }
  function catamaran(g,f){
    for(let l=0;l<2;l++){const dx=l*5,dy=l*9;
      g.poly([[6+dx,23+dy],[22+dx,20+dy],[46+dx,13+dy],[53+dx,10+dy],[51+dx,16+dy],[42+dx,21+dy],[16+dx,29+dy],[8+dx,28+dy]],bronze);
      g.poly([[7+dx,23+dy],[29+dx,18+dy],[53+dx,10+dy],[48+dx,16+dy],[17+dx,26+dy],[9+dx,26+dy]],brass);
      g.line(10+dx,24+dy,25+dx,21+dy,gold);g.line(31+dx,19+dy,49+dx,13+dy,gold);
      g.line(9+dx,27+dy,5-f+dx,28+dy,cyan);
    }
    g.poly([[16,21],[36,15],[47,25],[24,31]],steel);g.poly([[19,21],[35,16],[43,24],[25,29]],deep);
    for(let i=0;i<4;i++)g.line(21+i*4,21-i,25+i*4,27-i,cyan);
    g.line(22,24,39,19,brass);g.line(20,22,36,17,gold);gleam(g,46,15,f);
  }
  const icon=(key,draw,fps=4)=>sheet(key,64,48,fps,draw);
  icon('luxSkiff',skiff,7);icon('luxObservatory',observatory,5);icon('luxCatamaran',catamaran,6);
  icon('luxOrreryKey',(g,f)=>{
    g.poly([[17,34],[38,17],[41,20],[20,38],[16,39],[13,37]],bronze);
    g.line(16,36,39,18,gold);g.poly([[18,31],[15,27],[17,25],[20,27],[22,25],[19,23],[22,21],[28,26]],brass);
    g.line(16,27,18,26,gold);g.line(20,24,22,22,gold);
    for(let i=0;i<8;i++){const a=i*TAU/8,r=10,x=43+r*Math.cos(a),y=15+r*Math.sin(a);g.ell(x,y,2,2,brass);}
    for(let i=0;i<3;i++)g.arc(43,15,10-i,10-i,0,TAU,[bronze,gold,brass][i]);
    g.poly([[43,7],[45,13],[51,15],[45,17],[43,23],[41,17],[35,15],[41,13]],gold);
    g.ell(43,15,3,3,bronze);g.pixel(43,14,mint);gleam(g,43,6,f);
  });
  icon('luxTideglass',(g,f)=>{
    g.rect(16,5,32,4,bronze);g.rect(17,5,30,2,gold);g.rect(18,38,28,3,brass);g.rect(16,41,32,2,gold);
    g.line(18,8,19,37,brass);g.line(45,8,44,37,brass);
    g.poly([[21,9],[43,9],[42,15],[36,21],[34,24],[36,27],[42,33],[43,37],[21,37],[23,31],[29,25],[30,23],[24,17]],deep);
    for(let s of [-1,1]){
      g.line(32+11*s,10,32+9*s,15,silver);g.line(32+9*s,15,32+2*s,23,cyan);
      g.line(32+2*s,25,32+9*s,32,silver);g.line(32+9*s,32,32+10*s,36,cyan);
    }
    g.poly([[24,13],[28,14],[32,12],[37,14],[40,13],[37,17],[32,21],[28,18]],'488fa7');
    g.line(25,13,29,14,ice);g.line(30,14,33,12,mint);g.pixel(32,23+f,ice);
    g.poly([[23,36],[26,33],[29,32],[32,29],[34,31],[39,33],[41,36]],cyan);gleam(g,22,11,f);
  });
  icon('luxEcho',(g,f)=>{
    const face=[[17,12],[33,5],[45,8],[49,35],[45,39],[28,43],[20,40]];
    g.poly(face,ink);g.poly([[17,12],[34,6],[43,9],[46,34],[27,40],[22,38]],'454553');
    g.poly([[19,13],[34,8],[41,10],[44,33],[27,38],[23,36]],'2a2d40');g.line(19,13,34,8,steel);g.line(23,36,27,38,plum);
    for(let i=0;i<3;i++){const x=23+i*6;
      g.line(x,16-i,x+1,26-i,i===f?'b9e4d2':jade);g.line(x+1,21-i,x+4,16-i,i===f?mint:jade);g.pixel(x+2,29-i,brass);
    }
    g.line(25,33,40,29,bronze);gleam(g,34,8,f);
  });
  icon('luxPendant',(g,f)=>{
    for(const s of [-1,1]){
      let px=32+s*19,py=6;
      for(let i=1;i<=14;i++){const t=i/14,x=32+s*19*(1-t*t),y=6+19*t;
        g.line(px,py,x,y,i%2?silver:ice);g.pixel(x+1,y+1,steel);px=x;py=y;}
    }
    g.ell(32,26,2,3,silver);g.poly([[32,25],[39,29],[41,34],[32,43],[23,34],[25,29]],silver);
    g.poly([[32,27],[38,30],[39,34],[32,40],[25,34],[27,30]],'875e9b');
    g.poly([[32,27],[27,30],[25,34],[30,33]],'dac4cf');g.poly([[32,27],[37,30],[34,33],[30,33]],'b193bd');
    g.poly([[30,33],[34,33],[32,40]],'8e6ba4');gleam(g,27,30,f);
  });
  icon('luxCuff',(g,f)=>{
    g.ell(32,16,19,8,dark);g.ell(32,15,19,8,silver);g.ell(32,15,15,5,deep);
    g.poly([[13,15],[18,20],[30,23],[44,21],[50,16],[48,31],[42,36],[30,39],[18,35],[15,31]],blue);
    g.poly([[13,16],[18,20],[22,21],[23,35],[18,33],[16,29]],'6586a7');
    g.arc(32,16,18,7,0,Math.PI,ice);g.arc(32,30,16,7,0,Math.PI,brass);
    for(let i=0;i<4;i++){const x=19+i*7,y=[23,25,25,23][i];g.line(x,y,x+3,y+5,cyan);g.line(x+3,y+5,x+5,y,ice);}
    gleam(g,19,19,f);
  });
  icon('luxMobile',(g,f)=>{
    g.line(32,3,32,12,silver);g.line(19,16,46,10,gold);g.line(32,12,32,21,silver);
    g.line(9,22,30,18,brass);g.line(20,16,20,20,silver);g.line(36,23,52,21,gold);g.line(45,11,45,22,silver);
    for(const [x,y,r,c] of [[10,22,4,coral],[29,19,5,cyan],[37,23,3,gold],[51,21,5,mint],[32,25,4,'9b7cae']]){
      const swing=[-1,0,1,0][f];g.line(x,y,x+swing,y+5,steel);
      g.ell(x+swing,y+9,r-(f%2),r,c);g.line(x+swing-1,y+9-r,x+swing+1,y+8-r,ice);
    }
    gleam(g,46,10,f);
  });
  icon('luxLacquer',(g,f)=>{
    g.poly([[7,22],[34,12],[56,18],[56,31],[29,41],[8,35]],ink);
    g.poly([[8,21],[34,11],[56,17],[29,28]],'4c4456');g.poly([[8,22],[29,28],[29,38],[8,32]],'382c3d');
    g.poly([[30,28],[55,18],[55,29],[30,39]],'513549');
    g.line(8,23,29,29,brass);g.line(30,29,55,19,gold);g.line(30,37,54,28,bronze);
    for(const [x,y] of [[19,21],[26,19],[33,17],[39,16]]){
      g.line(x,y,x+5,y-1,mint);g.line(x+2,y,x+1,y-3,'c0a6b8');g.pixel(x+4,y-3,ice);
    }
    g.rect(40,26,4,4,brass);g.line(41,26,43,25,ivory);gleam(g,35,17,f);
  });
  icon('luxMosaic',(g,f)=>{
    g.rect(7,6,50,36,bronze);g.rect(8,7,48,33,gold);g.rect(10,9,44,29,'443d4a');
    const panes=[[[11,10],[22,10],[20,19],[11,22]],[[24,10],[34,10],[29,17],[21,20]],[[36,10],[51,10],[45,16],[32,17]],[[51,12],[51,23],[41,20],[45,17]],
      [[11,24],[20,21],[25,26],[13,33]],[[22,21],[29,18],[32,26],[27,27]],[[31,19],[40,18],[38,23],[33,26]],[[42,21],[51,25],[51,34],[43,29]],[[14,35],[26,28],[30,35]],[[28,28],[39,25],[42,33],[32,36]],[[41,25],[50,36],[44,35]]];
    panes.forEach((p,i)=>{g.poly(p,[blue,'587fa2','b88657',gold,deep,brass,gold,'b58d66',cyan,blue,'558698'][i]);g.pixel(p[0][0]+1,p[0][1]+1,i%2?ivory:silver);});
    gleam(g,42,15,f);
  });
  icon('luxPhoto',(g,f)=>{
    g.rect(5,5,54,37,ink);g.rect(6,6,52,35,'514d57');g.rect(7,7,50,33,ink);g.rect(9,9,46,29,ice);
    for(let i=0;i<23;i++)g.line(11,11+i,52,11+i,shade(wine,'efb98d',Math.floor(i/3)/7));
    g.ell(37,22,5,5,'ffdaa2');g.rect(11,28,42,8,'8e6065');
    g.poly([[11,26],[18,24],[20,17],[22,18],[22,25],[27,24],[28,20],[30,21],[31,26],[41,26],[45,23],[51,24],[52,27],[52,29],[11,29]],deep);
    g.line(19,18,27,15,ink);g.line(26,15,26,20,steel);
    for(let i=0;i<9;i++)g.line(13+i*4,30+i%3,15+i*4,30+i%3,i%2?coral:gold);gleam(g,47,7,f);
  });
  drawVenues();

  function drawVenues(){
    // Style helpers for architectural perspective, ribbed metal, and distant
    // figures. The four illustrations have independent layouts and palettes.
    const wide=(key,fn)=>sheet('confluence-'+key,480,160,0,fn,1);
    const S=(g,x,y,s,palette)=>{
      const [coat,light]=palette;
      g.ell(x,y-8*s,1.6*s,2*s,light);g.poly([[x-s,y-6*s],[x+2*s,y-6*s],[x+3*s,y],[x+2*s,y+2*s],[x+2*s,y+8*s],[x+s,y+8*s],[x,y+2*s],[x-s,y+8*s],[x-2*s,y+8*s],[x-2*s,y]],coat);
      g.line(x+s,y-5*s,x+2*s,y-1*s,light);
    };
    const backdrop=(g,top,bottom)=>{
      for(let y=0;y<160;y++)for(let x=0;x<480;x++){
        const t=Math.max(0,Math.min(1,y/230+noise(x/60,y/32,88)*.20+noise(x/13,y/12,24)*.08));
        g.pixel(x,y,shade(top,bottom,Math.floor(t*15+(x+y)%2*.28)/15));
      }
    };
    const rail=(g,x,y,w,col=steel)=>{g.rect(x,y,w,2,col);g.rect(x,y+5,w,1,col);for(let i=0;i<w;i+=17)g.rect(x+i,y,2,12,col);};
    const tileFloor=(g,horizon,far,near,focus)=>{
      for(let y=horizon;y<160;y++)g.line(0,y,480,y,shade(far,near,Math.floor((y-horizon)/(160-horizon)*12)/12));
      for(let x=-280;x<=740;x+=52)g.line(focus+(x-focus)*.14,horizon,x,159,shade(far,near,.16));
      for(const y of [horizon+7,horizon+18,horizon+35,153])g.line(0,y,479,y,shade(far,near,.20));
    };
    const store=(g,x,y,w,h,col,stock)=>{
      g.rect(x,y,w,h,dark);g.rect(x+2,y+6,w-4,h-8,shade(col,ink,.6));
      g.poly([[x-4,y+4],[x+3,y-4],[x+w-1,y-4],[x+w+4,y+4]],col);
      for(let i=4;i<w;i+=9)g.poly([[x+i,y+3],[x+i+4,y-4],[x+i+8,y-4],[x+i+5,y+3]],shade(col,ivory,.28));
      g.rect(x-2,y+4,w+6,2,gold);g.rect(x+4,y+h-10,w-8,8,bronze);
      for(let i=0;i<w-12;i+=6){let hh=2+Math.floor(rnd(i+x,y)*5);g.rect(x+6+i,y+h-10-hh,4,hh,stock[(i/6)%stock.length]);g.pixel(x+6+i,y+h-10-hh,gold);}
      g.line(x+2,y+h-3,x+w-2,y+h-3,brass);g.line(x+3,y+8,x+3,y+h-11,steel);
    };
    wide('market',g=>{
      backdrop(g,'192b3c','a77b6b');
      // Promenade receding into a high atrium with a second gallery.
      g.rect(0,34,480,6,'3d4955');rail(g,0,22,480,'546773');
      for(let x=-3;x<480;x+=48){
        g.poly([[x,0],[x+7,0],[x+15,13],[x+16,47],[x+12,54],[x+10,15]],deep);
        g.line(x+7,0,x+14,13,'9b857f');g.rect(x+15,21,1,21,brass);
        g.rect(x+21,30,10,2,cyan);g.rect(x+35,30,5,2,gold);
      }
      for(let i=0;i<17;i++)S(g,12+i*28,27,0.5,[i%2?plum:bronze,silver]);
      tileFloor(g,97,'685962','344454',250);
      store(g,3,69,68,49,'ac5553',[coral,cyan,brass]);store(g,80,70,55,36,jade,[mint,steel,gold]);
      store(g,142,70,43,29,brass,[blue,coral]);store(g,194,70,33,25,blue,[mint,red]);
      store(g,263,68,41,27,plum,[gold,cyan]);store(g,311,62,60,41,red,[coral,silver,cyan]);
      store(g,381,64,88,54,'478884',[mint,gold,coral]);
      for(const [x,y,w,c] of [[22,42,34,red],[99,44,25,jade],[335,38,27,red],[406,33,37,brass]]){
        g.line(x+3,32,x+3,y,steel);g.rect(x,y,w,12,dark);g.rect(x+1,y+1,w-2,10,c);
        for(let a=3;a<w-3;a+=5){g.line(x+a,y+3,x+a+2,y+3,gold);g.rect(x+a+1,y+4,1,4,ivory);}
      }
      for(let i=0;i<24;i++){const x=38+rnd(i,4)*414,y=89+rnd(i,9)*42,s=.6+(y-89)/46;S(g,x,y,s,[[deep,brass],[wine,coral],[petrol(),silver],[plum,gold]][i%4]);}
      for(let x=23;x<480;x+=54){let y=13+Math.floor(Math.sin(x/105)*7);g.line(x-17,y-7,x,y,steel);g.line(x,y,x+38,y+2,steel);g.rect(x-2,y,5,4,gold);}
      g.poly([[0,129],[34,121],[50,126],[50,159],[0,159]],dark);g.line(0,130,33,123,brass);g.line(5,140,41,132,steel);
      g.poly([[449,142],[480,132],[480,159],[444,159]],bronze);g.line(448,144,479,135,gold);
    });
    function petrol(){return '32525b';}
    // The transformation retains integer edges at each final drawing pixel.
    function place(g,x,y,s){
      const X=v=>Math.round(x+v*s),Y=v=>Math.round(y+v*s),L=v=>Math.max(1,Math.round(v*s));
      return {pixel:(a,b,c)=>g.pixel(X(a),Y(b),c),line:(a,b,c,d,e)=>g.line(X(a),Y(b),X(c),Y(d),e),
        ell:(a,b,c,d,e)=>g.ell(X(a),Y(b),L(c),L(d),e),rect:(a,b,c,d,e)=>g.rect(X(a),Y(b),L(c),L(d),e),
        poly:(p,c)=>g.poly(p.map(([a,b])=>[X(a),Y(b)]),c),arc:(a,b,c,d,e,f,col)=>g.arc(X(a),Y(b),L(c),L(d),e,f,col)};
    }
    wide('hangar',g=>{
      backdrop(g,'162333','576576');tileFloor(g,86,'47515c','213246',247);
      for(let i=0;i<7;i++){let x=i*78-10;
        g.rect(x+4,23,66,51,deep);g.rect(x+7,26,60,43,'253b55');for(let j=0;j<34;j++)g.pixel(x+8+rnd(i,j)*56,28+rnd(j,i)*37,j%5?steel:ice);
        g.rect(x,0,5,87,'3f4f5e');g.line(x,1,x+4,23,silver);g.rect(x+6,74,62,2,brass);
        g.line(x+2,4,x+26,15,steel);g.line(x+26,15,x+66,1,steel);
        g.rect(x+13,15,43,2,ice);g.rect(x+15,17,39,1,cyan);
      }
      rail(g,0,78,480,steel);
      for(const [cx,cy,r,c] of [[84,111,67,cyan],[248,126,88,gold],[410,108,63,mint]]){
        g.ell(cx,cy+5,r,12,dark);g.ell(cx,cy+1,r,12,steel);g.ell(cx,cy,r-2,10,'374758');
        g.arc(cx,cy,r-4,9,0,Math.PI,c);g.arc(cx,cy,r-6,9,Math.PI,TAU,steel);
        g.ell(cx,cy-1,r*.57,4,deep);g.rect(cx-3,cy-9,6,9,steel);
      }
      skiff(place(g,34,55,1.6),1);observatory(place(g,186,53,1.9),1);catamaran(place(g,355,52,1.6),0);
      for(let i=0;i<9;i++){const x=96+i*37,y=132+i%3*4;S(g,x,y,.78,[i%2?steel:bronze,silver]);}
      g.poly([[0,0],[26,0],[14,10],[14,80],[5,97],[0,99]],dark);g.line(14,10,14,80,brass);
      g.poly([[456,0],[480,0],[480,104],[465,88],[465,12]],dark);g.line(465,12,465,88,steel);
      for(const [x,y] of [[45,123],[294,143],[433,122]]){g.rect(x,y,2,7,brass);g.poly([[x-6,y-1],[x+6,y-3],[x+6,y],[x-6,y+2]],cyan);}
    });
    wide('casino',g=>{
      backdrop(g,'30263d','965b65');
      // Tall picture windows, brass fan arches and planet glow.
      for(let i=0;i<5;i++){const x=10+i*93;
        g.rect(x,12,86,57,'372b46');g.rect(x+4,16,78,49,'3c3b55');
        for(let j=0;j<70;j++)g.pixel(x+5+rnd(i,j+2)*75,17+rnd(j,i+3)*45,j%5?'67667e':gold);
        g.arc(x+43,64,38,44,Math.PI,TAU,bronze);g.line(x+43,18,x+43,64,brass);
        for(let k=-2;k<=2;k++)g.line(x+43,63,x+43+k*14,24+Math.abs(k)*5,'735563');
        g.rect(x+2,65,82,2,brass);
      }
      tileFloor(g,77,'765262','3c2d41',236);
      for(let x=-120;x<600;x+=35)g.line(x,158,244+(x-244)*.12,77,'825968');
      g.rect(0,71,480,5,'513847');g.rect(0,71,480,1,brass);
      for(const [cx,cy,r] of [[66,100,46],[170,100,32],[303,93,37],[411,109,56],[230,130,62]]){
        g.ell(cx,cy+12,r*.72,4,'473442');g.rect(cx-3,cy,6,12,bronze);g.ell(cx,cy+2,r,10,'5e4148');g.ell(cx,cy,r,10,brass);g.ell(cx,cy-1,r-3,8,'47746b');
        if(r%2===0){g.arc(cx,cy-1,r-6,6,0,Math.PI,'99a18d');for(let k=-2;k<=2;k++)g.rect(cx+k*r/4,cy-2,3,2,ivory);}
        else{g.ell(cx,cy-2,8,4,bronze);g.ell(cx,cy-3,6,3,gold);}
        for(let i=0;i<5;i++){const x=cx+(i-2)*r*.36;g.ell(x,cy+8-Math.abs(i-2)*2,4,2,wine);g.rect(x,cy+9-Math.abs(i-2)*2,1,5,brass);}
        S(g,cx-r*.4,cy-14,.8,[dark,gold]);S(g,cx+r*.5,cy-13,.8,[plum,silver]);
      }
      for(const [x,y] of [[88,30],[239,26],[385,30]]){
        g.line(x,0,x,y-11,brass);g.ell(x,y,21,4,brass);g.ell(x,y-1,17,3,gold);
        for(let i=-3;i<=3;i++){const sx=x+i*5;g.line(x,y-10,sx,y-2,brass);g.line(sx,y+2,sx,y+8-Math.abs(i),silver);g.pixel(sx,y+8-Math.abs(i),ivory);}
      }
      // A freestanding shipwright's roulette table in the foreground.
      g.poly([[248,132],[429,120],[479,140],[479,159],[255,159],[233,145]],'492b29');
      g.poly([[247,128],[425,116],[479,136],[479,146],[258,159],[230,140]],'a8764b');
      g.poly([[248,129],[424,119],[474,137],[259,155],[237,140]],'225447');
      for(let k=0;k<9;k++)g.line(329+k*12,129-k*.65,343+k*12,145-k*.65,'baa782');
      for(let k=0;k<4;k++)g.line(329+k*5,129+k*5,427+k*5,123+k*5,'baa782');
      for(const [rw,rh,y,col] of [[52,16,135,'4f2b27'],[52,14,132,'bd864f'],[48,12,131,'58312a'],[45,11,131,'a36741'],[41,10,131,'36282b']])g.ell(285,y,rw,rh,col);
      for(let i=0;i<37;i++){const a=TAU*i/37;const x=285+37*Math.cos(a),y=131+8*Math.sin(a);g.line(x,y,285+42*Math.cos(a),131+10*Math.sin(a),i===0?'59a274':i%2?'b95448':'352c34');}
      g.ell(285,130,28,7,'a16a43');g.ell(285,129,20,5,'734b35');g.rect(284,121,3,10,brass);
      g.line(274,123,297,126,gold);g.line(283,126,289,120,brass);g.ell(285,120,3,2,ivory);g.ell(317,125,2,1,ivory);
      for(const left of [true,false]){
        for(let i=0;i<7;i++){let x=left?i*4:479-i*4;g.poly([[x,0],[x+(left?5:-5),0],[left?8:471,44+i*3],[left?0:479,67+i*2]],i%2?'653542':'824350');}
      }
    });
    wide('auction',g=>{
      backdrop(g,'181c2d','534357');
      // Low underground vault, boxed side galleries and a spotlighted lot.
      for(let i=0;i<7;i++){const x=i*77-12;g.poly([[x,0],[x+12,0],[x+30,20],[x+34,60],[x+27,60],[x+23,24]],'343446');g.line(x+12,0,x+29,19,steel);}
      for(const x of [4,60,340,398]){g.rect(x,28,49,40,'453746');g.rect(x+3,31,43,31,'282a3b');rail(g,x,56,49,bronze);}
      g.poly([[142,18],[324,18],[333,83],[133,83]],'503b48');g.rect(146,23,173,60,'3d3346');
      for(let x=151;x<316;x+=9){g.line(x,25,x-2,76,x%2?'654857':'493948');}
      const spotlight=[['423842',188,276],['50444a',203,261],['675552',217,247]];
      for(const [c,l,r] of spotlight)g.poly([[226,21],[239,21],[r,77],[l,77]],c);
      g.rect(224,17,18,4,dark);g.rect(227,21,10,2,gold);
      g.poly([[149,76],[309,76],[331,91],[134,91]],'83665e');g.rect(134,92,198,5,'59444a');g.line(134,92,330,92,brass);
      g.ell(233,78,18,3,bronze);g.rect(221,64,23,13,'746562');g.ell(232,64,12,3,brass);
      g.poly([[227,59],[227,54],[230,51],[236,51],[239,55],[237,60],[234,61],[235,63],[229,63],[231,60]],'96b4a3');g.pixel(230,53,ivory);
      S(g,299,68,1.25,[dark,brass]);g.poly([[285,70],[304,69],[302,82],[287,82]],bronze);g.line(285,69,304,68,gold);
      tileFloor(g,98,'55434e','2a293c',232);
      for(let row=0;row<3;row++){
        const size=.72+.34*row,cy=98+row*20;
        for(let i=0;i<12;i++){
          const x=i*(39+row*5)-(row*22)+(row%2)*11;if(Math.abs(x-234)<17+row*5)continue;
          S(g,x,cy+2,size,[i%3?dark:plum,i%4?bronze:silver]);
          g.ell(x,cy+8+row*2,6+row*2,3+row,wine);g.rect(x-5-row*2,cy+8+row*2,11+row*4,6+row,'583a4a');
          g.line(x-4-row,cy+7+row*2,x+4+row,cy+7+row*2,'8b5f65');
        }
      }
      for(const x of [14,108,361,452]){g.rect(x,42,3,10,brass);g.rect(x+1,44,1,6,ivory);}
      g.line(227,98,206,159,bronze);g.line(241,98,263,159,bronze);
    });
  }
};
