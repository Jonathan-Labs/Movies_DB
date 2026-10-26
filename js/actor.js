/* Actor detail pop-up */
async function openActor(pid){
  track('a',pid);
  actorTok=pid;
  open(loadingHTML());
  let p,c;
  try{[p,c]=await Promise.all([tmdb(`/person/${pid}?append_to_response=external_ids,images`),tmdb(`/person/${pid}/combined_credits`)])}
  catch(err){open(`<div class="msg">${esc(err.message)}</div>`);return}
  const seen=new Set(),films=(c.cast||[]).filter(f=>(f.media_type==='movie'||f.media_type==='tv')&&!/self|himself|herself/i.test(f.character||'')&&!(f.genre_ids||[]).some(g=>[10767,10763,10764].includes(g))).map(norm).filter(f=>f.release_date&&!seen.has(f.id)&&seen.add(f.id)).sort((a,b)=>b.release_date.localeCompare(a.release_date)).sort((a,b)=>inLib(b.id)-inLib(a.id));
  const n=films.filter(f=>lib.some(x=>x.id===f.id)).length;
  const D=d=>new Date(d+'T00:00:00');
  const fmt=d=>D(d).toLocaleDateString('en',{year:'numeric',month:'long',day:'numeric'});
  const ageOf=(b,e)=>{const B=D(b),E=e?D(e):new Date();let a=E.getFullYear()-B.getFullYear();if(E.getMonth()<B.getMonth()||(E.getMonth()===B.getMonth()&&E.getDate()<B.getDate()))a--;return a};
  const pics=(p.images?.profiles||[]).slice(0,24).map(x=>x.file_path);
  if(!pics.length&&p.profile_path)pics.push(p.profile_path);
  const bio=p.biography||'';
  open(`${pics.length?`<div class="strip">${pics.map(f=>`<img class="zm" loading="lazy" src="${IMG}w342${f}" data-full="${IMG}h632${f}" alt="">`).join('')}</div>`:''}<div class="top"><div>
    <h2>${esc(p.name)}</h2>
    <div class="facts">
     ${p.birthday?`<p><span class="k">Born</span><span class="v">${fmt(p.birthday)}${p.deathday?'':` (age ${ageOf(p.birthday)})`}</span></p>`:''}
     ${p.deathday?`<p><span class="k">Died</span><span class="v">${fmt(p.deathday)}${p.birthday?` (age ${ageOf(p.birthday,p.deathday)})`:''}</span></p>`:''}
     ${p.place_of_birth?`<p><span class="k">Birthplace</span><span class="v">${esc(p.place_of_birth)}</span></p>`:''}
     ${p.deathday?'':'<p id="lv" hidden><span class="k">Lives in</span><span class="v"></span></p>'}
     </div>
    ${bio?`<p class="clip">${esc(bio)}</p><button class="vm">View more</button>`:''}
    <details class="kwd mkw" id="aw"><summary>Awards</summary><div class="v">${spinHTML()}Loading…</div></details>
    <div class="badges"><span class="badge">You’ve watched <span class="score">${n}</span> of ${films.length} titles</span></div></div></div>
    <h3 id="wk">Other work (${films.length})</h3><div id="work"></div>`);
  $('#sheet').querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>openMovie(+b.dataset.m));
  wireClips($('#sheet'));
  const per=20,pages=Math.max(1,Math.ceil(films.length/per));let wp=1;
  const draw=()=>{
    $('#work').innerHTML=films.length?`<div class="grid">${films.slice((wp-1)*per,wp*per).map(f=>card(f)).join('')}</div>${pager(wp,pages,'wp')}`:'<p class="meta">No other titles found.</p>';
    $('#work').querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>openMovie(+b.dataset.m));
    $('#work').querySelectorAll('[data-wp]').forEach(b=>b.onclick=()=>{wp=+b.dataset.wp;draw();$('#wk').scrollIntoView({block:'start'})});
  };
  draw();
  const setAw=h=>{if(actorTok===pid&&$('#aw .v'))$('#aw .v').innerHTML=h};
  const qid=p.external_ids?.wikidata_id;
  if(!qid){setAw('Not available');return}
  wd(qid).then(r=>{
    if(actorTok!==pid)return;
    if(r.home&&$('#lv')){$('#lv').hidden=false;$('#lv .v').textContent=r.home}
    setAw(awardsHTML(r.awards));
  }).catch(()=>setAw('Could not load awards'));
}
