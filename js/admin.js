/* Admin screen: approve, reject and remove members */
async function adminView(){
  const el=$('#main');el.innerHTML=`<h2>Admin</h2>${loadingHTML()}`;
  const r=await sbf('/rest/v1/profiles?select=*&order=created_at.asc');
  if(view!=='admin')return;
  if(!r.ok){el.innerHTML=`<h2>Admin</h2><div class="msg">Could not load the members (${r.status}).</div>`;return}
  const rows=await r.json(),pend=rows.filter(x=>!x.approved),mem=rows.filter(x=>x.approved);
  PENDING=pend.length;nav();
  const dt=u=>u.created_at?new Date(u.created_at).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}):'';
  const card=(u,btns)=>{
    const me=u.id===SESS.user.id,tag=me?`You${u.role==='admin'?' (Admin)':''}`:u.role==='admin'?'Admin':'';
    return`<div class="ucard">${avatar(u.username,'lg')}<span class="un">@${esc(u.username)}</span><span class="ubot"><span class="ufoot">Joined ${esc(dt(u))}</span><span class="abt">${tag?`<span class="utag">${tag}</span>`:''}${btns}</span></span></div>`;
  };
  el.innerHTML=`<h2>Admin</h2>
   <h3 class="hh">Waiting for approval (${pend.length})</h3>${pend.length?`<div class="ucards">${pend.map(u=>card(u,`<button class="btn" data-au="approve:${u.id}">Approve</button><button class="btn ghost" data-au="reject:${u.id}" data-name="${esc(u.username)}">Reject</button>`)).join('')}</div>`:'<p class="meta">No accounts are waiting.</p>'}
   <h3 class="hh">Members (${mem.length})</h3><div class="ucards">${mem.map(u=>card(u,u.id===SESS.user.id?'':`<button class="btn ghost" data-au="remove:${u.id}" data-name="${esc(u.username)}">Remove</button>`)).join('')}</div>`;
}

async function authClick(b){
  const [a,v]=b.dataset.au.split(':'),name=b.dataset.name;
  if(a==='mode'){AUTHM=v;accountView()}
  else if(a==='signout')await doSignOut();
  else if(a==='refresh')await afterAuth('account');
  else if(a==='viewlib')openUserLib(v,name);
  else if(/^(reqacc|cancelacc|accok|accno|accrev)$/.test(a))await accessClick(a,v);
  else if(a==='back'){view='users';render()}
  else if(a==='approve'){
    const r=await sbf(`/rest/v1/profiles?id=eq.${v}`,{method:'PATCH',body:JSON.stringify({approved:true})});
    if(!r.ok){alert(`Could not approve (${r.status}).`);return}
    USERS=null;adminView();
  }else if(a==='reject'||a==='remove'){
    if(!confirm(a==='reject'?`Reject and delete the account “${name}”?`:`Remove “${name}” and everything they rated?`))return;
    const r=await sbf('/rest/v1/rpc/admin_delete_user',{method:'POST',body:JSON.stringify({target:v})});
    if(!r.ok){alert(`Could not remove the account (${r.status}).`);return}
    USERS=null;adminView();
  }
}
