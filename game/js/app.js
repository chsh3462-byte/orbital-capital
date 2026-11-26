'use strict';
(async()=>{
  const D=GameData,E=Economy,U=UI,P=PixelArt,$=q=>document.querySelector(q);
  let state,page='dashboard',period='day',speed=1,paused=false,clock=0,playTime=0,last=performance.now(),modal=null;
  let saveEnabled=true,toastTimer,animationBatch=0,lastPaint=-1,saveQueue=Promise.resolve(),guideView='';
  let exchangePort='nereid',dealRequest=null;
  let venue='market',wheelPick='red',spinEnd=0;
  const shelves=Object.fromEntries(['market','hangar','auction','lounge'].map(key=>[key,{page:0,desc:false,filter:'all'}]));
  const currentShelf=()=>shelves[page==='lounge'?'lounge':venue];
  const spinDuration=2200;
  const dialog=$('#dialog'),workspace=$('#workspace');
  const map=new P.StarMap($('#galaxy'),$('#node-labels'),id=>open('planet',id));P.load();
  function notify(msg){
    $('#toast').textContent=msg;$('#toast').classList.add('toast-visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('toast-visible'),2800);
  }
  function error(msg){
    if(dialog.open){let el=$('.dialog-error');if(!el){el=document.createElement('p');el.className='dialog-error';el.setAttribute('role','alert');$('#dialog-body').append(el);}el.textContent=msg;}
    else notify(msg);
  }
  function save(slot='auto'){
    if(slot==='auto'&&!saveEnabled)return Promise.resolve();
    const snapshot=structuredClone(state);
    const job=saveQueue.then(()=>LocalSave.write(slot,snapshot)).then(()=>{
      $('#saved-status').textContent=(slot==='auto'?'자동 저장':'수동 저장')+' · D'+String(snapshot.day).padStart(3,'0');
    });
    saveQueue=job.catch(()=>{});
    return job;
  }
  function auto(){save().catch(()=>error('자동 저장 실패 · 로컬 저장 공간과 쓰기 권한을 확인하세요.'));}
  let pendingBackup=null;
  function storyAction(action){
    const reward=Handover.advance(state,action);
    if(reward){$('#metrics').innerHTML=U.metrics(state);notify(reward);auto();}
    return reward;
  }
  function drawGuide(){
    const box=$('#guide'),html=Handover.panel(state)||Tutorial.panel(state,page);
    if(guideView!==html){box.innerHTML=html;guideView=html;animationBatch=0;}
    box.hidden=!html;
    const scene=Handover.current(state);
    document.querySelectorAll('.handover-focus').forEach(el=>el.classList.remove('handover-focus'));
    if(scene?.highlightTarget)document.querySelector(scene.highlightTarget)?.classList.add('handover-focus');
    const routeButton=$('#fleet-status-panel [data-act="routeSetup"]');
    routeButton.disabled=Commerce.freeShips(state)<1;
    map.buttons.nereid.classList.toggle('guide-focus',state.guide.status==='active'&&state.guide.step===0&&!state.guide.seen);
  }
  function inspected(){
    const g=state.guide;
    if(g.status!=='active'||g.seen)return;
    g.seen=true;drawGuide();auto();
  }
  function visitChapter(){
    if(state.guide.step===1)period='day';
    nav(Tutorial.chapter(state).page);auto();
  }
  async function inspectTarget(){
    const g=state.guide,r=Tutorial.issuer(state);
    switch(g.step){
      case 0:nav('dashboard');return open('planet','nereid');
      case 1:period='quarter';nav('finance');inspected();return;
      case 2:nav('research');return open('guideWarp');
      case 3:nav('ads');return open('guideAd');
      case 4:nav('estate');return open('planet',Tutorial.site(state).id);
      case 5:case 6:
        nav('stocks');
        if(!r){inspected();return;}
        return open(g.step===5?'stock':'reviewHostile',r.id);
      case 7:return open('loads');
    }
  }
  function nav(target){
    if(!U.nav[target])return;
    if(dialog.open)dialog.close();modal=null;page=target;
    if(target==='finance')storyAction('OPEN_PNL_OR_LOGS');
    document.querySelectorAll('#nav button').forEach(b=>{b.classList.toggle('on',b.dataset.nav===target);if(b.dataset.nav===target)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    $('#section-en').textContent=U.nav[target][1];$('#page-title').textContent=U.nav[target][0];
    $('#dashboard').hidden=page!=='dashboard';workspace.hidden=page==='dashboard';render();window.scrollTo(0,0);
  }
  function render(){
    const focus=document.activeElement?.closest('button'),selector=focus?.dataset.act?['act',focus.dataset.act,focus.dataset.id]:null;
    $('#date').textContent=U.date(state.day);$('#metrics').innerHTML=U.metrics(state);
    const badge=$('.corp-logo'),jewel=Leisure.get(state.leisure.worn);
    if(badge.dataset.worn!==(jewel?.id||'')){
      badge.dataset.worn=jewel?.id||'';badge.innerHTML=jewel?P.thumb(jewel.art,32):'OC';
      badge.title=jewel?'착용 중 · '+jewel.name:'오르빗 캐피탈';badge.setAttribute('aria-label',badge.title);
    }
    $('#pause').innerHTML=U.icon(paused?'play':'pause');$('#pause').setAttribute('aria-label',paused?'진행 재개':'일시정지');
    $('#speed').textContent=speed+'×';$('#map-live').textContent=paused?'일시정지':'실시간';
    if(page==='dashboard'){
      $('#ticker-list').innerHTML=U.tickers(state);$('#fleet').innerHTML=U.fleet(state);$('#logs').innerHTML=U.logs(state.logs.slice(0,4));$('#breakdown').innerHTML=U.bars(state);
    }else if(page==='port')workspace.innerHTML=Freeport.port(state,venue,currentShelf());
    else if(page==='lounge')workspace.innerHTML=Freeport.lounge(state,currentShelf());
    else workspace.innerHTML=U[page](state,page==='exchange'?exchangePort:period);
    const e=state.event&&D.events.find(e=>e.id===state.event.id);
    let notice=$('#event');if(e){
      if(!notice){notice=document.createElement('div');notice.className='notice';notice.id='event';$('#metrics').after(notice);}
      notice.textContent=e.name+'　·　'+e.desc+'　·　'+state.event.left+'일 남음';
    }else notice?.remove();
    if(selector&&!focus.isConnected){
      const alt=Array.from(document.querySelectorAll('[data-act]')).find(b=>b.dataset.act===selector[1]&&b.dataset.id===selector[2]&&b.offsetParent);
      alt?.focus({preventScroll:true});
    }
    drawGuide();animationBatch=0;
  }
  async function open(kind,id){
    modal={kind,id};const token=modal;
    let title='',body='';
    if(kind==='storyIntro'){
      title='대표 취임 인계';body=Handover.panel(state);
    }else if(kind==='storyBook'){
      title='대표 인계 수첩';
      body=state.story?Handover.handbook(state):'<p>현재 회사의 함대와 거점을 이어받아 AURA 인계를 시작합니다.</p>'+U.btn('현재 회사로 취임 인계 시작','storyEnroll');
    }else if(kind==='storyRestore'){
      title='백업 복구 확인';body=U.kv('백업 날짜',U.date(pendingBackup.day))+U.kv('백업 현금',U.money(pendingBackup.cash))+'<p>현재 회사의 자동 저장을 이 백업으로 교체합니다. 수동 저장은 유지합니다.</p>'+U.btn('이 백업으로 복구','storyRestoreConfirm')+U.btn('취소','close','',false,false);
    }else if(kind==='collectChoices'){
      title=Leisure.get(id).name+' · 인수 조건';body=Bargains.collectorView(state,id,venue);
    }else if(kind==='dealChoices'){
      const q=dealRequest;
      title=(q.buy?'매입':'매각')+' 조건 선택';body=Bargains.view(state,q.place,q.good,q.qty,q.buy);
    }else if(kind==='guardSetup'){
      title='지정 항로 경호 배정';body=ExchangeUI.guardForm(state,id);
    }else if(kind==='goodsOrder'){
      title=Commerce.port(exchangePort).name+' · '+Commerce.byId(id).name;body=ExchangeUI.order(state,exchangePort,id);
    }else if(kind==='routeSetup'){
      title='지정 자동 운항';body=ExchangeUI.routeForm(state,exchangePort,id);
    }else if(kind==='hrSetup'){
      title='자동 채용 심사 기준';body=ExchangeUI.policy(state);
    }else if(kind==='planet'){
      title=id==='hq'?'기업 본사':D.planets.find(p=>p.id===id).name+' 거점';body=U.planetDetail(state,id);
    }else if(kind==='stock'){
      title=D.rivals.find(r=>r.id===id).name+' · '+id;body=U.stockDetail(state,id);
    }else if(kind==='reviewFriendly'||kind==='reviewHostile'){
      const hostile=kind==='reviewHostile',r=state.markets.find(r=>r.id===id),cost=E.mergerCost(r,hostile);
      title=hostile?'적대적 인수':'우호적 인수';
      const vessels=D.rivals.find(d=>d.id===id).ships||0;
      body='<p class="hint">'+id+'의 잔여 지분을 정산하면 소유 행성과 시설, 시장 점유율을 인계받습니다.'+(vessels?' 운송 화물선 '+vessels+'척을 함대에 편입합니다.':'')+' 합병과 동시에 주식 거래가 종료됩니다.</p>'+U.kv('잔여 지분',(100-r.shares)+'%')+U.kv('인수 지출',U.money(cost))+U.kv('보유 자금',U.money(state.cash))+'<div class="action-row">'+U.btn('인수 확정',hostile?'hostile':'friendly',id,state.cash<cost)+U.btn('거래로 돌아가기','stock',id,false,false)+'</div>';
    }else if(kind==='luxItem'){
      title=Leisure.get(id).name;body=Freeport.itemView(state,id,page==='lounge'?'lounge':venue);
    }else if(kind==='casino'){
      title='황혼선 · 룰렛 살롱';body=Roulette.table(state,wheelPick,performance.now()<spinEnd);
    }else if(kind==='salon'){
      title='황혼선 · '+Salon.names[id];body=Salon.table(state,id);
    }else if(kind==='auctionBid'){
      title=Leisure.get(id).name+' · 호가 경매';body=Freeport.bidView(state);
    }else if(kind==='cruise'){
      title=Leisure.get(id.split('/')[0]).name+' · 전용 유람 비행';body=Leisure.cruiseView(state,id);
    }else if(kind==='guideWarp'||kind==='guideAd'){
      title=kind==='guideWarp'?'기관실 · 워프 추진기 견적':'영업팀 · 홀로넷 광고 시안';body=Tutorial.preview(state,kind);
    }else if(kind==='logs'){title='전체 기록';body=Records.view(state,id);}
    else if(kind==='loads'){
      title='로컬 데이터 불러오기';body='<p class="hint">불러올 시점을 선택하세요. 적용하면 현재 진행 상태가 선택한 기록으로 바뀝니다.</p>';
      for(const slot of ['manual','auto']){
        let saved,info='비어 있음';try{await saveQueue;saved=await LocalSave.read(slot);if(saved)info=U.date(saved.day)+' · '+U.money(saved.cash);}catch{info='파일을 읽을 수 없습니다.';}
        body+='<button class="list-choice" data-act="load" data-id="'+slot+'" '+(!saved?'disabled':'')+'><span>'+(slot==='manual'?'수동 저장':'자동 저장')+'<small>'+info+'</small></span><b>불러오기</b></button>';
      }
      if(!saveEnabled)body+='<div class="action-row">'+U.btn('현재 게임으로 자동 저장 재개','restoreAuto')+'</div>';
    }
    if(modal!==token)return;
    if(kind==='planet'&&Commerce.port(id))storyAction('OPEN_ORBITAL_MAP_OR_SELECT_PLANET');
    if(kind==='logs')storyAction('OPEN_PNL_OR_LOGS');
    drawGuide();
    const g=state.guide,r=Tutorial.issuer(state);
    const related=g.status==='active'&&[
      kind==='planet'&&id==='nereid',false,kind==='guideWarp',kind==='guideAd',
      kind==='planet'&&id===Tutorial.site(state).id,kind==='stock'&&id===r?.id,
      (kind==='reviewFriendly'||kind==='reviewHostile')&&id===r?.id,kind==='loads'
    ][g.step];
    if(related){if(g.step!==5)inspected();body+=Tutorial.dialogNote(state);}
    $('#dialog-title').textContent=title;$('#dialog-body').innerHTML=body;
    if(kind==='goodsOrder'||kind==='routeSetup')ExchangeUI.updateQuote(state,exchangePort,id,document);
    dialog.classList.toggle('wheel-dialog',kind==='casino');
    if(!dialog.open)dialog.showModal();animationBatch=0;
  }
  function restoreCompany(loaded){
    state=loaded;spinEnd=0;clock=0;playTime=0;map.pulses=[];map.transit=0;saveEnabled=true;
    nav(state.guide.status==='active'?Tutorial.chapter(state).page:'dashboard');
    if(Handover.current(state)?.choices)open('storyIntro');
  }
  function changed(feedback){
    render();if(modal)open(modal.kind,modal.id);auto();if(!dialog.open)notify(feedback);
  }
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.nav){nav(b.dataset.nav);return;}
    const a=b.dataset.act,id=b.dataset.id;
    try{
      switch(a){
        case 'storyEnroll':
          if(!state.story)Handover.attach(state,3);
          nav('dashboard');auto();await open('storyIntro');return;
        case 'storyChoice':
          if(Handover.choose(state,id)){nav('dashboard');auto();if(Handover.current(state)?.choices)await open('storyIntro');}
          return;
        case 'storyTarget':{
          const step=Handover.current(state)?.step;
          if(step===1){nav('dashboard');map.buttons.nereid.focus();$('#orbital-trade-map').scrollIntoView({block:'center'});}
          if(step===2){
            if(state.freight){nav('freight');notify('계약 화물이 인도되면 다음 항로를 지정하세요.');}
            else if(Commerce.freeShips(state)>0){exchangePort='nereid';await open('routeSetup','tea');}
            else{nav('exchange');notify('지정 항로는 다음 결산에 선적합니다. 자금과 운항 상태를 확인하세요.');}
          }
          if(step===3)$('#speed').click();
          if(step===4)nav('finance');
          if(step===5)nav('stocks');
          return;
        }
        case 'storyBook':await open('storyBook');return;
        case 'storyClaim':Handover.claim(state,id);changed();return;
        case 'storyLoan':case 'storyRepay':Handover.loan(state,a==='storyRepay');changed();return;
        case 'pointResearch':E.research(state,id,true);break;
        case 'storyExport':{
          const blob=new Blob([JSON.stringify(state)],{type:'application/json'}),url=URL.createObjectURL(blob);
          const link=document.createElement('a');link.href=url;link.download='OrbitalCapital-D'+state.day+'.json';link.click();
          setTimeout(()=>URL.revokeObjectURL(url),30000);return;
        }
        case 'storyImport':{
          const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
          input.onchange=async()=>{
            try{
              const file=input.files[0];if(!file)return;
              if(file.size>8*1024*1024)throw Error('백업 파일은 8 MiB 이하로 선택하세요.');
              const restored=LocalSave.validate(JSON.parse(await file.text()));
              if(!dialog.open||modal?.kind!=='storyBook')return;
              pendingBackup=restored;await open('storyRestore');
            }catch{error('복구할 수 없는 백업 파일입니다. 기존 회사는 유지됩니다.');}
          };
          input.click();return;
        }
        case 'storyRestoreConfirm':
          if(modal?.kind!=='storyRestore'||!pendingBackup)return;
          await saveQueue;await LocalSave.write('auto',pendingBackup);
          restoreCompany(pendingBackup);pendingBackup=null;return;
        case 'recordSection':
          await open('logs',id);
          dialog.querySelector('[data-act="recordSection"][aria-pressed="true"]').focus({preventScroll:true});
          return;
        case 'guideStart':{
          if(Handover.current(state)){nav('dashboard');if(!Handover.current(state).step)await open('storyIntro');return;}
          const g=state.guide;
          if(g.status==='done'){g.step=0;g.seen=false;}
          g.status='active';visitChapter();return;
        }
        case 'guideLater':state.guide.status='later';render();auto();notify('근무 인계서에서 이어볼 수 있습니다.');return;
        case 'guideTarget':if(state.guide.status==='active')await inspectTarget();return;
        case 'guidePrev':case 'guideNext':{
          const g=state.guide;
          if(g.status!=='active'||(a==='guideNext'&&!g.seen))return;
          if(a==='guideNext'&&g.step===Tutorial.chapters.length-1){
            g.status='done';nav('dashboard');auto();notify('첫 근무 인계를 마쳤습니다. 이제 다음 투자처를 정해 보세요.');return;
          }
          g.step=Math.max(0,g.step+(a==='guideNext'?1:-1));g.seen=false;visitChapter();return;
        }
        case 'exchangePort':case 'openMarket':if(Commerce.port(id)){exchangePort=id;nav('exchange');}return;
        case 'goodsOrder':case 'routeSetup':case 'hrSetup':case 'guardSetup':await open(a,id);return;
        case 'goodsBuy':case 'goodsSell':{
          const qty=$('#goodsQty').valueAsNumber,buy=a==='goodsBuy';
          if(!Number.isInteger(qty)||qty<1||qty>1000)throw Error('1~1,000상자를 입력하세요.');
          dealRequest={place:exchangePort,good:id,qty,buy};await open('dealChoices',id);return;
        }
        case 'dealAccept':{
          if(modal?.kind!=='dealChoices'||!dealRequest)return;
          const q=dealRequest;Bargains.deal(state,q.place,q.good,q.qty,q.buy,Number(id));
          dealRequest=null;dialog.close();modal=null;break;
        }
        case 'guardHire':Escort.hire(state,Number(id));break;
        case 'guardRelease':Escort.release(state,Number(id));changed('대기 경호 계약을 해약했습니다.');return;
        case 'guardAssign':Escort.assign(state,state.exchange.routes.find(r=>r.id===Number(id)),Number($('#routeGuard').value));dialog.close();modal=null;changed('경호 배정을 변경했습니다.');return;
        case 'registerCarrier':Commerce.register(state);break;
        case 'routeStart':
          Commerce.schedule(state,$('#routeFrom').value,$('#routeTo').value,ExchangeUI.readLines(document),Number($('#routeGrade').value),Number($('#routeGuard').value));
          dialog.close();modal=null;break;
        case 'routeCancel':Commerce.cancel(state,Number(id));break;
        case 'hrApply':
          Staff.recruit(state,{style:$('#hrStyle').value,skill:$('#hrSkill').valueAsNumber,care:$('#hrCare').valueAsNumber,wage:$('#hrWage').valueAsNumber,target:$('#hrTarget').valueAsNumber});
          dialog.close();modal=null;break;
        case 'hrStop':state.hr.open=false;changed('모집을 중지했습니다.');return;
        case 'freightAccept':Freight.accept(state,id);changed(storyAction('DISPATCH_FIRST_SHIP')||'화물선 한 척을 계약 항로에 배정했습니다.');return;
        case 'pause':paused=!paused;render();return;
        case 'speed':speed=speed===4?1:speed*2;if(speed>1)storyAction('CHANGE_TIME_SPEED_ABOVE_1X');render();return;
        case 'close':dialog.close();return;
        case 'routes':map.routes=!map.routes;b.setAttribute('aria-pressed',String(map.routes));return;
        case 'zoomIn':case 'zoomOut':map.zoom=Math.min(1.15,Math.max(.75,+(map.zoom+(a==='zoomIn'?.10:-.10)).toFixed(2)));return;
        case 'daily':case 'quarter':period=a==='daily'?'day':'quarter';render();if(a==='quarter'&&state.guide.step===1)inspected();return;
        case 'save':await save('manual');notify('수동 슬롯에 저장했습니다.');return;
        case 'loads':case 'planet':case 'stock':case 'logs':case 'reviewFriendly':case 'reviewHostile':await open(a,id);return;
        case 'load':{
          await saveQueue;const loaded=await LocalSave.read(id);if(!loaded)throw Error('저장 데이터가 없습니다.');
          restoreCompany(loaded);auto();notify('저장한 게임을 불러왔습니다.');return;
        }
        case 'restoreAuto':saveEnabled=true;await save('auto');dialog.close();notify('자동 저장을 재개했습니다.');return;
        case 'research':E.research(state,id);break;
        case 'venue':
          if(Object.hasOwn(Freeport.venues,id)){venue=id;nav('port');}return;
        case 'shelfPage':currentShelf().page=Math.max(0,Number(id));render();return;
        case 'shelfSort':currentShelf().desc=id==='desc';currentShelf().page=0;render();return;
        case 'shelfFilter':currentShelf().filter=id;currentShelf().page=0;render();return;
        case 'auctionEnter':if(page==='port'&&venue==='auction'){Freeport.invite(state);render();auto();}return;
        case 'auctionBid':if(page==='port'&&venue==='auction'&&state.leisure.auction.lot?.id===id)await open(a,id);return;
        case 'startAuction':Freeport.start(state,id,$('#auction-offer').valueAsNumber);changed('경매를 열었습니다.');return;
        case 'submitBid':Freeport.bid(state,id,$('#auction-offer').valueAsNumber);changed('호가를 제출했습니다.');return;
        case 'auctionRound':
          Freeport.round(state,id);
          if(state.leisure.auction.lot?.id!==id){dialog.close();modal=null;}
          changed('호가를 진행했습니다.');return;
        case 'casino':if(page==='port'&&venue==='casino')await open(a,id);return;
        case 'luxItem':case 'cruise':await open(a,id);return;
        case 'luxBuy':if(page==='port')await open('collectChoices',id);return;
        case 'collectDeal':{
          if(modal?.kind!=='collectChoices')return;
          const itemId=modal.id;Bargains.collect(state,itemId,venue,Number(id));await open('luxItem',itemId);changed('소장품을 인도받았습니다.');return;
        }
        case 'luxDisplay':Leisure.display(state,id);changed('전시 배치를 변경했습니다.');return;
        case 'luxWear':Leisure.wear(state,id);changed('대표 프로필을 갱신했습니다.');return;
        case 'salon':if(page==='port'&&venue==='casino'&&Object.hasOwn(Salon.names,id))await open(a,id);return;
        case 'bjStart':if(modal?.id!=='blackjack')return;Salon.startBlackjack(state);changed('블랙잭 패가 기록되었습니다.');return;
        case 'bjHit':case 'bjStand':if(modal?.id!=='blackjack')return;Salon.decide(state,a==='bjHit'?'hit':'stand');changed('블랙잭 패가 기록되었습니다.');return;
        case 'baccaratBet':if(modal?.id!=='baccarat')return;Salon.baccarat(state,id);break;
        case 'crownBet':if(modal?.id!=='crown')return;Salon.crown(state,Number(id));break;
        case 'wheelPick':
          if(modal?.kind!=='casino'||performance.now()<spinEnd)return;
          wheelPick=id==='red'||id==='black'?id:Number(id);await open('casino');return;
        case 'wheelSpin':
          if(modal?.kind!=='casino'||performance.now()<spinEnd)return;
          Roulette.spin(state,wheelPick);spinEnd=performance.now()+spinDuration;break;
        case 'ad':E.advertise(state,id);break;
        case 'buyLand':E.buyLand(state,id);break;
        case 'build':{const [planet,f]=id.split('/');E.build(state,planet,f);break;}
        case 'buy':case 'sell':{
          const qty=$('#qty').valueAsNumber;E.trade(state,id,qty,a==='buy');
          if(a==='buy'&&storyAction('BUY_FIRST_STOCK_SHARE')){
            dialog.close();modal=null;nav('dashboard');await open('storyBook');return;
          }
          break;
        }
        case 'friendly':case 'hostile':E.merge(state,id,a==='hostile');dialog.close();modal=null;nav('stocks');break;
        default:return;
      }
      changed(state.logs[0].title);
    }catch(err){error(err.message||'작업을 완료할 수 없습니다.');}
  });
  document.addEventListener('input',e=>{
    if(modal?.kind==='goodsOrder'||modal?.kind==='routeSetup')ExchangeUI.updateQuote(state,exchangePort,modal.id,document);
    if(e.target.id==='qty'&&modal?.kind==='stock'){
      const q=e.target.valueAsNumber,r=state.markets.find(r=>r.id===modal.id);
      $('#order-cost').textContent=Number.isInteger(q)&&q>=1&&q<=100?U.money(q*r.price):'—';
      if(q===3&&state.guide.status==='active'&&state.guide.step===5&&r.id===Tutorial.issuer(state)?.id&&!state.guide.seen){
        inspected();$('.guide-note')?.remove();$('#dialog-body').insertAdjacentHTML('beforeend',Tutorial.dialogNote(state));
      }
    }
  });
  dialog.addEventListener('close',()=>{if(!dialog.open)modal=null;});
  function frame(now){
    const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;
    const sim=paused||Handover.current(state)?.choices||modal||$('#account-dialog').open||document.hidden?0:dt*speed;
    playTime+=sim;clock+=sim;
    if(clock>=3){clock-=3;const priorScene=state.story?.scene;const row=E.step(state);if(priorScene==='tutorial_02'&&state.story.scene==='tutorial_03')notify('첫 항로 개설 보너스 +3,000 CR 지급');if(row){map.payout(row.net+row.research+row.marketing);auto();}render();}
    if(now-lastPaint>=32&&!document.hidden){
      if(page==='dashboard')map.draw(state,playTime,sim?Math.min(.25,(now-lastPaint)/1000)*speed:0);
      if(spinEnd&&now>=spinEnd){spinEnd=0;if(modal?.kind==='casino'&&dialog.open)open('casino');}
      if(modal?.kind==='casino'&&dialog.open){
        const wheel=$('.roulette-wheel');
        if(wheel)Roulette.paint(wheel,state.leisure.wheel.last?.number??0,spinEnd?Math.max(0,1-(spinEnd-now)/spinDuration):1);
      }
      if(modal?.kind==='cruise'&&dialog.open)Leisure.fly($('.cruise-view'),modal.id,now/1000);
      lastPaint=now;
      const showcaseTime=now/1000,index=Math.floor(showcaseTime*8)+1;
      if(animationBatch!==index){
        animationBatch=index;document.querySelectorAll('.sprite-thumb').forEach(c=>{
          const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);P.sprite(ctx,c.dataset.sprite,c.width/2,c.height/2,c.width,showcaseTime);
        });
      }
    }
    requestAnimationFrame(frame);
  }
  $('#nav').innerHTML=Object.entries(U.nav).map(([id,[name,,ico]])=>'<button data-nav="'+id+'" title="'+name+'" aria-label="'+name+'">'+U.icon(ico)+'<span class="nav-label">'+name+'</span></button>').join('');
  document.querySelectorAll('[data-ico]').forEach(el=>{el.insertAdjacentHTML('afterbegin',U.icon(el.dataset.ico));if(el.textContent.trim())el.setAttribute('aria-label',el.textContent.trim());});
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=U.icon(el.dataset.icon));
  try{state=await LocalSave.read('auto');}catch{saveEnabled=false;}
  if(!state)state=E.newGame();
  if(!saveEnabled){notify('자동 저장을 읽지 못했습니다. 불러오기에서 수동 슬롯을 확인하세요.');$('#saved-status').textContent='자동 저장 복구 필요';}
  window.desktopSaves?.onClosing(()=>save('auto'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state)auto();last=performance.now();});
  window.addEventListener('pagehide',()=>{if(!window.desktopSaves&&saveEnabled&&state)LocalSave.write('auto',state).catch(()=>{});});
  nav(state.guide.status==='active'?Tutorial.chapter(state).page:'dashboard');
  AccountUI.attach(()=>state.cash,()=>save('auto'));
  if(Handover.current(state)?.choices&&!$('#account-dialog').open)await open('storyIntro');
  requestAnimationFrame(frame);
})();
