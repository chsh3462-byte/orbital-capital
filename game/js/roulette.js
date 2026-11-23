'use strict';
window.Roulette=(()=>{
  const pockets=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  const red=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  const chip=500, turn=Math.PI*2;
  const color=n=>n===0?'green':red.has(n)?'red':'black';
  const labels={green:'녹색',red:'적색',black:'흑색'};
  const number=n=>Number.isInteger(n)&&n>=0&&n<=36;
  const choice=p=>p==='red'||p==='black'||number(p);
  const payout=(n,p)=>n===p?chip*36:color(n)===p?chip*2:0;
  const initial=()=>({rounds:0,paidOut:0,last:null});
  function valid(w){
    if(!w||!Number.isSafeInteger(w.rounds)||w.rounds<0||!Number.isSafeInteger(w.paidOut)||w.paidOut<0||w.paidOut>w.rounds*chip*36)return false;
    if(!w.rounds)return w.last===null&&w.paidOut===0;
    const r=w.last;
    return !!r&&number(r.number)&&choice(r.pick)&&r.payout===payout(r.number,r.pick)&&w.paidOut>=r.payout;
  }
  function spin(s,pick){
    if(!choice(pick))throw Error('적색·흑색 또는 한 숫자에 칩을 놓으세요.');
    Economy.charge(s,chip);
    const n=Math.floor(Math.random()*37),pay=payout(n,pick),w=s.leisure.wheel;
    w.rounds++;w.paidOut+=pay;w.last={number:n,pick,payout:pay};s.cash+=pay;
    Economy.note(s,'leisure','황혼선 룰렛 · '+n+' '+labels[color(n)],(pay>=chip?'+':'−')+Math.abs(pay-chip).toLocaleString('ko-KR')+' CR');
    return n;
  }
  const pickName=p=>number(p)?p+'번':labels[p];
  function table(s,selected,spinning){
    const w=s.leisure.wheel,r=w.last,U=UI;
    function square(label,p,css){
      return '<button type="button" class="wheel-chip '+css+(p===selected?' chosen':'')+'" data-act="wheelPick" data-id="'+p+'" aria-pressed="'+(p===selected)+'" '+(spinning?'disabled':'')+'>'+label+'</button>';
    }
    const nums=[3,2,1].map(start=>Array.from({length:12},(_,i)=>start+i*3).map(n=>square(n,n,color(n))).join('')).join('');
    const status=spinning?'상아색 공이 원판 위를 돌고 있습니다.':r?r.number+' '+labels[color(r.number)]+' · '+pickName(r.pick)+'에 건 판 · '+(r.payout?'지급 '+U.money(r.payout):'−500 CR'):'크루피에가 칩을 기다립니다.';
    const old=s.leisure.rounds?' · 이전 주사위 기록 '+s.leisure.rounds+'판':'';
    return '<div class="roulette-layout"><canvas class="roulette-wheel" width="316" height="316" aria-label="37칸 목제 룰렛 원판"></canvas><div class="wheel-story"><small>황혼선 · 일등 살롱</small><h3>단일 제로 룰렛</h3><p>룰렛 장인이 마호가니를 깎아 만든 원판입니다. 황동 손잡이를 돌리면 크루피에가 반대 방향으로 공을 흘려보냅니다.</p><p>한 판 500 CR. 색 적중은 1,000 CR, 숫자 적중은 18,000 CR를 받습니다. 0은 녹색이며 지급액에는 판돈이 포함됩니다.</p></div></div><p class="wheel-status" role="status">'+status+'</p><div class="felt"><div class="wheel-grid">'+square('0',0,'green zero')+nums+'</div><div class="outside-bets">'+square('◆ 적색','red','red')+square('◇ 흑색','black','black')+'</div></div><div class="wheel-controls"><div><b>놓은 칩 · '+pickName(selected)+'</b><small>가용 '+U.money(s.cash)+' · 룰렛 '+w.rounds+'판'+old+'</small></div>'+U.btn(spinning?'회전 중':'500 CR · 원판 돌리기','wheelSpin','',spinning||s.cash<chip)+'</div>';
  }
  function paint(canvas,n,p){
    const ctx=canvas.getContext('2d'),c=158,step=turn/37;
    ctx.clearRect(0,0,316,316);ctx.save();ctx.translate(c,c);
    function circle(radius,fill){ctx.beginPath();ctx.arc(0,0,radius,0,turn);ctx.fillStyle=fill;ctx.fill();}
    const wood=ctx.createRadialGradient(-30,-45,10,0,0,153);
    wood.addColorStop(0,'#ba8354');wood.addColorStop(.55,'#7e422e');wood.addColorStop(1,'#45261f');
    circle(153,'#ab8453');circle(150,wood);
    [145,141,136].forEach((r,i)=>{ctx.strokeStyle=['#a7744b','#71442d','#d2a671'][i];ctx.lineWidth=i===2?3:1;ctx.beginPath();ctx.arc(0,0,r,0,turn);ctx.stroke();});
    const final=-pockets.indexOf(n)*step-Math.PI/2,angle=final-turn*2*(1-p)**3;
    ctx.save();ctx.rotate(angle);
    pockets.forEach((v,i)=>{
      const a=i*step;
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,130,a-step/2,a+step/2);ctx.fillStyle={red:'#a34a3b',black:'#242526',green:'#306447'}[color(v)];ctx.fill();
      ctx.strokeStyle='#c2a778';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(Math.cos(a-step/2)*99,Math.sin(a-step/2)*99);ctx.lineTo(Math.cos(a-step/2)*130,Math.sin(a-step/2)*130);ctx.stroke();
      ctx.save();ctx.rotate(a);ctx.translate(117,0);ctx.rotate(Math.PI/2);ctx.fillStyle='#ffedcc';ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(v,0,0);ctx.restore();
    });
    circle(96,'#c49a62');circle(93,wood);circle(62,'#70452e');circle(59,wood);
    ctx.fillStyle='#d5b47a';ctx.fillRect(-43,-2,86,4);ctx.fillRect(-2,-43,4,86);
    for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);ctx.translate(40,0);circle(5,'#e0bd7b');ctx.restore();}
    circle(15,'#67442b');circle(11,'#d2ac71');circle(5,'#f3d79a');ctx.restore();
    const theta=-Math.PI/2+turn*3*(1-p)**2,rad=104+29*(1-p);
    ctx.translate(Math.cos(theta)*rad,Math.sin(theta)*rad);circle(5,'#a49377');ctx.translate(-1,-1);circle(4,'#fff3d5');ctx.restore();
  }
  return {initial,valid,spin,table,paint,payout};
})();
