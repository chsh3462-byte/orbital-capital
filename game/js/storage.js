'use strict';
window.LocalSave = (() => {
  const D=GameData;
  const integer=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const finite=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(v)&&v>=min&&v<=max;
  const items=(a,check,max=Infinity)=>Array.isArray(a)&&a.length<=max&&a.every(check);
  const unique=(a,key)=>new Set(a.map(key)).size===a.length;
  const str=v=>typeof v==='string'&&v.length<512;
  const keySet=(a,defs)=>Array.isArray(a)&&a.length===defs.length&&unique(a,x=>x.id)&&a.every(x=>defs.some(d=>d.id===x.id));
  function validate(s){
    try{
      if(s.version===1&&s.exchange===undefined){
        s.exchange=Commerce.initial();
        for(const d of D.rivals.filter(r=>r.ships)){
          if(!s.markets.some(r=>r.id===d.id))s.markets.push({id:d.id,price:d.price,prev:d.price,history:[d.price],shares:0,basis:0,acquired:false,weight:d.weight});
        }
      }
      if(s.version===1&&s.frontier===undefined){
        for(const d of D.rivals.filter(r=>['LUX','SEL','ARC'].includes(r.id))){
          if(!s.markets.some(r=>r.id===d.id))s.markets.push({id:d.id,price:d.price,prev:d.price,history:[d.price],shares:0,basis:0,acquired:false,weight:d.weight});
        }
        for(const p of D.planets.filter(p=>['mira','serein','calyx'].includes(p.id))){
          if(!s.planets.some(r=>r.id===p.id))s.planets.push({id:p.id,owner:p.owner,buildings:p.owner?['spaceport']:[]});
        }
        s.frontier=1;s.security=Escort.initial();s.dealSerial=0;
        for(const r of s.exchange.routes){r.grade=1;r.guard=0;}
      }
      if(s.version===1&&s.hr===undefined)s.hr=Staff.initial();
      if(s.version===1&&s.freight===undefined)s.freight=null;
      if(s.version===1&&s.expenses===undefined)s.expenses={research:0,marketing:0};
      if(s.version===1&&s.guide===undefined)s.guide=Tutorial.initial();
      if(s.version===1&&s.leisure===undefined)s.leisure=Leisure.initial();
      if(s.version===1&&s.leisure){
        const oldFour=s.leisure.tables===undefined;
        Leisure.migrate(s.leisure);
        const lot=s.leisure.auction?.lot;
        if(lot&&lot.stage===undefined)Freeport.prepare(lot);
        // A collector who finished the old catalog can receive the new consignments.
        if(s.leisure.auction?.invited&&s.leisure.auction.lot===null){
          const last=oldFour?'echo':'bell';
          const previous=['astrolabe','key','tideglass','echo'];
          if(!oldFour)previous.push('compass','mask','seed','bell');
          if(previous.every(id=>s.leisure.owned.includes(id)))s.leisure.auction.lot=Freeport.nextLot(s,last);
        }
      }
      const valid=s.version===1&&integer(s.day,1)&&integer(s.tick,0,3)&&integer(s.cash)&&integer(s.seed,0,4294967295)&&finite(s.rep,0,100)&&Number.isSafeInteger(s.realized)
        &&s.frontier===1&&integer(s.dealSerial)&&Escort.valid(s)&&Staff.valid(s.hr)&&Commerce.valid(s.exchange)&&Commerce.freeShips(s)>=0&&Freight.valid(s.freight,s.day)&&integer(s.expenses.research)&&integer(s.expenses.marketing)&&Tutorial.valid(s.guide)&&Leisure.valid(s.leisure)
        &&Object.keys(s.tech).length===D.techs.length&&D.techs.every(t=>integer(s.tech[t.id],0,3))
        &&items(s.ads,a=>D.campaigns.some(c=>c.id===a.id&&integer(a.left,1,c.days)),3)&&unique(s.ads,a=>a.id)
        &&(s.event===null||D.events.some(e=>e.id===s.event.id&&integer(s.event.left,1,e.days)))
        &&keySet(s.planets,D.planets)&&s.planets.every(p=>(p.owner===null||p.owner==='player'||D.rivals.some(r=>r.id===p.owner))&&items(p.buildings,id=>D.facilities.some(f=>f.id===id),4)&&unique(p.buildings,x=>x))
        &&keySet(s.markets,D.rivals)&&s.markets.every(r=>integer(r.price,1)&&integer(r.prev,1)&&integer(r.shares,0,100)&&integer(r.basis)&&typeof r.acquired==='boolean'&&finite(r.weight,1)&&items(r.history,v=>integer(v,1),64)&&r.history.length>0)
        &&items(s.logs,l=>integer(l.day,1)&&str(l.title)&&str(l.detail)&&str(l.type),100)
        &&items(s.mergers,m=>D.rivals.some(r=>r.id===m.id)&&integer(m.day,1)&&integer(m.cost)&&typeof m.hostile==='boolean',D.rivals.length)&&unique(s.mergers,m=>m.id)
        &&s.markets.every(r=>r.acquired===s.mergers.some(m=>m.id===r.id)&&(!r.acquired||(r.shares===0&&!s.planets.some(p=>p.owner===r.id))))
        &&items(s.history,h=>['day','cash','trade','facility','dividend','fleetCost','landCost','risk','revenue','cost','share','rep'].every(k=>finite(h[k]))&&Number.isSafeInteger(h.net)&&['marketing','research','contract','goodsSales','goodsCost','wages'].every(k=>h[k]===undefined||integer(h[k])),180)&&s.history.length>0
        &&items(s.quarters,q=>['q','revenue','cost'].every(k=>integer(q[k]))&&Number.isSafeInteger(q.net)&&['trade','facility','dividend','fleetCost','landCost','risk','research','marketing','contract','goodsSales','goodsCost','wages','share','rep'].every(k=>q[k]===undefined||finite(q[k])));
      if(valid)return s;
    }catch{}
    throw Error('저장 형식 또는 게임 데이터가 손상되었습니다.');
  }
  async function write(slot,s){
    validate(s);
    const raw=JSON.stringify(s);
    if(window.desktopSaves)await window.desktopSaves.write(slot,raw);
    else localStorage.setItem('orbital-capital.v1.'+slot,raw);
  }
  async function read(slot){
    const raw=window.desktopSaves?await window.desktopSaves.read(slot):localStorage.getItem('orbital-capital.v1.'+slot);
    if(raw===null)return null;
    return validate(JSON.parse(raw));
  }
  return {write,read,validate};
})();
