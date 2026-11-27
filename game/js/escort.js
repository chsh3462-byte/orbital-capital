'use strict';
window.Escort=(()=>{
  const hulls=['연안 화물정','순항 화물정','원정 화물정','대형 특송정'];
  const guards=['무호위','항만 경비원','항로 호위대','수석 경호단'];
  const wages=[0,120,300,610];
  const initial=()=>({roster:[0,0,0,0],raids:0,wins:0,lost:0});
  const risk=grade=>[8,17,29,42][grade-1];
  const chance=guard=>[18,43,68,91][guard];
  const payroll=s=>s.security.roster.reduce((sum,n,i)=>sum+n*wages[i],0);
  const spare=(s,g)=>s.security.roster[g]-s.exchange.routes.filter(r=>r.guard===g).length;
  function hire(s,g){
    if(!Number.isInteger(g)||g<1||g>3||s.security.roster[g]>=12)throw Error('이 등급의 경호 인력 정원이 찼습니다.');
    s.security.roster[g]++;
    Economy.note(s,'fleet',guards[g]+' 고용','일급 '+wages[g]+' CR');
  }
  function release(s,g){
    if(!Number.isInteger(g)||g<1||g>3||spare(s,g)<1)throw Error('항로에 배정되지 않은 경호 인력만 해약할 수 있습니다.');
    s.security.roster[g]--;
  }
  function assign(s,r,g){
    if(!r||!Number.isInteger(g)||g<0||g>3||(g&&r.guard!==g&&spare(s,g)<1))throw Error('배정할 수 있는 경호 인력이 없습니다.');
    if(r.cargo)throw Error('현재 화물을 인도한 뒤 경호를 교대할 수 있습니다.');
    r.guard=g;
  }
  function roll(s){
    s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;
    return s.seed/4294967296;
  }
  function encounter(s,r,random=()=>roll(s)){
    if(random()*100>=risk(r.grade))return 0;
    s.security.raids++;
    const won=random()*100<chance(r.guard);
    if(won)s.security.wins++;
    const lost=won?0:25+Math.floor(random()*26);
    Economy.note(s,'fleet',(won?'습격 방어 성공':'수송 화물 피해')+' · '+Commerce.port(r.to).name,hulls[r.grade-1]+' / '+guards[r.guard]+(won?' · 전량 보전':' · 품목별 '+lost+'% 손실(올림)'));
    return lost;
  }
  function valid(s){
    const h=s.security,n=v=>Number.isSafeInteger(v)&&v>=0;
    return h&&Array.isArray(h.roster)&&h.roster.length===4&&h.roster[0]===0&&h.roster.every(x=>n(x)&&x<=12)
      &&[h.raids,h.wins,h.lost].every(n)&&h.wins<=h.raids&&[1,2,3].every(g=>spare(s,g)>=0);
  }
  function view(s){
    const U=UI,h=s.security;
    const rows=[1,2,3].map(g=>[guards[g],chance(g)+'%',U.money(wages[g]),spare(s,g)+' / '+h.roster[g],
      U.btn('고용','guardHire',g,h.roster[g]>=12)+U.btn('해약','guardRelease',g,spare(s,g)<1,false)]);
    return U.panel('항로 경호 인력','<p class="padded hint">경호조 한 팀이 지정 항로 한 곳을 맡습니다. 고용 후 항로에서 배정하세요. 대기 인력도 일급을 받습니다. 누적 습격 '+h.raids+'회 · 방어 성공 '+h.wins+'회 · 유실 '+h.lost+'상자</p>'+U.table(['경호 등급','방어 성공률','일급','대기 / 고용','관리'],rows));
  }
  return {hulls,guards,initial,payroll,risk,chance,spare,hire,release,assign,encounter,valid,view};
})();
