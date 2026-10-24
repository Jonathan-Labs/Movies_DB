/* Watched screen: filters, grid/list views and sorting */
const F0={type:'all',genre:'all',year:'all',rating:'mine',sort:'az'},F={...F0};
const rtxt=w=>CRS==='imdb'?(w.imdb_rating?'IMDb '+w.imdb_rating:null):CRS==='tmdb'?(w.tmdb_rating?'TMDB '+w.tmdb_rating:null):(avgOf(w)?'★ '+avgOf(w):null);
function listHTML(items){
  return`<div class="lst"><div class="lrow lh"><span>Title</span><span>Year</span><span>Type</span><span style="text-align:right">Rating</span></div>${items.map(m=>`<button class="lrow" data-m="${m.id}"><span class="lt">${esc(m.title)}</span><span class="ly">${esc(m.year||'')}</span><span class="lk">${m.id<0?'Series':'Movie'}</span><span class="lr score">${rtxt(m)||'–'}</span></button>`).join('')}</div>`;
}
function library(src){
  const L=src||lib;
  const el=$('#main');
  const gs=[...new Set(L.flatMap(m=>(m.genres||'').split(', ').filter(Boolean)))].sort();
  const sel=(k,opts)=>`<select data-f="${k}">${opts.map(([v,l])=>`<option value="${esc(v)}"${String(F[k])===String(v)?' selected':''}>${esc(l)}</option>`).join('')}</select>`;
  const yrs=[...new Set(L.map(m=>m.year).filter(Boolean))].sort().reverse();
  el.innerHTML=`<div class="hrow"><h2>${src?`<button class="bk" data-au="back:">‹ Users</button> ${esc('@'+VU.name)}’s library`:'Watched'} <span id="cnt"></span></h2><div class="hact"><button class="btn ghost ftb" id="ft" aria-label="Filters" title="Filters" aria-expanded="${fOpen}" aria-controls="fp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg><span class="ftl">Filters</span> <span class="fb" id="fb" hidden>0</span></button>${viewToggle('vw',LV)}</div></div><div class="filters" id="fp"${fOpen?'':' hidden'}>
   <label>Type${sel('type',[['all','All'],['movie','Movies'],['tv','Series']])}</label>
   <label>Genre${sel('genre',[['all','All genres'],...gs.map(g=>[g,g])])}</label>
   <label>Release year${sel('year',[['all','All years'],...yrs.map(y=>[y,y])])}</label>



   <label>Ratings${sel('rating',[['mine','My Ratings'],['imdb','IMDb'],['tmdb','TMDB'],['none','No ranking']])}</label>
   <label>Sort by${sel('sort',[['az','Title A–Z'],['za','Title Z–A'],['new','Release: newest'],['old','Release: oldest'],['recent','Recently added']])}</label>
   <button class="btn ghost ic" id="rs" aria-label="Reset filters" title="Reset filters"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button></div><div id="res"></div>`;
  const rv=m=>F.rating==='imdb'?num(m.imdb_rating):F.rating==='tmdb'?num(m.tmdb_rating):num(avgOf(m));
  const by={recent:()=>0,az:(a,b)=>a.title.localeCompare(b.title),za:(a,b)=>b.title.localeCompare(a.title),
    new:(a,b)=>num(b.year)-num(a.year),old:(a,b)=>num(a.year)-num(b.year),};
  const paint=()=>{
    const l=L.filter(m=>(F.type==='all'||(F.type==='tv')===(m.id<0))&&(F.genre==='all'||(m.genres||'').split(', ').includes(F.genre))
      &&(F.year==='all'||m.year===F.year)).sort((a,b)=>(F.rating==='none'?0:rv(b)-rv(a))||by[F.sort](a,b));
    $('#cnt').textContent=`(${l.length}${l.length!==L.length?' of '+L.length:''})`;
    const per=LV==='list'?50:24,pages=Math.max(1,Math.ceil(l.length/per));libPage=Math.min(libPage,pages);PG=n=>{libPage=n;paint()};
    const nf=Object.keys(F0).filter(k=>F[k]!==F0[k]).length;$('#fb').textContent=nf;$('#fb').hidden=!nf;
    CRS=F.rating==='none'?'mine':F.rating;CSRC=src||null;
    $('#res').innerHTML=l.length?`${LV==='list'?listHTML(l.slice((libPage-1)*per,libPage*per)):`<div class="grid">${l.slice((libPage-1)*per,libPage*per).map(card).join('')}</div>`}${pager(libPage,pages)}`:`<p class="empty">${L.length?'No titles match these filters.':(src?'This library is empty.':'Nothing here yet. Search for a movie or series above to log your first one.')}</p>`;
    CRS='mine';CSRC=null;
  };
  $('.filters').oninput=e=>{const k=e.target.dataset.f;if(!k)return;F[k]=e.target.value;libPage=1;paint()};
  $('#rs').onclick=()=>{Object.assign(F,F0);libPage=1;library(src)};
  $('#ft').onclick=()=>{fOpen=!fOpen;$('#fp').hidden=!fOpen;$('#ft').setAttribute('aria-expanded',fOpen)};
  el.querySelectorAll('[data-vw]').forEach(b=>b.onclick=()=>{LV=b.dataset.vw;save('lview',LV);libPage=1;library(src)});
  paint();
}
let CSRC=null,CRS='mine',LV=load('lview')==='list'?'list':'grid',fOpen=false,pgBoard=1,libPage=1,wlPage=1,PG=null,SQ={q:'',type:'multi',page:1,data:null};
