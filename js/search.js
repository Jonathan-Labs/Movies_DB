/* Search: titles, actors and keywords */
function normS(r,t){
  const mt=r.media_type||t;
  if(mt==='person')return{id:r.id,title:r.name,person:1,photo:r.profile_path?IMG+'w185'+r.profile_path:'',dept:r.known_for_department||'Acting'};
  if(mt==='movie'||mt==='tv')return{...norm({...r,media_type:mt}),st:1,year:(r.release_date||r.first_air_date||'').slice(0,4),tmdb_rating:r.vote_average?+r.vote_average.toFixed(1):null};
  return null;
}
const fold=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const inLib=id=>lib.some(x=>x.id===id);
/* titles from your library whose name contains the search text (shown first on page 1) */
function pinned(q,type){
  const f=fold(q).trim();if(!f||type==='person')return[];
  const rank=t=>{t=fold(t);return t===f?0:t.startsWith(f)?1:2};
  return lib.filter(m=>fold(m.title).includes(f)&&(type==='multi'||(type==='movie')===(m.id>0)))
    .sort((a,b)=>rank(a.title)-rank(b.title)||a.title.localeCompare(b.title)).map(m=>({...m,st:1}));
}
function prioritize(items,pin){
  const ids=new Set(pin.map(m=>m.id)),rest=items.filter(m=>!ids.has(m.id)),w=m=>!m.person&&inLib(m.id);
  return uniq([...pin,...rest.filter(w),...rest.filter(m=>!w(m))]);
}
async function runSearch(){
  const tok=SQ.tok=(SQ.tok||0)+1;
  view='search';nav();$('#main').innerHTML=loadingHTML('Searching…');
  try{
    if(SQ.type==='keyword')await runKeyword();
    else{
      const d=await tmdbPaged(`/search/${SQ.type}?query=${encodeURIComponent(SQ.q)}`,SQ.page);
      const pin=pinned(SQ.q,SQ.type),pids=new Set(pin.map(m=>m.id)),raw=d.results.map(r=>normS(r,SQ.type)).filter(Boolean);
      const items=SQ.page===1?prioritize(raw,pin):prioritize(raw.filter(m=>!pids.has(m.id)),[]);   // pinned titles are shown on page 1 only
      SQ.data={items,pages:d.total_pages||1,total:d.total_results||0};
    }
  }catch(err){$('#main').innerHTML=`<div class="msg">${esc(err.message)}</div>`;return}
  render();
  if(SQ.type==='keyword'&&SQ.data&&!SQ.data.rel)loadRelated(tok);
}
const kwChips=(list,active)=>list.map(x=>`<button class="chip${active&&active.includes(x.id)?' on':''}" data-kw="${x.id}" data-kn="${esc(x.name)}">${esc(x.name)}</button>`).join('');
async function runKeyword(){
  let ids,label;
  if(SQ.kw){ids=SQ.kw.ids;label=SQ.kw.label}
  else{
    const k=await tmdb(`/search/keyword?query=${encodeURIComponent(SQ.q)}`);
    SQ.matches=(k.results||[]).slice(0,12);
    if(!SQ.matches.length){SQ.data={items:[],pages:1,total:0,rel:[],kw:{label:SQ.q,ids:[],matches:[]}};return}
    const exact=SQ.matches.find(m=>m.name.toLowerCase()===SQ.q.toLowerCase());
    const pick=exact?[exact]:SQ.matches.slice(0,3);
    ids=pick.map(m=>m.id);label=pick.map(m=>m.name).join(', ');
  }
  const q=`with_keywords=${ids.join('|')}&sort_by=popularity.desc&page=${SQ.page}`;
  const [m,t]=await Promise.all([tmdb('/discover/movie?'+q),tmdb('/discover/tv?'+q)]);
  const items=[...m.results.map(r=>({r,t:'movie'})),...t.results.map(r=>({r,t:'tv'}))].sort((a,b)=>(b.r.popularity||0)-(a.r.popularity||0)).map(x=>normS(x.r,x.t)).filter(Boolean);
  SQ.data={items:prioritize(items,[]),pages:Math.min(Math.max(m.total_pages||1,t.total_pages||1),500),total:(m.total_results||0)+(t.total_results||0),kw:{label,ids,matches:SQ.matches||[]}};
}
/* suggestions: keywords that the titles on this page are tagged with */
async function loadRelated(tok){
  const cnt={};
  await Promise.all(SQ.data.items.slice(0,8).map(async m=>{
    try{const d=await tmdb(m.id>0?`/movie/${m.id}/keywords`:`/tv/${-m.id}/keywords`);
      (d.keywords||d.results||[]).forEach(k=>{(cnt[k.name.toLowerCase()]??={id:k.id,name:k.name,n:0}).n++})}catch{}
  }));
  if(tok!==SQ.tok||!SQ.data)return;
  const skip=new Set(SQ.data.kw?.ids||[]);
  SQ.data.rel=Object.values(cnt).filter(k=>!skip.has(k.id)).sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name)).slice(0,14);
  const box=$('#kwr');if(box)box.innerHTML=SQ.data.rel.length?kwChips(SQ.data.rel):'<span class="meta">None found</span>';
}
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-kwgo]');if(!c)return;
  SQ={q:c.dataset.kn,type:'keyword',page:1,data:null,kw:{ids:[+c.dataset.kwgo],label:c.dataset.kn}};
  $('#q').value=c.dataset.kn;lockTop=true;closeM();window.scrollTo({top:0});runSearch();
});
function kwBlock(d){
  const k=d.kw||{label:SQ.q,ids:[],matches:[]};
  const rel=d.rel?(d.rel.length?kwChips(d.rel):'<span class="meta">None found</span>'):'<span class="meta">${spinHTML()}Loading…</span>';
  return`<p class="meta">Titles tagged <b>${esc(k.label)}</b></p>
   ${k.matches.length?`<details class="kwd"><summary>Matching keywords (${k.matches.length})</summary><div class="chips">${kwChips(k.matches,k.ids)}</div></details>`:(SQ.kw?'':'<p class="meta">No keywords match that search. Try a shorter or different word.</p>')}
   <details class="kwd"><summary>Related keywords</summary><div class="chips" id="kwr">${rel}</div></details>`;
}
const TI={
 multi:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 movie:'<path d="M4 8h16v12H4z"/><path d="M4 8l3-5h4L8 8M12 8l3-5h4l-3 5"/>',
 tv:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 3l4 4 4-4"/>',
 person:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
 keyword:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>'};
function searchView(){
  const d=SQ.data;if(!d){$('#main').innerHTML='';return}
  const tabs=[['multi','All'],['movie','Movies'],['tv','Series'],['person','Actors'],['keyword','Keyword']];
  $('#main').innerHTML=`<h2>Results for “${esc(SQ.q)}”</h2>
   <div class="chips tabs">${tabs.map(([k,l])=>`<button class="chip${SQ.type===k?' on':''}" data-t="${k}" aria-label="${l}" title="${l}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${TI[k]}</svg></button>`).join('')}</div>
   <p class="meta">${d.total.toLocaleString()} result${d.total===1?'':'s'}</p>${SQ.type==='keyword'?kwBlock(d):''}
   ${d.items.length?`<div class="grid">${d.items.map(card).join('')}</div>`:'<p class="empty">Nothing found.</p>'}${pager(SQ.page,d.pages)}`;
  PG=n=>{SQ.page=n;runSearch()};
}
