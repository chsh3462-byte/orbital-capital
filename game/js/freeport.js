'use strict';
window.Freeport=(()=>{
  const venues={
    market:{name:'교역 회랑',place:'제1환 · 여객 부두',title:'자오선 교역 회랑',art:'market',story:'세 항로의 배가 만나는 중립 자유항입니다. 통관을 마친 세공품은 공방이, 그림은 작가의 대리인이 직접 진열합니다. 진열품을 골라 출처와 가격표를 확인하세요.'},
    hangar:{name:'비행선 전시장',place:'제2환 · 조선소 인도장',title:'수평선 전시 격납고',art:'hangar',story:'자유항 선급원은 선체의 항속 인증에 따라 연안·순항·원정·대항해급을 부여합니다. 인증 항로는 등급마다 3곳에서 6곳까지 늘어납니다. 갑판을 둘러보고 매입하면 등록증과 함께 개인 선석으로 넘겨받습니다.'},
    casino:{name:'항성간 카지노',place:'외항 · 국제 여객선 접안구',title:'항성간 카지노 황혼선',art:'casino',story:'독립 여객조합의 카지노선이 급유를 위해 자오선에 접안했습니다. 다음 항로를 기다리는 승객이라면 누구나 승선할 수 있습니다. 벨벳 커튼 뒤의 살롱에서는 크루피에가 황동 손잡이로 목제 원판을 돌립니다.'},
    auction:{name:'봉인 중개소',place:'구항 · 폐등대 수장고',title:'소등 후의 비밀 경매',art:'auction',story:'인양선들이 회수한 유물은 발견 좌표가 새지 않도록 구항에 따로 보관합니다. 등록 기업의 대표가 초대장의 봉인을 열면 위탁 기록과 비공개 입찰 장부를 열람할 수 있습니다.'}
  };
  const berths={dock:'전용 계류장',wall:'갤러리 벽면',cabinet:'유리 전시대'};
  const buyers=['은고래 재단','구항 기록관','제9항로 유족회'];
  function shipSpec(id){return Registry.ships[id][1]+' · '+Registry.gradeName(id);}
  const relics=()=>Leisure.catalog.filter(i=>Leisure.source(i)==='auction');
  const isRelic=id=>relics().some(i=>i.id===id);
  const amount=n=>Number.isSafeInteger(n)&&n>=0;
  const emptyAuction=()=>({invited:false,lot:null,history:[]});
  function validAuction(l){
    const a=l.auction;
    if(!a||typeof a.invited!=='boolean'||!Array.isArray(a.history)||a.history.length>24)return false;
    if(!a.history.every(h=>h&&isRelic(h.id)&&amount(h.day)&&h.day>0&&amount(h.amount)&&amount(h.bid)&&(h.winner==='player'||buyers.includes(h.winner))))return false;
    if(!a.invited)return a.lot===null&&!a.history.length;
    const lot=a.lot;
    if(!lot)return relics().every(i=>l.owned.includes(i.id));
    if(!isRelic(lot.id)||l.owned.includes(lot.id)||!amount(lot.close)||lot.close<4||!amount(lot.bid))return false;
    const reserve=Leisure.get(lot.id).price;
    return (lot.bid===0||(lot.bid>=reserve&&lot.bid%1000===0))&&Array.isArray(lot.quotes)&&lot.quotes.length===buyers.length&&lot.quotes.every(v=>amount(v)&&v>=reserve);
  }
  function nextLot(s,previous){
    const list=relics(),offset=list.findIndex(i=>i.id===previous)+1;
    const item=list.map((_,i)=>list[(i+offset)%list.length]).find(i=>!s.leisure.owned.includes(i.id));
    if(!item)return null;
    // The sealed institutional bids are fixed before the player enters a price.
    const quotes=buyers.map((_,i)=>{
      const key=Math.imul((s.seed^Math.imul(s.day+i*71,2654435761))>>>0,2246822519)>>>0;
      const premium=(key%41+(list.indexOf(item)%3===i?12:0))/100;
      return Math.ceil(item.price*(1+premium)/1000)*1000;
    });
    return {id:item.id,close:s.day+3,bid:0,quotes};
  }
  function invite(s){
    const a=s.leisure.auction;
    if(!a.invited){a.invited=true;a.lot=nextLot(s,null);}
  }
  function bid(s,id,value){
    const a=s.leisure.auction,lot=a.lot;
    if(!a.invited||!lot||lot.id!==id||s.day>=lot.close||s.leisure.owned.includes(id))throw Error('이 회차의 입찰이 종료되었습니다.');
    const min=Math.max(Leisure.get(id).price,lot.bid+1000);
    if(!Number.isSafeInteger(value)||value<min||value%1000!==0)throw Error(min.toLocaleString('ko-KR')+' CR 이상, 1,000 CR 단위로 입력하세요.');
    Economy.charge(s,value-lot.bid);lot.bid=value;
    Economy.note(s,'leisure',Leisure.get(id).name+' 봉인 입찰',value.toLocaleString('ko-KR')+' CR 예치');
  }
  function closeAuction(s){
    const a=s.leisure.auction,lot=a.lot;
    if(!lot||s.day<lot.close)return;
    const rival=Math.max(...lot.quotes),won=lot.bid>rival;
    const winner=won?'player':buyers[lot.quotes.indexOf(rival)];
    if(won)s.leisure.owned.push(lot.id);
    else s.cash+=lot.bid;
    a.history.unshift({day:s.day,id:lot.id,winner,amount:won?lot.bid:rival,bid:lot.bid});
    if(a.history.length>24)a.history.pop();
    if(lot.bid)Economy.note(s,'leisure',Leisure.get(lot.id).name+(won?' 낙찰 · 인도 완료':' 패찰 · 예치금 반환'),lot.bid.toLocaleString('ko-KR')+' CR');
    a.lot=nextLot(s,lot.id);
  }
  const exhibit=(s,i)=>s.leisure.displays[Leisure.slot(i)]===i.id;
  function card(s,i,where){
    const owned=s.leisure.owned.includes(i.id),ship=Leisure.source(i)==='hangar';
    let caption=ship?shipSpec(i.id):i.kind;
    const price=where==='lounge'?(exhibit(s,i)?'전시 중':'보관 중'):(owned?'인도 완료':(where==='auction'?'최저 ':'')+UI.money(i.price));
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
    if(!a.invited)return '<section class="invitation"><div><small>수신인 · 오르빗 캐피탈 대표</small><h3>폐등대 인장이 찍힌 초대장</h3><p>“회수 좌표는 묻지 마십시오. 입찰액과 소유권 인수인의 이름만 적어 주십시오.”</p></div>'+U.btn('초대장 개봉 · 입장','auctionEnter')+'</section>';
    let body='<p class="empty">모든 위탁 유물이 개인 보관고에 인도되었습니다.</p>';
    if(a.lot){
      const lot=a.lot,i=Leisure.get(lot.id);
      body='<section class="auction-lot"><div class="lot-picture">'+PixelArt.thumb(i.art,135)+'</div><div><small>현재 위탁품 · 비공개 봉인 입찰</small><h2>'+i.name+'</h2><p>'+i.origin+'</p><div class="auction-numbers">'+U.kv('최저 입찰가',U.money(i.price))+U.kv('내 예치액',U.money(lot.bid))+U.kv('개찰일',U.date(lot.close)+' · '+(lot.close-s.day)+'일 후')+'</div>'+U.btn(lot.bid?'입찰액 올리기':'기록 열람 · 입찰','auctionBid',lot.id)+'</div></section>';
    }
    const list=relics(),start=list.findIndex(i=>i.id===a.lot?.id);
    const upcoming=list.map((_,n)=>list[(start+1+n)%list.length]).filter(i=>i.id!==a.lot?.id&&!s.leisure.owned.includes(i.id)).slice(0,3);
    if(upcoming.length)body+='<div class="lounge-heading"><h2>다음 위탁 순서</h2></div><div class="lux-catalog">'+upcoming.map(i=>'<article class="lux-lot"><div class="lot-picture">'+PixelArt.thumb(i.art,64)+'</div><div class="lot-copy"><small>봉인 위탁품</small><h3>'+i.name+'</h3><span>최저 '+U.money(i.price)+'</span></div></article>').join('')+'</div>';
    return body+'<div class="lounge-heading"><div><h2>최근 개찰 기록</h2><p>최고액 낙찰 · 동액이면 먼저 봉인한 기관에 우선권이 있습니다.</p></div></div>'+(a.history.length?'<div class="auction-history">'+a.history.slice(0,6).map(h=>'<div><span>'+U.date(h.day)+' · '+Leisure.get(h.id).name+'</span><b>'+(h.winner==='player'?'오르빗 캐피탈':h.winner)+' · '+U.money(h.amount)+'</b></div>').join('')+'</div>':'<p class="hint">첫 개찰을 기다리는 중입니다.</p>');
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
      meta=U.kv('최저 입찰가',U.money(i.price))+U.kv('위탁 상태',owned?'인도 완료':s.leisure.auction.lot?.id===id?'입찰 접수 중':'출품 대기');
      if(s.leisure.auction.lot?.id===id)buttons=U.btn('봉인 입찰 열기','auctionBid',id);
    }else if(source===location&&source!=='auction'){
      meta=U.kv('판매가',U.money(i.price))+U.kv('가용 자금',U.money(s.cash));
      buttons=owned?'<button class="btn" data-nav="lounge">인도 완료 · 내 보관고</button>':U.btn('구입 · 보관고로 인도','luxBuy',id,s.cash<i.price);
    }
    if(source==='hangar')meta+=U.kv('선급원 인증',Registry.gradeName(id))+U.kv('선종',Registry.ships[id][1])+U.kv('유람 항로',Registry.ports(id).map(key=>GameData.planets.find(p=>p.id===key).name).join(' · '));
    return artDetail(i)+meta+'<div class="action-row">'+buttons+'</div>';
  }
  function bidView(s){
    const lot=s.leisure.auction.lot,i=Leisure.get(lot.id),U=UI,min=Math.max(i.price,lot.bid+1000);
    return artDetail(i)+'<p class="hint">입찰액 전액을 예치합니다. 증액할 때는 차액만 납부합니다. 낙찰 시 예치액으로 결제하며, 패찰하면 전액 돌려받습니다. 개찰까지 '+(lot.close-s.day)+'일 남았습니다.</p>'+U.kv('기존 예치액',U.money(lot.bid))+U.kv('가용 자금',U.money(s.cash))+'<label class="field">봉인할 총액 <input type="number" id="auction-offer" min="'+min+'" step="1000" value="'+min+'"> CR</label><div class="action-row">'+U.btn('입찰 봉인','submitBid',i.id,s.cash<min-lot.bid)+'</div>';
  }
  return {venues,emptyAuction,validAuction,nextLot,invite,bid,closeAuction,lounge,port,itemView,bidView};
})();
