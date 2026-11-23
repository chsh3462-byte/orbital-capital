'use strict';
window.Leisure = (() => {
  const catalog = [
    {id:'yacht',art:'luxYacht',kind:'소형 비행선',name:'백야호',price:180000,origin:'라이라 조선소 · 2인승 유람정',
      story:'선실에는 화물 적재표 대신 두 사람이 나란히 누울 수 있는 긴 창이 있습니다. 금빛 보조 추진기가 켜지면 아이보리색 날개 아래로 고리 행성의 얼음 띠가 지나갑니다.'},
    {id:'brooch',art:'luxBrooch',kind:'장신구',name:'안개 정원 브로치',price:12500,origin:'네레이드 세공 길드 · 비취와 황동',
      story:'구리 덩굴 사이에 작은 비취 조각을 겹쳐 박았습니다. 보는 각도가 바뀔 때마다 안쪽에 갇힌 초록빛이 한 잎씩 번집니다.'},
    {id:'astrolabe',art:'luxAstrolabe',kind:'아티팩트',name:'잃어버린 항해사의 천구의',price:96000,origin:'오리온 구항 회수품 · 황동 환 3겹',
      story:'항성 지도가 지워진 뒤에도 세 개의 환은 오래된 항로를 짚어 냅니다. 받침 밑에는 이름 대신 집으로 돌아가는 방위각 하나가 새겨져 있습니다.'},
    {id:'painting',art:'luxPainting',kind:'유화',name:'네레이드의 두 달',price:48000,origin:'이레 윤 · 자개 가루를 섞은 유채',
      story:'두 달이 함께 뜨는 열두 분 동안 화가는 부두의 불을 하나씩 지웠습니다. 캔버스에 남은 연둣빛 한 줄은 마지막 배가 그은 항적입니다.'},
    {id:'ring',art:'luxRing',kind:'장신구',name:'근일점 반지',price:34000,origin:'베이라 공방 · 태양석과 금',
      story:'낮 쪽 채석장에서 나온 주홍색 태양석을 낮은 금 테에 물렸습니다. 돌을 돌려 보면 내부의 가는 결이 일출 직전의 수평선처럼 빛납니다.'},
    {id:'print',art:'luxPrint',kind:'판화',name:'청색 항구, 새벽 네 시',price:6500,origin:'탈로스 인쇄소 · 청색 단판 인쇄',
      story:'야간 하역조가 퇴근하기 직전의 항구입니다. 종이에 눌린 잉크 자국 사이로 크레인과 방파제가 드러납니다. 오른쪽 아래에는 작가의 작은 닻 도장이 찍혀 있습니다.'},
    {id:'skiff',art:'luxSkiff',kind:'소형 비행선',name:'홍시울',price:72000,origin:'베이라 경주조합 · 1인승 스키프',story:'조종석 양옆의 붉은 판은 우승 당시의 도장입니다. 선수가 고개를 돌리는 쪽으로 선체가 기울어지도록 좌석과 자세 제어기를 한 덩어리로 만들었습니다.'},
    {id:'observer',art:'luxObservatory',kind:'소형 비행선',name:'유리새',price:245000,origin:'에이르 광학소 · 3인승 관측선',story:'기관은 선미 아래에 숨기고 선수 전체를 유리 돔으로 불었습니다. 검은 천을 펼쳐 실내등을 가리면 좌석 바로 아래로 별이 흐릅니다.'},
    {id:'twin',art:'luxCatamaran',kind:'소형 비행선',name:'구리돛 쌍동선',price:360000,origin:'라이라 외환 조선소 · 6인승 태양 범선',story:'거주동 두 채를 얇은 다리로 잇고 그 사이에 구릿빛 광압 돛을 폈습니다. 해가 돛을 가득 채울 때는 선내에서 기관 소리가 완전히 사라집니다.'},
    {id:'pendant',art:'luxPendant',kind:'장신구',name:'자정의 우편인',price:18500,origin:'탈로스 우편공방 · 은과 자수정',story:'우편선이 떠날 때 찍던 둥근 봉인을 줄 끝에 달았습니다. 자수정 뒤에는 아주 작은 종이를 접어 넣을 수 있는 경첩이 있습니다.'},
    {id:'cuff',art:'luxCuff',kind:'장신구',name:'코발트 수평선',price:27000,origin:'에이르 소성실 · 청화 자기 팔찌',story:'유약을 두 번 굽자 푸른 선 사이에 하얀 띠가 한 줄 남았습니다. 도공은 그 자국을 깎아 내지 않고 겨울 바다의 이름을 붙였습니다.'},
    {id:'mobile',art:'luxMobile',kind:'조각',name:'여섯 번의 정박',price:57000,origin:'민 다온 · 황동 균형 조각',story:'무게가 다른 색판 여섯 개가 한 가닥의 축에 매달려 있습니다. 문이 열릴 때 밀려온 공기만으로 항구의 신호기처럼 천천히 돌아갑니다.'},
    {id:'lacquer',art:'luxLacquer',kind:'공예',name:'밤바다 나전함',price:21500,origin:'네레이드 잠수촌 · 자개와 흑칠',story:'잠수부들이 식탁에 남긴 조개껍데기를 잘라 뚜껑에 붙였습니다. 뚜껑을 열면 안쪽 옻칠에 바다의 옛 수심선이 보입니다.'},
    {id:'mosaic',art:'luxMosaic',kind:'모자이크',name:'환승역의 오후',price:61500,origin:'자오선 여객조합 · 폐창 유리',story:'폐쇄된 대합실의 파란 창과 노란 행선판을 잘라 맞췄습니다. 역이 헐린 지금도 작품을 빛에 비추면 옛 승강장 바닥의 색이 살아납니다.'},
    {id:'photo',art:'luxPhoto',kind:'사진',name:'붉은 부두의 첫 편',price:9200,origin:'조 란 · 은염 인화',story:'정비사가 용접기를 끄고 첫 여객선의 밧줄을 받는 순간입니다. 프레임 오른쪽에 남은 붉은 빛은 해가 아니라 야간 근무 종료등입니다.'},
    {id:'key',art:'luxOrreryKey',kind:'아티팩트',name:'북천문의 황동 열쇠',price:135000,origin:'구조선 물까치 · 폐쇄 천문대 수습품',story:'이빨의 간격이 낡은 천체력의 누락된 날짜와 일치합니다. 회수선은 열쇠를 끼울 문을 찾지 못한 채 자오선의 보관소로 돌아왔습니다.'},
    {id:'tideglass',art:'luxTideglass',kind:'아티팩트',name:'썰물이 멎은 유리병',price:220000,origin:'에이르 빙하 관측대 · 봉인 표본',story:'거꾸로 들면 안쪽의 파도만 수평을 지킵니다. 조사대가 남긴 마지막 필름에는 이 병과 똑같은 유리 물결이 빙하 전체를 덮고 있습니다.'},
    {id:'echo',art:'luxEcho',kind:'아티팩트',name:'반향 기록판',price:165000,origin:'오리온 무인 부표 · 흑요석 명판',story:'홈을 따라 빛을 비추면 사라진 부표들의 호출 순서가 돌아옵니다. 맨 끝의 부표 하나는 어느 항로 장부에도 기록되어 있지 않습니다.'}
  ].concat(Registry.additions);
  const ticket=500;
  const bets={low:{name:'청색',range:'2–6',mult:2},seven:{name:'쌍성',range:'7',mult:5},high:{name:'금색',range:'8–12',mult:2}};
  const get=id=>catalog.find(item=>item.id===id);
  const source=item=>item.kind==='아티팩트'?'auction':item.kind==='소형 비행선'?'hangar':'market';
  const slot=item=>source(item)==='hangar'?'dock':['유화','판화','모자이크','사진','직조화','동판화'].includes(item.kind)?'wall':'cabinet';
  const initial=()=>({owned:[],displays:{dock:null,wall:null,cabinet:null},worn:null,rounds:0,paidOut:0,last:null,wheel:Roulette.initial(),tables:Salon.initial(),auction:Freeport.emptyAuction()});
  function migrate(l){
    if(!l.displays&&Object.hasOwn(l,'exhibit')){
      if(l.exhibit!==null&&(!l.owned.includes(l.exhibit)||!get(l.exhibit)))throw Error('잘못된 전시 기록');
      l.displays={dock:null,wall:null,cabinet:null};
      if(l.exhibit)l.displays[slot(get(l.exhibit))]=l.exhibit;
      delete l.exhibit;
    }
    if(l.tables===undefined)l.tables=Salon.initial();
    if(l.wheel===undefined)l.wheel=Roulette.initial();
    if(l.auction===undefined)l.auction=Freeport.emptyAuction();
  }
  function award(a,b,pick){
    const sum=a+b,winning=sum<7?'low':sum===7?'seven':'high';
    return winning===pick?ticket*bets[pick].mult:0;
  }
  function valid(l){
    if(!l||!Array.isArray(l.owned)||l.owned.length>catalog.length||!l.owned.every(id=>get(id))||new Set(l.owned).size!==l.owned.length)return false;
    if(!l.displays||!['dock','wall','cabinet'].every(k=>l.displays[k]===null||(l.owned.includes(l.displays[k])&&slot(get(l.displays[k]))===k)))return false;
    if(!Salon.valid(l.tables)||!Roulette.valid(l.wheel)||!Freeport.validAuction(l))return false;
    if(l.worn!==null&&(!l.owned.includes(l.worn)||get(l.worn)?.kind!=='장신구'))return false;
    if(!Number.isSafeInteger(l.rounds)||l.rounds<0||!Number.isSafeInteger(l.paidOut)||l.paidOut<0||l.paidOut>l.rounds*ticket*5)return false;
    if(l.rounds===0)return l.last===null&&l.paidOut===0;
    const r=l.last;
    return !!r&&Object.hasOwn(bets,r.pick)&&[r.a,r.b].every(v=>Number.isInteger(v)&&v>=1&&v<=6)&&r.payout===award(r.a,r.b,r.pick)&&r.payout<=l.paidOut;
  }
  function purchase(s,id,venue){
    const item=get(id);
    if(!item||s.leisure.owned.includes(id))throw Error('이미 소장했거나 판매 목록에 없는 물품입니다.');
    if(source(item)==='auction')throw Error('아티팩트 소유권은 비밀 경매에서 낙찰받아야 합니다.');
    if(source(item)!==venue)throw Error('해당 전시장을 방문하세요.');
    Economy.charge(s,item.price);
    s.leisure.owned.push(id);
    Economy.note(s,'leisure',item.name+' 소장','−'+UIAmount(item.price)+' CR');
  }
  function display(s,id){
    if(!s.leisure.owned.includes(id))throw Error('소장품만 전시할 수 있습니다.');
    const key=slot(get(id));
    s.leisure.displays[key]=s.leisure.displays[key]===id?null:id;
  }
  function wear(s,id){
    if(!s.leisure.owned.includes(id)||get(id)?.kind!=='장신구')throw Error('소장한 장신구를 선택하세요.');
    s.leisure.worn=s.leisure.worn===id?null:id;
  }
  function UIAmount(n){return n.toLocaleString('ko-KR');}
  const destinations={lyra:'라이라의 고리 그늘',nereid:'네레이드의 새벽 해안',orion:'오리온의 보랏빛 구름',veyra:'베이라의 홍토 협곡',eir:'에이르의 빙설 경계',thalos:'탈로스의 심해 궤도'};
  function cruiseView(s,id){
    const [ship,port]=id.split('/');
    const item=get(ship);
    if(!item||source(item)!=='hangar'||!s.leisure.owned.includes(ship)||!Registry.ports(ship).includes(port))throw Error('인도된 비행선과 목적지를 선택하세요.');
    return '<canvas class="cruise-view" width="384" height="150" aria-label="'+destinations[port]+' 유람 비행"></canvas><p class="lux-origin">'+destinations[port]+'</p><p class="hint">'+item.name+' 운항 중 · 기항지를 선택하면 관측 궤도로 진입합니다.</p><div class="action-row">'+Registry.ports(ship).map((key)=>UI.btn(GameData.planets.find(p=>p.id===key).name,'cruise',ship+'/'+key,port===key,false)).join('')+'</div>';
  }
  function fly(canvas,id,t){
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    ctx.imageSmoothingEnabled=false;ctx.fillStyle='#100e23';ctx.fillRect(0,0,w,h);
    for(let i=0;i<100;i++){
      const x=((i*113.37-t*(3+i%3)*1.6)%w+w)%w,y=(i*i*7+11*i)%h;
      ctx.fillStyle=['#8a839c','#676890','#d8c9c6'][i%3];ctx.fillRect(Math.floor(x),y,i%16===0?2:1,1);
    }
    const [ship,port]=id.split('/');
    const dest=GameData.planets.find(p=>p.id===port);
    PixelArt.sprite(ctx,dest.sprite,274+Math.cos(t*.12)*16,69,146,t);
    const scale=Registry.ships[ship][2];
    PixelArt.sprite(ctx,get(ship).art,111+Math.sin(t*(ship==='skiff'?.8:.4))*12,85+Math.cos(t*.65)*8,scale,t);
  }
  return {catalog,source,slot,initial,migrate,valid,get,award,purchase,display,wear,cruiseView,fly};
})();
