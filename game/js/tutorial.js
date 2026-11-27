'use strict';
window.Tutorial = (() => {
  const chapters = [
    {title:'도장을 찍은 곳',page:'dashboard',art:'spaceport',
      story:'네레이드 공항에서 돌아온 운송장입니다. 모서리가 접힌 칸에 공항 도장이 보이죠? 배는 본사로 돌아오지만, 이 운송을 받쳐 주는 우리 시설은 저 행성에 있습니다.',
      task:'지도에서 네레이드를 열고 소유자와 보유 시설을 확인하세요.',action:'네레이드 찾기'},
    {title:'운송장의 뒷면',page:'finance',art:'credits',
      story:'앞면에는 화주가 낸 운임이, 뒷면에는 배를 띄우는 데 쓴 돈이 적혀 있어요. 전임자는 늘 두 장을 포개 놓고 결재했습니다. 우리도 들어온 돈 가운데 얼마가 남았는지 보죠.',
      task:'재무제표의 일일 실적을 읽고 ‘분기’를 눌러 누계와 비교하세요.',action:'재무제표 열기'},
    {title:'돌아오는 배를 기다리며',page:'research',art:'ship2',
      story:'공항장이 운송장 귀퉁이에 한 줄을 남겼습니다. “다음 배는 몇 시에 옵니까?” 배를 새로 사지 않아도 같은 배가 일찍 돌아오면 다음 운임을 더 빨리 벌 수 있어요.',
      task:'워프 추진기 견적에서 연구비와 예상 일일 운송 매출의 변화를 비교하세요.',action:'추진기 견적 보기'},
    {title:'빈 화물칸의 값',page:'ads',art:'hologram',
      story:'기관실은 배를 일찍 돌려보낼 수 있고, 영업팀은 다음 화주를 모을 수 있다고 합니다. 영업팀이 벌써 네레이드 출항편 홀로넷 광고의 시안을 보냈군요. 이번에는 게시 기간도 함께 보세요.',
      task:'홀로넷 배너의 총비용, 적용 기간, 기간 내 추가 매출 추정치를 확인하세요.',action:'광고 시안 검토'},
    {title:'두 번째 공항 후보지',page:'estate',art:'deed',
      story:'광고 시안 아래에 새 기항지 제안서가 한 장 끼어 있습니다. 땅을 사면 바로 운임이 들어온다고 쓰여 있네요. 공항 도장 자리를 보세요. 아직 건물이 없다면 그 계산에는 공사비가 빠져 있어요.',
      task:'후보 행성의 소유권과 시설을 열어 토지 비용과 건설 비용을 구분하세요.',action:'후보지 장부 열기'},
    {title:'부두 건너편의 회사',page:'stocks',art:'stock',
      story:'다른 방법도 있습니다. 경쟁사가 이미 부두를 운영하고 있으니 그 회사의 주식을 사서 배당에 참여할 수도 있어요. 거래 단말에 수량을 입력해 견적부터 받아 보죠.',
      task:'거래창의 수량에 3을 입력하고 주문 금액을 확인하세요. 매수는 선택입니다.',action:'주문서 열기'},
    {title:'부두의 열쇠는 얼마일까',page:'stocks',art:'planetRust',
      story:'주식 몇 장을 사면 배당은 오지만 부두의 열쇠는 여전히 상대 회사에 있습니다. 회사를 통째로 인수할 때 지불할 금액은 다릅니다. 방금 본 주가로 잔여 지분 견적을 받아 보세요.',
      task:'인수 검토 창에서 잔여 지분과 최종 인수 지출을 대조하세요. 확정은 선택입니다.',action:'인수 견적 열기'},
    {title:'다음 교대에 남길 기록',page:'dashboard',art:'hq',
      story:'이제 운송장에 답을 적을 수 있겠네요. 기관실 견적을 채택해도, 부지를 사려고 현금을 남겨 둬도 좋습니다. 어떤 결정을 내리든 다음 교대가 장부를 이어받을 수 있게 저장 위치만 확인해 주세요.',
      task:'불러오기에서 자동·수동 슬롯을 확인한 뒤 인계를 마치세요. 직접 저장할 때는 ‘게임 저장’을 누릅니다.',action:'저장 슬롯 확인'}
  ];
  const initial=()=>({status:'offer',step:0,seen:false});
  const valid=g=>g&&['offer','active','later','done'].includes(g.status)&&Number.isInteger(g.step)&&g.step>=0&&g.step<chapters.length&&typeof g.seen==='boolean';
  const issuer=s=>Campaign.markets(s).find(r=>!r.acquired)||null;
  const site=s=>s.planets.find(p=>Campaign.allowed(s,p.id)&&!p.owner)||s.planets.find(p=>p.id==='nereid');
  function chapter(s){
    const ch={...chapters[s.guide.step]};
    if(s.guide.step===4&&site(s).owner)ch.story='후보지로 검토하던 시절의 도면과 현재 장부를 함께 펼쳐 보죠. 지금은 주인이 있는 땅입니다. 소유권과 준공 시설을 확인하면 그동안의 개발 결과를 읽을 수 있어요.';
    if([5,6].includes(s.guide.step)&&!issuer(s)){
      ch.story='인수 서류에 있던 기업들이 모두 우리 회사로 편입됐군요. 상장 폐지된 기업은 거래가 끝납니다. 합병 이력에는 어느 날 어떤 방식으로 인수했는지 남아 있습니다.';
      ch.task='증권 화면에서 완료된 합병 이력을 확인하세요.';ch.action='합병 이력 보기';
    }
    return ch;
  }
  function preview(s,kind){
    const U=UI,E=Economy,D=GameData,alt=structuredClone(s);
    if(kind==='guideWarp'){
      const lv=s.tech.warp;
      if(lv===3)return '<p class="hint">워프 추진기 연구가 3단계까지 끝났습니다. 현재 항로 회전율에는 기본 대비 54% 보너스가 적용됩니다.</p>'+U.kv('현재 일일 운송 매출',U.money(E.forecast(s).trade));
      const cost=E.researchCost(s,'warp');alt.tech.warp++;
      return '<p class="hint">기관실이 현재 운임과 운항 척수로 계산한 견적입니다. 다음 단계를 연구하면 항로의 배가 빨라지고 일일 운송량이 늘어납니다.</p>'+U.kv('연구 단계','Lv.'+lv+' → Lv.'+(lv+1))+U.kv('즉시 지출할 연구비',U.money(cost))+U.kv('현재 일일 운송 매출',U.money(E.forecast(s).trade))+U.kv('연구 후 일일 운송 매출',U.money(E.forecast(alt).trade))+'<p class="hint">연구를 결정하면 함대 연구소에서 직접 집행하세요. 이 견적을 여는 데에는 비용이 들지 않습니다.</p>';
    }
    const c=D.campaigns.find(c=>c.id==='holo'),active=s.ads.find(a=>a.id===c.id);
    const days=active?.left??c.days;
    alt.ads=alt.ads.filter(a=>a.id!==c.id);const base=E.forecast(alt);alt.ads.push({id:c.id,left:days});const plus=E.forecast(alt);
    const daily=plus.trade+plus.facility-base.trade-base.facility;
    return '<p class="hint">“네레이드 정기편, 화물 접수 중.” 영업팀이 보낸 배너입니다. 현재 운임과 이벤트가 같은 조건으로 이어진다고 가정한 추정치입니다.</p>'+U.kv('집행 비용',U.money(c.cost))+U.kv(active?'현재 남은 기간':'광고 기간',days+'일')+U.kv('매출 배율 보너스 / 평판','+'+Math.round(c.boost*100)+'% / +'+c.rep)+U.kv('하루 추가 매출',U.money(daily))+U.kv(days+'일간 예상 추가 매출',U.money(daily*days))+'<p class="hint">광고가 끝나면 매출과 평판 보너스도 종료됩니다. 실제 집행은 마케팅 화면에서 결정하세요.</p>';
  }
  function insight(s){
    const U=UI,E=Economy,D=GameData,r=issuer(s),p=site(s),g=s.guide;
    switch(g.step){
      case 0:return '네레이드의 보유 시설은 '+s.planets.find(p=>p.id==='nereid').buildings.map(id=>D.facilities.find(f=>f.id===id).name).join(', ')+'입니다. 시설과 함선은 각각 매출을 냅니다. 기본 속도에서 12초가 하루예요. 장부를 천천히 읽고 싶으면 날짜 옆의 일시정지를 누르세요.';
      case 1:{const f=s.history.at(-1);return '최근 결산의 매출은 '+U.money(f.trade+f.facility)+', 배당은 '+U.money(f.dividend)+', 비용은 '+U.money(f.cost)+'입니다. 남은 순이익은 '+U.money(f.net)+'입니다.';}
      case 2:return '속도가 병목이면 추진기, 운송 단가가 낮으면 화물칸을 보세요. 소행성 경보 때 손실이 크면 방어막도 투자 후보입니다. 총 연구 레벨 3과 6에서 선체가 바뀝니다.';
      case 3:return '기간 한정 광고는 추가 매출이 광고비를 회수할 수 있는지 먼저 비교하세요. 시세와 경제 이벤트에 따라 실제 결과는 달라집니다.';
      case 4:{const name=D.planets.find(d=>d.id===p.id).name,land=D.planets.find(d=>d.id===p.id).price,port=D.facilities.find(f=>f.id==='spaceport');return p.owner?name+'의 시설 목록이 현재 운영 자산입니다. 경쟁사 소유권은 M&A로 이전됩니다.':name+' 토지 '+U.money(land)+'에 첫 공항 건설비 '+U.money(port.cost)+'를 더하면 개항까지 '+U.money(land+port.cost)+'가 필요합니다. 토지만 소유해도 유지비가 발생합니다.';}
      case 5:return r?r.id+'의 현재 3주 견적은 '+U.money(3*r.price)+'입니다. 발행량이 100주라 지분은 3%이고, 배당은 실제 보유한 주식에 매일 지급됩니다.':'합병을 마친 회사는 주식 거래와 배당이 종료됩니다.';
      case 6:return r?'지분 50%부터 우호적 인수가 열립니다. 적대적 인수는 잔여 주식에 30%를 더 냅니다. 기업을 인수하면 보유 행성·시설과 점유율이 함께 이전됩니다.':'편입된 행성과 시설은 이제 행성 개발 화면에서 직접 운영합니다.';
      default:return '자동 슬롯은 영업 중 갱신됩니다. 장기 투자 직전의 장부를 따로 남기고 싶을 때 수동 슬롯을 사용하세요.';
    }
  }
  function panel(s,page){
    const g=s.guide,U=UI;
    if(g.status==='offer'&&page==='dashboard')return '<div class="guide-offer"><div class="dispatch-icon">'+PixelArt.thumb('spaceport',48)+'</div><div class="guide-copy"><small>운항실장 윤서진 · 첫 근무 인계</small><h2>네레이드에서 운송장 한 장이 도착했습니다.</h2><p>첫 정기편의 장부를 따라 거점, 투자, 인수 비용을 살펴보세요.</p></div><div class="guide-actions">'+U.btn('인계받기','guideStart')+U.btn('자유 경영','guideLater','',false,false)+'</div></div>';
    return '';
  }
  function dialogNote(s){
    const g=s.guide;
    if(g.status!=='active')return '';
    return '<aside class="guide-note"><small>운항실장 인계 메모 · '+(g.step+1)+' / '+chapters.length+'</small><p>'+(g.seen?insight(s):chapter(s).task)+'</p>'+(g.seen?UI.btn(g.step===chapters.length-1?'인계 마치기':'다음 인계','guideNext'):'')+'</aside>';
  }
  return {chapters,initial,valid,issuer,site,chapter,insight,panel,dialogNote,preview};
})();
