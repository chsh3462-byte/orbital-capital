'use strict';
window.Commerce = (() => {
  // The wholesale lots are independent of the individual pieces in the collector's market.
  const goods = [
    {id:'tea', name:'해무 찻잎', origin:'nereid', hub:'lyra', base:210, art:'luxTea', use:'라이라 여객선의 티룸에 공급하는 첫물 찻잎'},
    {id:'silk', name:'진홍 성운사', origin:'veyra', hub:'nereid', base:340, art:'luxWeave', use:'네레이드 수상 공방에서 돛감으로 짜는 섬유'},
    {id:'glass', name:'별고리 광학유리', origin:'lyra', hub:'orion', base:480, art:'luxTideglass', use:'오리온 측량원의 관측 렌즈용 유리'},
    {id:'sensor', name:'항법 소자', origin:'orion', hub:'thalos', base:620, art:'chip', use:'탈로스 조선소에서 항법기에 넣는 정밀 부품'},
    {id:'gear', name:'내열 기어', origin:'thalos', hub:'eir', base:390, art:'luxClock', use:'에이르 채취 기지의 시추기용 기어'},
    {id:'essence', name:'빙화 정유', origin:'eir', hub:'veyra', base:530, art:'luxScent', use:'베이라 직조 길드의 향료 마감재'},
    {id:'wick',name:'유리 등심',origin:'mira',hub:'serein',base:460,art:'ex-vase-kiln',use:'세린 염전의 야간 표지등에 쓰는 내열 심지'},
    {id:'salt',name:'진주 결정염',origin:'serein',hub:'calyx',base:350,art:'ex-ampoule-rain',use:'칼릭스 배양장의 영양액을 조제하는 결정염'},
    {id:'resin',name:'수목 수지',origin:'calyx',hub:'mira',base:560,art:'luxSeed',use:'미라 공방의 유리 틀을 밀봉하는 수지'}
  ];
  goods.push(
    {id:'coil',name:'태양 포집 코일',origin:'sable',hub:'opal',base:980,art:'chip',use:'오팔 집광탑의 전력 회수 장치'},
    {id:'foil',name:'차폐 금박',origin:'lumen',hub:'nix',base:830,art:'ex-foil-egret',use:'닉스의 저온 관측기 차폐재'},
    {id:'brinegel',name:'심해 전해질',origin:'brine',hub:'rill',base:580,art:'ex-ampoule-rain',use:'릴 저장 전지의 이온 보충액'},
    {id:'quartz',name:'위상 석영',origin:'opal',hub:'sable',base:1240,art:'luxTideglass',use:'사블 변전소의 주파수 표준'},
    {id:'spore',name:'야광 포자포',origin:'rill',hub:'brine',base:740,art:'luxWeave',use:'브린 잠수부용 저조도 표식'},
    {id:'cryo',name:'극저온 축열봉',origin:'nix',hub:'lumen',base:1050,art:'ex-tablet-ice',use:'루멘 주조로의 폐열 회수재'},
    {id:'mesh',name:'안개 여과망',origin:'nereid',hub:'brine',base:395,art:'luxWeave',use:'심해 취수탑의 교체 필터'},
  const byId = id => goods.find(g => g.id === id);
  const port = id => GameData.planets.find(p => p.id === id);
  const integer = (n, lo=0, hi=Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(n) && n>=lo && n<=hi;
  const initial = () => ({stock:[], routes:[], serial:0, sales:0, costs:0, realized:0, arrears:0,carrier:false});
  function quote(s, place, id, day=s.day) {
    const g=byId(id), p=GameData.planets.findIndex(x=>x.id===place), k=goods.indexOf(g);
    const regional=place===g.origin ? .73 : place===g.hub ? 1.38 : 1;
    const cycle=.20*Math.sin(day*.48+p*1.3+k)+.08*Math.cos(day*.27+k*2-p);
    const mid=Math.round(g.base*(regional+cycle));
    return {ask:Math.ceil(mid*1.04), bid:Math.floor(mid*.96), demand:Math.round(100*(regional+cycle))};
  }
  function holding(s, place, id) { return s.exchange.stock.find(h=>h.place===place && h.good===id); }
  function add(s,place,good,qty,cost) {
    const h=holding(s,place,good);
    if(h){h.qty+=qty; h.cost+=cost;} else s.exchange.stock.push({place,good,qty,cost});
  }
  function take(s,h,qty) {
    if(!qty)return 0;
    const cost=Math.round(h.cost*qty/h.qty);
    h.qty-=qty; h.cost-=cost;
    if(!h.qty)s.exchange.stock.splice(s.exchange.stock.indexOf(h),1);
    return cost;
  }
  function bookSale(s,amount,cost) {
    s.cash+=amount; s.exchange.sales+=amount; s.exchange.costs+=cost; s.exchange.realized+=amount-cost;
  }
  function trade(s,place,id,qty,buy,invoice) {
    if(!port(place)||!byId(id)||!integer(qty,1,1000))throw Error('품목과 1~1,000상자의 정수 수량을 선택하세요.');
    const q=quote(s,place,id),total=invoice??qty*(buy?q.ask:q.bid);
    if(!integer(total,buy?1:0))throw Error('올바른 거래 금액이 아닙니다.');
    if(buy){
      Economy.charge(s,total); add(s,place,id,qty,total);
    }else{
      const h=holding(s,place,id);
      if(!h||h.qty<qty)throw Error('이 행성의 창고에 매도할 수량이 부족합니다.');
      bookSale(s,total,take(s,h,qty));
    }
    Economy.note(s,'market',byId(id).name+(buy?' 현물 매수':' 현물 매도'),port(place).name+' · '+qty+'상자 · '+total.toLocaleString('ko-KR')+' CR');
  }
  const registrationFee = 18000;
  function register(s) {
    if(s.exchange.carrier)throw Error('이미 전문 운송사로 등록했습니다.');
    Economy.charge(s,registrationFee);
    s.exchange.carrier=true;
    Economy.note(s,'fleet','전문 운송사 등록','전용 적재 설비 도입 · 척당 8상자 확장');
  }
  const capacity = (s,grade=1) => [0,5,11,20][grade-1]+12+(s.exchange.carrier?8:0)+s.tech.cargo*4+Staff.capacity(s);
  const freeShips = s => Economy.fleet(s)-s.exchange.routes.length-(s.freight?1:0);
  function manifest(lines) {
    return Array.isArray(lines)&&lines.length>=1&&lines.length<=goods.length&&lines.every(l=>byId(l.good)&&integer(l.qty,1,1000))&&new Set(lines.map(l=>l.good)).size===lines.length;
  }
  function schedule(s,from,to,lines,grade=1,guard=0) {
    if(!integer(grade,1,4)||!port(from)||!port(to)||from===to||!manifest(lines)||lines.reduce((n,l)=>n+l.qty,0)>capacity(s,grade))throw Error('서로 다른 항구와 적재 한도 안의 화물 목록을 지정하세요.');
    if(freeShips(s)<1)throw Error('배정할 정기편 화물선이 없습니다.');
    const route={id:s.exchange.serial+1,from,to,lines:lines.map(l=>({...l})),cargo:null,stop:false,trips:0,profit:0,grade,guard:0};
    Escort.assign(s,route,guard);s.exchange.serial++;s.exchange.routes.push(route);
    Economy.note(s,'fleet','자동 항로 개설',port(from).name+' → '+port(to).name+' · '+lines.length+'품목');
  }
  function cancel(s,id) {
    const routes=s.exchange.routes, r=routes.find(x=>x.id===id);
    if(!r||r.stop)throw Error('이미 취소된 항로입니다.');
    if(r.cargo)r.stop=true; else routes.splice(routes.indexOf(r),1);
    Economy.note(s,'fleet','자동 운항 취소',r.cargo?'현재 화물 매각 후 복귀':'배정 해제');
  }
  function loadingCost(s,r) {
    return r.lines.reduce((total,l)=>total+Math.max(0,l.qty-(holding(s,r.from,l.good)?.qty||0))*quote(s,r.from,l.good).ask,0);
  }
  function departures(s) {
    for(const r of [...s.exchange.routes]){
      if(r.cargo){
        const damage=Escort.encounter(s,r);
        let proceeds=0;
        for(const line of r.lines){
          const lost=Math.ceil(line.qty*damage/100);
          s.security.lost+=lost;proceeds+=quote(s,r.to,line.good).bid*(line.qty-lost);
        }
        const gain=proceeds-r.cargo.cost;
        bookSale(s,proceeds,r.cargo.cost); r.profit+=gain; r.trips++; r.cargo=null;
        if(s.story&&proceeds>0)s.story.deliveries++;
        Economy.note(s,'market',port(r.to).name+' 자동 매각',r.lines.length+'품목 · 손익 '+gain.toLocaleString('ko-KR')+' CR');
        if(r.stop)s.exchange.routes.splice(s.exchange.routes.indexOf(r),1);
      }else{
        const price=loadingCost(s,r);
        if(s.cash<price)continue;
        let cost=price;
        for(const l of r.lines){
          const h=holding(s,r.from,l.good);
          cost+=take(s,h,Math.min(h?.qty||0,l.qty));
        }
        s.cash-=price; r.cargo={cost};
        Handover.advance(s,'DISPATCH_FIRST_SHIP');
      }
    }
  }
  function valid(e) {
    const amount=lot=>integer(lot.qty,1)&&integer(lot.cost,1);
    return e && typeof e.carrier==='boolean' && ['sales','costs','serial','arrears'].every(k=>integer(e[k])) && Number.isSafeInteger(e.realized)
      && Array.isArray(e.stock)&&e.stock.length<=goods.length*GameData.planets.length
      && e.stock.every(h=>port(h.place)&&byId(h.good)&&amount(h))&&new Set(e.stock.map(h=>h.place+'/'+h.good)).size===e.stock.length
      && Array.isArray(e.routes)&&new Set(e.routes.map(r=>r.id)).size===e.routes.length
      && e.routes.every(r=>integer(r.id,1,e.serial)&&port(r.from)&&port(r.to)&&r.from!==r.to&&manifest(r.lines)
        && integer(r.grade,1,4)&&integer(r.guard,0,3)&& (r.cargo===null||integer(r.cargo.cost,1))&&typeof r.stop==='boolean'&&(!r.stop||r.cargo)&&integer(r.trips)&&Number.isSafeInteger(r.profit));
  }
  return {goods,byId,port,initial,quote,holding,trade,register,registrationFee,capacity,freeShips,schedule,cancel,loadingCost,departures,valid};
})();
