'use strict';
window.Commerce = (() => {
  // The wholesale lots are independent of the individual pieces in the collector's market.
  const goods = [
    {id:'tea', name:'해무 찻잎', origin:'nereid', hub:'lyra', base:210, art:'luxTea', use:'라이라 여객선의 티룸에 공급하는 첫물 찻잎'},
    {id:'silk', name:'진홍 성운사', origin:'veyra', hub:'nereid', base:340, art:'luxWeave', use:'네레이드 수상 공방에서 돛감으로 짜는 섬유'},
    {id:'glass', name:'별고리 광학유리', origin:'lyra', hub:'orion', base:480, art:'luxTideglass', use:'오리온 측량원의 관측 렌즈용 유리'},
    {id:'sensor', name:'항법 소자', origin:'orion', hub:'thalos', base:620, art:'chip', use:'탈로스 조선소에서 항법기에 넣는 정밀 부품'},
    {id:'gear', name:'내열 기어', origin:'thalos', hub:'eir', base:390, art:'luxClock', use:'에이르 채취 기지의 시추기용 기어'},
    {id:'essence', name:'빙화 정유', origin:'eir', hub:'veyra', base:530, art:'luxScent', use:'베이라 직조 길드의 향료 마감재'}
  ];
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
  function trade(s,place,id,qty,buy) {
    if(!port(place)||!byId(id)||!integer(qty,1,1000))throw Error('품목과 1~1,000상자의 정수 수량을 선택하세요.');
    const q=quote(s,place,id);
    if(buy){
      Economy.charge(s,qty*q.ask); add(s,place,id,qty,qty*q.ask);
    }else{
      const h=holding(s,place,id);
      if(!h||h.qty<qty)throw Error('이 행성의 창고에 매도할 수량이 부족합니다.');
      bookSale(s,qty*q.bid,take(s,h,qty));
    }
    Economy.note(s,'market',byId(id).name+(buy?' 현물 매수':' 현물 매도'),port(place).name+' · '+qty+'상자 × '+(buy?q.ask:q.bid)+' CR');
  }
  const registrationFee = 18000;
  function register(s) {
    if(s.exchange.carrier)throw Error('이미 전문 운송사로 등록했습니다.');
    Economy.charge(s,registrationFee);
    s.exchange.carrier=true;
    Economy.note(s,'fleet','전문 운송사 등록','전용 적재 설비 도입 · 척당 8상자 확장');
  }
  const capacity = s => 12+(s.exchange.carrier?8:0)+s.tech.cargo*4+Staff.capacity(s);
  const freeShips = s => Economy.fleet(s)-s.exchange.routes.length-(s.freight?1:0);
  function manifest(lines) {
    return Array.isArray(lines)&&lines.length>=1&&lines.length<=goods.length&&lines.every(l=>byId(l.good)&&integer(l.qty,1,1000))&&new Set(lines.map(l=>l.good)).size===lines.length;
  }
  function schedule(s,from,to,lines) {
    if(!port(from)||!port(to)||from===to||!manifest(lines)||lines.reduce((n,l)=>n+l.qty,0)>capacity(s))throw Error('서로 다른 항구와 적재 한도 안의 화물 목록을 지정하세요.');
    if(freeShips(s)<1)throw Error('배정할 정기편 화물선이 없습니다.');
    s.exchange.routes.push({id:++s.exchange.serial,from,to,lines:lines.map(l=>({...l})),cargo:null,stop:false,trips:0,profit:0});
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
        const proceeds=r.lines.reduce((n,l)=>n+quote(s,r.to,l.good).bid*l.qty,0), gain=proceeds-r.cargo.cost;
        bookSale(s,proceeds,r.cargo.cost); r.profit+=gain; r.trips++; r.cargo=null;
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
        && (r.cargo===null||integer(r.cargo.cost,1))&&typeof r.stop==='boolean'&&(!r.stop||r.cargo)&&integer(r.trips)&&Number.isSafeInteger(r.profit));
  }
  return {goods,byId,port,initial,quote,holding,trade,register,registrationFee,capacity,freeShips,schedule,cancel,loadingCost,departures,valid};
})();
