'use strict';
window.Freight = (() => {
  const jobs = [
    {id:'tea', port:'nereid', cargo:'청무차 첫물', client:'네레이드 차 농원', to:'라이라', days:2, fee:6000, art:'luxTea', note:'라이라 찻집의 개장에 맞춰 첫 수확분을 실어 주세요.'},
    {id:'clock', port:'thalos', cargo:'선실시계 부품', client:'탈로스 시계 골목', to:'베이라', days:3, fee:10400, art:'luxClock', note:'도크가 다시 열리는 날, 수리한 시계추를 객선마다 달기로 했습니다.'},
    {id:'scent', port:'eir', cargo:'빙화 향료 원액', client:'에이르 조향소', to:'오리온', days:5, fee:19700, art:'luxScent', note:'봉인한 원액을 오리온 향료상의 겨울 시향회로 보내 주세요.'}
  ];
  const find = id => jobs.find(job => job.id === id);
  const duration = (job, warp) => Math.max(1, job.days - warp);
  function valid(order, day) {
    if (order === null) return true;
    const job = order && find(order.id);
    return !!job && Number.isSafeInteger(order.start) && order.start >= 1 && order.start <= day &&
      Number.isInteger(order.warp) && order.warp >= 0 && order.warp <= 3 &&
      due(order) >= day;
  }
  function due(order) {
    return order.start + duration(find(order.id), order.warp) - 1;
  }
  function accept(s, id) {
    const job = find(id);
    if (!job || s.freight || Commerce.freeShips(s)<1) throw Error('현재 수주할 수 없는 계약입니다.');
    Campaign.requireAccess(s,job.port);
    s.freight = {id, start:s.day, warp:s.tech.warp};
    Economy.note(s,'fleet','운송 계약 수주 · '+job.cargo,job.client+' → '+job.to+' · D'+due(s.freight)+' 마감');
  }
  function payment(s) {
    return s.freight && due(s.freight) === s.day ? find(s.freight.id).fee : 0;
  }
  function complete(s) {
    const job = find(s.freight.id);
    Economy.note(s,'finance','계약 운임 입금 · '+job.cargo,job.to+' 인도 · +'+job.fee.toLocaleString('ko-KR')+' CR');
    if(s.story)s.story.deliveries++;
    s.freight = null;
  }
  function board(s) {
    const U = UI, order = s.freight;
    const fleet = Economy.fleet(s);
    let status = U.kv('정기편 운항', Commerce.freeShips(s)+' / '+fleet+'척');
    if (order) {
      const job = find(order.id);
      status += U.kv('운송 중',job.cargo+' → '+job.to) +
        U.kv('도착 및 입금',U.date(due(order))+' 결산 · '+U.money(job.fee));
    }
    const cards = jobs.filter(job=>Campaign.allowed(s,job.port)).map(job => {
      const active = order && order.id === job.id;
      const days = duration(job,active ? order.warp : s.tech.warp);
      return '<article class="tile"><div class="tile-art">'+PixelArt.thumb(job.art,48)+'</div><h3>'+job.cargo+'</h3><p class="desc">'+job.note+'</p>'+
        U.kv('의뢰인',job.client)+U.kv('인도처',job.to)+U.kv('운송 기간',days+'회 결산')+U.kv('계약 운임',U.money(job.fee))+
        U.btn(active?'운송 중':order?'배선 대기':'계약 수주','freightAccept',job.id,!!order||Commerce.freeShips(s)<1)+'</article>';
    });
    return '<p class="screen-intro">계약을 맡으면 정기편 화물선 한 척을 배정합니다. 워프 연구는 운송 기간을 줄이며, 인도일 결산 때 운임 전액이 들어오고 배가 복귀합니다.</p><section class="panel wide-panel"><div class="panel-head"><h2><i class="stripe"></i>배선 현황</h2></div><div class="finance-bars">'+status+'</div></section><div class="cards">'+cards.join('')+'</div>';
  }
  return {accept,valid,payment,complete,board};
})();
