'use strict';
window.Aura = (() => {
  const tips = {
    dashboard:'지도에서 행성을 고르면 특산품과 현지 거래장을 볼 수 있어요.',
    exchange:'출발지의 매입가와 도착지의 매각가를 비교해 봐요. 반복 운항은 취소할 때까지 이어져요.',
    freight:'계약의 도착일과 운임을 살펴보세요. 계약 기간에는 화물선 한 척이 배정돼요.',
    personnel:'원하는 지원자 스타일과 합격 기준을 정해 주세요. 채용하면 일일 급여에 반영돼요.',
    finance:'같은 매출이라도 유지비가 다르면 손에 남는 돈이 달라요. 오늘과 지난 분기를 비교해 봐요.',
    stocks:'거래할 회사를 누르면 주가와 보유 지분을 함께 볼 수 있어요.',
    research:'선박이 더 필요하면 AI 항법, 회당 운송 수익을 올리려면 양자 화물칸을 살펴보세요.',
    estate:'매입한 땅에는 수익 시설을 지을 수 있어요. 땅값과 공사비를 함께 남겨 두세요.',
    ads:'캠페인의 비용과 지속 일수를 비교해 봐요. 효과는 진행 중인 기간에 적용돼요.',
    port:'선박과 공예품은 전시품을 골라 구매해요. 아티팩트는 비밀 경매에서 만날 수 있어요.',
    lounge:'소장한 물건과 전시 자리를 고르면 대표님의 라운지에 놓을 수 있어요.'
  };
  function advice(state,page,modal,paused){
    const scene=Handover.current(state),step=scene?.step,kind=modal?.kind;
    const say=(line,mood='explain',label='',act='')=>({line,mood,label,act});
    if(kind==='account')return say('여기는 계정과 자금 랭킹 창이에요. 창을 닫으면 하던 일부터 이어서 볼게요.','calm');
    if(step===2&&kind==='routeSetup'){
      const from=document.getElementById('routeFrom'),to=document.getElementById('routeTo');
      if(from&&to){
        const lines=ExchangeUI.readLines(document),capacity=Commerce.capacity(state,Number(document.getElementById('routeGrade').value));
        if(from.value===to.value)return say('두 칸에 같은 항구가 적혀 있어요. 매각 항구를 다른 행성으로 골라 볼까요?','concern');
        if(!lines.length||lines.some(l=>!Number.isInteger(l.qty)||l.qty<1)||lines.reduce((n,l)=>n+l.qty,0)>capacity)return say('이 배에는 '+capacity+'상자까지 실을 수 있어요. 선적 목록에서 수량을 조정해 주세요.','concern');
        if(Commerce.loadingCost(state,{from:from.value,lines})>state.cash)return say('이만큼 실으려면 선적 자금이 모자라요. 상자를 조금 줄이면 출항할 수 있어요.','concern');
      }
      return say('매입 항구와 매각 항구를 확인해요. 예상 손익이 괜찮으면 아래의 ‘반복 운항 시작’을 눌러 주세요.','think');
    }
    if(step===2&&state.exchange.routes.some(r=>!r.stop)){
      if(kind)return say('운송장이 접수됐어요. 창을 닫으면 부두 시계가 다시 움직여요.','think','창 닫기','close');
      if(paused)return say('시계가 멈춰 있어요. 진행을 재개하면 다음 결산 때 선적을 시도해요.','think','시간 재개','pause');
      const route=state.exchange.routes.find(r=>!r.stop);
      if(Commerce.loadingCost(state,route)>state.cash)return say('선적 자금이 부족해요. 거래장에서 항로를 취소하고 더 적은 수량으로 다시 지정할 수 있어요.','concern','거래장 보기','auraExchange');
      return say('운송장이 접수됐어요. 이제 다음 결산에 선적할 때까지 함께 기다려요.','think');
    }
    if(step===5&&kind==='stock'&&document.getElementById('qty')){
      const qty=document.getElementById('qty').valueAsNumber,market=state.markets.find(r=>r.id===modal.id);
      if(!Number.isInteger(qty)||qty<1||qty>100-market.shares||qty*market.price>state.cash)return say('주문 수량과 자금을 확인해 볼까요? 첫 실습에는 한 주면 충분해요.','concern');
      return say('한 주 가격과 주문 금액을 확인했나요? 준비되면 ‘매수’를 눌러 주세요.','think');
    }
    if(step){
      const labels=['지도 보기','운송장 열기','배속 전환','재무제표 보기','거래소 보기'];
      if(step===5&&page==='stocks'&&!kind)return say('마음에 드는 회사의 거래창을 열어 봐요. 주문서에서 한 주를 살 수 있어요.');
      const line=step>=4?scene.lines[1]:scene.lines[0];
      return say(line,step===4?'think':'explain',labels[step-1],'storyTarget');
    }
    if(state.guide.status==='active'){
      const chapter=Tutorial.chapter(state);
      return state.guide.seen?say(Tutorial.insight(state),'happy',state.guide.step===7?'인계 마치기':'다음 인계','guideNext'):
        say(chapter.task,'explain',chapter.action,'guideTarget');
    }
    if(kind==='storyBook')return say(modal.id==='firstShift'?'첫 교대를 마쳤어요, 대표님. 다음 배도 같이 준비해요.':'여기서 달성한 목표의 보상을 받거나 회사 장부를 백업할 수 있어요.',modal.id==='firstShift'?'happy':'calm');
    return say(tips[page]||tips.dashboard,'calm',kind?'':'운영 실습 하기',kind?'':'guideStart');
  }

  function mount(refresh){
    const root=document.getElementById('aura'),home=root.parentElement,face=root.querySelector('.aura-face');
    const toggle=root.querySelector('.aura-toggle'),bubble=root.querySelector('.aura-bubble');
    const caption=root.querySelector('.aura-caption'),line=root.querySelector('.aura-line'),action=root.querySelector('.aura-action');
    const key='orbital.aura.folded.'+(AccountUI.profile||'guest');
    let folded=false,previousState,previousStep,smileUntil=0,issue='',scope='',timer;
    try{folded=localStorage.getItem(key)==='1';}catch{}
    toggle.addEventListener('click',()=>{
      folded=!folded;
      try{localStorage.setItem(key,folded?'1':'0');}catch{}
      refresh();
    });
    function warn(message){issue=message;refresh();}
    function clearIssue(){issue='';}
    function update(state,page,modal,paused){
      const dock=document.getElementById('dock-dialog'),dialog=document.getElementById('dialog'),account=document.getElementById('account-dialog');
      root.hidden=state.dockPage!=='done'||dock.open;
      const host=account.open?account:dialog.open?dialog:home;
      if(root.parentElement!==host)host.append(root);
      document.body.classList.toggle('aura-on',!root.hidden&&host===home);
      document.body.classList.toggle('aura-folded',folded);
      if(root.hidden)return;
      const context=account.open?{kind:'account'}:dialog.open?modal:null;
      const step=Handover.current(state)?.step||(state.story?.scene==='completed'?6:0);
      const nextScope=[page,context?.kind,context?.id,step].join('/');
      if(previousState!==state||scope!==nextScope)issue='';
      if(previousState!==state)smileUntil=0;
      else if(previousStep>=1&&step===previousStep+1){
        smileUntil=performance.now()+2100;
        clearTimeout(timer);timer=setTimeout(refresh,2150);
      }
      previousState=state;previousStep=step;scope=nextScope;
      const tip=advice(state,page,context,paused);
      const mood=issue?'concern':performance.now()<smileUntil&&tip.mood!=='concern'?'happy':tip.mood;
      if(face.dataset.mood!==mood)face.dataset.mood=mood;
      root.classList.toggle('folded',folded);bubble.hidden=folded;
      toggle.setAttribute('aria-expanded',String(!folded));
      toggle.setAttribute('aria-label',folded?'AURA 안내 펼치기':'AURA 안내 접기');
      caption.textContent=step>=1&&step<=5?'취임 실습 '+step+'/5':state.guide.status==='active'?'근무 인계 '+(state.guide.step+1)+'/8':'대표 비서';
      const advanced=state.guide.status==='active'&&!Handover.current(state)&&context?.kind!=='account';
      root.querySelector('.aura-back').hidden=!advanced||!state.guide.step;
      root.querySelector('.aura-later').hidden=!advanced;
      const message=issue||tip.line;
      if(line.textContent!==message)line.textContent=message;
      action.hidden=!tip.act;action.dataset.act=tip.act;action.textContent=tip.label;
    }
    return {update,warn,clearIssue};
  }
  return {mount};
})();
