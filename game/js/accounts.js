'use strict';
window.AccountUI=(()=>{
  const key='orbital.account.session';
  const addressKey='orbital.account.server';
  const fallback=document.querySelector('meta[name="account-api-origin"]')?.content || ((location.protocol==='file:' || location.hostname.endsWith('.github.io'))?'http://127.0.0.1:8717':location.origin);
  function address(raw){
    const u=new URL(raw);
    const local=u.protocol==='http:' && ['localhost','127.0.0.1','[::1]'].includes(u.hostname);
    if ((!local && u.protocol!=='https:') || u.username || u.password || u.pathname!=='/' || u.search || u.hash) throw Error('서버의 HTTPS 주소나 로컬 주소를 입력하세요.');
    return u.origin;
  }
  let session=null;
  try{
    const v=JSON.parse(sessionStorage.getItem(key));
    if (v && /^[0-9a-f-]{36}$/.test(v.user.id) && typeof v.user.name==='string' && /^[0-9a-f]{64}$/.test(v.token)) {
      address(v.server);session=v;
    }
  }catch{}
  const profile=session?.user.id || '';
  const q=id=>document.getElementById(id);
  function attach(getCash,saveBeforeSwitch){
    const dialog=q('account-dialog'),form=q('account-form'),status=q('account-feedback'),serverField=q('account-server');
    let busy=false;
    let savedServer=fallback;
    try { savedServer=address(localStorage.getItem(addressKey) || fallback); }catch{}
    serverField.value=session?.server || savedServer;
    serverField.disabled=Boolean(session);
    q('account-switch').hidden=!session;
    form.hidden=Boolean(session);
    q('publish-balance').hidden=!session;
    q('account-name').textContent=session?session.user.name:'게스트';
    q('account-open').textContent=session?'자금 랭킹 · '+session.user.name:'계정 · 자금 랭킹';
    async function api(endpoint,data,token){
      const base=address(serverField.value.trim());
      const headers={};
      if (data!==undefined) headers['Content-Type']='application/json';
      if (token) headers.Authorization='Bearer '+token;
      let res;
      try {
        res=await fetch(base+'/api/'+endpoint,{method:data===undefined?'GET':'POST',headers,
          body:data===undefined?undefined:JSON.stringify(data),credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(8000)});
      }catch{throw Error('서버에 연결할 수 없습니다. 서버 주소와 실행 상태를 확인하세요.');}
      if (!res.headers.get('Content-Type')?.includes('application/json')) throw Error('계정 서버 주소를 확인하세요.');
      const result=await res.json();
      if (!res.ok) throw Object.assign(Error(result.error || '서버 요청에 실패했습니다.'),{status:res.status});
      return result;
    }
    function drawRows(rows){
      const list=q('ranking-rows');
      list.replaceChildren();
      for (const r of rows){
        const tr=document.createElement('tr');
        for(const item of [r.rank+'위',r.name,r.cash.toLocaleString('ko-KR')+' CR',new Date(r.updated).toLocaleString('ko-KR')]){
          const td=document.createElement('td');td.textContent=item;tr.append(td);
        }
        list.append(tr);
      }
      q('rank-empty').textContent=rows.length?'':'아직 등록된 자금이 없습니다.';
    }
    async function ranks(){const {rows}=await api('rankings');drawRows(rows);}
    async function run(job){
      if(busy)return;
      busy=true;dialog.setAttribute('aria-busy','true');
      const controls=Array.from(dialog.querySelectorAll('button,input')).filter(el=>!el.disabled);
      controls.forEach(el=>el.disabled=true);status.textContent='연결 중…';
      try{await job();}catch(e){status.textContent=e.message;}finally{
        busy=false;dialog.removeAttribute('aria-busy');controls.forEach(el=>el.disabled=false);
      }
    }
    async function switchTo(value){
      await saveBeforeSwitch();
      if(value)sessionStorage.setItem(key,JSON.stringify(value));else sessionStorage.removeItem(key);
      sessionStorage.setItem('orbital.account.reopen','1');location.reload();
    }
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const action=e.submitter?.value==='register'?'register':'login';
      run(async()=>{
        const base=address(serverField.value.trim());
        const result=await api(action,{name:q('login-name').value.trim(),password:q('login-password').value});
        q('login-password').value='';localStorage.setItem(addressKey,base);
        await switchTo({...result,server:base});
      });
    });
    q('account-switch').onclick=()=>run(async()=>{
      try{await api('logout',{},session.token);}catch(e){if(e.status!==401)throw e;}
      await switchTo(null);
    });
    q('rank-refresh').onclick=()=>run(async()=>{
      await ranks();localStorage.setItem(addressKey,address(serverField.value.trim()));status.textContent='랭킹을 불러왔습니다.';
    });
    q('publish-balance').onclick=()=>run(async()=>{
      const result=await api('balance',{cash:getCash()},session.token);
      status.textContent=result.cash.toLocaleString('ko-KR')+' CR 등록 · '+result.rank+'위';
      await ranks();
    });
    function open(){
      q('rank-cash').textContent=getCash().toLocaleString('ko-KR')+' CR';
      dialog.showModal();
      if(session)q('rank-refresh').click();
    }
    q('account-open').onclick=open;q('account-close').onclick=()=>dialog.close();
    if(sessionStorage.getItem('orbital.account.reopen')){sessionStorage.removeItem('orbital.account.reopen');open();}
  }
  return {profile,attach};
})();

