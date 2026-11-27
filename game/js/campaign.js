'use strict';
window.Campaign=(()=>{
  const chapters=[
    {title:'변방의 생존자',ports:['nereid','lyra','veyra'],stocks:['TOW','SEL'],features:[],condition:'첫 부두 인계',briefs:[
      '변방 운항증이 나왔어요. 네레이드·라이라·베이라 사이에 짐을 나르고, 자오선 예항과 세린 염광조합 주식을 거래할 수 있어요. 첫 배는 제가 옆에서 도울게요.']},
    {title:'성계 관문 개방',ports:['thalos','mira'],stocks:['POL','LUX'],features:['research','personnel'],condition:'초기 순자산 2배 또는 거점 2곳',briefs:[
      '상업 연맹에서 관문 통행증을 보냈어요. 탈로스와 미라의 공업품 시세가 들어오고, 극광 냉장해운과 미라 등광유리 주문도 받기 시작했어요.',
      '연구소에 예산을 배정할 수 있어요. 워프·화물칸·AI 항법은 서로 다른 연구예요. 세 분야를 하나씩 끝내면 다음 허가 조건에 포함돼요.',
      '인사 창구도 열렸어요. 원하는 직원 스타일과 채용 기준을 정해 두면 매일 심사해요. 경호원을 고용한 뒤에는 지정 항로에 배정해 주세요.']},
    {title:'메가코프의 견제',ports:['orion','serein'],stocks:['HEL','NVA'],features:['ads','mergers'],condition:'초기 순자산 10배 및 서로 다른 연구 3종',briefs:[
      '오리온과 세린이 항로표에 들어왔어요. 헬리오스 물류와 노바 다이내믹스도 거래를 열었네요. 두 회사의 호가는 변방 종목보다 크게 움직여요.',
      '마케팅 부서가 문을 열었어요. 캠페인을 고르면 비용을 먼저 내고, 정해진 기간 동안 매출과 평판에 효과를 받아요.',
      '이제 거래창에서 경영권 인수를 검토할 수 있어요. 우호적 인수는 지분 50%부터예요. 다음 챕터의 지분 조건은 51%라서 한 주 차이가 나요.']},
    {title:'섹터 07 지배권',ports:['eir','calyx'],stocks:['AXM','ARC'],features:['port','lounge'],condition:'경쟁사 지분 51% 또는 거점 6곳',briefs:[
      '마지막 관제권이 승인됐어요. 에이르와 칼릭스까지 아홉 행성이 한 지도에 잡혀요. 액시엄 테크와 변경 호송해운도 이제 주문할 수 있어요.',
      '자오선 자유항에서 비행선과 공예품을 고를 수 있어요. 아티팩트는 비밀 경매의 NPC와 경쟁해야 손에 들어와요. 카지노는 살롱에서 찾으세요.',
      '대표님 라운지도 열렸어요. 자유항에서 산 물건을 전시 자리에 놓아 보세요. 다음 교대에도 그대로 남겨 둘게요.']}
  ];
  const tier=new Map(chapters.flatMap((c,i)=>[...c.ports,...c.stocks,...c.features].map(id=>[id,i+1])));
  const level=s=>s.campaign?.level||1;
  const allowed=(s,id)=>(tier.get(id)||1)<=level(s);
  function requireAccess(s,id){if(!allowed(s,id))throw Error('챕터 '+tier.get(id)+'에서 열립니다.');}
  const ports=s=>GameData.planets.filter(p=>allowed(s,p.id));
  const markets=s=>s.markets.filter(r=>allowed(s,r.id));
  const goods=s=>Commerce.goods.filter(g=>allowed(s,g.origin));
  const initial=base=>({level:1,base:Math.max(1,base),read:0});
  function valid(c){
    return c&&Number.isInteger(c.level)&&c.level>=1&&c.level<=4&&Number.isSafeInteger(c.base)&&c.base>0
      &&Number.isInteger(c.read)&&c.read>=0&&c.read<=chapters.slice(0,c.level).reduce((n,ch)=>n+ch.briefs.length,0);
  }
  function migrate(s){
    if(s.campaign!==undefined)return;
    const c=s.campaign=initial(s.story?.baseline||Handover.worth(s));
    const keep=id=>{c.level=Math.max(c.level,tier.get(id)||1);};
    for(const p of s.planets)if(p.owner==='player')keep(p.id);
    for(const r of s.markets)if(r.acquired||r.shares)keep(r.id);
    for(const r of s.exchange.routes){keep(r.from);keep(r.to);for(const l of r.lines)keep(Commerce.byId(l.good).origin);}
    for(const h of s.exchange.stock){keep(h.place);keep(Commerce.byId(h.good).origin);}
    if(s.freight)keep({tea:'nereid',clock:'thalos',scent:'eir'}[s.freight.id]);
    if(s.hr.open||s.hr.serial||s.security.roster.some(Boolean)||Object.values(s.tech).some(Boolean))keep('research');
    if(s.ads.length||s.expenses.marketing||s.mergers.length||s.guide.status==='active')keep('mergers');
    const l=s.leisure;
    if(l.owned.length||l.auction.invited||l.rounds||l.wheel.rounds||Object.values(l.tables).some(Boolean))keep('port');
  }
  function progress(s){
    const c=s.campaign;if(!c)return false;
    const before=c.level,sites=s.planets.filter(p=>p.owner==='player').length;
    if(c.level===1&&(sites>=2||Handover.worth(s)>=c.base*2))c.level=2;
    if(c.level===2&&Object.values(s.tech).filter(Boolean).length>=3&&Handover.worth(s)>=c.base*10)c.level=3;
    if(c.level===3&&(sites>=6||s.markets.some(r=>r.shares>=51||r.acquired)))c.level=4;
    for(let i=before;i<c.level;i++)Economy.note(s,'system','긴급 통신 · '+chapters[i].title,chapters[i].condition+' 달성');
    return c.level!==before;
  }
  function pending(s){
    let offset=s.campaign.read;
    for(const [i,ch] of chapters.slice(0,level(s)).entries()){
      if(offset<ch.briefs.length)return {title:'CH.'+(i+1)+' '+ch.title,line:ch.briefs[offset],more:offset+1<ch.briefs.length};
      offset-=ch.briefs.length;
    }
    return null;
  }
  const next=s=>chapters[level(s)]?.condition||'섹터 전역 개방';
  return {chapters,tier,initial,valid,migrate,progress,pending,next,level,allowed,requireAccess,ports,markets,goods};
})();
