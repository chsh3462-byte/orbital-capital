'use strict';
window.DockStory = (() => {
  const cast = {
    harbor: ['네레이드 항만 방송', '접안 주파수'],
    clerk: ['문해진', '야간 접수원'],
    pilot: ['이안', '화물선 선장'],
    aura: ['아우라 · AURA', '오르빗 캐피탈 전속 비서']
  };
  // Optional questions return to the same handover. The chosen reply is saved like any other line.
  const pages = {
    arrival: {actor:'harbor', place:'네레이드 접근 궤도', item:'야간 입항표', field:'도착지', value:'네레이드 · 3번 부두', line:'은하 외곽, 아스트라 성계 섹터 07에 진입했습니다. 네레이드에 내리실 분은 짐을 챙겨 주세요. 라이라행 정기선은 오늘도 결항입니다.', next:[['3번 부두에 내린다','counter']]},
    counter: {actor:'clerk', place:'3번 부두 · 화물 접수창구', item:'미수령 봉투', field:'수취인', value:'오르빗 캐피탈 후임 대표', line:'오르빗에서 왔죠? 장부에 이름은 바뀌었는데 창구 열쇠를 아무도 안 찾아가서. 전임자가 봉투에 딱 두 가지 넣어 뒀어요. 열쇠하고, 반송된 운송장.', next:[['운송장을 펼친다','waybill'],['정기선은 왜 안 오죠?','withdrawal']]},
    withdrawal: {actor:'clerk', place:'3번 부두 · 화물 접수창구', item:'노선 변경 통지', field:'변방 정기편', value:'운항 철수', line:'큰 회사들은 관문 안쪽으로 갔어요. 빈 배로 돌아오는 날이 많다면서. 그 뒤로 여기선 배 시간 물어보는 사람한테 먼저 짐이 몇 상자인지 물어요.', next:[['반송된 운송장을 본다','waybill']]},
    waybill: {actor:'clerk', place:'3번 부두 · 화물 접수창구', item:'반송 운송장', field:'발송 / 수령', value:'네레이드 → 라이라', line:'변방 세 항구를 손가락으로 짚어 봐요. 여기 네레이드에서 찻잎을 내고, 라이라는 여객선 식당에 그걸 팔아요. 건너편 베이라에서 오는 실로는 우리 돛감을 짜고요. 지도에선 짧은 선 셋인데, 하나 끊기면 다들 알아요.', next:[['상자를 들고 온 사람을 부른다','crate']]},
    crate: {actor:'pilot', place:'접수창구 · 계량대 앞', item:'화주 보관표', field:'화물', value:'해무 찻잎 · 건조 보관', line:'이안입니다. 아침마다 라이라 식당에서 몇 상자 실었냐고 무전이 와요. 어제까진 대답을 못 했는데. 오늘은 대표님 이름으로 운송장을 써도 될까요?', next:[['내 이름으로 접수 도장을 찍는다','stamp'],['돌아오는 배에는 뭘 싣죠?','returnCargo']]},
    returnCargo: {actor:'pilot', place:'접수창구 · 계량대 앞', item:'선장의 수첩', field:'라이라 특산품', value:'별고리 광학유리', line:'라이라에선 광학유리가 나요. 근데 여기서 사 줄 사람이 없으면 돌아올 때 짐만 무거워져요. 받는 쪽 시세부터 보는 게 제 버릇입니다.', next:[['운송장에 접수 도장을 찍는다','stamp']]},
    stamp: {actor:'clerk', place:'3번 부두 · 화물 접수창구', item:'접수된 운송장', field:'수탁 회사', value:'오르빗 캐피탈', line:'됐어요. 이제 창구는 당신 거예요. 아, 오른쪽에 저 낡은 영사기 전원 좀 눌러 봐요. 전임자가 떠난 뒤로도 매일 아침 혼자 출근하던 친구라.', next:[['창구 영사기의 전원을 켠다','awake']]},
    awake: {actor:'aura', place:'항만 창구 · 비서 단말기', item:'단말기 인계 기록', field:'접속자', value:'AURA · 대표 비서', line:'…제 목소리 들리세요? 아우라입니다. 선장님은 늘 출항부터 누르셔서, 저는 시세표를 먼저 띄우는 버릇이 생겼어요. 대표님과는 순서를 맞춰 보고 싶네요.', next:[['첫 운송을 같이 준비하자','chart']]},
    chart: {actor:'aura', place:'항만 창구 · 항로 지도', item:'첫 운송 메모', field:'시세 확인', value:'네레이드 매입가 / 라이라 매각가', line:'이안 씨가 기다리는 동안 네레이드를 눌러 찻잎 값을 봐요. 그다음 제가 라이라행 운송장을 열어 드릴게요. 얼마를 벌었는지는 배가 돌아오면 둘이 장부에서 확인해요.', next:[['관제실로 간다','done']]}
  };
  function valid(page){return page===undefined||page==='done'||Object.hasOwn(pages,page);}
  function render(id){
    const p=pages[id], [speaker,role]=cast[p.actor];
    const choices=p.next.map(([label,to],i)=>UI.btn(label,'dockNext',to,false,i===0)).join('');
    const stamp=['stamp','awake','chart'].includes(id)?'<i class="dock-ink">접수</i>':'';
    return '<div class="dock-top"><span>ORBITAL CAPITAL</span><button class="dock-skip" data-act="dockSkip">장면 건너뛰기 ›</button></div>'+
      '<div class="dock-stage"><div class="dock-art art-'+p.actor+'" role="img" aria-label="'+p.place+' · '+speaker+'"></div>'+
      '<aside class="dock-file"><small>SECTOR 07 / DOCK 03</small><h2 id="dock-title">변방의 생존자</h2><p>'+p.place+'</p><div class="dock-ticket"><small>'+p.field+'</small><strong>'+p.value+'</strong><span>'+p.item+'</span>'+stamp+'</div></aside></div>'+
      '<section class="dock-speech"><header><b>'+speaker+'</b><span>'+role+'</span></header><p aria-live="polite"><span class="dock-reader">'+p.line+'</span><span aria-hidden="true" class="dock-spoken"></span></p></section>'+
      '<div class="dock-choices">'+choices+'</div>';
  }
  return {pages,valid,render};
})();
