/* Library access: members must ask the owner before they can see a library */
/* ACC.mine[ownerId] = my request's status ('pending' | 'approved' | 'denied'); ACC.inbox = requests other members sent to me.
   ACC.ok is false when the library_access table does not exist yet (supabase-library-access.sql not run): nobody can open other libraries then. */
let ACC={ok:false,mine:{},inbox:[]},ACCREQ=0;
async function accessLoad(){
  const next={ok:false,mine:{},inbox:[]};
  try{
    if(canUse()){
      const r=await sbf('/rest/v1/library_access?select=*&order=created_at.desc');
      if(r.ok){
        const me=SESS.user.id;next.ok=true;
        (await r.json()).forEach(x=>{if(x.requester_id===me)next.mine[x.owner_id]=x.status;if(x.owner_id===me)next.inbox.push(x)});
      }
    }
  }catch{}
  ACC=next;ACCREQ=ACC.inbox.filter(x=>x.status==='pending').length;
}
const accDate=s=>s?new Date(s).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}):'';
async function nameMap(ids){
  const out={};(USERS||[]).forEach(u=>out[u.id]=u.username);
  const need=[...new Set(ids)].filter(i=>!out[i]);
  if(need.length){try{const r=await sbf(`/rest/v1/profiles?id=in.(${need.join(',')})&select=id,username`);if(r.ok)(await r.json()).forEach(u=>out[u.id]=u.username)}catch{}}
  return out;
}
/* buttons: reqacc / cancelacc (requester), accok / accno / accrev (owner) */
async function accessClick(a,v){
  const me=SESS.user.id,H={Prefer:'return=minimal'};
  let r;
  if(a==='reqacc')r=await sbf('/rest/v1/library_access?on_conflict=owner_id,requester_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({owner_id:v,requester_id:me,status:'pending'})});
  else if(a==='cancelacc')r=await sbf(`/rest/v1/library_access?owner_id=eq.${v}&requester_id=eq.${me}`,{method:'DELETE',headers:H});
  else if(a==='accok'||a==='accno')r=await sbf(`/rest/v1/library_access?owner_id=eq.${me}&requester_id=eq.${v}`,{method:'PATCH',headers:H,body:JSON.stringify({status:a==='accok'?'approved':'denied'})});
  else if(a==='accrev')r=await sbf(`/rest/v1/library_access?owner_id=eq.${me}&requester_id=eq.${v}`,{method:'DELETE',headers:H});
  else return;
  if(!r.ok){alert(r.status===404?'Library requests are not set up yet. The admin needs to run supabase-library-access.sql in Supabase.':`Could not update the request (${r.status}).`);return}
  await accessRefresh();
}
async function accessRefresh(){
  await accessLoad();nav();
  if(view==='users')drawUsers();else if(view==='account')accessPanel();
}
/* "Library access" section on the Account page: who is asking, and who may already look */
async function accessPanel(){
  const box=$('#accs');if(!box||!canUse())return;
  await accessLoad();nav();
  if(!$('#accs'))return;
  if(!ACC.ok){box.innerHTML='<h3>Library access</h3><p class="meta">Not set up yet. The admin needs to run supabase-library-access.sql in Supabase.</p>';return}
  const pend=ACC.inbox.filter(x=>x.status==='pending'),okk=ACC.inbox.filter(x=>x.status==='approved');
  const nm=await nameMap([...pend,...okk].map(x=>x.requester_id));
  if(!$('#accs'))return;
  const card=(x,line,btns)=>{const n=nm[x.requester_id]||'member';return`<div class="ucard">${avatar(n,'lg')}<span class="un">@${esc(n)}</span><span class="ubot"><span class="ufoot">${line}</span><span class="abt">${btns}</span></span></div>`};
  box.innerHTML=`<h3>Library access</h3><p class="meta">Other members have to ask you before they can see your library.</p>
   <h3 class="hh">Requests (${pend.length})</h3>${pend.length?`<div class="ucards">${pend.map(x=>card(x,'Asked '+esc(accDate(x.created_at)),`<button class="btn" data-au="accok:${x.requester_id}">Approve</button><button class="btn ghost" data-au="accno:${x.requester_id}">Decline</button>`)).join('')}</div>`:'<p class="meta">No one is waiting.</p>'}
   <h3 class="hh">Can view your library (${okk.length})</h3>${okk.length?`<div class="ucards">${okk.map(x=>card(x,'Has access',`<button class="btn ghost" data-au="accrev:${x.requester_id}">Remove access</button>`)).join('')}</div>`:'<p class="meta">No one yet.</p>'}`;
}
