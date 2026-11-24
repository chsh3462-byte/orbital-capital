'use strict';
window.UI=(()=>{
  const D=GameData,E=Economy,P=PixelArt;
  const paths={
    grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    chart:'<path d="M3 3v17h18M6 15l5-6 4 3 6-8"/>',wallet:'<path d="M3 6h17v14H3zM3 6l13-4v4M15 11h6v5h-6z"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M15 8h-5v8h5M7 11h6"/>',
    pie:'<path d="M10 3a9 9 0 1 0 11 11H10zM14 2v8h8a9 9 0 0 0-8-8z"/>',
    star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
    rocket:'<path d="M8 16C9 9 14 5 21 3c0 7-4 13-11 15zM8 10l-5 2 1 4 4-1m5 3-1 4 4-1 2-6M6 18l-3 3"/><circle cx="15" cy="9" r="2"/>',
    planet:'<circle cx="12" cy="12" r="7"/><ellipse cx="12" cy="12" rx="12" ry="3" transform="rotate(-28 12 12)"/>',
    ad:'<path d="m3 9 13-5v15L3 14zM6 15l2 6h3l-2-5M20 8l2-2m-2 6h3m-3 4 2 2"/>',
    finance:'<path d="M5 3h14v18H5zM8 7h8m-8 4h8m-8 4h3m2 0h3"/>',
    save:'<path d="M3 3h15l3 3v15H3zM7 3v6h9V3M7 21v-8h10v8"/>',
    folder:'<path d="M3 6h7l2 2h9v11H3z"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',
    pause:'<path d="M8 5v14m8-14v14" stroke-width="3"/>',play:'<path d="m6 3 14 9-14 9z"/>',
    route:'<path d="M5 17c0-10 14 0 14-10"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
    nova:'<path d="m12 2 2 7 7-2-5 6 3 7-7-4-7 4 3-7-5-6 7 2z"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    box:'<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5m-9 5v10"/>',
    cpu:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4M9 9h6v6H9z"/>',
    network:'<path d="M12 6v5M5 16v-5h14v5"/><rect x="9" y="2" width="6" height="4"/><rect x="2" y="16" width="6" height="5"/><rect x="16" y="16" width="6" height="5"/>',
    shield:'<path d="m12 2 9 4v5q0 7-9 11-9-4-9-11V6zM8 12l3 3 5-6"/>'
  };
  const icon=k=>'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+(paths[k]||paths.grid)+'</svg>';
  const nav={dashboard:['경영 관제실','COMMAND CENTER','grid'],freight:['항만 운송 계약','FREIGHT CONTRACTS','box'],finance:['재무제표','FINANCIAL REPORTS','finance'],stocks:['증권 · 인수합병','GALACTIC EXCHANGE','chart'],research:['함대 연구소','FLEET RESEARCH','rocket'],estate:['행성 개발','PLANETARY ESTATES','planet'],ads:['마케팅','MARKETING','ad'],port:['자오선 자유항','MERIDIAN FREEPORT','planet'],lounge:['개인 라운지','PRIVATE LOUNGE','star']};
  const fmt=n=>Math.round(n).toLocaleString('ko-KR'),money=n=>fmt(n)+' CR',esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function date(day){const d=new Date(Date.UTC(2186,0,day));return [d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate()].map((n,i)=>i?String(n).padStart(2,'0'):n).join('.');}
  function spark(values,color){
    const lo=Math.min(...values),range=Math.max(...values)-lo;
    const pts=values.map((v,i)=>[+(i*100/Math.max(1,values.length-1)).toFixed(1),+(range?24-(v-lo)*19/range:15).toFixed(1)].join(',')).join(' ');
    return '<svg class="mini" viewBox="0 0 100 29" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,29 '+pts+' 100,29" fill="'+color+'" opacity=".07"/><polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>';
  }
  const kv=(label,val)=>'<div class="kv"><span>'+label+'</span><b>'+val+'</b></div>';
  const btn=(name,act,id='',disabled=false,primary=true)=>'<button class="btn '+(primary?'primary':'')+'" data-act="'+act+'" data-id="'+id+'" '+(disabled?'disabled':'')+'>'+name+'</button>';
  const tag=(s,neutral=false)=>'<span class="tag'+(neutral?' neutral':'')+'">'+s+'</span>';
  const ownerName=p=>p.owner==='player'?'자사 거점':p.owner===null?'미개척':p.owner+' 소유';
  const thumb=P.thumb;
  function metrics(s){
    const last=s.history.at(-1);
    const data=[
      ['가용 자금','wallet',fmt(s.cash),'CR','#73e4c7','보유 현금',s.history.map(r=>r.cash)],
      ['일일 순이익','chart',(last.net>=0?'+':'')+fmt(last.net),'CR','#95cea0','최근 결산',s.history.map(r=>r.net)],
      ['시장 점유율','pie',E.weights(s).player.toFixed(1),'%','#82b8f6','은하 상권',s.history.map(r=>r.share)],
      ['브랜드 평판','star',fmt(E.rep(s)),'/ 100','#e7b778','캠페인 '+s.ads.length+'건',s.history.map(r=>r.rep)]
    ];
    return data.map(([label,ico,v,u,c,sub,a],i)=>'<article class="metric" style="--accent:'+c+'"><div class="metric-label">'+icon(ico)+label+'</div><div class="number">'+v+'<small>'+u+'</small></div><div class="k-sub">'+(i===0?'<strong>●</strong> ':i===1?(last.net<0?'<strong class="neg">▼</strong> ':'<strong>▲</strong> '):'')+sub+'</div>'+spark(a.slice(-16),c)+'</article>').join('');
  }
  function change(r){return (r.price-r.prev)/r.prev*100;}
  function tickers(s){
    return s.markets.map(r=>{
      const d=D.rivals.find(d=>d.id===r.id),v=change(r),color=v<0?'#ef9c96':'#71d9b8';
      return '<button class="ticker" data-act="stock" data-id="'+r.id+'"><span class="emblem" style="--c:'+d.color+'">'+icon(d.icon)+'</span><div><b class="ticker-id">'+r.id+'</b><small>'+d.name+'</small></div>'+spark(r.history.slice(-20),color)+'<div class="ticker-price">'+fmt(r.price)+'<small class="'+(v<0?'neg':'pos')+'">'+(r.acquired?'상장 폐지':(v<0?'−':'+')+Math.abs(v).toFixed(2)+'%')+'</small></div></button>';
    }).join('');
  }
  function fleet(s){const k='ship'+E.tier(s);return '<div class="fleet-art">'+thumb(k,48)+thumb(k,48)+thumb(k,48)+'</div><div class="fleet-row"><span>정기편 <b>'+(E.fleet(s)-(s.freight?1:0))+'척'+(s.freight?' · 계약 1척':'')+'</b></span><span>선체 <b>MK.'+['I','II','III'][E.tier(s)-1]+'</b></span></div>';}
  const logColors={system:'#7cb6f3',fleet:'#8dbef2',finance:'#73e4c7',research:'#ad9bf0',event:'#efad76',market:'#e9bd76',land:'#9fd3a2',marketing:'#cc91bf'};
  function logs(rows){return rows.map(r=>'<div class="log-row"><time>D'+String(r.day).padStart(3,'0')+'</time><i class="event-dot" style="--c:'+(logColors[r.type]||'#73e4c7')+'"></i><strong>'+esc(r.title)+'</strong><span class="detail">'+esc(r.detail)+'</span></div>').join('');}
  function bars(s){
    const r=s.history.at(-1);
    return '<div class="finance-bars">'+kv('총수익',money(r.revenue))+'<div class="stack-bar"><i style="background:#73d7b7;width:'+100*r.revenue/(r.revenue+r.cost)+'%"></i><i style="background:#dfae7b;flex:1"></i></div>'+kv('총비용',money(r.cost))+kv('순이익','<span class="'+(r.net<0?'neg':'pos')+'">'+money(r.net)+'</span>')+'</div>';
  }
  function panel(title,body){return '<section class="panel wide-panel"><div class="panel-head"><h2><i class="stripe"></i>'+title+'</h2></div>'+body+'</section>';}
  function table(head,rows){return '<div class="table-wrap"><table><thead><tr>'+head.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
  function finance(s,period){
    const f=E.forecast(s),quarter=period==='quarter',from=(Math.ceil(s.day/90)-1)*90+1,part=s.history.filter(r=>r.day>=from);
    const keys=['revenue','cost','net','trade','contract','facility','dividend','fleetCost','landCost','risk','marketing','research'];
    const partial={...Object.fromEntries(keys.map(k=>[k,E.sum(part,k)])),label:'Q'+Math.ceil(s.day/90)+' · 진행 중',rep:part.at(-1)?.rep??E.rep(s),share:part.at(-1)?.share??E.weights(s).player};
    const rows=quarter?[partial,...s.quarters.slice().reverse().map(q=>({...q,label:'Q'+q.q}))]:s.history.slice().reverse().map(r=>({...r,label:date(r.day)}));
    const val=(r,k)=>r[k]===undefined?'—':money(r[k]);
    const totals=rows.map(r=>[r.label,r.trade===undefined?'—':money(r.trade+r.facility+(r.contract??0)),money(r.contract??0),val(r,'dividend'),val(r,'cost'),val(r,'net'),r.rep??'—',r.share===undefined?'—':r.share.toFixed(1)+'%']);
    const costs=rows.map(r=>[r.label,...['fleetCost','landCost','risk','research','marketing'].map(k=>val(r,k))]);
    return '<div class="toolbar"><div><h2>영업 실적</h2><p>예상 일일 순이익 '+money(f.net)+' · 90일마다 분기 결산</p></div><div class="action-row"><button class="tab '+(!quarter?'active':'')+'" data-act="daily">일일</button><button class="tab '+(quarter?'active':'')+'" data-act="quarter">분기</button></div></div><section class="panel">'+table([quarter?'분기':'결산일','총매출','그중 계약 운임','배당금','총비용','순이익','평판','점유율'],totals)+'</section>'+panel('비용 명세',table([quarter?'분기':'결산일','함대 유지비','행성 유지비','사고 손실','연구비','광고비'],costs));
  }
  function research(s){return '<p class="screen-intro">각 기술은 3단계까지 연구할 수 있습니다. 총 연구 레벨 3과 6에서 함선 외형과 추진기가 진화합니다.</p><div class="cards">'+D.techs.map(t=>{
    const lv=s.tech[t.id],cost=E.researchCost(s,t.id);
    return '<article class="tile"><div class="title-line"><span class="tech-mark">'+icon(t.icon)+'</span><div><h3>'+t.name+'</h3><small class="eyebrow">LEVEL '+lv+' / 3</small></div></div><div class="level">'+[1,2,3].map(i=>'<i class="'+(i<=lv?'filled':'')+'"></i>').join('')+'</div><p class="desc">'+t.desc+'</p>'+btn(lv===3?'연구 완료':money(cost)+' · 연구','research',t.id,lv===3||cost>s.cash)+'</article>';
  }).join('')+'</div>';}
  function ads(s){return '<p class="screen-intro">캠페인 효과는 집행 즉시 적용됩니다. 다른 매체의 매출 보너스는 합산되며, 종료일에 평판 보너스도 만료됩니다.</p><div class="cards">'+D.campaigns.map(c=>{
    const a=s.ads.find(x=>x.id===c.id);
    return '<article class="tile"><div class="tile-art">'+thumb(c.id==='holo'?'hologram':c.icon,48)+'</div><h3>'+c.name+'</h3>'+kv('운영 기간',c.days+'일')+kv('운송 · 시설 매출','+'+Math.round(c.boost*100)+'%')+kv('브랜드 평판','+'+c.rep)+btn(a?'진행 중 · '+a.left+'일 남음':money(c.cost)+' · 집행','ad',c.id,!!a||s.cash<c.cost)+'</article>';
  }).join('')+'</div>';}
  function estate(s){return '<div class="cards">'+s.planets.map(p=>{
    const d=D.planets.find(d=>d.id===p.id);
    return '<article class="tile"><div class="tile-art">'+thumb(d.sprite,84)+'</div><div class="toolbar" style="margin:0"><h3>'+d.name+'</h3>'+tag(ownerName(p),p.owner!=='player')+'</div>'+kv('건설 시설',p.buildings.length+' / 4')+btn(p.owner==='player'?'시설 관리':p.owner?'소유 기업 보기':money(d.price)+' · 매입 검토','planet',p.id)+'</article>';
  }).join('')+'</div>';}
  function stocks(s){
    const worth=s.markets.reduce((a,r)=>a+r.shares*r.price,0),basis=s.markets.reduce((a,r)=>a+r.basis,0);
    return '<p class="screen-intro">평가액 '+money(worth)+'　·　평가손익 '+money(worth-basis)+'　·　실현손익 '+money(s.realized)+'</p><div class="cards">'+s.markets.map(r=>{
      const d=D.rivals.find(x=>x.id===r.id);
      return '<article class="tile"><div class="title-line"><span class="emblem" style="--c:'+d.color+'">'+icon(d.icon)+'</span><div><h3>'+d.name+'</h3><small class="eyebrow">'+r.id+' · '+d.en.toUpperCase()+'</small></div></div><div class="number">'+fmt(r.price)+'<small>CR / 주</small></div><div class="chart-box">'+spark(r.history,d.color)+'</div>'+kv('시장 점유율',E.weights(s)[r.id].toFixed(1)+'%')+kv('소유 행성',s.planets.filter(p=>p.owner===r.id).map(p=>D.planets.find(x=>x.id===p.id).name).join(', ')||'—')+kv('보유 지분',r.shares+'%')+btn(r.acquired?'합병 완료':'주식 거래 · 인수','stock',r.id,r.acquired)+'</article>';
    }).join('')+'</div>'+panel('합병 이력',s.mergers.length?table(['기업','합병일','방식','잔여 지분 비용'],s.mergers.map(m=>[m.id,date(m.day),m.hostile?'적대적':'우호적',money(m.cost)])):'<p class="padded hint">완료된 합병이 없습니다.</p>');
  }
  function planetDetail(s,id){
    if(id==='hq')return '<div class="asset-summary">'+thumb('hq',116)+'<div><h3>오르빗 캐피탈 본사</h3><p class="hint">아스트라 성계의 중앙 교역 허브</p></div></div>'+kv('통제 거점',s.planets.filter(p=>p.owner==='player').length+'개 행성')+kv('자동 운항 함대',E.fleet(s)+'척')+'<div class="action-row"><button class="btn primary" data-nav="research">함대 연구소</button><button class="btn" data-nav="finance">재무제표</button></div>';
    const p=s.planets.find(p=>p.id===id),d=D.planets.find(p=>p.id===id);
    let acts='';
    if(!p.owner)acts='<div class="action-row">'+btn(money(d.price)+' · 토지 매입','buyLand',id,s.cash<d.price)+'</div>';
    else if(p.owner!=='player')acts='<p class="hint">이 행성의 소유권은 '+p.owner+' 인수 시 이전됩니다.</p><div class="action-row">'+btn('소유 기업 보기','stock',p.owner)+'</div>';
    else acts=D.facilities.map(f=>'<button class="list-choice" data-act="build" data-id="'+p.id+'/'+f.id+'" '+(p.buildings.includes(f.id)||s.cash<f.cost?'disabled':'')+'><span class="item-line">'+thumb(f.id,32)+'<span>'+f.name+'<small>매출 '+money(f.income)+' / 일</small></span></span><b>'+(p.buildings.includes(f.id)?'준공':money(f.cost))+'</b></button>').join('');
    return '<div class="asset-summary">'+thumb(d.sprite,84)+'<div><h3>'+d.name+'</h3><p class="hint">'+d.code+' · '+ownerName(p)+'</p></div></div>'+kv('보유 시설',p.buildings.map(id=>D.facilities.find(f=>f.id===id).name).join(', ')||'없음')+acts;
  }
  function stockDetail(s,id){
    const r=s.markets.find(r=>r.id===id),d=D.rivals.find(d=>d.id===id);
    if(r.acquired)return '<p class="hint">'+d.name+'의 합병이 완료되었습니다.</p>';
    return '<div class="chart-box">'+spark(r.history,d.color)+'</div>'+kv('현재 주가',money(r.price))+kv('보유 지분',r.shares+'% · '+r.shares+' / 100주')+kv('일일 예상 배당',money(Math.floor(r.shares*r.price*.002)))+'<label class="field">거래 수량 <input id="qty" type="number" min="1" max="100" step="1" value="1"> 주</label>'+kv('주문 금액','<span id="order-cost">'+money(r.price)+'</span>')+'<div class="action-row">'+btn('매수','buy',id)+btn('매도','sell',id,!r.shares,false)+'</div><hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><h3>기업 인수합병</h3><p class="hint">우호적 인수는 지분 50% 이상에서 가능합니다. 적대적 인수는 잔여 주식에 프리미엄 30%를 지불합니다.</p><div class="action-row">'+btn('우호적 인수 검토','reviewFriendly',id,r.shares<50,false)+btn('적대적 인수 검토','reviewHostile',id,false,false)+'</div>';
  }
  return {nav,icon,fmt,money,esc,date,kv,btn,metrics,tickers,fleet,logs,bars,freight:Freight.board,finance,research,ads,estate,stocks,port:Freeport.port,lounge:Freeport.lounge,planetDetail,stockDetail};
})();
