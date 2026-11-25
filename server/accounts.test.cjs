'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {mkdtemp,rm}=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {createGameServer}=require('./index.cjs');

test('persistent accounts, session revocation, and last reported cash with shared ranks',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'orbital-account-test-'));
  let srv,base;
  async function start(){
    srv=createGameServer(dir);
    await new Promise(resolve=>srv.listen(0,'127.0.0.1',resolve));
    base='http://127.0.0.1:'+srv.address().port;
  }
  const close=()=>new Promise(resolve=>srv.close(resolve));
  async function call(route,body,token){
    const headers={'Content-Type':'application/json'};
    if(token)headers.Authorization='Bearer '+token;
    const res=await fetch(base+'/api/'+route,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined});
    return {code:res.status,...await res.json()};
  }
  const a={name:'항로Alpha',password:'example-A-902'}, b={name:'부두Beta',password:'example-B-543'};
  try{
    await start();
    assert.equal((await call('balance',{cash:5})).code,401);
    const first=await call('register',a),second=await call('register',b);
    assert.equal(first.code,201);assert.equal(second.code,201);
    assert.equal((await call('register',{...a,name:a.name.toLowerCase()})).code,409);
    assert.equal((await call('login',{...a,password:'incorrect-123'})).code,401);
    assert.equal((await call('balance',{cash:-1},first.token)).code,400);
    await call('balance',{cash:1000},first.token);
    await call('balance',{cash:1000},second.token);
    assert.deepEqual((await call('rankings')).rows.map(r=>r.rank),[1,1]);
    await call('balance',{cash:90},second.token);
    await close();await start();
    assert.deepEqual((await call('rankings')).rows.map(r=>[r.name,r.cash,r.rank]),[[a.name,1000,1],[b.name,90,2]]);
    assert.equal((await call('logout',{},first.token)).code,200);
    assert.equal((await call('balance',{cash:9000},first.token)).code,401);
    const back=await call('login',a);
    assert.equal(back.user.id,first.user.id);assert.notEqual(back.token,first.token);
    const app=await fetch(base+'/');assert.match(await app.text(),/account-open/);
    const bad=await fetch(base+'/api/rankings',{headers:{origin:'https://unrelated.example'}});assert.equal(bad.status,403);
  }finally{await close();await rm(dir,{recursive:true,force:true});}
});

