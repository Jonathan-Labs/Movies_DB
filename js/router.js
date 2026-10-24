/* render(): chooses which screen to show, plus main click handler */
/* Top Actors: 'grid' (large pictures, like the movie library; the default) or 'list' (rows). Remembered between visits. */
let BV=load('actorView')==='list'?'list':'grid';
function render(){
  const NL=['dashboard','library','watch','board','stats','quiz','users','ulib'];
  if(NL.includes(view)&&!canUse())view='public';
  if(view==='admin'&&!isAdmin())view='public';
  if(view==='ulib'&&!VU)view='users';
  Object.values(H).forEach(h=>clearInterval(h.t));clearInterval(QT);nav();const el=$('#main');
  if(view==='dashboard')dash();
  else if(view==='public')publicView();
  else if(view==='account')accountView();
  else if(view==='admin')adminView();
  else if(view==='users')usersView();
  else if(view==='ulib')library(VU.rows);
  else if(view==='library')library();
  else if(view==='watch')watchView();
  else if(view==='stats')statsView();
  else if(view==='quiz')quizView();
  else if(view==='search'){
    searchView();
  }else if(view==='board'){
    const map={};
    lib.forEach(m=>(m.cast||[]).forEach(a=>{(map[a.id]??={...a,n:0,films:[]}).n++;map[a.id].films.push(m.title)}));
    const rows=Object.values(map).filter(a=>a.photo).sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name));
    const per=24,pages=Math.max(1,Math.ceil(rows.length/per));pgBoard=Math.min(pgBoard,pages);const start=(pgBoard-1)*per;PG=n=>{pgBoard=n;render()};
    const toggle=viewToggle('bv',BV);
    const page=rows.slice(start,start+per);
    const listH=`<ul class="lb">${page.map((a,i)=>`<li data-a="${a.id}"><span class="rk">${start+i+1}</span>${a.photo?`<img src="${a.photo}" alt="">`:'<div class="ph"></div>'}<div>${esc(a.name)}<br><small style="color:var(--mute)">${esc(a.films.slice(0,3).join(', '))}${a.films.length>3?'…':''}</small></div><b>${a.n}</b></li>`).join('')}</ul>`;
    const gridH=`<div class="grid actors">${page.map((a,i)=>`<button class="poster" data-a="${a.id}"><img loading="lazy" src="${a.photo.replace('/w185/','/h632/')}" alt=""><div>${start+i+1}. ${esc(a.name)}<small>${a.n} title${a.n===1?'':'s'}</small></div></button>`).join('')}</div>`;
    el.innerHTML=`<div class="hrow"><h2>Top Actors (${rows.length})</h2>${toggle}</div>`+(rows.length?`${BV==='grid'?gridH:listH}${pager(pgBoard,pages)}`:'<p class="empty">Log a movie or series and its cast will show up here.</p>');
    el.querySelectorAll('[data-bv]').forEach(b=>b.onclick=()=>{BV=b.dataset.bv;save('actorView',BV);pgBoard=1;render()});
  }
}
$('#main').onclick=e=>{
  const au=e.target.closest('[data-au]');if(au){authClick(au);return}
  const kc=e.target.closest('[data-kw]');if(kc){SQ.type='keyword';SQ.kw={ids:[+kc.dataset.kw],label:kc.dataset.kn};SQ.page=1;runSearch();return}
  const z=e.target.closest('[data-qz]');if(z){quizClick(z);return}
  const t=e.target.closest('[data-t]');if(t){SQ.type=t.dataset.t;SQ.kw=null;SQ.page=1;runSearch();return}
  const m=e.target.closest('[data-m]'),a=e.target.closest('[data-a]');
  if(m)openMovie(+m.dataset.m);else if(a)openActor(+a.dataset.a);
};
