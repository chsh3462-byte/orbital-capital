'use strict';
window.Economy = (() => {
  const D=GameData, MAX=3;
  function rand(s) {
    s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;
    return s.seed/4294967296;
  }
  function note(s,type,title,detail='') {
    s.logs.unshift({day:s.day,type,title,detail});
    if(s.logs.length>100) s.logs.pop();
  }
  function newGame() {
    const s={story:Handover.initial(1),version:1,day:1,tick:0,cash:82000,seed:179839,rep:58,realized:0,expenses:{research:0,marketing:0},tech:{warp:0,cargo:0,core:0,ai:0,shield:0},ads:[],event:null,
      planets:D.planets.map(p=>({id:p.id,owner:p.owner,buildings:p.owner?['spaceport']:[]})),
      markets:D.rivals.map(r=>({id:r.id,price:r.price,prev:r.price,history:[r.price],shares:0,basis:0,acquired:false,weight:r.weight})),
      frontier:1,security:Escort.initial(),dealSerial:0,exchange:Commerce.initial(),hr:Staff.initial(),freight:null,guide:Tutorial.initial(),leisure:Leisure.initial(),history:[],quarters:[],mergers:[],logs:[]};
    // The company starts with ten settled operating days and an observed price history.
    for(let i=0;i<10;i++){for(let j=0;j<4;j++) quote(s); settle(s,false);}
    quote(s);s.tick=1;
    s.logs=[];note(s,'finance','일일 영업 결산','+'+s.history.at(-1).net.toLocaleString('ko-KR')+' CR');
    note(s,'system','관제 시스템 온라인','오르빗 캐피탈 본사');
    note(s,'fleet','정기 운송 항로 개통','네레이드 교역권');
    Handover.attach(s,1);
    return s;
  }
  function fleet(s){return (s.story?.baseFleet??3)+s.tech.ai+D.rivals.reduce((n,d)=>n+(s.markets.find(r=>r.id===d.id)?.acquired?(d.ships||0):0),0);}
  function tier(s){return Math.min(3,1+Math.floor(Object.values(s.tech).reduce((a,b)=>a+b,0)/3));}
  function rep(s){return Math.min(100,s.rep+s.ads.reduce((a,b)=>a+D.campaigns.find(c=>c.id===b.id).rep,0));}
  function weights(s){
    const own=18+s.markets.filter(r=>r.acquired).reduce((a,r)=>a+r.weight,0)+Math.max(0,s.planets.filter(p=>p.owner==='player'&&!D.planets.find(d=>d.id===p.id).owner).length)*2+(rep(s)-58)*.08;
    const total=own+s.markets.filter(r=>!r.acquired).reduce((a,r)=>a+r.weight,0);
    return Object.fromEntries([['player',100*own/total],...s.markets.map(r=>[r.id,r.acquired?0:100*r.weight/total])]);
  }
  function quote(s) {
    for(const r of s.markets.filter(r=>!r.acquired)){
      const base=D.rivals.find(x=>x.id===r.id).price;
      r.price=Math.max(100,Math.round(r.price*(1+(rand(s)-.485)*.044)+(base-r.price)*.025));
      r.history.push(r.price); if(r.history.length>64)r.history.shift();
    }
  }
  function forecast(s,regular=Commerce.freeShips(s)) {
    const owned=s.planets.filter(p=>p.owner==='player');
    const mult=1+s.ads.reduce((a,b)=>a+D.campaigns.find(c=>c.id===b.id).boost,0);
    const demand=s.markets.reduce((a,r)=>a+r.price/D.rivals.find(d=>d.id===r.id).price,0)/s.markets.length;
    const trade=Math.round(regular*910*Math.max(.8,Math.min(1.2,demand))*(1+s.tech.warp*.18)*(1+s.tech.cargo*.22)*(s.event?.id==='boom'?1.35:1)*mult);
    const facility=Math.round(owned.flatMap(p=>p.buildings).reduce((a,id)=>a+D.facilities.find(f=>f.id===id).income,0)*(1+s.tech.core*.25)*(s.event?.id==='breakthrough'?1.30:1)*mult);
    const dividend=s.markets.reduce((a,r)=>a+(r.acquired?0:Math.floor(r.shares*r.price*.002)),0);
    const discount=Handover.has(s,'mission_second_outpost')?Math.round(s.exchange.routes.length*310*.05):0;
    const fleetCost=fleet(s)*310-discount,landCost=owned.reduce((a,p)=>a+200+210*p.buildings.length,0);
    const risk=s.event?.id==='risk'?Math.round(trade*.4*(1-s.tech.shield*.25)):0;
    const {research,marketing}=s.expenses;
    const contract=Freight.payment(s);
    const goodsSales=s.exchange.sales,goodsCost=s.exchange.costs,wages=Staff.payroll(s)+Escort.payroll(s);
    const revenue=trade+facility+dividend+contract+goodsSales,cost=fleetCost+landCost+risk+research+marketing+goodsCost+wages;
    return {goodsSales,goodsCost,wages,trade,contract,facility,dividend,fleetCost,landCost,risk,research,marketing,revenue,cost,net:revenue-cost};
  }
  function settle(s,live=true){
    const regular=Commerce.freeShips(s);
    if(live)Commerce.departures(s);
    if(live && s.story?.debt)s.story.debt+=20;
    const f=forecast(s,regular);
    // The R&D and advertising invoices have already reduced cash at purchase.
    const available=s.cash+f.net+f.research+f.marketing-f.goodsSales+f.goodsCost-s.exchange.arrears;
    s.exchange.arrears=Math.max(0,-available);
    s.cash=Math.max(0,available);
    s.exchange.sales=0;s.exchange.costs=0;s.expenses={research:0,marketing:0};
    if(f.contract)Freight.complete(s);
    if(s.day%4===0&&s.rep<78)s.rep++;
    const row={day:s.day,...f,cash:s.cash,share:weights(s).player,rep:rep(s)};
    s.history.push(row);if(s.history.length>180)s.history.shift();
    if(s.day%90===0){
      const rows=s.history.slice(-90);
      const totals=Object.fromEntries(['revenue','goodsSales','goodsCost','wages','trade','contract','facility','dividend','cost','net','fleetCost','landCost','risk','research','marketing'].map(k=>[k,sum(rows,k)]));
      s.quarters.push({q:s.day/90,...totals,share:row.share,rep:row.rep});
      note(s,'finance','분기 결산 완료','Q'+s.day/90);
    }
    if(live)note(s,'finance','일일 영업 결산',(f.net>=0?'+':'')+f.net.toLocaleString('ko-KR')+' CR');
    if(live)Staff.screen(s);
    s.day++;
    if(live)Freeport.closeAuction(s);
    s.ads=s.ads.filter(a=>--a.left>0);
    if(s.event && --s.event.left<=0)s.event=null;
    if(live && !s.event && rand(s)<.22){
      const e=D.events[Math.floor(rand(s)*D.events.length)];
      s.event={id:e.id,left:e.days};note(s,'event',e.name,e.desc);
    }
    if(live && s.day%6===0){
      const active=s.markets.filter(r=>!r.acquired);
      if(active.length){
        const r=active[Math.floor(rand(s)*active.length)];r.weight+=.5;
        const p=s.planets.find(p=>p.owner===r.id && p.buildings.length<4);
        if(p){p.buildings.push(D.facilities.find(f=>!p.buildings.includes(f.id)).id);note(s,'market',r.id+' 시설 확장',D.planets.find(x=>x.id===p.id).name);}
      }
    }
    for(const r of s.markets)r.prev=r.price;
    return row;
  }
  function step(s){
    quote(s);s.tick++;
    if(s.tick>=4){s.tick=0;return settle(s);}
    return null;
  }
  function sum(rows,key){return rows.reduce((a,r)=>a+(r[key]??0),0);}
  function charge(s,amount){if(s.cash<amount)throw Error('보유 자금이 부족합니다.');s.cash-=amount;}
  function researchCost(s,id){return D.techs.find(t=>t.id===id).cost*(s.tech[id]+1);}
  function research(s,id,usePoint=false){
    const t=D.techs.find(t=>t.id===id);if(!t||s.tech[id]>=MAX)throw Error('최종 연구 단계입니다.');
    if(usePoint && !s.story?.points)throw Error('사용할 연구 가속 포인트가 없습니다.');
    const cost=usePoint?0:researchCost(s,id);
    charge(s,cost);if(usePoint)s.story.points--;s.expenses.research+=cost;s.tech[id]++;note(s,'research',t.name+' 연구 완료','Lv.'+s.tech[id]);
    if(Handover.has(s,'mission_first_research'))note(s,'research','연구 성과 기록',t.name+' · '+t.desc+' · Lv.'+s.tech[id]);
  }
  function advertise(s,id){
    const c=D.campaigns.find(c=>c.id===id);if(!c||s.ads.some(a=>a.id===id))throw Error('이미 진행 중인 캠페인입니다.');
    charge(s,c.cost);s.expenses.marketing+=c.cost;s.ads.push({id,left:c.days});note(s,'marketing',c.name+' 집행',c.days+'일');
  }
  function buyLand(s,id){
    const p=s.planets.find(p=>p.id===id),m=D.planets.find(p=>p.id===id);
    if(!p||p.owner)throw Error('미개척 행성만 매입할 수 있습니다.');
    charge(s,m.price);p.owner='player';note(s,'land',m.name+' 소유권 취득','행성 매입');
  }
  function build(s,id,facility){
    const p=s.planets.find(p=>p.id===id),f=D.facilities.find(f=>f.id===facility);
    if(!f||p?.owner!=='player')throw Error('자사 소유 행성에서 건설할 수 있습니다.');
    if(p.buildings.includes(facility))throw Error('이미 건설한 시설입니다.');
    charge(s,f.cost);p.buildings.push(f.id);note(s,'land',f.name+' 준공',D.planets.find(p=>p.id===id).name);
  }
  function trade(s,id,n,buy){
    const r=s.markets.find(r=>r.id===id);
    if(!r||r.acquired||!Number.isSafeInteger(n)||n<1||n>100)throw Error('1~100 사이의 정수 수량을 입력하세요.');
    if(buy){
      if(n+r.shares>100)throw Error('발행 주식은 총 100주입니다.');
      charge(s,n*r.price);r.basis+=n*r.price;r.shares+=n;
    }else{
      if(n>r.shares)throw Error('보유 주식이 부족합니다.');
      const basis=Math.round(r.basis*n/r.shares);
      s.realized+=r.price*n-basis;r.basis-=basis;r.shares-=n;s.cash+=r.price*n;
    }
    note(s,'market',id+(buy?' 주식 매수':' 주식 매도'),n+'주 · '+r.price.toLocaleString()+' CR');
  }
  function mergerCost(r,hostile){return Math.ceil((100-r.shares)*r.price*(hostile?1.30:1));}
  function merge(s,id,hostile){
    const r=s.markets.find(r=>r.id===id);
    if(!r||r.acquired)throw Error('거래가 종료된 기업입니다.');
    if(!hostile && r.shares<50)throw Error('우호적 인수에는 지분 50%가 필요합니다.');
    const cost=mergerCost(r,hostile);charge(s,cost);
    const assets=s.planets.filter(p=>p.owner===id);for(const p of assets)p.owner='player';
    s.mergers.push({id,day:s.day,cost,hostile});r.acquired=true;r.shares=0;r.basis=0;
    note(s,'market',id+' 합병 완료','행성 '+assets.length+'개 편입'+(D.rivals.find(d=>d.id===id).ships?' · 화물선 '+D.rivals.find(d=>d.id===id).ships+'척 편입':''));
  }
  return {newGame,step,forecast,weights,rep,tier,fleet,research,advertise,buyLand,build,trade,merge,mergerCost,researchCost,sum,charge,note};
})();
