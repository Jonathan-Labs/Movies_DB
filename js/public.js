/* Public dashboard (trending/popular) and small shared account helpers */
/* ---------- public dashboard, account, members and admin screens ---------- */
let PB={type:'movie',kind:'trending',page:1},ACCMSG='',AUTHM='in',USERS=null,UQ='',VU=null,VIEWU=null;
const avatar=(n,c='')=>`<span class="uav ${c}">${esc((n||'?')[0].toUpperCase())}</span>`;
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

/* Public screen: one Filters button (Type, Event) and the Picture/List toggle, like the Library. */
const PB0={type:'movie',kind:'trending'};
let pOpen=false,PV=load('pubView')==='list'?'list':'grid',PBC=null;   // PBC = last loaded page, so flipping the view does not refetch
async function publicView(){
  const el=$('#main');
  const T=[['movie','Movies'],['tv','Series']],K=[['trending','Trending'],['popular','Popular'],['top','Top rated']];
  const sel=(k,opts)=>`<select data-pf="${k}">${opts.map(([v,l])=>`<option value="${v}"${PB[k]===v?' selected':''}>${l}</option>`).join('')}</select>`;
  const nf=Object.keys(PB0).filter(k=>PB[k]!==PB0[k]).length;
  el.innerHTML=`<div class="hrow"><button class="btn ghost ftb" id="ft" aria-label="Filters" title="Filters" aria-expanded="${pOpen}" aria-controls="fp"><svg ${VSV}><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg><span class="ftl">Filters</span> <span class="fb"${nf?'':' hidden'}>${nf}</span></button>${viewToggle('pv',PV)}</div>
   <div class="filters" id="fp"${pOpen?'':' hidden'}>
    <label>Type${sel('type',T)}</label>
    <label>Event${sel('kind',K)}</label>
    <button class="btn ghost ic" id="rs" aria-label="Reset filters" title="Reset filters"><svg ${VSV}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button></div>
   <div id="pbres">${loadingHTML()}</div>`;
  $('#ft').onclick=()=>{pOpen=!pOpen;$('#fp').hidden=!pOpen;$('#ft').setAttribute('aria-expanded',pOpen)};
  el.querySelectorAll('[data-pf]').forEach(s=>s.onchange=()=>{PB[s.dataset.pf]=s.value;PB.page=1;publicView()});
  $('#rs').onclick=()=>{Object.assign(PB,PB0,{page:1});publicView()};
  el.querySelectorAll('[data-pv]').forEach(b=>b.onclick=()=>{PV=b.dataset.pv;save('pubView',PV);publicView()});
  const key=`${PB.type}|${PB.kind}|${PB.page}`;
  let c=PBC&&PBC.key===key?PBC:null;
  if(!c){
    const path=PB.kind==='trending'?`/trending/${PB.type}/week`:`/${PB.type}/${PB.kind==='top'?'top_rated':'popular'}`;
    let d;
    try{d=await tmdbPaged(path,PB.page)}catch(err){if(view==='public'&&$('#pbres'))$('#pbres').innerHTML=`<div class="msg">${esc(err.message)}</div>`;return}
    c=PBC={key,items:uniq(d.results.map(r=>normS(r,PB.type)).filter(Boolean)),pages:d.total_pages||1};
  }
  if(view!=='public'||!$('#pbres'))return;
  PG=n=>{PB.page=n;publicView()};
  let body;
  if(PV==='list'){CRS='tmdb';body=listHTML(c.items);CRS='mine'}
  else body=`<div class="grid">${c.items.map(card).join('')}</div>`;
  $('#pbres').innerHTML=`${body}${pager(PB.page,c.pages)}`;
}
