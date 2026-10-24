/* Users list and other members' libraries */
async function usersView(){
  const el=$('#main');
  el.innerHTML=`<h2>Users</h2><p class="meta">Find other members and see what they have watched.</p><input id="usq" placeholder="Search by username…" value="${esc(UQ)}" autocomplete="off"><div id="ulist"><p class="empty">Loading…</p></div>`;
  $('#usq').oninput=e=>{UQ=e.target.value;drawUsers()};
  if(!USERS){
    const r=await sbf('/rest/v1/profiles?approved=eq.true&select=id,username,role&order=username.asc');
    USERS=r.ok?await r.json():[];
  }
  if(view==='users')drawUsers();
}
function drawUsers(){
  const box=$('#ulist');if(!box)return;
  const q=fold(UQ).trim(),list=(USERS||[]).filter(u=>u.id!==SESS?.user.id&&fold(u.username).includes(q));
  box.innerHTML=list.length?`<div class="ul">${list.map(u=>`<button class="urow" data-au="viewlib:${u.id}" data-name="${esc(u.username)}">${avatar(u.username)}<span class="un">@${esc(u.username)}</span>${u.role==='admin'?'<span class="badge">Admin</span>':''}<span class="go">›</span></button>`).join('')}</div>`:'<p class="meta">No members found.</p>';
}
async function openUserLib(id,name){
  $('#main').innerHTML='<p class="empty">Loading…</p>';
  const r=await sbf(`/rest/v1/movies?user_id=eq.${id}&select=*&order=created_at.desc`);
  const rows=r.ok?(await r.json()).filter(isW):[];
  VU={id,name,rows};VIEWU=VU;libPage=1;view='ulib';render();window.scrollTo(0,0);
}
