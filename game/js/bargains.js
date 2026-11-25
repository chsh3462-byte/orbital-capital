'use strict';
window.Bargains=(()=>{
  // A concession changes the unit price, lot size or handling fee. Negative percentages
  // reduce prices for either side. The UI quotes the final invoice before commitment.
  const pool=[];
  function group(side,context,rows){
    for(const [title,percent,scale=100,fee=0] of rows)pool.push({id:pool.length,side,context,title,percent,scale,fee});
  }
  group('buy','any',[['공동 포장 인수',-2,100,12],['검수 보증표 첨부',1],['잔량 소포장',1,75],['현장 인도',-1],['추가 상자 묶음',-2,125],['봉함 상자 우선 배정',0,100,8]]);
  group('sell','any',[['부두 현금 정산',-1],['검수 후 고가 인수',2,100,15],['소매상 분할 납품',2,75],['일괄 하역',-1,125],['표준 인수증 교환',0],['여객 조합 공동 납품',3,100,30]]);
  group('buy','origin',[['생산자 공동 출고',-3,125],['산지 선별품 확보',1,75],['공방 잔량 인수',-3,75],['산지 직송 상자',-2,100,5],['생산조 교대 물량',-1,150]]);
  group('sell','origin',[['현지 가공소 잔량 납품',-2,75],['귀항 포장재 회수',1,100,8],['산지 조합 재매입',-1,125],['품질 표본 제공',3,50,10],['현장 재검수',2,100,18]]);
  group('buy','demand',[['예약 취소분 인수',-1,75],['수요처 선점',2,125],['긴급 재고 확보',3],['여객 부두 배정분',0,75],['소매 상회 합배송',-2,150,20]]);
  group('sell','demand',[['소비 조합 긴급 납품',3,125],['상점 진열분 직납',2,75],['예약 주문 충당',3,100,10],['여객선 보급 주문',1,150],['하역장 직판',2,100,5]]);
  group('both','bulk',[['컨테이너 단위 정산',-2,125],['창고 두 곳 분할',1,75,8],['대량 잔여분만 교환',-1,50],['전용 하역창 예약',2,100,20],['통합 송장 발행',0,150]]);
  group('both','small',[['샘플 상자 거래',1,50],['손수레 직거래',-1],['소량 검사 면제',0],['견본 추가 동봉',-1,150],['창구 우선 처리',2,100,5]]);
  group('both','boom',[['호황 증편 물량',1,150],['만석 편 잔여칸',2,75],['추가 배선 공동 접수',-1,125]]);
  group('both','risk',[['우회편 접안료 분담',-2,100,18],['보호 창고 인수',2,100,12],['위험 구역 소량 반출',1,50]]);
  group('both','breakthrough',[['시제품 비교 검수',2,75],['시험 생산 잔량',-2,125],['연구소 공동 배송',1,100,8]]);
  const scenarios={origin:'산지 출고',demand:'소비지 주문',bulk:'대량 화물',small:'소량 화물',boom:'물류 호황',risk:'운항 경보',breakthrough:'신기술 발표',any:'부두 거래'};
  function drawFrom(pool,seed){
    return ()=>{
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      return pool.splice(Math.floor(seed/4294967296*pool.length),1)[0];
    };
  }
  function offers(s,place,good,qty,buy){
    if(!Number.isInteger(qty)||qty<1||qty>1000||!Commerce.port(place)||!Commerce.byId(good))throw Error('1~1,000상자를 입력하세요.');
    const g=Commerce.byId(good),q=Commerce.quote(s,place,good);
    const contexts=new Set(['any',qty>=10?'bulk':'small',s.event?.id]);
    if(place===g.origin)contexts.add('origin');
    if(place===g.hub||q.demand>=120)contexts.add('demand');
    let seed=(s.seed^Math.imul(s.dealSerial+1,2654435761))>>>0;
    for(const c of place+good+qty+buy)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
    const candidates=pool.filter(o=>(o.side==='both'||o.side===(buy?'buy':'sell'))&&contexts.has(o.context));
    const special=candidates.filter(o=>o.context!=='any'),first=drawFrom(special,seed)();
    const draw=drawFrom(candidates.filter(o=>o!==first),seed^0x54321),picked=[first,draw(),draw(),draw()];
    return picked.map(o=>{
      const units=Math.max(1,Math.min(1000,Math.round(qty*o.scale/100)));
      const price=Math.round((buy?q.ask:q.bid)*(1+o.percent/100));
      const total=buy?units*price+o.fee:Math.max(0,units*price-o.fee);
      return {...o,units,price,total};
    });
  }
  function deal(s,place,good,qty,buy,id){
    const o=offers(s,place,good,qty,buy).find(x=>x.id===id);
    if(!o)throw Error('이번 거래에 제시된 조건을 선택하세요.');
    Commerce.trade(s,place,good,o.units,buy,o.total);
    s.dealSerial++;
  }
  function view(s,place,good,qty,buy){
    const h=Commerce.holding(s,place,good);
    return '<p class="hint">'+Commerce.port(place).name+' · '+Commerce.byId(good).name+' · 요청 '+qty+'상자. 수량과 취급료를 포함한 최종 금액을 확인하세요. 제안을 고르면 즉시 체결합니다.</p>'+offers(s,place,good,qty,buy).map(o=>{
      const disabled=buy?o.total>s.cash:o.units>(h?.qty||0);
      return '<button class="list-choice" data-act="dealAccept" data-id="'+o.id+'" '+(disabled?'disabled':'')+'><span>'+o.title+'<small>'+scenarios[o.context]+' · '+o.units+'상자 × '+UI.money(o.price)+' · 취급료 '+UI.money(o.fee)+'</small></span><b>'+UI.money(o.total)+'</b></button>';
    }).join('');
  }
  // A single collectible is delivered under any of these terms. The public commissions
  // raise company reputation, while private collection and self-service cost less.
  const collectorTerms=[
    ['any','직접 인수',-1,0],['any','비공개 인도',-2,0],['any','표준 인도증',0,0],
    ['any','제작자 공동 발표',3,1],['any','자유항 전시기금 후원',6,2],
    ['hangar','조선소 선석에서 인수',-3,0],['hangar','시운전 참관권 공개',2,1],
    ['hangar','진수식 후원사 등록',5,2],['hangar','선주 직접 회항',-4,0],
    ['hangar','기관사 조합 공개 인도',4,2],['hangar','인도장 정규 출고',0,0],
    ['market','공방 포장재 재사용',-3,0],['market','작가 작업실에서 인수',-4,0],
    ['market','공방 도록 후원',3,1],['market','제작 시연회 협찬',5,2],
    ['market','회랑 조합 공동 인증',2,1],['market','진열 종료 후 현장 인수',-2,0],
    ['premium','기념 도록 발간 후원',7,3],['premium','초청 인수식 개최',5,2],
    ['premium','전용 운송함 반납',-2,0],['premium','박물관 연구 도판 후원',4,2]
  ];
  function collectorOffers(s,item,venue){
    if(!item||!['market','hangar'].includes(venue)||Leisure.source(item)!==venue||s.leisure.owned.includes(item.id))throw Error('인도 가능한 진열품을 선택하세요.');
    const rows=collectorTerms.map(([kind,title,pct,rep],id)=>({kind,title,pct,rep,id,total:Math.round(item.price*(1+pct/100))})).filter(o=>o.kind==='any'||o.kind===venue||(o.kind==='premium'&&item.price>=1000000));
    let seed=s.seed^s.dealSerial;
    for(const c of item.id)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
    const economical=drawFrom(rows.filter(o=>o.pct<=0),seed)(),publicity=drawFrom(rows.filter(o=>o.rep>0),seed^12345)();
    const draw=drawFrom(rows.filter(o=>o!==economical&&o!==publicity),seed^54321);
    return [economical,publicity,draw(),draw()];
  }
  function collect(s,id,venue,choice){
    const offer=collectorOffers(s,Leisure.get(id),venue).find(o=>o.id===choice);
    if(!offer)throw Error('이번 인도 조건을 선택하세요.');
    Leisure.purchase(s,id,venue,offer.total);s.rep=Math.min(100,s.rep+offer.rep);s.dealSerial++;
  }
  function collectorView(s,id,venue){
    const item=Leisure.get(id);
    return UI.kv('표시 가격',UI.money(item.price))+'<p class="hint">인수 조건을 고르면 표시된 최종 금액을 결제하고 개인 보관고에 인도합니다.</p>'+collectorOffers(s,item,venue).map(o=>
      '<button class="list-choice" data-act="collectDeal" data-id="'+o.id+'" '+(s.cash<o.total?'disabled':'')+'><span>'+o.title+'<small>표시가 대비 '+(o.pct>0?'+':'')+o.pct+'% · 기본 평판 +'+Math.min(100-s.rep,o.rep)+'</small></span><b>'+UI.money(o.total)+'</b></button>').join('');
  }
  return {offers,deal,view,collectorOffers,collect,collectorView};
})();
