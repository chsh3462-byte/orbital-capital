'use strict';
// Exercises accounting, acquisitions, and save replay without Electron or external packages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const runtime = vm.createContext({});
runtime.window = runtime;
for (const file of ['data', 'dock-story', 'handover-script', 'handover', 'tutorial', 'roulette', 'collection', 'registry', 'salon', 'freeport', 'leisure', 'staff', 'escort', 'bargains', 'commerce', 'freight', 'economy', 'storage']) {
  const source = fs.readFileSync(path.join(__dirname, '../game/js', file + '.js'), 'utf8');
  vm.runInContext(source, runtime, {filename:file + '.js'});
}
const E = runtime.Economy, check = runtime.LocalSave.validate;
const clone = state => check(JSON.parse(JSON.stringify(state)));
{
  const s=E.newGame(),B=runtime.Bargains,C=runtime.Commerce,G=runtime.Escort,F=runtime.Freeport;
  const labels=new Set();
  for(const place of ['mira','serein','calyx']){
    for(const event of [null,'risk','boom','breakthrough']){
      s.event=event?{id:event,left:1}:null;
      for(let i=0;i<60;i++){
        s.dealSerial=i;
        const list=B.offers(s,place,'wick',i%4===0?20:3,!!(i%2));
        assert.equal(new Set(list.map(o=>o.id)).size,4);
        for(const offer of list)labels.add(offer.title);
      }
    }
  }
  assert.ok(labels.size>=45);s.event=null;
  const jacket=runtime.Leisure.get('brooch'),termsArt=B.collectorOffers(s,jacket,'market');
  assert.equal(new Set(termsArt.map(o=>o.id)).size,4);
  const pledged=termsArt.find(o=>o.rep),oldRep=s.rep,oldCash=s.cash;
  B.collect(s,jacket.id,'market',pledged.id);assert.equal(s.rep,oldRep+pledged.rep);assert.equal(s.cash,oldCash-pledged.total);assert.throws(()=>B.collect(s,jacket.id,'market',pledged.id));
  const offered=B.offers(s,'mira','wick',7,true)[0],before=s.cash;
  B.deal(s,'mira','wick',7,true,offered.id);
  assert.equal(s.cash,before-offered.total);assert.equal(C.holding(s,'mira','wick').qty,offered.units);
  const terms=B.offers(s,'mira','wick',1,false)[0],funds=s.cash;
  B.deal(s,'mira','wick',1,false,terms.id);assert.equal(s.cash,funds+terms.total);
  assert.throws(()=>B.deal(s,'mira','wick',1,false,-1));
  G.hire(s,3);assert.equal(G.payroll(s),610);
  C.schedule(s,'mira','serein',[{good:'wick',qty:21}],4,3);
  assert.throws(()=>G.release(s,3));assert.throws(()=>C.schedule(s,'serein','mira',[{good:'salt',qty:5}],1,3));
  const r=s.exchange.routes[0];C.departures(s);assert.ok(r.cargo);assert.throws(()=>G.assign(s,r,0));
  for(let grade=1;grade<4;grade++)assert.ok(G.risk(grade)<G.risk(grade+1));
  for(let guard=0;guard<3;guard++)assert.ok(G.chance(guard)<G.chance(guard+1));
  function delivery(guard){
    const simulation=clone(s),route=simulation.exchange.routes[0];route.guard=guard;
    // Find an encounter whose outcome changes with escort rank, then replay that seed.
    let seed=1;
    for(;;seed++){
      const a=(Math.imul(1664525,seed)+1013904223)>>>0,b=(Math.imul(1664525,a)+1013904223)>>>0;
      if(a/4294967296<.42 && b/4294967296>.43 && b/4294967296<.91)break;
    }
    simulation.seed=seed;C.cancel(simulation,route.id);C.departures(simulation);
    assert.equal(simulation.exchange.routes.length,0);G.release(simulation,3);check(simulation);
    return simulation;
  }
  const defended=delivery(3),lost=delivery(0);
  assert.equal(defended.security.wins,1);assert.equal(defended.security.lost,0);
  assert.equal(lost.security.wins,0);assert.ok(lost.security.lost>0);
  assert.equal(defended.cash-lost.cash,lost.security.lost*C.quote(s,'serein','wick').bid);
  // An older sealed offer has already been paid. Conversion and replay cannot charge it again.
  F.invite(s);const old=s.leisure.auction.lot,reserve=runtime.Leisure.get(old.id).price;
  s.cash=reserve+8000;
  E.charge(s,reserve);
  s.leisure.auction.lot={id:old.id,close:s.day+3,quotes:old.quotes,bid:reserve};
  const migrated=clone(s);assert.equal(migrated.cash,s.cash);assert.equal(migrated.leisure.auction.lot.leader,'player');
  migrated.leisure.auction.lot.quotes=[reserve*2,reserve,reserve];F.round(migrated,old.id);
  assert.equal(migrated.cash,s.cash+reserve);assert.equal(clone(migrated).leisure.auction.lot.bid,0);
  const empty=E.newGame();F.invite(empty);const ready=empty.leisure.auction.lot;
  F.start(empty,ready.id,runtime.Leisure.get(ready.id).price*2);
  F.round(empty,ready.id);F.round(empty,ready.id);assert.equal(empty.leisure.auction.history[0].winner,'유찰');check(empty);
  console.log('PASS: contextual quotes, actual invoices, graded encounters, escort payroll and allocation, legacy escrow and unsold lots.');
}
{
  const C=runtime.Commerce,H=runtime.Staff;
  const nextDay=s=>{let row;while(!row)row=E.step(s);return row;};
  const s=E.newGame();
  const original=s.markets.slice(0,3);s.markets=original;s.planets=s.planets.slice(0,6);delete s.frontier;delete s.security;delete s.dealSerial;delete s.hr;delete s.exchange;
  check(s);assert.equal(s.markets.length,8);assert.equal(s.planets.length,9);assert.equal(s.markets[0],original[0]);
  const lines=[{good:'tea',qty:8},{good:'gear',qty:4}];
  C.trade(s,'nereid','tea',10,true);
  C.trade(s,'nereid','tea',2,false);
  assert.throws(()=>C.trade(s,'lyra','tea',1,false));
  assert.throws(()=>C.schedule(s,'nereid','nereid',lines));
  C.schedule(s,'nereid','lyra',lines);
  const prior=s.cash, ask=C.quote(s,'nereid','gear').ask, regular=E.fleet(s)-1;
  const day1=nextDay(s);assert.equal(C.freeShips(s),regular);
  assert.equal(s.cash,prior-ask*4+day1.net-day1.goodsSales+day1.goodsCost);
  assert.equal(s.exchange.stock.length,0);assert.ok(s.exchange.routes[0].cargo);
  const again=clone(s),cost=again.exchange.routes[0].cargo.cost;
  const expected=lines.reduce((n,l)=>n+C.quote(again,'lyra',l.good).bid*l.qty,0);
  const day2=nextDay(again);assert.equal(day2.goodsSales,expected);assert.equal(day2.goodsCost,cost);
  assert.equal(again.exchange.routes[0].trips,1);
  nextDay(again);C.cancel(again,1);assert.ok(again.exchange.routes[0].stop);
  const ending=clone(again);nextDay(ending);assert.equal(ending.exchange.routes.length,0);
  assert.equal(nextDay(ending).goodsSales,0);
  const waiting=clone(s);C.cancel(waiting,1);nextDay(waiting);
  C.schedule(waiting,'eir','lyra',lines);waiting.cash=0;
  nextDay(waiting);assert.equal(waiting.exchange.routes[0].cargo,null);
  waiting.cash=200000;nextDay(waiting);assert.ok(waiting.exchange.routes[0].cargo);
  const policy={style:'method',skill:0,care:0,wage:1,target:2};
  H.recruit(ending,policy);nextDay(ending);assert.equal(ending.hr.team.length,0);assert.match(ending.hr.recent[0].result,/일급/);
  H.recruit(ending,{...policy,wage:500});nextDay(ending);assert.equal(ending.hr.team[0].style,'method');
  const payroll=H.payroll(ending);assert.equal(nextDay(ending).wages,payroll);
  assert.equal(ending.hr.team.length,2);assert.equal(ending.hr.open,false);
  const cap=C.capacity(ending);C.register(ending);assert.equal(C.capacity(ending),cap+8);assert.throws(()=>C.register(ending));
  ending.cash=2_000_000;const ships=E.fleet(ending);
  E.trade(ending,'TOW',50,true);E.merge(ending,'TOW',false);E.merge(ending,'POL',true);
  assert.equal(E.fleet(ending),ships+3);check(ending);
  console.log('PASS: commodity accounting, mixed cargo, repeat/cancel/resume, liquidity, recruitment and transport acquisitions.');
}
{
  const F = runtime.Freight;
  const old = E.newGame();
  delete old.freight;
  old.history.forEach(row => delete row.contract);
  const s = clone(old);
  assert.equal(s.freight, null);
  // Start just before the end of the quarter and resume from a mid-voyage save.
  while (s.day < 89) E.step(s);
  const regular = E.forecast(s);
  F.accept(s, 'tea');
  assert.ok(E.forecast(s).trade < regular.trade);
  assert.equal(E.forecast(s).fleetCost, regular.fleetCost);
  assert.throws(() => F.accept(s, 'clock'));
  assert.equal(F.payment(s), 0);
  E.research(s, 'warp');
  while (s.day < 90) E.step(s);
  const resumed = clone(s);
  assert.equal(F.payment(resumed), 6000);
  assert.throws(() => clone({...resumed, freight:{id:'tea', start:70, warp:0}}));
  let cash = resumed.cash;
  while (resumed.day < 91) E.step(resumed);
  const row = resumed.history.at(-1);
  assert.equal(row.contract, 6000);
  assert.equal(row.revenue, row.trade + row.contract + row.dividend + row.facility);
  assert.equal(resumed.cash, cash + row.net);
  assert.equal(resumed.quarters.at(-1).contract, 6000);
  assert.equal(resumed.freight, null);
  assert.equal(E.forecast(resumed).contract, 0);
  F.accept(resumed, 'tea');
  assert.equal(F.payment(resumed), 6000); // New contract uses upgraded engines.
  console.log('PASS: freight allocation, old save, voyage resume, warp terms, single payment and quarter close.');
}
const game = E.newGame();
game.cash = 1_000_000;
const before = game.cash;
const researchCost = E.researchCost(game, 'warp');
E.research(game, 'warp');
E.advertise(game, 'holo');
assert.equal(game.cash, before - researchCost - 8500);
assert.equal(E.rep(game), game.rep + 4);
assert.throws(() => E.advertise(game, 'holo'));
E.buyLand(game, 'eir'); E.build(game, 'eir', 'lab');
assert.throws(() => E.buyLand(game, 'veyra'));
assert.throws(() => E.build(game, 'eir', 'lab'));
assert.throws(() => E.build(game, 'veyra', 'resort'));
const hel = game.markets[0];
E.trade(game, hel.id, 12, true);
const firstPrice = hel.price;
E.step(game);
const secondPrice = hel.price;
E.trade(game, hel.id, 4, false);
assert.equal(game.realized, (secondPrice - firstPrice) * 4);
assert.equal(hel.basis, firstPrice * 8);
assert.equal(E.forecast(game).dividend, Math.floor(8 * hel.price * .002));
assert.throws(() => E.trade(game, hel.id, 93, true));
assert.throws(() => E.merge(game, hel.id, false));
const cashPreClose = game.cash;
let row;
while (!row) row = E.step(game);
assert.equal(game.cash, cashPreClose + row.net + row.marketing + row.research);
assert.equal(row.cost, row.fleetCost + row.landCost + row.risk + row.marketing + row.research);
assert(row.net < 0);
assert.equal(game.expenses.research + game.expenses.marketing, 0);
const copy = clone(game);
for (let i=0; i<360; i++) { E.step(game); E.step(copy); }
assert.equal(JSON.stringify(game), JSON.stringify(copy));
assert.equal(game.ads.length,0);
assert(game.quarters.length > 0);
const q=game.quarters[0];
assert.equal(q.net,q.revenue-q.cost);
assert.equal(q.revenue,q.trade+q.facility+q.dividend);
E.trade(game, 'HEL', 42, true);
const valueBefore = E.weights(game), cost=E.mergerCost(hel,false), balance=game.cash;
E.merge(game,'HEL',false);
assert.equal(game.cash,balance-cost);
assert(Math.abs(E.weights(game).player-valueBefore.player-valueBefore.HEL)<1e-8);
assert.equal(game.planets.find(p=>p.id==='veyra').owner,'player');
assert.throws(()=>E.trade(game,'HEL',1,true));
assert.throws(()=>E.merge(game,'HEL',true));
const nva=game.markets[1];
assert.equal(E.mergerCost(nva,true),Math.ceil(100*nva.price*1.3));
E.merge(game,'NVA',true);
assert.equal(game.planets.find(p=>p.id==='orion').owner,'player');
for(const t of ['warp','cargo','ai'])E.research(game,t);
assert.equal(E.tier(game),2);assert.equal(E.fleet(game),2);
const broke = clone(game);broke.cash=0;
const intact=JSON.stringify(broke);
assert.throws(()=>E.research(broke,'shield'));assert.equal(JSON.stringify(broke),intact);
assert.throws(()=>check({...game, cash:-1}));
assert.throws(()=>check({...game, version:99}));
check(game);
const loungeGame = clone(game);
delete loungeGame.leisure;
check(loungeGame);
assert.equal(loungeGame.leisure.owned.length,0);
const L=runtime.Leisure, F=runtime.Freeport, R=runtime.Roulette;
const funds=loungeGame.cash;
L.purchase(loungeGame,'print','market');L.purchase(loungeGame,'brooch','market');
assert.equal(loungeGame.cash,funds-19000);
assert.equal(loungeGame.leisure.displays.wall,null);
L.display(loungeGame,'print');L.display(loungeGame,'brooch');L.wear(loungeGame,'brooch');
assert.equal(loungeGame.leisure.displays.wall,'print');
assert.equal(loungeGame.leisure.displays.cabinet,'brooch');
assert.throws(()=>L.wear(loungeGame,'print'));
assert.throws(()=>L.purchase(loungeGame,'brooch','market'));
assert.throws(()=>L.purchase(loungeGame,'yacht','market'));
assert.throws(()=>L.display(loungeGame,'yacht'));
assert.throws(()=>L.purchase(broke,'yacht','hangar'));
for(const i of L.catalog.filter(i=>L.source(i)==='auction')){
  for(const venue of ['market','hangar','auction','lounge'])assert.throws(()=>L.purchase(loungeGame,i.id,venue));
}
assert.equal(L.catalog.length,150);
for(const k of ['id','name','art'])assert.equal(new Set(L.catalog.map(i=>i[k])).size,150);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../game/assets/sprites.js'),'utf8'),runtime);
for(const i of L.catalog){
  const spec=runtime.SPRITES[i.art];assert.equal(spec.frames,4);
  const png=fs.readFileSync(path.join(__dirname,'../game',spec.src));
  assert.equal(png.readUInt32BE(16),4*spec.w);assert.equal(png.readUInt32BE(20),spec.h);
}
{
  const collector=clone(loungeGame);collector.cash=2_000_000_000;
  for(const venue of ['hangar','market','auction']){
    const items=L.catalog.filter(i=>L.source(i)===venue);assert.equal(items.length,50);
    if(venue==='auction')continue;
    for(const item of items){
      if(!collector.leisure.owned.includes(item.id))L.purchase(collector,item.id,venue);
      L.display(collector,item.id);
    }
  }
  F.invite(collector);
  for(let lot=0;lot<50;lot++){
    const current=collector.leisure.auction.lot;assert.ok(current);
    F.start(collector,current.id,L.get(current.id).price);
    F.bid(collector,current.id,Math.max(...current.quotes)+1000);
    F.round(collector,current.id);F.round(collector,current.id);
  }
  assert.equal(collector.leisure.auction.lot,null);
  assert.equal(clone(collector).leisure.owned.length,150);
  const previous=clone(collector);
  previous.leisure.owned=previous.leisure.owned.filter(id=>!runtime.Collection.items.some(i=>i.id===id));
  previous.leisure.displays={dock:'yacht',cabinet:'brooch',wall:'print'};
  previous.leisure.auction.history=[];
  assert.equal(clone(previous).leisure.auction.lot.id,'dial-noon');
  console.log('PASS: 150 unique collectibles and animation sheets, purchases, complete ascending auction rotation and v0.3 collection migration.');
}
const old=clone(loungeGame);
delete old.leisure.displays;delete old.leisure.auction;delete old.leisure.wheel;
old.leisure.exhibit='print';
old.leisure.rounds=1;old.leisure.paidOut=1000;old.leisure.last={a:1,b:2,pick:'low',payout:1000};
const upgraded=clone(old);
assert.equal(upgraded.leisure.displays.wall,'print');assert.equal(upgraded.leisure.worn,'brooch');
assert.equal(upgraded.leisure.paidOut,1000);
assert.throws(()=>F.bid(loungeGame,'astrolabe',120000));
F.invite(loungeGame);
let lot=loungeGame.leisure.auction.lot;
const item=L.get(lot.id),beforeBid=loungeGame.cash;
assert.throws(()=>F.bid(loungeGame,lot.id,17));
assert.throws(()=>F.bid(loungeGame,lot.id,loungeGame.cash+100000));
assert.throws(()=>F.start(loungeGame,lot.id,200));
F.start(loungeGame,lot.id,item.price);F.bid(loungeGame,lot.id,item.price);
assert.equal(loungeGame.cash,beforeBid-item.price);
lot.quotes=[item.price+10000,item.price,item.price];
F.round(loungeGame,lot.id);assert.equal(lot.leader,'은고래 재단');assert.equal(loungeGame.cash,beforeBid);
const replay=clone(loungeGame);
for(let i=0;i<12;i++){E.step(loungeGame);E.step(replay);}
assert.equal(JSON.stringify(loungeGame),JSON.stringify(replay));
assert(!loungeGame.leisure.owned.includes(item.id));assert.equal(loungeGame.leisure.auction.history[0].winner,'은고래 재단');
lot=loungeGame.leisure.auction.lot;F.start(loungeGame,lot.id,L.get(lot.id).price);
const winning=Math.max(...lot.quotes)+1000;
F.bid(loungeGame,lot.id,winning);const balanceAfterBid=loungeGame.cash;
F.round(loungeGame,lot.id);F.round(loungeGame,lot.id);
assert.equal(loungeGame.cash,balanceAfterBid);
assert(loungeGame.leisure.owned.includes(lot.id));
assert.equal(loungeGame.leisure.auction.history[0].amount,winning);
assert.equal(loungeGame.leisure.auction.history[0].winner,'player');
assert.equal(loungeGame.leisure.displays.cabinet,'brooch');
const casinoStart=loungeGame.cash;
vm.runInContext('Math.random=()=>0',runtime);
R.spin(loungeGame,'red');assert.equal(loungeGame.cash,casinoStart-500);
R.spin(loungeGame,0);assert.equal(loungeGame.cash,casinoStart+17000);
assert.throws(()=>R.spin(broke,'black'));assert.throws(()=>R.spin(loungeGame,37));
for(let i=1;i<=36;i++)assert.equal(R.payout(i,'red')+R.payout(i,'black'),1000);
assert.equal(R.payout(0,'red')+R.payout(0,'black'),0);
assert.equal(JSON.stringify(broke),intact);
assert.equal(JSON.stringify(clone(loungeGame).leisure),JSON.stringify(loungeGame.leisure));
console.log('PASS: economic regression, old save migration, public venues, owned-only display, sealed auctions, escrow, deterministic settlement, single-zero roulette.');
const ships=L.catalog.filter(i=>L.source(i)==='hangar');
assert.equal(ships.length,50);
for(const ship of ships)assert.equal(runtime.Registry.ports(ship.id).length,[3,4,5,9][runtime.Registry.ships[ship.id][0]-1]);
const completed=clone(loungeGame);
completed.leisure.owned.push(...['astrolabe','key','tideglass','echo'].filter(id=>!completed.leisure.owned.includes(id)));
completed.leisure.auction.lot=null;delete completed.leisure.tables;
assert.equal(clone(completed).leisure.auction.lot.id,'compass');
const T=runtime.Salon;
assert.equal(T.points([0,13,8]),21);assert.equal(T.points([0,9,5]),17);
assert(!T.bankerDraw(3,8));assert(T.bankerDraw(3,7));assert(T.bankerDraw(5,null));assert(!T.bankerDraw(6,null));
assert.throws(()=>T.startBlackjack(broke));assert.throws(()=>T.baccarat(broke,'banker'));assert.throws(()=>T.crown(broke,0));
assert.equal(JSON.stringify(broke),intact);
const b=clone(loungeGame), cash=b.cash;
T.startBlackjack(b);assert.equal(b.cash,cash-500+(b.leisure.tables.blackjack.pay??0));
if(b.leisure.tables.blackjack.pay===null){
  assert.throws(()=>T.startBlackjack(b));const resumed=clone(b);
  T.decide(b,'stand');T.decide(resumed,'stand');assert.equal(resumed.cash,b.cash);assert.throws(()=>T.decide(b,'stand'));
}
for(const side of ['player','banker','tie']){let start=b.cash;T.baccarat(b,side);assert.equal(b.cash,start-500+b.leisure.tables.baccarat.pay);check(b);}
vm.runInContext('Math.random=()=>0',runtime);
let start=b.cash;T.crown(b,0);assert.equal(b.cash,start+1500);
T.crown(b,1);assert.equal(b.cash,start+1000);assert.throws(()=>T.crown(b,6));
assert.deepEqual(JSON.stringify(clone(b).leisure.tables),JSON.stringify(b.leisure.tables));
console.log('PASS: exhibition grades and routes, expanded relic auction migration, blackjack resume, baccarat drawing rules and symbol dice payouts.');

