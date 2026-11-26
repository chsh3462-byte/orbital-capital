'use strict';
window.Handover=(()=>{
  const {intro,steps,missions,guide}=HandoverScript;
  const scenes=new Map([...intro,...steps].map(scene=>[scene.id,scene]));
  const current=s=>scenes.get(s.story?.scene);
  function initial(baseFleet){
    return {scene:intro[0].id,baseFleet,baseline:0,deliveries:0,claimed:[],points:0,debt:0};
  }
  function valid(g){
    if(g===undefined)return true;
    const natural=n=>Number.isSafeInteger(n)&&n>=0;
    return g&&(g.scene==='completed'||scenes.has(g.scene))&&[1,3].includes(g.baseFleet)&&natural(g.baseline)&&natural(g.deliveries)
      &&natural(g.points)&&g.points<=1&&natural(g.debt)&&Array.isArray(g.claimed)&&new Set(g.claimed).size===g.claimed.length
      &&g.claimed.every(id=>missions.some(m=>m.id===id));
  }
  function worth(s){
    let total=s.cash-s.exchange.arrears-(s.story?.debt||0);
    for(const r of s.markets)total+=r.shares*r.price;
    for(const p of s.planets.filter(p=>p.owner==='player')){
      total+=Commerce.port(p.id).price+p.buildings.reduce((n,id)=>n+GameData.facilities.find(f=>f.id===id).cost,0);
    }
    for(const h of s.exchange.stock)total+=h.qty*Commerce.quote(s,h.place,h.good).bid;
    for(const r of s.exchange.routes)total+=r.cargo?.cost||0;
    for(const id of s.leisure.owned)total+=Leisure.get(id).price;
    return total+(s.leisure.auction.lot?.bid||0);
  }
  function attach(s,baseFleet){
    s.story=initial(baseFleet);
    s.story.baseline=Math.max(1,worth(s));
    if(s.guide.status!=='done')s.guide.status='later';
  }
  function choose(s,id){
    if(!current(s)?.choices?.some(c=>c.nextId===id))return false;
    s.story.scene=id;return true;
  }
  function advance(s,action){
    const scene=current(s);
    if(!scene||scene.requiredAction!==action)return false;
    const reward=scene.reward;
    s.story.scene=scene.nextId;s.cash+=reward.cash||0;
    s.rep=Math.min(100,s.rep+(reward.reputation||0));
    Economy.note(s,'system',scene.title,reward.message);
    return reward.message;
  }
  function achieved(s,id){
    switch(id){
      case 'mission_first_trade':return s.story.deliveries>0;
      case 'mission_net_worth_2x':return worth(s)>=s.story.baseline*2;
      case 'mission_second_outpost':return s.planets.filter(p=>p.owner==='player').length>=2;
      case 'mission_first_research':return Object.values(s.tech).some(lv=>lv>0);
    }
    return false;
  }
  const has=(s,id)=>s.story?.claimed.includes(id);
  function claim(s,id){
    if(s.story?.scene!=='completed'||has(s,id)||!achieved(s,id))throw Error('달성한 목표의 보상만 한 번 받을 수 있습니다.');
    const mission=missions.find(m=>m.id===id);
    s.story.claimed.push(id);
    if(id==='mission_first_trade')s.cash+=10000;
    if(id==='mission_net_worth_2x')s.story.points++;
    Economy.note(s,'system',mission.title,mission.rewardText);
  }
  function loan(s,repay){
    if(repay){
      if(!s.story.debt)throw Error('상환할 대출이 없습니다.');
      Economy.charge(s,s.story.debt);Economy.note(s,'finance','운영 자금 전액 상환',s.story.debt.toLocaleString('ko-KR')+' CR');s.story.debt=0;
    }else{
      if(s.story.debt||s.cash>10000)throw Error('현금 10,000 CR 이하이며 기존 대출이 없을 때 신청할 수 있습니다.');
      s.cash+=20000;s.story.debt=20000;Economy.note(s,'finance','긴급 운영 자금 대출','20,000 CR · 하루 이자 20 CR');
    }
  }
  const targets=['지도에서 행성 선택','화물 적재 및 항로 지정','배속 올리기','일일 재무제표 열기','은하 증권 시장 열기'];
  function panel(s){
    const scene=current(s);if(!scene)return '';
    let lines=scene.lines;
    if(s.story.baseFleet===3 && scene.id==='scene_01')lines=[...lines.slice(0,2),'현재 회사의 자금과 함대를 인계서에 반영했다. 운영을 이어가자.'];
    if(scene.id==='scene_02' && (s.story.baseFleet===3||s.day!==11))lines=[lines[0].replace('2186년 1월 11일',UI.date(s.day)), '보유 함선 '+Economy.fleet(s)+'척, 자사 거점 '+s.planets.filter(p=>p.owner==='player').length+'곳입니다. 일일 유지비를 감당할 수 있는 항로를 확보하세요.',lines[2]];
    const buttons=scene.choices?scene.choices.map(c=>UI.btn(c.label,'storyChoice',c.nextId,false,!c.skipIntro)).join(''):UI.btn(targets[scene.step-1],'storyTarget');
    return '<article class="handover"><small>'+scene.role+'</small><h2>'+scene.title+'</h2><b>'+scene.speaker+'</b>'+lines.map(l=>'<p>'+l+'</p>').join('')+'<div class="handover-actions">'+buttons+'</div><p class="hint">'+scene.actionHint+(scene.reward?' · '+scene.reward.message:'')+'</p></article>';
  }
  function handbook(s){
    const g=s.story;
    const checklist=missions.map(m=>{
      const taken=has(s,m.id);
      return '<section><b>'+m.title+'</b><p>'+m.description+'</p>'+UI.btn(taken?'수령 완료':m.rewardText+' 받기','storyClaim',m.id,taken||g.scene!=='completed'||!achieved(s,m.id))+'</section>';
    }).join('');
    return '<p>'+ (g.scene==='completed'?'직위 · 정식 CEO 인가':'인계 진행 · '+current(s).title)+'</p>'+UI.kv('총자산 / 목표',UI.money(worth(s))+' / '+UI.money(g.baseline*2))+'<div class="handover-list">'+checklist+'</div><h3>'+guide.emergencyLoan.title+'</h3><p>현금 10,000 CR 이하에서 20,000 CR를 빌릴 수 있습니다. 전액 상환까지 결산일마다 이자 20 CR가 부채에 더해집니다.</p>'+UI.kv('상환 잔액',UI.money(g.debt))+UI.btn('대출 신청','storyLoan','',!!g.debt||s.cash>10000)+UI.btn('전액 상환','storyRepay','',!g.debt||s.cash<g.debt,false)+'<h3>'+guide.saveBackup.title+'</h3><p>'+guide.saveBackup.summary+'</p>'+UI.btn('JSON 백업','storyExport')+UI.btn('백업 복구…','storyImport','',false,false);
  }
  return {initial,valid,attach,current,choose,advance,has,claim,worth,loan,panel,handbook};
})();
