'use strict';
module.exports=function drawRegistry({sheet,TAU}){
  const dark='262431',shadow='3f3c4e',brass='b4884e',gold='e1b96c',cream='fae7af',silver='abb4c7',jade='459f90',ice='beefdb';
  const sprite=(id,fn)=>sheet(id,64,48,4,(g,f)=>{
    fn(g,f);
  });
  function shine(g,x,y,f){
    g.pixel(x,y,cream);if(f%2){g.line(x-1,y,x+1,y,cream);g.line(x,y-1,x,y+1,cream);}if(f===2)g.pixel(x+2,y-2,gold);
  }
  function streak(g,f){g.line(9,30,2+f,32,brass);g.line(10,29,4+f,30,ice);}
  sprite('luxCourier',(g,f)=>{
    g.poly([[8,25],[19,22],[19,13],[24,14],[28,20],[45,18],[56,21],[57,25],[40,32],[17,34],[8,30]],dark);
    g.poly([[10,25],[25,21],[44,19],[55,21],[51,25],[23,30],[10,29]],'d39c4f');g.line(14,25,44,20,cream);
    g.poly([[24,22],[31,17],[40,17],[44,20],[33,23]],'48657a');g.line(32,18,39,18,ice);
    g.poly([[18,29],[33,24],[29,31],[16,35]],brass);g.line(33,28,49,24,silver);
    g.rect(12,24,9,5,'ab5940');g.line(13,24,17,27,cream);g.line(17,27,20,24,cream);streak(g,f);
  });
  sprite('luxSkimmer',(g,f)=>{
    g.poly([[6,25],[23,21],[21,6],[31,12],[39,20],[57,18],[60,21],[46,26],[26,41],[16,40],[21,29]],dark);
    g.poly([[11,24],[26,21],[23,9],[32,16],[38,21],[54,19],[45,24],[24,38],[19,38],[27,26]],'43857f');
    g.line(24,10,31,17,ice);g.line(22,36,35,25,jade);g.poly([[23,24],[37,18],[44,18],[48,20],[39,23],[27,26]],'b2d1bc');g.line(34,21,42,19,'406278');g.line(10,26,5-f,27,ice);
  });
  sprite('luxMapper',(g,f)=>{
    for(const [x,y] of [[9,12],[34,28]]){
      g.poly([[x,y+3],[x+14,y],[x+18,y+8],[x+4,y+10]],brass);
      for(let i=1;i<14;i+=4)g.line(x+i,y+3,x+i+3,y+9,cream);
    }
    g.line(18,18,43,33,silver);g.poly([[8,27],[26,21],[48,17],[57,19],[55,23],[27,31],[10,31]],shadow);
    g.poly([[11,26],[36,19],[51,17],[55,19],[43,23],[16,29]],'b8b6a2');g.line(20,26,48,18,cream);
    g.ell(35,20,5,3,'447281');g.pixel(34,19,ice);g.line(52,18,57,12,gold);g.ell(57,11,3,2,silver);streak(g,f);
  });
  sprite('luxLiner',(g,f)=>{
    g.poly([[5,24],[19,20],[43,17],[60,18],[57,24],[45,29],[18,34],[6,31]],shadow);
    g.poly([[7,24],[20,21],[51,16],[60,18],[50,23],[17,30],[7,29]],silver);
    g.poly([[14,22],[19,17],[42,14],[52,16],[49,19],[16,26]],'dbd3bd');g.line(18,20,44,15,cream);
    for(let i=0;i<10;i++){const x=16+i*3,y=24-Math.floor(i*.64);g.rect(x,y,2,2,'30525c');g.pixel(x,y,ice);}
    g.line(12,30,50,22,gold);g.line(9,31,3+f,33,'9dd5e4');g.rect(20,14,3,5,brass);g.rect(26,13,3,4,brass);shine(g,48,17,f);
  });
  sprite('luxTea',(g,f)=>{
    for(const [x,y,col] of [[12,18,'477463'],[31,14,'69885f']]){
      g.rect(x,y,18,20,shadow);g.rect(x+2,y,14,18,col);g.ell(x+8,y,9,3,gold);g.ell(x+8,y-1,7,2,'758965');
      g.rect(x+5,y+5,8,8,cream);g.line(x+7,y+10,x+11,y+7,jade);g.line(x+3,y+17,x+15,y+17,brass);
    }shine(g,42,12,f);
  });
  sprite('luxClock',(g,f)=>{
    g.rect(16,33,33,5,brass);g.poly([[19,33],[19,15],[25,10],[37,8],[44,15],[44,33]],'795442');g.rect(22,15,19,17,shadow);
    g.ell(31,17,9,9,gold);g.ell(31,17,7,7,'e6d8ae');g.line(31,17,31,12,dark);g.line(31,17,35,19,dark);
    for(let i=0;i<2;i++){let x=26+10*i;g.line(x,25,x+f-1,31,gold);g.ell(x+f-1,32,2,3,brass);}
  });
  sprite('luxScent',(g,f)=>{
    g.poly([[18,25],[26,18],[37,17],[46,24],[45,34],[34,39],[20,35]],shadow);g.poly([[20,25],[26,20],[37,19],[43,24],[42,32],[32,36],[22,33]],'8d679e');
    g.line(23,25,32,35,'c69fcd');g.line(41,24,33,34,'af83b7');g.rect(27,14,10,6,gold);g.poly([[26,12],[31,6],[38,10],[34,15],[28,15]],'9baed0');shine(g,30,10,f);
  });
  sprite('luxComb',(g,f)=>{
    for(let i=0;i<9;i++){let x=12+4*i,y=23-Math.floor(i*.7);g.line(x,y,x+4,y+13,silver);g.pixel(x+4,y+14,cream);}
    g.poly([[9,18],[44,10],[50,14],[49,19],[13,28],[9,25]],brass);g.line(13,24,47,16,gold);
    for(let i=0;i<7;i++){let x=13+5*i,y=20-Math.floor(i*1.1);g.ell(x,y,3,3,'b95850');g.pixel(x-1,y-1,'f0a382');}shine(g,44,13,f);
  });
  sprite('luxWeave',(g,f)=>{
    g.rect(12,7,41,3,brass);g.rect(16,10,32,25,'703f4b');
    for(let y=12;y<34;y+=3)for(let x=17;x<47;x+=2)g.pixel(x,y,((x+y)%5?'976453':'dab27a'));
    g.poly([[18,28],[27,15],[35,25],[44,12],[45,17],[36,30],[28,21],[20,32]],'d88e73');
    for(let x=16;x<48;x+=3)g.line(x,35,x,39+(x%3),gold);shine(g,12,8,f);
  });
  sprite('luxEtch',(g,f)=>{
    g.rect(9,9,46,29,dark);g.rect(11,10,42,26,brass);g.rect(13,12,38,22,'d3be9b');
    for(let i=0;i<23;i++){let x=14+i*1.5;g.line(x,29-i%5,x+1,33,shadow);}
    g.line(15,25,48,21,shadow);g.line(21,25,20,17,dark);g.line(20,17,31,14,shadow);g.line(34,22,37,15,dark);g.line(37,15,47,17,shadow);shine(g,51,11,f);
  });
  sprite('luxCompass',(g,f)=>{
    g.ell(31,11,5,5,brass);g.ell(31,11,3,3,dark);g.ell(32,26,16,13,shadow);g.ell(31,24,15,12,gold);g.ell(31,24,12,10,'39615e');g.arc(31,24,10,8,0,TAU,brass);
    g.poly([[23,31],[30,23],[40,17],[33,25]],'e3cabb');g.poly([[30,23],[40,17],[33,25]],'b1534d');g.pixel(32,24,cream);shine(g,21,17,f);
  });
  sprite('luxMask',(g,f)=>{
    g.poly([[17,10],[33,7],[46,12],[44,26],[35,37],[29,39],[20,31],[16,20]],shadow);
    g.poly([[18,11],[32,8],[44,13],[40,27],[31,37],[23,29],[17,18]],'e1d7bb');g.poly([[32,10],[42,14],[39,26],[32,33],[34,23]],'ac9ea0');
    g.line(21,18,28,21,dark);g.line(35,21,41,17,dark);g.line(31,19,29,25,brass);g.line(29,25,32,26,gold);shine(g,24,13,f);
  });
  sprite('luxSeed',(g,f)=>{
    g.ell(32,35,11,4,brass);g.ell(32,21,11,15,'466370');g.ell(32,20,8,13,'294d50');g.line(32,31,31,17,gold);
    for(const [x,y,dx] of [[31,21,-5],[32,25,6],[31,17,3]])g.poly([[x,y],[x+dx,y-1],[x+dx+1,y-6],[x,y-3]],'85bb77');
    g.arc(32,20,10,14,3.4,4.9,ice);g.ell(32,35,10,2,gold);shine(g,25,13,f);
  });
  sprite('luxBell',(g,f)=>{
    g.ell(33,10,5,4,brass);g.ell(33,10,2,2,dark);g.poly([[15,30],[20,25],[23,15],[29,12],[37,13],[41,18],[44,25],[50,29],[50,33],[37,36],[20,35],[15,33]],'95714e');
    g.poly([[20,30],[25,24],[26,16],[31,14],[33,14],[29,29]],gold);g.ell(32,32,17,4,'d5aa69');g.ell(32,33,14,2,shadow);g.ell(33,35,3,3,brass);g.line(24,23,39,21,'72857a');shine(g,28,16,f);
  });
};
