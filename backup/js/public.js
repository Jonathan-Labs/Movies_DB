/* Public dashboard (trending/popular) and small shared account helpers */
/* ---------- public dashboard, account, members and admin screens ---------- */
let PB={type:'movie',kind:'trending',page:1},ACCMSG='',AUTHM='in',USERS=null,UQ='',VU=null,VIEWU=null;
const avatar=n=>`<span class="uav">${esc((n||'?')[0].toUpperCase())}</span>`;
function ratePrompt(){
  return`<div class="rate"><h3 style="margin-top:0">Rate and save titles</h3><p class="meta">${PROF?'Your account is waiting for the admin to approve it. After that you can rate titles, keep a To Watch list, play games and see your statistics.':'Log in to rate this title, add it to your To Watch list, play the games and see your statistics.'}</p>${PROF?'':'<button class="btn" data-login>Log in or create an account</button>'}</div>`;
}
function viewedLine(id){
  if(view!=='ulib'||!VU)return'';
  const x=VU.rows.find(r=>r.id===id);if(!x)return'';
  return`<p class="meta">@${esc(VU.name)} rated this <span class="score">★ ${avgOf(x)}</span> · ${CATS.map(([k,l])=>`${l} ${x.ratings[k]}`).join(' · ')}</p>`;
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');if(!g)return;
  view=g.dataset.go;lockTop=true;closeM();
});

async function publicView(){
  const el=$('#main'),T=[['movie','Movies'],['tv','Series']];
  const kinds=PB.type==='person'?[['popular','Popular']]:[['trending','Trending'],['popular','Popular'],['top','Top rated']];
  if(!kinds.some(k=>k[0]===PB.kind))PB.kind=kinds[0][0];
  const sv='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  el.innerHTML=`<div class="chips tabs">${T.map(([k,l])=>`<button class="chip${PB.type===k?' on':''}" data-au="pbt:${k}" aria-label="${l}" title="${l}"><svg ${sv}>${TI[k]}</svg></button>`).join('')}</div>
   <div class="chips">${kinds.map(([k,l])=>`<button class="chip${PB.kind===k?' on':''}" data-au="pbk:${k}">${l}</button>`).join('')}</div>
   <div id="pbres"><p class="empty">Loading…</p></div>`;
  const path=PB.type==='person'?'/person/popular':PB.kind==='trending'?`/trending/${PB.type}/week`:`/${PB.type}/${PB.kind==='top'?'top_rated':'popular'}`;
  let d;
  try{d=await tmdbPaged(path,PB.page)}catch(err){if(view==='public')$('#pbres').innerHTML=`<div class="msg">${esc(err.message)}</div>`;return}
  if(view!=='public'||!$('#pbres'))return;
  const items=d.results.map(r=>normS(r,PB.type)).filter(Boolean);
  PG=n=>{PB.page=n;publicView()};
  $('#pbres').innerHTML=`<div class="grid">${items.map(card).join('')}</div>${pager(PB.page,d.total_pages||1)}`;
}
