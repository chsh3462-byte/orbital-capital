'use strict';
window.Freeport=(()=>{
  const venues={
    market:{name:'교역 회랑',place:'제1환 · 여객 부두',title:'자오선 교역 회랑',art:'market',story:'세 항로의 배가 만나는 중립 자유항입니다. 통관을 마친 세공품은 공방이, 그림은 작가의 대리인이 직접 진열합니다. 진열품을 골라 출처와 가격표를 확인하세요.'},
    hangar:{name:'비행선 전시장',place:'제2환 · 조선소 인도장',title:'수평선 전시 격납고',art:'hangar',story:'자유항 선급원은 선체의 항속 인증에 따라 연안·순항·원정·대항해급을 부여합니다. 인증 항로는 등급마다 3곳에서 9곳까지 늘어납니다. 갑판을 둘러보고 매입하면 등록증과 함께 개인 선석으로 넘겨받습니다.'},
    casino:{name:'항성간 카지노',place:'외항 · 국제 여객선 접안구',title:'항성간 카지노 황혼선',art:'casino',story:'독립 여객조합의 카지노선이 급유를 위해 자오선에 접안했습니다. 다음 항로를 기다리는 승객이라면 누구나 승선할 수 있습니다. 벨벳 커튼 뒤의 살롱에서는 크루피에가 황동 손잡이로 목제 원판을 돌립니다.'},
    auction:{name:'봉인 중개소',place:'구항 · 폐등대 수장고',title:'소등 후의 비밀 경매',art:'auction',story:'인양선들이 회수한 유물은 발견 좌표가 새지 않도록 구항에 따로 보관합니다. 등록 기업의 대표가 초대장의 봉인을 열면 위탁 기록을 열람하고 다른 수집가와 같은 경매석에서 호가를 주고받습니다.'}
  };
  const berths={dock:'전용 계류장',wall:'갤러리 벽면',cabinet:'유리 전시대'};
  const buyers=['은고래 재단','구항 기록관','제9항로 유족회'];
  const bidders=[
    {name:'문해주',style:'광학 표본 수집 · 최소 폭 인상',forms:['lens','ampoule'],legacy:['tideglass','seed']},
    {name:'유도경',style:'문서·옥새 수집 · 중간 폭 인상',forms:['tablet','seal'],legacy:['key','mask']},
    {name:'한시온',style:'항해 유물 수집 · 큰 폭 인상',forms:['dial','fork','gate'],legacy:['astrolabe','echo','compass','bell']}
  ];
  const bidderName=who=>who==='player'?'나':buyers.includes(who)?bidders[buyers.indexOf(who)].name+' · '+who:who||'없음';
  function shipSpec(id){return Registry.ships[id][1]+' · '+Registry.gradeName(id);}
  const relics=()=>Leisure.catalog.filter(i=>Leisure.source(i)==='auction');
  const isRelic=id=>relics().some(i=>i.id===id);
  const amount=n=>Number.isSafeInteger(n)&&n>=0;
  const emptyAuction=()=>({invited:false,lot:null,history:[]});
  function validAuction(l){
    const a=l.auction;
    if(!a||typeof a.invited!=='boolean'||!Array.isArray(a.history)||a.history.length>24)return false;
    if(!a.history.every(h=>h&&isRelic(h.id)&&amount(h.day)&&h.day>0&&amount(h.amount)&&amount(h.bid)&&(h.winner==='player'||buyers.includes(h.winner)||h.winner==='유찰')))return false;
    if(!a.invited)return a.lot===null&&!a.history.length;
    const lot=a.lot;
    if(!lot)return relics().every(i=>l.owned.includes(i.id));
    if(!isRelic(lot.id)||l.owned.includes(lot.id)||!amount(lot.close)||lot.close<1||!amount(lot.bid))return false;
    const reserve=Leisure.get(lot.id).price;
    const who=x=>x===null||x==='player'||buyers.includes(x);
    return [lot.start,lot.current,lot.turn,lot.quiet,lot.lastPlayer].every(amount)&&lot.quiet<2
      && ['ready','live'].includes(lot.stage)&&who(lot.leader)&&lot.start%1000===0&&lot.start>=floorPrice(reserve)&&lot.start<=reserve*2
      && (lot.leader===null?lot.current===0:lot.current>=lot.start)&&lot.bid===(lot.leader==='player'?lot.current:0)
      && (lot.stage==='live'||(!lot.leader&&!lot.current&&!lot.turn))&&Array.isArray(lot.log)&&lot.log.length<=12
      && lot.log.every(entry=>who(entry.who)&&amount(entry.value))&&Array.isArray(lot.quotes)&&lot.quotes.length===buyers.length&&lot.quotes.every(v=>amount(v)&&v>=reserve);
  }
  const floorPrice=price=>Math.ceil(price/2000)*1000;
  function prepare(lot){
    const held=lot.bid;
    return Object.assign(lot,{stage:held?'live':'ready',start:Leisure.get(lot.id).price,current:held,leader:held?'player':null,turn:0,quiet:0,lastPlayer:held,log:held?[{who:'player',value:held}]:[]});
  }
  function nextLot(s,previous){
    const list=relics(),offset=list.findIndex(i=>i.id===previous)+1;
    const item=list.map((_,i)=>list[(i+offset)%list.length]).find(i=>!s.leisure.owned.includes(i.id));
    if(!item)return null;
    // Each institution keeps its spending limit throughout the bidding session.
    const quotes=buyers.map((_,i)=>{
      const key=Math.imul((s.seed^Math.imul(s.day+i*71,2654435761))>>>0,2246822519)>>>0;
      const preferred=bidders[i].forms.includes(item.form)||bidders[i].legacy.includes(item.id);
      const premium=(key%41+(preferred?16:0))/100;
      return Math.ceil(item.price*(1+premium)/1000)*1000;
    });
    return prepare({id:item.id,close:s.day+3,bid:0,quotes});
  }
  function invite(s){
    const a=s.leisure.auction;
    if(!a.invited){a.invited=true;a.lot=nextLot(s,null);}
  }
  function currentLot(s,id,stage){
    const lot=s.leisure.auction.lot;
    if(!lot||lot.id!==id||lot.stage!==stage)throw Error('현재 경매 상태를 다시 확인하세요.');
    return lot;
  }
  function start(s,id,value){
    const lot=currentLot(s,id,'ready'),price=Leisure.get(id).price;
    if(!Number.isSafeInteger(value)||value%1000!==0||value<floorPrice(price)||value>price*2)throw Error('허용 범위 안에서 1,000 CR 단위로 시작가를 정하세요.');
    lot.stage='live';lot.start=value;lot.close=s.day+1;
  }
  function minimum(lot){return lot.leader?lot.current+Math.max(1000,Math.ceil(lot.start*.035/1000)*1000):lot.start;}
  function place(lot,who,value){
    lot.leader=who;lot.current=value;lot.quiet=0;lot.log.unshift({who,value});lot.log=lot.log.slice(0,12);
  }
  function bid(s,id,value){
    const lot=currentLot(s,id,'live');
    if(lot.leader==='player'||!Number.isSafeInteger(value)||value%1000!==0||value<minimum(lot))throw Error('현재 호가 이상을 1,000 CR 단위로 입력하세요.');
    Economy.charge(s,value);lot.bid=value;lot.lastPlayer=value;place(lot,'player',value);
  }
  function round(s,id){
    const lot=currentLot(s,id,'live'),a=s.leisure.auction,min=minimum(lot);
    for(let n=0;n<buyers.length;n++){
      const i=(lot.turn+n)%buyers.length;
      if(lot.leader===buyers[i]||lot.quotes[i]<min)continue;
      const step=Math.max(1000,Math.round(lot.start*.02/1000)*1000);
      const value=lot.leader?Math.min(lot.quotes[i],min+i*step):min;
      if(lot.bid){s.cash+=lot.bid;lot.bid=0;}
      place(lot,buyers[i],value);lot.turn=(i+1)%buyers.length;lot.close=s.day+1;return;
    }
    lot.quiet++;lot.close=s.day+1;
    if(lot.quiet<2)return;
    const winner=lot.leader||'유찰';
    if(winner==='player')s.leisure.owned.push(id);
    a.history.unshift({day:s.day,id,winner,amount:lot.current,bid:lot.lastPlayer});a.history=a.history.slice(0,24);
    Economy.note(s,'leisure',Leisure.get(id).name+' 경매 종료',(winner==='player'?'자사 낙찰':winner)+' · '+lot.current.toLocaleString('ko-KR')+' CR');
    a.lot=nextLot(s,id);
  }
  function closeAuction(s){
    const lot=s.leisure.auction.lot;
    if(!lot||s.day<lot.close)return;
    if(lot.stage==='ready')start(s,lot.id,lot.start);
    else round(s,lot.id);
  }
  const exhibit=(s,i)=>s.leisure.displays[Leisure.slot(i)]===i.id;
  function card(s,i,where){
    const owned=s.leisure.owned.includes(i.id),ship=Leisure.source(i)==='hangar';
    let caption=ship?shipSpec(i.id):i.kind;
    const price=where==='lounge'?(exhibit(s,i)?'전시 중':'보관 중'):(owned?'인도 완료':(where==='auction'?'감정 ':'')+UI.money(i.price));
    return '<button class="lux-lot '+(ship?'ship-lot':'')+'" data-act="luxItem" data-id="'+i.id+'"><div class="lot-picture">'+PixelArt.thumb(i.art,ship?112:88)+'</div><div class="lot-copy"><small>'+caption+'</small><h3>'+i.name+'</h3><span>'+price+'</span></div></button>';
  }
  function exhibitWall(s){
    return '<div class="display-bays">'+Object.entries(berths).map(([key,name])=>{
      const i=Leisure.get(s.leisure.displays[key]);
      return '<section class="display-bay"><small>'+name+'</small>'+(i?'<button data-act="luxItem" data-id="'+i.id+'">'+PixelArt.thumb(i.art,74)+'<b>'+i.name+'</b></button>':'<div class="vacant-bay">'+UI.icon(key==='dock'?'rocket':key==='wall'?'grid':'box')+'<span>비어 있음</span></div>')+'</section>';
    }).join('')+'</div>';
  }
  function shelf(s,items,where,view){
    if(!items.length)return '';
    const U=UI;
    const filtered=items.filter(i=>{
      if(where==='hangar'&&view.filter!=='all')return Registry.ships[i.id][0]===Number(view.filter);
      if(where==='market'&&view.filter!=='all')return Leisure.slot(i)===view.filter;
      return true;
    }).sort((a,b)=>view.desc?b.price-a.price:a.price-b.price);
    const pages=Math.max(1,Math.ceil(filtered.length/10)),page=Math.min(view.page,pages-1);
    const choices=where==='hangar'?Registry.grades.map((n,i)=>[String(i+1),n]):where==='market'?[['cabinet','공예 · 세공'],['wall','벽면 작품']]:[];
    const filters=choices.length?'<div class="action-row">'+[['all','전체'],...choices].map(([k,n])=>U.btn(n,'shelfFilter',k,view.filter===k,false)).join('')+'</div>':'';
    const titles={hangar:'비행선 목록',market:'회랑 진열품',auction:'비밀 위탁 도록',lounge:'보관품 목록'};
    return '<div class="lounge-heading"><h2>'+titles[where]+' · '+items.length+(where==='hangar'?'척':'점')+'</h2></div>'+filters+
      '<div class="toolbar"><div class="action-row">'+U.btn('낮은 가격순','shelfSort','asc',!view.desc,false)+U.btn('높은 가격순','shelfSort','desc',view.desc,false)+'</div><div class="action-row">'+
      U.btn('이전','shelfPage',String(page-1),page===0,false)+'<span>'+ (page+1)+' / '+pages+'</span>'+U.btn('다음','shelfPage',String(page+1),page+1>=pages,false)+'</div></div>'+
      '<div class="lux-catalog '+(where==='hangar'?'ships-on-show':'')+'">'+filtered.slice(page*10,(page+1)*10).map(i=>card(s,i,where)).join('')+'</div>';
  }
  function lounge(s,view){
    const owned=s.leisure.owned.map(Leisure.get);
    return '<section class="observatory"><div class="window-view"><div class="window-caption"><small>본사 주거 구역 · 라이라 전망창</small><h2>대표 전용 전망실</h2></div></div>'+exhibitWall(s)+'</section><div class="lounge-heading"><div><h2>개인 보관고 · '+owned.length+'점</h2><p>'+(owned.length?'소장품을 골라 전시하거나 보관고로 되돌릴 수 있습니다.':'자유항에서 인도받은 물품과 경매 낙찰품이 이곳에 도착합니다.')+'</p></div><button class="btn" data-nav="port">자오선 자유항 방문</button></div>'+shelf(s,owned,'lounge',view);
  }
  function auctionRoom(s){
    const a=s.leisure.auction,U=UI;
    if(!a.invited)return '<section class="invitation"><div><small>수신인 · 오르빗 캐피탈 대표</small><h3>폐등대 인장이 찍힌 초대장</h3><p>“회수 좌표는 묻지 마십시오. 초대장을 지참하시고 종이 울리면 호가를 불러 주십시오.”</p></div>'+U.btn('초대장 개봉 · 입장','auctionEnter')+'</section>';
    let body='<p class="empty">모든 위탁 유물이 개인 보관고에 인도되었습니다.</p>';
    if(a.lot){
      const lot=a.lot,i=Leisure.get(lot.id);
      body='<section class="auction-lot"><div class="lot-picture">'+PixelArt.thumb(i.art,135)+'</div><div><small>현재 위탁품 · 초대제 호가 경매</small><h2>'+i.name+'</h2><p>'+i.origin+'</p>'+U.kv('감정가',U.money(i.price))+U.kv(lot.stage==='ready'?'제안 시작가':'현재 호가',U.money(lot.current||lot.start))+U.kv('최고 입찰자',lot.leader==='player'?'나':lot.leader||'없음')+U.btn(lot.stage==='ready'?'시작가 정하기':'경매석 입장','auctionBid',lot.id)+'</div></section>';
    }
    const list=relics(),start=list.findIndex(i=>i.id===a.lot?.id);
    const upcoming=list.map((_,n)=>list[(start+1+n)%list.length]).filter(i=>i.id!==a.lot?.id&&!s.leisure.owned.includes(i.id)).slice(0,3);
    if(upcoming.length)body+='<div class="lounge-heading"><h2>다음 위탁 순서</h2></div><div class="lux-catalog">'+upcoming.map(i=>'<article class="lux-lot"><div class="lot-picture">'+PixelArt.thumb(i.art,64)+'</div><div class="lot-copy"><small>봉인 위탁품</small><h3>'+i.name+'</h3><span>감정 '+U.money(i.price)+'</span></div></article>').join('')+'</div>';
    return body+'<div class="lounge-heading"><div><h2>최근 낙찰 기록</h2><p>마지막 호가와 낙찰자를 확인하세요.</p></div></div>'+(a.history.length?'<div class="auction-history">'+a.history.slice(0,6).map(h=>'<div><span>'+U.date(h.day)+' · '+Leisure.get(h.id).name+'</span><b>'+(h.winner==='player'?'오르빗 캐피탈':h.winner)+' · '+U.money(h.amount)+'</b></div>').join('')+'</div>':'<p class="hint">첫 낙찰을 기다리는 중입니다.</p>');
  }
  function port(s,venue,view){
    const v=venues[venue]||venues.market,U=UI;
    const tabs=Object.entries(venues).map(([k,d])=>'<button class="tab '+(k===venue?'active':'')+'" data-act="venue" data-id="'+k+'" aria-pressed="'+(k===venue)+'">'+d.name+'</button>').join('');
    const hero='<section class="port-hero" style="background-image:url(assets/confluence-'+v.art+'.png)"><div class="window-caption"><small>'+v.place+'</small><h2>'+v.title+'</h2></div></section>';
    let body='';
    if(venue==='auction')body=auctionRoom(s)+(s.leisure.auction.invited?shelf(s,relics(),venue,view):'');
    else if(venue==='casino')body='<section class="casino-boarding"><div class="boarding-emblem">'+U.icon('star')+'</div><div><small>상갑판 · 공개 테이블</small><h2>마호가니 룰렛</h2><p>녹색 펠트 위에 칩을 놓고 상아색 공이 멈추는 칸을 기다리세요. 승선은 무료, 한 판은 500 CR입니다.</p></div>'+U.btn('승선 · 테이블 입장','casino')+'</section><div class="salon-tables">'+Object.entries(Salon.names).map(([id,n],i)=>'<article class="salon-seat"><span class="table-mark">'+['♠','♦','⚓'][i]+'</span><h3>'+n+'</h3><p>'+Salon.descriptions[id]+'</p>'+U.btn('테이블 입장','salon',id)+'</article>').join('')+'</div>';
    else{
      const stock=Leisure.catalog.filter(i=>Leisure.source(i)===venue);
      body=shelf(s,stock,venue,view);
    }
    return '<nav class="port-tabs" aria-label="자유항 방문 장소">'+tabs+'</nav>'+hero+'<p class="port-intro">'+v.story+'</p>'+body;
  }
  function artDetail(i){return '<div class="lux-closeup">'+PixelArt.thumb(i.art,144)+'</div><p class="lux-origin">'+i.origin+'</p><p class="lux-story">'+i.story+'</p>';}
  function itemView(s,id,location){
    const i=Leisure.get(id),U=UI,owned=s.leisure.owned.includes(id),source=Leisure.source(i);
    let buttons='',meta='';
    if(location==='lounge'&&owned){
      const where=berths[Leisure.slot(i)];
      buttons=U.btn(exhibit(s,i)?'전시 해제':where+'에 배치','luxDisplay',id);
      if(source==='hangar')buttons+=U.btn('유람 비행','cruise',id+'/lyra',false,false);
      if(i.kind==='장신구')buttons+=U.btn(s.leisure.worn===id?'착용 해제':'프로필에 착용','luxWear',id,false,false);
      meta=U.kv('배치 장소',where);
    }else if(source==='auction'&&location==='auction'){
      meta=U.kv('감정가',U.money(i.price))+U.kv('위탁 상태',owned?'인도 완료':s.leisure.auction.lot?.id===id?'입찰 접수 중':'출품 대기');
      if(s.leisure.auction.lot?.id===id)buttons=U.btn('경매석 열기','auctionBid',id);
    }else if(source===location&&source!=='auction'){
      meta=U.kv('판매가',U.money(i.price))+U.kv('가용 자금',U.money(s.cash));
      buttons=owned?'<button class="btn" data-nav="lounge">인도 완료 · 내 보관고</button>':U.btn('인수 조건 보기','luxBuy',id);
    }
    if(source==='hangar')meta+=U.kv('선급원 인증',Registry.gradeName(id))+U.kv('선종',Registry.ships[id][1])+U.kv('유람 항로',Registry.ports(id).map(key=>GameData.planets.find(p=>p.id===key).name).join(' · '));
    return artDetail(i)+meta+'<div class="action-row">'+buttons+'</div>';
  }
  function bidView(s){
    const lot=s.leisure.auction.lot,i=Leisure.get(lot.id),U=UI;
    const label=bidderName;
    if(lot.stage==='ready')return artDetail(i)+U.kv('감정가',U.money(i.price))+
      '<p class="hint">감정가의 50~200%에서 시작가를 정하세요. 사흘간 개시하지 않으면 감정가로 시작합니다.</p><label class="field">시작가 (CR)<input id="auction-offer" type="number" min="'+floorPrice(i.price)+'" max="'+i.price*2+'" step="1000" value="'+lot.start+'"></label>'+U.btn('경매 개시','startAuction',i.id);
    const min=minimum(lot);
    return '<p class="hint">은고래 재단은 최소 호가로, 구항 기록관과 제9항로 유족회는 더 큰 폭으로 응찰합니다. 호가가 두 번 연속 없으면 마감합니다. 경매석 밖에서는 하루에 한 차례 진행합니다.</p>'+
      U.table(['응찰자','소속','선호품 · 입찰 성향'],bidders.map((b,i)=>[b.name,buyers[i],b.style]))+
      U.kv('시작가',U.money(lot.start))+U.kv('최고가 · 입찰자',U.money(lot.current)+' · '+label(lot.leader))+U.kv('내 예치액',U.money(lot.bid))+
      '<label class="field">내 호가 (CR)<input type="number" id="auction-offer" min="'+min+'" step="1000" value="'+min+'"></label><div class="action-row">'+U.btn('호가 제출','submitBid',i.id,lot.leader==='player'||s.cash<min)+U.btn('다음 호가 듣기','auctionRound',i.id,false,false)+'</div>'+
      (lot.quiet?'<p class="hint">추가 호가 없음 · 마지막 호출</p>':'')+
      U.panel('경매석 기록',lot.log.length?U.table(['입찰자','호가'],lot.log.map(e=>[label(e.who),U.money(e.value)])):'<p class="padded">첫 호가를 기다립니다.</p>');
  }
  return {venues,emptyAuction,validAuction,nextLot,invite,prepare,start,bid,round,closeAuction,lounge,port,itemView,bidView};
})();
