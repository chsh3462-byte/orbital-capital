'use strict';
window.Staff = (() => {
  const styles = {field:'현장형', method:'꼼꼼형', general:'균형형'};
  const names = ['서린','태오','지안','하람','주원','연우','윤슬','해솔','보민','다온','은재','시온'];
  const integer=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
  const initial=()=>({team:[],recent:[],policy:{style:'field',skill:60,care:50,wage:200,target:3},open:false,serial:0});
  function validPolicy(p){
    return p&&Object.hasOwn(styles,p.style)&&integer(p.skill,0,100)&&integer(p.care,0,100)&&integer(p.wage,1,500)&&integer(p.target,1,24);
  }
  function recruit(s,policy){
    if(!validPolicy(policy))throw Error('점수는 0~100, 일급 상한은 1~500 CR, 목표 인원은 1~24명으로 입력하세요.');
    s.hr.policy={...policy}; s.hr.open=s.hr.team.length<policy.target;
    Economy.note(s,'system','채용 기준 적용',styles[policy.style]+' · 목표 '+policy.target+'명');
  }
  function roll(day,serial,index){
    let v=Math.imul(day,73856093)^Math.imul(serial,19349663)^Math.imul(index+1,83492791);
    v=Math.imul(v^(v>>>16),0x45d9f3b); return ((v^(v>>>16))>>>0)%100;
  }
  function screen(s){
    const h=s.hr,p=h.policy;
    if(!h.open || h.team.length>=p.target)return;
    const id=++h.serial, style=p.style;
    const skill=Math.min(100,33+roll(s.day,id,0)%51+(style==='field'?17:style==='general'?9:0));
    const care=Math.min(100,33+roll(s.day,id,1)%51+(style==='method'?17:style==='general'?9:0));
    const wage=55+Math.round((skill+care)*.55)+roll(s.day,id,2)%40;
    const applicant={id,style,skill,care,wage,name:names[roll(s.day,id,3)%names.length]};
    const reasons=[];
    if(skill<p.skill)reasons.push('실무 미달');
    if(care<p.care)reasons.push('정확성 미달');
    if(wage>p.wage)reasons.push('희망 일급 초과');
    const hired=!reasons.length;
    if(hired)h.team.push(applicant);
    h.recent.unshift({...applicant,day:s.day,result:hired?'합격':reasons.join(' · ')});
    h.recent=h.recent.slice(0,8);
    if(hired)Economy.note(s,'fleet',applicant.name+' 채용',styles[style]+' · 일급 '+wage+' CR');
    if(h.team.length>=p.target)h.open=false;
  }
  const payroll=s=>s.hr.team.reduce((n,w)=>n+w.wage,0);
  const capacity=s=>s.hr.team.reduce((n,w)=>n+1+Math.floor((w.skill+w.care)/70),0);
  function valid(h){
    const person=w=>integer(w.id,1,h.serial)&&Object.hasOwn(styles,w.style)&&names.includes(w.name)&&integer(w.skill,0,100)&&integer(w.care,0,100)&&integer(w.wage,1,500);
    return h&&Number.isSafeInteger(h.serial)&&h.serial>=0&&typeof h.open==='boolean'&&validPolicy(h.policy)&&Array.isArray(h.team)&&h.team.length<=24
      &&new Set(h.team.map(w=>w.id)).size===h.team.length&&h.team.every(person)&&(!h.open||h.team.length<h.policy.target)
      &&Array.isArray(h.recent)&&h.recent.length<=8&&h.recent.every(a=>person(a)&&Number.isSafeInteger(a.day)&&a.day>=1&&typeof a.result==='string'&&a.result.length<64);
  }
  return {styles,initial,valid,recruit,screen,capacity,payroll};
})();