{
  const H=runtime.Handover, s=E.newGame();
  assert.equal(E.fleet(s),1);assert.equal(s.day,11);
  assert.equal(H.choose(s,'tutorial_01'),true);
  let cash=s.cash;
  assert.equal(H.advance(s,'BUY_FIRST_STOCK_SHARE'),false);
  assert.ok(H.advance(s,'OPEN_ORBITAL_MAP_OR_SELECT_PLANET'));
  assert.equal(s.cash,cash+5000);
  assert.equal(H.advance(s,'OPEN_ORBITAL_MAP_OR_SELECT_PLANET'),false);
  runtime.Commerce.schedule(s,'nereid','lyra',[{good:'tea',qty:1}]);
  assert.equal(s.story.scene,'tutorial_02');
  while(!s.exchange.routes[0].cargo)E.step(s);
  const resumed=clone(s);
  assert.equal(resumed.story.scene,'tutorial_03');
  const rep=resumed.rep;assert.ok(H.advance(resumed,'CHANGE_TIME_SPEED_ABOVE_1X'));assert.equal(resumed.rep,rep+10);
  assert.ok(H.advance(resumed,'OPEN_PNL_OR_LOGS'));assert.ok(H.advance(resumed,'BUY_FIRST_STOCK_SHARE'));
  while(!resumed.story.deliveries)E.step(resumed);
  cash=resumed.cash;H.claim(resumed,'mission_first_trade');assert.equal(resumed.cash,cash+10000);
  assert.throws(()=>H.claim(clone(resumed),'mission_first_trade'));
  resumed.cash=2*resumed.story.baseline;H.claim(resumed,'mission_net_worth_2x');
  cash=resumed.cash;E.research(resumed,'cargo',true);assert.equal(resumed.cash,cash);assert.equal(resumed.story.points,0);
  assert.throws(()=>E.research(resumed,'warp',true));
  H.claim(resumed,'mission_first_research');E.research(resumed,'warp');assert.equal(resumed.logs[0].title,'연구 성과 기록');
  E.buyLand(resumed,'eir');const cost=E.forecast(resumed).fleetCost;H.claim(resumed,'mission_second_outpost');
  assert.ok(E.forecast(resumed).fleetCost<cost);
  resumed.cash=1000;H.loan(resumed,false);assert.equal(resumed.cash,21000);assert.throws(()=>H.loan(resumed,false));
  const day=resumed.day;while(resumed.day===day)E.step(resumed);
  assert.equal(resumed.story.debt,20020);resumed.cash=30000;H.loan(resumed,true);
  assert.equal(resumed.cash,9980);assert.equal(clone(resumed).story.debt,0);
  const old=E.newGame();delete old.story;const legacy=clone(old);assert.equal(E.fleet(legacy),3);
  H.attach(legacy,3);assert.equal(E.fleet(clone(legacy)),3);
  console.log('PASS: AURA stages and awards, saved progression, checklist grants, loan repayment and legacy fleet.');
}
{
  const {pages}=runtime.DockStory, company=E.newGame(), visited=new Set();
  function walk(id,path){
    if(id==='done')return;
    assert.ok(pages[id],id);
    assert.ok(!path.includes(id),'Dialogue loop at '+id);
    visited.add(id);
    company.dockPage=id;
    assert.equal(clone(company).dockPage,id);
    assert.ok(pages[id].next.length>0);
    for(const [,next] of pages[id].next)walk(next,[...path,id]);
  }
  walk('arrival',[]);
  assert.equal(visited.size,Object.keys(pages).length);
  company.dockPage='unlisted';assert.throws(()=>clone(company));
  console.log('PASS: both dock questions rejoin the story and every saved line reaches the control room.');
}
