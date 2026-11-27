'use strict';
window.DockStory = (() => {
  const cast = {
    harbor: ['네레이드 항만 방송', '접안 주파수'],
    clerk: ['문해진', '부두 야간 관리자'],
    pilot: ['이안', '화물선 선장'],
    aura: ['아우라 · AURA', '오르빗 캐피탈 전속 비서']
  };
  // Optional questions return to the same handover. The chosen reply is saved like any other line.
  const pages = {
    arrival: {actor:'harbor', place:'네레이드 접근 궤도', item:'야간 입항표', field:'도착지', value:'네레이드 · 3번 부두', line:'은하 외곽, 아스트라 성계 섹터 07에 진입했습니다. 네레이드에 내리실 분은 짐을 챙겨 주세요. 라이라행 정기선은 오늘도 결항입니다.', next:[['3번 부두에 내린다','counter']]},
    counter: {actor:'clerk', place:'3번 부두 · 야간 창구', item:'인계 봉투', field:'수취인', value:'오르빗 캐피탈 후임 대표', line:'잠깐만요, 그 상자는 저울에 그대로 두세요. …아, 짐 맡기러 온 분이 아니구나. 오르빗에서 오셨죠? 문해진이에요. 야간엔 제가 부두를 맡아요. 오는 길에 라이라행 방송 들으셨어요?', next:[['네. 오늘도 결항이라던데요.','withdrawal'],['네. 이 짐도 라이라로 가나요?','waybill']]},
    withdrawal: {actor:'clerk', place:'3번 부두 · 야간 창구', item:'노선 변경 통지', field:'변방 정기편', value:'운항 철수', line:'벌써 사흘째예요. 큰 회사가 배를 관문 안쪽으로 돌렸거든요. 그런데 방송은 아직도 ‘오늘’이라고 하네요. 저기 상자 좀 보실래요? 첫날 아침에 들어온 짐이에요.', next:[['라이라에서 기다리는 사람이 있어요?','waybill']]},
    waybill: {actor:'clerk', place:'3번 부두 · 계량대', item:'반송 운송장', field:'발송 / 수령', value:'네레이드 → 라이라', line:'라이라 선원 식당에서 주문한 찻잎이에요. 어젯밤엔 주인장이 직접 전화해서, 늦어도 좋으니 보낼 수 있는지만 알려 달래요. 아, 마침 선장이 왔네요. 이안 씨, 새 대표님 오셨어요.', next:[['이안 씨, 이 짐 실을 자리 있어요?','crate']]},
    crate: {actor:'pilot', place:'접수창구 · 계량대 앞', item:'화주 보관표', field:'화물', value:'해무 찻잎 · 건조 보관', line:'자리는 있어요. 문제는 돌아올 때죠. 빈 배로 두 번 다녀오면 기름값부터 모자라거든요. 일단 몇 상자만 실어 볼까요? 식당에 도착할 때까진 제가 안 젖게 맡을게요.', next:[['좋아요. 첫 운송은 우리 이름으로 받죠.','stamp'],['돌아오는 길엔 뭘 실을 수 있죠?','returnCargo']]},
    returnCargo: {actor:'pilot', place:'접수창구 · 계량대 앞', item:'선장의 수첩', field:'라이라 특산품', value:'별고리 광학유리', line:'라이라 공방에 광학유리가 있어요. 근데 그걸 네레이드에서 얼마에 사 줄지는 저도 몰라요. 우리 비서한테 물어보죠. 저보다 숫자에 밝은 친구예요.', next:[['그럼 가는 짐부터 접수할게요.','stamp']]},
    stamp: {actor:'clerk', place:'3번 부두 · 서명대', item:'접수된 운송장', field:'수탁 회사', value:'오르빗 캐피탈', line:'여기 한 부는 이안 씨, 한 부는 대표님 거예요. 도장이 얼마 만에 제대로 찍혔는지 모르겠네. 제가 식당에 전화할게요. 대표님은 창구 열쇠 받아 가세요. 비서 단말기도 저 안에 있어요.', next:[['감사해요. 장부는 누가 인계해 주나요?','funding']]},
    funding: {actor:'clerk', place:'3번 부두 · 서명대', item:'창업 자금 인계서', field:'개업 잔액', value:'100,000 CR', line:'장부는 아우라가 맡아요. 여기 첫 줄 보이죠? 십만 크레딧. 기름값도 부두 사용료도 여기서 나가요. 찻잎을 얼마에 사야 남는지는 저보다 아우라가 잘 알 거예요. 불러 볼까요?', next:[['열쇠를 돌려 단말기를 켠다.','awake']]},
    awake: {actor:'aura', place:'항만 창구 · 비서 단말기', item:'단말기 인계 기록', field:'접속자', value:'AURA · 대표 비서', line:'…대표님? 들리세요? 아우라예요. 방금 해진 씨가 라이라 식당하고 통화하는 소리를 들었어요. 이안 씨 배에 자리가 났다면서요? 그럼 제가 찻잎 시세부터 띄울게요.', next:[['부탁해요, 아우라. 첫 배는 같이 보내죠.','chart']]},
    chart: {actor:'aura', place:'항만 창구 · 항로 지도', item:'첫 운송 메모', field:'시세 확인', value:'네레이드 매입가 / 라이라 매각가', line:'이안 씨가 기다리는 동안 네레이드를 눌러 찻잎 값을 봐요. 그다음 제가 라이라행 운송장을 열어 드릴게요. 얼마를 벌었는지는 배가 돌아오면 둘이 장부에서 확인해요.', next:[['관제실로 간다','done']]}
  };
  function valid(page){return page===undefined||page==='done'||Object.hasOwn(pages,page);}
  function render(id){
    const p=pages[id], [speaker,role]=cast[p.actor];
    const choices=p.next.map(([label,to],i)=>UI.btn(label,'dockNext',to,false,i===0)).join('');
    const stamp=['stamp','funding','awake','chart'].includes(id)?'<i class="dock-ink">접수</i>':'';
    return '<div class="dock-top"><span>ORBITAL CAPITAL</span><button class="dock-skip" data-act="dockSkip">장면 건너뛰기 ›</button></div>'+
      '<div class="dock-stage"><div class="dock-art art-'+p.actor+'" role="img" aria-label="'+p.place+' · '+speaker+'"></div>'+
      '<aside class="dock-file"><small>SECTOR 07 / DOCK 03</small><h2 id="dock-title">변방의 생존자</h2><p>'+p.place+'</p><div class="dock-ticket"><small>'+p.field+'</small><strong>'+p.value+'</strong><span>'+p.item+'</span>'+stamp+'</div></aside></div>'+
      '<section class="dock-speech"><header><b>'+speaker+'</b><span>'+role+'</span></header><p aria-live="polite"><span class="dock-reader">'+p.line+'</span><span aria-hidden="true" class="dock-spoken"></span></p></section>'+
      '<div class="dock-choices">'+choices+'</div>';
  }
  return {pages,valid,render};
})();
