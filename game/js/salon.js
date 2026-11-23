'use strict';
window.Salon=(()=>{
  const stake=500;
  const names={blackjack:'블랙잭',baccarat:'바카라',crown:'크라운 앤 앵커'};
  const suits=['♠','♥','♦','♣'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const faces=['왕관','닻','스페이드','하트','다이아','클로버'],marks=['♛','⚓','♠','♥','♦','♣'];
  const sides={player:'플레이어',banker:'뱅커',tie:'타이'};
  const initial=()=>({blackjack:null,baccarat:null,crown:null});
  const integer=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b;
  const cards=(h,max)=>Array.isArray(h)&&h.length>=2&&h.length<=max&&h.every(v=>integer(v,0,51));
  function deck(){
    const d=Array.from({length:52},(_,i)=>i);
    for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
    return d;
  }
  function points(h){
    const sum=h.reduce((v,c)=>v+Math.min(10,c%13+1),0);
    return sum<=11&&h.some(c=>c%13===0)?sum+10:sum;
  }
  const baccaratPoints=h=>h.reduce((n,c)=>n+Math.min(c%13+1,10),0)%10;
  function blackjackPay(h){
    const p=points(h.p),d=points(h.d),natural=p===21&&h.p.length===2,dealerNatural=d===21&&h.d.length===2;
    if(p>21||dealerNatural&&!natural)return 0;
    if(natural)return dealerNatural?stake:1250;
    return d>21||p>d?2*stake:p===d?stake:0;
  }
  function baccaratPay(h){
    const p=baccaratPoints(h.p),d=baccaratPoints(h.d);
    if(p===d)return h.pick==='tie'?4500:stake;
    return p>d&&h.pick==='player'?1000:d>p&&h.pick==='banker'?975:0;
  }
  function crownPay(h){const n=h.dice.filter(x=>x===h.pick).length;return n?(n+1)*stake:0;}
  function valid(s){
    if(!s||!Object.keys(names).every(k=>Object.hasOwn(s,k)))return false;
    const b=s.blackjack,v=s.baccarat,c=s.crown;
    if(b!==null){
      if(!b||!cards(b.p,21)||!cards(b.d,21)||!Array.isArray(b.deck)||b.deck.some(x=>!integer(x,0,51)))return false;
      const all=[...b.p,...b.d,...b.deck];
      if(all.length!==52||new Set(all).size!==52)return false;
      if(b.pay===null){if(points(b.p)>=21||points(b.d)===21||b.d.length!==2)return false;}
      else if(b.pay!==blackjackPay(b))return false;
    }
    if(v!==null&&(!v||!Object.hasOwn(sides,v.pick)||!cards(v.p,3)||!cards(v.d,3)||new Set([...v.p,...v.d]).size!==v.p.length+v.d.length||v.pay!==baccaratPay(v)))return false;
    return c===null||!!c&&integer(c.pick,0,5)&&Array.isArray(c.dice)&&c.dice.length===3&&c.dice.every(x=>integer(x,0,5))&&c.pay===crownPay(c);
  }
  function settle(s,key,h,pay){
    h.pay=pay;s.cash+=pay;
    Economy.note(s,'leisure','황혼선 '+names[key],(pay>=stake?'+':'−')+Math.abs(pay-stake).toLocaleString('ko-KR')+' CR');
  }
  function startBlackjack(s){
    const tables=s.leisure.tables;
    if(tables.blackjack?.pay===null)throw Error('진행 중인 패를 먼저 마치세요.');
    Economy.charge(s,stake);const d=deck();
    const p1=d.pop(),d1=d.pop(),h={p:[p1,d.pop()],d:[d1,d.pop()],deck:d,pay:null};
    tables.blackjack=h;
    if(points(h.p)===21||points(h.d)===21)settle(s,'blackjack',h,blackjackPay(h));
  }
  function decide(s,action){
    const h=s.leisure.tables.blackjack;
    if(!h||h.pay!==null||!['hit','stand'].includes(action))throw Error('진행 중인 블랙잭 패를 선택하세요.');
    if(action==='hit'){h.p.push(h.deck.pop());if(points(h.p)<21)return;}
    if(points(h.p)<=21)while(points(h.d)<17)h.d.push(h.deck.pop());
    settle(s,'blackjack',h,blackjackPay(h));
  }
  function bankerDraw(total,third){
    if(third===null)return total<6;
    return total<=2||total===3&&third!==8||total===4&&third>=2&&third<=7||total===5&&third>=4&&third<=7||total===6&&third>=6&&third<=7;
  }
  function baccarat(s,pick){
    if(!Object.hasOwn(sides,pick))throw Error('승리할 쪽을 선택하세요.');
    Economy.charge(s,stake);const d=deck(),p1=d.pop(),d1=d.pop();
    const h={pick,p:[p1,d.pop()],d:[d1,d.pop()]};
    const p=baccaratPoints(h.p),b=baccaratPoints(h.d);
    if(p<8&&b<8){
      let third=null;
      if(p<=5){h.p.push(d.pop());third=baccaratPoints(h.p.slice(-1));}
      if(bankerDraw(b,third))h.d.push(d.pop());
    }
    s.leisure.tables.baccarat=h;settle(s,'baccarat',h,baccaratPay(h));
  }
  function crown(s,pick){
    if(!integer(pick,0,5))throw Error('문양을 선택하세요.');
    Economy.charge(s,stake);
    const h={pick,dice:Array.from({length:3},()=>Math.floor(Math.random()*6))};
    s.leisure.tables.crown=h;settle(s,'crown',h,crownPay(h));
  }
  function hand(label,cards,hidden=false){
    const parts=cards.map((c,i)=>{
      if(hidden&&i===1)return '<i class="playing-card backed" aria-label="뒷면">✥</i>';
      const suit=Math.floor(c/13);return '<i class="playing-card '+(suit===1||suit===2?'ruby':'')+'"><b>'+ranks[c%13]+'</b>'+suits[suit]+'</i>';
    });
    return '<div class="hand-row"><small>'+label+'</small><div>'+parts.join('')+'</div></div>';
  }
  const descriptions={
    blackjack:'한 장 더 받을지 멈출지 정해 딜러보다 21에 가까운 패를 만드세요.',
    baccarat:'플레이어와 뱅커 중 끝자리 점수가 9에 가까울 쪽을 고르세요.',
    crown:'여섯 문양 중 하나를 고르고 황동 컵에서 나오는 주사위 세 개를 확인하세요.'
  };
  function table(s,k){
    const h=s.leisure.tables[k],U=UI,poor=s.cash<stake;
    const cash='<div class="kv"><span>가용 자금</span><b>'+U.money(s.cash)+'</b></div>';
    let layout='',controls='',rules='',result='';
    if(k==='blackjack'){
      const active=h?.pay===null;
      layout=h?hand(active?'딜러 · 한 장 비공개':'딜러 · '+points(h.d)+'점',h.d,active)+hand('내 패 · '+points(h.p)+'점',h.p):'<p class="table-idle">딜러가 새 카드 한 벌을 준비합니다.</p>';
      rules='A는 1 또는 11점, 그림패는 10점입니다. 딜러는 17점부터 멈춥니다. 승리 1,000 CR, 첫 두 장 블랙잭 1,250 CR, 무승부 500 CR를 받습니다.';
      controls=active?U.btn('한 장 더 · 히트','bjHit')+U.btn('멈춤 · 스탠드','bjStand','',false,false):U.btn('500 CR · 카드 받기','bjStart','',poor);
      if(active)result='패가 저장됩니다. 자리를 비워도 같은 패로 이어갑니다.';
    }else if(k==='baccarat'){
      layout=h?hand('플레이어 · '+baccaratPoints(h.p)+'점',h.p)+hand('뱅커 · '+baccaratPoints(h.d)+'점',h.d):'<p class="table-idle">딜러 앞에 플레이어와 뱅커의 자리가 비어 있습니다.</p>';
      rules='A는 1점, 10과 그림패는 0점입니다. 세 번째 카드는 푼토 방코 규칙에 따라 자동 배분합니다. 적중 시 플레이어 1,000 CR, 뱅커 975 CR, 타이 4,500 CR를 받습니다. 동점이면 양쪽에 건 판돈은 반환됩니다.';
      controls=Object.entries(sides).map(([id,n])=>U.btn(n+' · 500 CR','baccaratBet',id,poor)).join('');
      if(h)result=sides[h.pick]+' 선택 · ';
    }else{
      layout=h?h.dice.map(v=>'<b class="symbol-die" aria-label="'+faces[v]+'">'+marks[v]+'</b>').join(''):'<p class="table-idle">문양 주사위 세 개가 컵 안에 있습니다.</p>';
      rules='선택한 문양이 한 번 나오면 1,000 CR, 두 번이면 1,500 CR, 세 번이면 2,000 CR를 받습니다.';
      controls=faces.map((n,i)=>U.btn(marks[i]+' '+n+' · 500','crownBet',i,poor,false)).join('');
      if(h)result=faces[h.pick]+' 선택 · ';
    }
    if(h&&h.pay!==null)result+=h.pay===stake?'무승부 · 500 CR 반환':h.pay===0?'이번 판 −500 CR':'적중 · '+U.money(h.pay)+' 지급';
    return '<p class="lux-origin">'+descriptions[k]+'</p><div class="card-felt">'+layout+'</div><p class="wheel-status" role="status">'+result+'</p><p class="hint">'+rules+' 지급액은 판돈을 포함합니다.</p>'+cash+'<div class="action-row">'+controls+'</div>';
  }
  return {names,descriptions,initial,valid,startBlackjack,decide,baccarat,crown,table,points,baccaratPoints,bankerDraw};
})();
