'use strict';
window.ExchangeUI = (() => {
  const C=Commerce;
  const num=(id,label,value,min,max)=>'<label class="field">'+label+'<input type="number" id="'+id+'" min="'+min+'" max="'+max+'" step="1" value="'+value+'"></label>';
  function select(id,label,options,value){
    return '<label class="field">'+label+'<select id="'+id+'">'+options.map(([k,v])=>'<option value="'+k+'" '+(k===value?'selected':'')+'>'+v+'</option>').join('')+'</select></label>';
  }
  const portName=id=>C.port(id).name;
  function market(s,place){
    const U=UI, p=C.port(place), e=s.exchange;
    const buttons=Campaign.ports(s).map(d=>'<button class="tab '+(d===p?'active':'')+'" data-act="exchangePort" data-id="'+d.id+'" aria-pressed="'+(d===p)+'">'+d.name+'</button>').join('');
    const prices=Campaign.goods(s).map(g=>{
      const q=C.quote(s,place,g.id), h=C.holding(s,place,g.id);
      const change=q.bid-C.quote(s,place,g.id,s.day-1).bid;
      const role=g.origin===place?'현지 특산품':g.hub===place?'주요 소비지':'일반 유통';
      return ['<span class="item-line">'+PixelArt.thumb(g.art,32)+'<b>'+g.name+'</b></span>',role+' · '+q.demand,U.money(q.ask),U.money(q.bid),
        (change>0?'+':'')+change+' CR',h?h.qty+'상자':'—',U.btn('매매 · 시세','goodsOrder',g.id,false,false)];
    });
    const stocks=e.stock.map(h=>{
      const worth=C.quote(s,h.place,h.good).bid*h.qty;
      return [portName(h.place),C.byId(h.good).name,h.qty+'상자',U.money(h.cost),U.money(worth),U.money(worth-h.cost)];
    });
    const routes=e.routes.map(r=>{
      const required=C.loadingCost(s,r);
      const phase=r.cargo?(r.stop?'마지막 인도 후 종료':'운송 중 · 다음 결산에 매각'):s.cash<required?'자금 부족 · 재시도 대기':'다음 결산에 선적';
      return [portName(r.from)+' → '+portName(r.to),Escort.hulls[r.grade-1]+' · '+Escort.guards[r.guard],r.lines.map(l=>C.byId(l.good).name+' '+l.qty+'상자').join(' · '),phase,r.trips+'회',U.money(r.profit),U.btn('경호 배정','guardSetup',r.id,!!r.cargo,false)+U.btn(r.stop?'취소 접수':'운항 취소','routeCancel',r.id,r.stop,false)];
    });
    return '<div class="toolbar"><div><h2>'+p.name+' 현물 거래장</h2><p>하루 한 번 시세가 바뀝니다. 수요 지수 100이 기준이며, 시세표에서 품목별 다른 행성 가격도 비교할 수 있습니다.</p></div></div><div class="action-row">'+buttons+'</div>'+
      U.panel('현지 호가',U.table(['품목','수요 지수','살 때 / 상자','팔 때 / 상자','전일 매도가 대비','현지 재고','주문'],prices))+
      U.panel('지정 자동 운항', '<div class="padded"><p class="hint">취소할 때까지 출발지에서 재고를 먼저 싣고 모자란 수량을 매입합니다. 다음 결산에 도착 시세로 전량 매각합니다. 자금이 부족하면 출항을 기다립니다.</p>'+U.btn('자동 항로 지정','routeSetup','',C.freeShips(s)<1)+' '+(e.carrier?'전문 운송사 등록 완료':U.btn('전문 운송사 등록 · 설비 +8상자 · '+U.money(C.registrationFee),'registerCarrier','',s.cash<C.registrationFee,false))+' <small>배정 가능 '+C.freeShips(s)+'척 · 척당 '+C.capacity(s)+'상자</small></div>'+(routes.length?U.table(['항로','선급 · 경호','화물','상태','매각','누적 매매손익','운항'],routes):''))+
      U.panel('행성별 투자 재고','<p class="padded hint">누적 실현손익 '+U.money(e.realized)+' · 평가액은 현지 매도 호가 기준입니다.</p>'+(stocks.length?U.table(['창고','품목','수량','매입 원가','평가액','평가손익'],stocks):'<p class="padded">보유한 현물이 없습니다.</p>'));
  }
  function order(s,place,id){
    const U=UI,g=C.byId(id),h=C.holding(s,place,id);
    const rows=Campaign.ports(s).map(p=>{
      const q=C.quote(s,p.id,id);
      const bids=Array.from({length:Math.min(7,s.day)},(_,i)=>C.quote(s,p.id,id,s.day-Math.min(7,s.day)+1+i).bid);
      return [p.name,p.id===g.origin?'특산지':p.id===g.hub?'주요 소비지':'일반',q.demand,U.money(q.ask),U.money(q.bid),U.spark(bids,'#83cbbb')];
    });
    return '<p class="hint">'+g.use+'입니다. 특산지는 '+portName(g.origin)+', 주요 소비지는 '+portName(g.hub)+'입니다.</p>'+
      U.table(['행성','역할','수요 지수','매수 단가','매도 단가','7일 매도가'],rows)+
      U.kv('주문 창고',portName(place)+' · '+(h?.qty||0)+'상자')+num('goodsQty','거래 수량 (상자)',1,1,1000)+
      '<p id="goodsQuote" class="hint"></p><div class="action-row">'+U.btn('매수 조건 보기','goodsBuy',id)+U.btn('매도 조건 보기','goodsSell',id,!h,false)+U.btn('이 품목 자동 운항','routeSetup',id,C.freeShips(s)<1,false)+'</div>';
  }
  function routeForm(s,place,id){
    const planets=Campaign.ports(s).map(p=>[p.id,p.name]),g=C.byId(id)||C.goods.find(g=>g.origin===place);
    return '<p class="hint">정기편 한 척을 이 항로에 배정합니다. 취소 시 이미 선적한 화물은 도착지에서 한 번 매각한 뒤 복귀합니다.</p>'+
      select('routeGrade','배선할 운송정 등급',Escort.hulls.map((name,i)=>[i+1,(i+1)+'급 '+name]),1)+
      select('routeGuard','동승 경호',guardOptions(s),0)+
      select('routeFrom','매입 · 선적 항구',planets,place)+select('routeTo','매각 항구',planets,[g.hub,g.origin,...planets.map(([key])=>key)].find(key=>key!==place&&Campaign.allowed(s,key)))+
      '<fieldset class="cargo-lines"><legend>회당 선적 목록 · 0상자는 제외</legend>'+Campaign.goods(s).map(item=>num('cargo-'+item.id,item.name+' (상자)',item===g?Math.min(10,C.capacity(s)):0,0,C.capacity(s,4))).join('')+'</fieldset>'+
      '<p id="routeQuote" class="hint"></p><div class="action-row">'+UI.btn('반복 운항 시작','routeStart')+'</div>';
  }
  function readLines(doc){
    return C.goods.map(g=>({good:g.id,qty:doc.getElementById('cargo-'+g.id)?.valueAsNumber??0})).filter(l=>l.qty!==0);
  }
  function updateQuote(s,place,id,doc){
    const read=id=>doc.getElementById(id);
    if(read('routeQuote')){
      const from=read('routeFrom').value,to=read('routeTo').value,lines=readLines(doc);
      const count=lines.reduce((n,l)=>n+l.qty,0),grade=Number(read('routeGrade').value),guard=Number(read('routeGuard').value),limit=C.capacity(s,grade);
      const gain=lines.reduce((n,l)=>n+l.qty*(C.quote(s,to,l.good).bid-C.quote(s,from,l.good).ask),0);
      read('routeQuote').textContent=lines.length&&lines.every(l=>Number.isInteger(l.qty)&&l.qty>0)&&count<=limit&&from!==to?
        '결산 2회에 1회 왕복 · 습격 '+Escort.risk(grade)+'% · 방어 성공 '+Escort.chance(guard)+'% · '+count+' / '+limit+'상자 · 현재 재고 반영 필요 자금 '+UI.money(C.loadingCost(s,{from,lines}))+' · 습격 피해 전 예상 매매손익 '+UI.money(gain)+' (도착 시세에 따라 변동)':'서로 다른 항구와 적재 한도 안의 수량을 선택하세요. 한도 '+limit+'상자';
    }else if(read('goodsQuote')){
      const n=read('goodsQty').valueAsNumber,q=C.quote(s,place,id);
      read('goodsQuote').textContent=Number.isInteger(n)&&n>=1&&n<=1000?'총 매수액 '+UI.money(q.ask*n)+' · 총 매도액 '+UI.money(q.bid*n):'1~1,000상자를 입력하세요.';
    }
  }
  function guardOptions(s,current=0){
    return Escort.guards.map((name,i)=>[i,name+' · 방어 '+Escort.chance(i)+'%']).filter(([i])=>i===0||i===current||Escort.spare(s,i)>0);
  }
  function guardForm(s,id){
    const r=s.exchange.routes.find(route=>route.id===Number(id));
    if(!r||r.cargo)throw Error('선적 대기 중인 항로를 선택하세요.');
    return UI.kv('항로',portName(r.from)+' → '+portName(r.to))+UI.kv('인도당 습격 확률',Escort.risk(r.grade)+'%')+select('routeGuard','배정할 경호',guardOptions(s,r.guard),r.guard)+UI.btn('경호 배정 확정','guardAssign',r.id);
  }
  function personnel(s){
    const U=UI,h=s.hr,p=h.policy;
    const member=w=>[w.name+' #'+w.id,Staff.styles[w.style],w.skill,w.care,U.money(w.wage)];
    const heads=['이름','업무 스타일','실무','정확성','일급'];
    return Escort.view(s)+U.panel('운항지원팀', '<div class="padded">'+U.kv('고용 직원',h.team.length+'명 · 일 급여 '+U.money(Staff.payroll(s)))+
      U.kv('팀의 추가 적재량','척당 +'+Staff.capacity(s)+'상자')+'<p class="hint">직원은 선적 순서와 적재 공간을 관리합니다. 한 명당 실무와 정확성 점수의 합에 따라 지정 항로의 적재 한도가 늘어납니다.</p></div>'+
      (h.team.length?U.table(heads,h.team.map(member)):''))+
      U.panel('자동 채용 심사','<div class="padded">'+U.kv('모집 상태',(h.open?'모집 중':'모집 종료')+' · 목표 총 '+p.target+'명')+
      U.kv('지원자 기준',Staff.styles[p.style]+' · 실무 '+p.skill+' 이상 · 정확성 '+p.care+' 이상 · 일급 '+U.money(p.wage)+' 이하')+
      '<p class="hint">매일 결산 때 지정한 스타일의 지원자 한 명을 심사합니다. 모든 기준을 충족하면 채용하고, 다음 근무일부터 급여를 지급합니다.</p><div class="action-row">'+U.btn('모집 스타일 · 심사 기준','hrSetup')+
      (h.open?U.btn('모집 중지','hrStop','',false,false):'')+'</div></div>')+
      U.panel('최근 심사 결과',h.recent.length?U.table(['심사일',...heads,'결과'],h.recent.map(w=>[U.date(w.day),...member(w),U.esc(w.result)])):'<p class="padded">아직 심사한 지원자가 없습니다.</p>');
  }
  function policy(s){
    const p=s.hr.policy;
    return '<p class="hint">현장형은 실무, 꼼꼼형은 정확성, 균형형은 두 점수에 고르게 가산점을 받습니다. 아래 설정은 다음 지원자부터 적용됩니다.</p>'+
      select('hrStyle','모집할 업무 스타일',Object.entries(Staff.styles),p.style)+num('hrSkill','최소 실무 점수',p.skill,0,100)+num('hrCare','최소 정확성 점수',p.care,0,100)+num('hrWage','희망 일급 상한 (CR)',p.wage,1,500)+num('hrTarget','목표 총 직원 수',p.target,1,24)+
      '<div class="action-row">'+UI.btn('기준 적용 · 자동 모집','hrApply')+'</div>';
  }
  return {market,order,guardForm,routeForm,readLines,updateQuote,personnel,policy};
})();
