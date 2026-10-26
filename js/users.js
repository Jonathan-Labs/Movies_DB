/* Users list and other members' libraries */
/* Users screen: small search box (magnifier inside) on the left, Filters button on the right.
   Filters = Sort by (Alphabetical / Date joined / Titles watched) + Order (Ascending / Descending). */
const USORT0={sort:'az',dir:'asc'};
let USORT={...USORT0},uOpen=false;
async function usersView(){
  const el=$('#main');
  const sel=(k,opts)=>`<select data-uf="${k}">${opts.map(([v,l])=>`<option value="${v}"${USORT[k]===v?' selected':''}>${l}</option>`).join('')}</select>`;
  const nf=Object.keys(USORT0).filter(k=>USORT[k]!==USORT0[k]).length;
  el.innerHTML=`<h2>Users</h2><p class="meta">Find other members and see what they have watched.</p>
   <div class="hrow"><label class="sbar"><svg ${VSV}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><input id="usq" type="search" aria-label="Search by username" placeholder="Search users…" value="${esc(UQ)}" autocomplete="off"></label>
    <button class="btn ghost ftb" id="ft" aria-label="Filters" title="Filters" aria-expanded="${uOpen}" aria-controls="fp"><svg ${VSV}><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg><span class="ftl">Filters</span> <span class="fb" id="fb"${nf?'':' hidden'}>${nf}</span></button></div>
   <div class="filters" id="fp"${uOpen?'':' hidden'}>
    <label>Sort by${sel('sort',[['az','Alphabetical'],['joined','Date joined'],['watched','Titles watched']])}</label>
    <label>Order${sel('dir',[['asc','Ascending'],['desc','Descending']])}</label>
    <button class="btn ghost ic" id="urs" aria-label="Reset filters" title="Reset filters"><svg ${VSV}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button></div>
   <div id="ulist">${loadingHTML()}</div>`;
  $('#usq').oninput=e=>{UQ=e.target.value;drawUsers()};
  $('#ft').onclick=()=>{uOpen=!uOpen;$('#fp').hidden=!uOpen;$('#ft').setAttribute('aria-expanded',uOpen)};
  el.querySelectorAll('[data-uf]').forEach(x=>x.onchange=()=>{USORT[x.dataset.uf]=x.value;drawUsers()});
  $('#urs').onclick=()=>{USORT={...USORT0};el.querySelectorAll('[data-uf]').forEach(x=>x.value=USORT[x.dataset.uf]);drawUsers()};
  if(!USERS){
    let r=await sbf('/rest/v1/profiles?approved=eq.true&select=id,username,role,created_at&order=username.asc');
    const [r2,counts]=await Promise.all([r.ok?r:sbf('/rest/v1/profiles?approved=eq.true&select=id,username,role&order=username.asc'),watchedCounts()]);   // falls back if the join date is not readable
    USERS=r2.ok?(await r2.json()).map(u=>({...u,n:counts?(counts[u.id]||0):null})):[];
  }
  if(view==='users')drawUsers();
}
/* How many titles each member has fully rated (= "watched"). Fetched in pages of 1000 because Supabase returns at most 1000 rows per request. */
async function watchedCounts(){
  const out={};
  try{
    for(let off=0;;off+=1000){
      const r=await sbf(`/rest/v1/movies?select=user_id,ratings&order=user_id.asc,id.asc&limit=1000&offset=${off}`);
      if(!r.ok)return null;
      const rows=await r.json();
      rows.forEach(m=>{if(isW(m))out[m.user_id]=(out[m.user_id]||0)+1});
      if(rows.length<1000)break;
    }
  }catch{return null}
  return out;
}
function drawUsers(){
  const box=$('#ulist');if(!box)return;
  const q=fold(UQ).trim(),list=(USERS||[]).filter(u=>u.id!==SESS?.user.id&&fold(u.username).includes(q));
  const az=(a,b)=>a.username.localeCompare(b.username,undefined,{sensitivity:'base'});
  const by={az,joined:(a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||''))||az(a,b),watched:(a,b)=>(a.n??-1)-(b.n??-1)||az(a,b)}[USORT.sort]||az;
  list.sort(by);if(USORT.dir==='desc')list.reverse();
  const nf=Object.keys(USORT0).filter(k=>USORT[k]!==USORT0[k]).length,fb=$('#fb');if(fb){fb.textContent=nf;fb.hidden=!nf}
  box.innerHTML=list.length?`<div class="ucards">${list.map(u=>`<button class="ucard" data-au="viewlib:${u.id}" data-name="${esc(u.username)}">${avatar(u.username,'lg')}<span class="un">@${esc(u.username)}</span><span class="ubot"><span class="ufoot"><b>${u.n??'–'}</b> film${u.n===1?'':'s'} watched</span></span></button>`).join('')}</div>`:'<p class="meta">No members found.</p>';
}
async function openUserLib(id,name){
  $('#main').innerHTML=loadingHTML();
  const r=await sbf(`/rest/v1/movies?user_id=eq.${id}&select=*&order=created_at.desc`);
  const rows=r.ok?(await r.json()).filter(isW):[];
  VU={id,name,rows};VIEWU=VU;libPage=1;view='ulib';render();window.scrollTo(0,0);
}
