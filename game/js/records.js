'use strict';
window.Records=(()=>{
  // Dates are the local release dates in Korea. Commit references identify milestones
  // within a release, including deployment work that did not change its version.
  const history=[
    {version:'0.7.2',date:'2026-11-26',title:'AURA 동행 안내',
      updates:['AURA가 관제실과 주문창에 남아 첫 운송부터 주식 매수까지 안내합니다.'],
      development:[['상황별 표정','선적 대기, 수량 오류, 실습 완료에 맞춰 표정과 대사를 연결했습니다. 안내를 접어도 AURA는 옆에 남습니다.']]},
    {version:'0.7.1',date:'2026-11-26',title:'변방의 생존자 · 네레이드 야간 창구',
      updates:['도착 방송, 접수원, 선장 이안, 비서 AURA가 등장하는 픽셀 대화극과 첫 운송장을 추가했습니다.'],
      development:[['기존 회사에서도 만나는 첫날','대화 위치를 회사별로 저장합니다. 상단 취임 이야기에서 실습 보상을 건드리지 않고 다시 볼 수 있습니다.']]},
    {version:'0.7.0',date:'2026-11-26',title:'대표 취임과 AURA 인계',
      updates:['새 회사는 수송선 한 척으로 출범합니다. 전임 대표의 녹음과 AURA의 다섯 실습, 정식 CEO 인가와 후속 목표를 추가했습니다.'],
      development:[['인계 진행 저장','실제 출항·배속·장부 열람·주식 매수에 보상을 연결하고, 단계와 수령 내역을 로컬 세이브 및 JSON 백업에 포함했습니다.']]},
    {version:'0.6.0',date:'2026-11-25',title:'계정과 자금 랭킹',
      updates:['운영 지원에서 회원가입·로그인·로그아웃을 이용하고, 현재 보유 현금을 서버 랭킹에 등록할 수 있습니다.'],
      development:[['계정별 저장과 서버 순위','기존 게스트 슬롯을 보존하고 계정별 슬롯을 추가했습니다. SQLite 파일에 계정과 최근 등록액을 보관하고 동점은 공동 순위로 계산합니다.']]},
    {version:'0.5.1',date:'2026-11-25',title:'게임 기록 열람',
      updates:['경영 관제실의 전체 기록에서 회사 운영 기록, 버전별 업데이트, 개발 기록을 전환할 수 있습니다.'],
      development:[['기록 보관','버전 이력을 게임 파일에 포함했습니다. 기존 세이브를 열거나 Windows에서 오프라인으로 실행해도 같은 이력을 읽을 수 있습니다.']]},
    {version:'0.5.0',date:'2026-11-25',title:'경매석과 변경 항로',
      updates:['아티팩트 경매에서 시작가를 정하고 수집가 세 명과 호가를 주고받습니다.','현물 거래 조건 51종과 소장품 인수 조건 21종을 추가했습니다. 거래마다 상황에 맞는 네 가지가 나옵니다.','운송정 4등급과 경호 인력 3등급을 도입했습니다. 미라·세린·칼릭스와 상장사 세 곳이 합류해 행성이 9곳, 상장사가 8곳이 됐습니다.'],
      development:[['경매 예치금과 운항 위험','기존 봉인 입찰의 예치금을 새 경매의 최고 호가로 옮겼습니다. NPC가 추월하면 즉시 반환하고, 습격으로 화물을 잃으면 남은 물량의 매출과 선적 원가를 장부에 반영합니다.','a230d26']]},
    {version:'0.4.0',date:'2026-11-24',title:'자유항 소장품 150종',
      updates:['비행선 8척을 50척으로, 교역 회랑 진열품 16점을 50점으로, 비밀 경매 아티팩트 8점을 50점으로 늘렸습니다.','가격순 정렬, 선급 필터, 비밀 위탁 도록을 추가했습니다. 백금 조수궁의 판매가는 1,800만 CR입니다.'],
      development:[['소장품과 경매 세이브 확장','신규 소장품 118종에 네 프레임 픽셀 시트를 제작했습니다. 이전 도록을 완성한 세이브에서도 다음 위탁품이 열리도록 경매 진행 상태를 이전했습니다.','ef5395e']]},
    {version:'0.3.0',date:'2026-11-24',title:'행성 현물 거래와 운송 회사',
      updates:['여섯 행성에 특산품과 현물 시세를 도입했습니다. 출발지·도착지·품목별 수량을 정하면 취소할 때까지 반복 운항합니다.','운송사 TOW·POL을 상장했습니다. 직원 모집 스타일과 실무·정확성·일급 기준을 정해 자동 채용할 수 있게 했습니다.'],
      development:[['재고 원가와 항로 복원','선적 시 현지 재고부터 쓰고 모자란 수량만 매입합니다. 저장한 화물의 원가를 도착일까지 보관해 매각 시점에 정산하고, 운항 중 취소한 배는 마지막 화물을 인도한 뒤 복귀하게 했습니다.','0422241']]},
    {version:'0.2.0',date:'2026-11-24',title:'항만 운송 계약',
      updates:['정기편에서 화물선 한 척을 빼서 청무차 첫물, 선실시계 부품, 빙화 향료 원액 중 한 건의 배송을 맡길 수 있게 됐습니다.','워프 연구가 신규 계약의 운송 기간을 줄입니다. 계약 운임은 인도일의 일일·분기 장부에서 확인할 수 있습니다.'],
      development:[['웹 배포 복구','웹 배포 과정에서 업로드 직후 게임 파일을 찾지 못한 문제를 해결하기 위해 파일 준비와 공개 배포를 별도 작업으로 나눴습니다.','eeb0d65'],['계약 정산','계약을 맡을 때 워프 레벨과 출발일을 저장해 운송 중 연구를 마쳐도 약속한 도착일을 지키고 운임을 한 번만 지급하도록 했습니다.','8f61905']]},
    {version:'0.1.0',date:'2026-11-23',title:'첫 공개 버전',
      updates:['첫 근무 인계 튜토리얼과 함께 함대 연구, 광고, 행성 개발, 주식 투자와 인수합병을 공개했습니다.','자유항에는 전용 비행선 8척, 회랑 진열품 16점, 아티팩트 8점과 고전 카지노 게임 4종이 있었습니다. 구매한 물건은 개인 라운지에 전시할 수 있었습니다.'],
      development:[['브라우저판 공개','GitHub Pages에서 설치 없이 바로 실행할 수 있게 했습니다. 브라우저판은 같은 기기의 로컬 저장소에서 진행을 복원합니다.','19dc600'],['Windows 첫 배포','픽셀 스프라이트 기반의 성계 지도와 경제 시뮬레이션을 Electron으로 패키징했습니다. Windows판은 자동·수동 슬롯을 로컬 JSON 파일에 저장합니다.','bc52ed7']]}
  ];
  const sections={operations:'운영 기록',updates:'업데이트 기록',development:'개발 기록'};
  function view(state,section){
    if(!Object.hasOwn(sections,section))section='operations';
    const controls='<div class="record-controls" role="group" aria-label="기록 종류">'+Object.entries(sections).map(([id,name])=>
      '<button class="tab '+(section===id?'active':'')+'" data-act="recordSection" data-id="'+id+'" aria-pressed="'+(section===id)+'">'+name+'</button>').join('')+'</div>';
    if(section==='operations')return controls+UI.logs(state.logs);
    return controls+history.map((r,i)=>{
      const body=section==='updates'?'<ul>'+r.updates.map(note=>'<li>'+note+'</li>').join('')+'</ul>':
        r.development.map(([title,note,commit])=>'<section><h4>'+title+(commit?' <code>'+commit+'</code>':'')+'</h4><p>'+note+'</p></section>').join('');
      return '<details class="release-record" '+(i===0?'open':'')+'><summary><span>v'+r.version+' · '+r.title+'</span><time datetime="'+r.date+'">'+r.date+'</time></summary><div>'+body+'</div></details>';
    }).join('');
  }
  return {view};
})();
