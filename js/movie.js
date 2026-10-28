/* Film / series detail pop-up */
async function openMovie(id){
  track('m',id);
  open(loadingHTML());
  let d,saved=all.find(x=>x.id===id);
  const tv=id<0;
  try{d=await tmdb(tv?`/tv/${-id}?append_to_response=aggregate_credits,external_ids,images,keywords,videos,watch/providers&include_image_language=en,null&include_video_language=en,null`:`/movie/${id}?append_to_response=credits,external_ids,images,keywords,videos,watch/providers&include_image_language=en,null&include_video_language=en,null`)}
  catch(err){open(`<div class="msg">${esc(err.message)}</div>`);return}
  const imdbId=d.external_ids?.imdb_id||null;
  const shots=(d.images?.backdrops||[]).slice(0,16).map(x=>x.file_path);
  const trailer=pickTrailer(d);   // null when TMDB has no YouTube trailer/teaser for this title
  const trlBtn=`<button type="button" class="trl${trailer?'':' off'}" id="trl"${trailer?'':' aria-disabled="true"'} title="${trailer?'Play trailer':'No trailer available'}">▶ Trailer</button>`;
  const kws=(tv?d.keywords?.results:d.keywords?.keywords)||[];
  const kwH=kws.length?`<details class="kwd mkw"><summary>Keywords (${kws.length})</summary><div class="chips">${kws.map(k=>`<button class="chip" data-kwgo="${k.id}" data-kn="${esc(k.name)}">${esc(k.name)}</button>`).join('')}</div></details>`:'';
  const cr=tv?d.aggregate_credits:d.credits;
  const info=tv?`Series · ${d.number_of_seasons} season${d.number_of_seasons===1?'':'s'} · ${d.number_of_episodes} episodes`:`${d.runtime||'?'} min`;
  const m={id,title:d.title||d.name,year:(d.release_date||d.first_air_date||'').slice(0,4),poster:d.poster_path?IMG+'w342'+d.poster_path:'',
    overview:d.overview,runtime:tv?(d.episode_run_time?.[0]||null):d.runtime,genres:(d.genres||[]).map(g=>g.name).join(', '),
    tmdb_rating:d.vote_average?+d.vote_average.toFixed(1):null,imdb_id:imdbId,
    director:tv?(d.created_by||[]).map(c=>c.name).join(', '):(d.credits?.crew||[]).filter(c=>c.job==='Director').map(c=>c.name).join(', '),
    cast:(cr?.cast||[]).slice(0,20).map(c=>({id:c.id,name:c.name,character:c.character||c.roles?.[0]?.character||'',photo:c.profile_path?IMG+'w185'+c.profile_path:''})),
    imdb_rating:saved?.imdb_rating||null,ratings:saved?.ratings||{}};
  const om=await omdbData(imdbId);
  if(!m.imdb_rating&&om?.imdbRating&&om.imdbRating!=='N/A')m.imdb_rating=om.imdbRating;
  let awH=spinHTML()+'Loading…';
  const wpv=d['watch/providers']?.results?.[WREG];
  const pn=wpv?[...new Set([...(wpv.flatrate||[]),...(wpv.free||[]),...(wpv.ads||[])].map(x=>x.provider_name))].slice(0,6):[];
  WM=m;WF=null;
  WP=wpv?`<p class="meta">Official streaming in ${WREG}: ${pn.length?esc(pn.join(', ')):'rent or buy only'} · <a href="${esc(wpv.link)}" target="_blank" rel="noopener noreferrer" style="color:var(--hot)">see options</a> (data by JustWatch)</p>`:'';
  const r={...m.ratings};
  const paint=()=>{
    const watched=saved&&isW(saved);
    open(`<div class="top">${m.poster?`<img class="zm" src="${m.poster}" data-full="${m.poster.replace('/w342/','/w780/')}" alt="">`:''}<div>
      <h2>${esc(m.title)}</h2><p class="meta">${m.year} · ${info} · ${esc(m.genres)}</p>
      <div class="badges">${m.imdb_rating?`<span class="badge">IMDb <span class="score">${m.imdb_rating}</span></span>`:''}
      ${m.tmdb_rating?`<span class="badge">TMDB <span class="score">${m.tmdb_rating}</span></span>`:''}
      ${m.director?`<span class="badge">${tv?'Created by':'Dir.'} ${esc(m.director)}</span>`:''}
      ${imdbId?`<a class="badge" style="color:var(--hot)" target="_blank" rel="noopener" href="https://www.imdb.com/title/${imdbId}/">View on IMDb</a>`:''}</div>
      ${viewedLine(id)}<details class="wnow" id="wn"><summary><span class="wbt">▶ Watch Now</span>${trlBtn}</summary><div class="wbody" id="wnb">${wnBody(m)}</div></details>
      <p class="clip">${esc(m.overview)}</p><button class="vm">View more</button>
      <details class="kwd mkw" id="maw"><summary>Awards</summary><div class="v">${awH}</div></details>${kwH}</div></div>
    ${shots.length?`<div class="strip wide">${shots.map(f=>`<img class="zm" loading="lazy" src="${IMG}w780${f}" data-full="${IMG}w1280${f}" alt="">`).join('')}</div>`:''}<h3>Cast</h3><div class="cast">${m.cast.map(a=>`<button data-a="${a.id}">${a.photo?`<img src="${a.photo}" alt="">`:'<div class="ph"></div>'}<span class="nm">${esc(a.name)}</span></button>`).join('')}</div>
    ${canUse()?`<div class="rate"><h3 style="margin-top:0">${watched?'Your ratings':'Rate it to mark it as watched'}</h3>
    ${CATS.map(([k,l])=>`<div class="row"><span>${l}</span><span class="stars">${[1,2,3,4,5].map(n=>`<button data-k="${k}" data-n="${n}" aria-label="${n} stars" class="${(r[k]||0)>=n?'f':''}">★</button>`).join('')}</span></div>`).join('')}
    <div class="acts"><button class="btn" id="add">${watched?'Update ratings':'Rate'}</button>${!saved?'<button class="btn ghost" id="wl">+ To Watch</button>':''}${saved?`<button class="btn danger ic" id="rm" aria-label="${watched?'Remove':'Remove from To Watch'}" title="${watched?'Remove':'Remove from To Watch'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg></button>`:''}</div></div>`:ratePrompt()}`);
    $('#sheet').querySelectorAll('.stars button').forEach(b=>b.onclick=()=>{r[b.dataset.k]=+b.dataset.n;paint()});
    $('#sheet').querySelectorAll('.cast button').forEach(b=>b.onclick=()=>openActor(+b.dataset.a));
    wireClips($('#sheet'));
    $('#trl').onclick=e=>{e.preventDefault();e.stopPropagation();if(trailer)playTrailer(trailer.key,m.title)};   // preventDefault: do not toggle the Watch Now list
    if($('#add'))$('#add').onclick=async()=>{
      if(CATS.some(([k])=>!r[k])){alert('Rate all four categories first.');return}
      m.ratings=r;try{await dbSave(m);saved=m;paint()}catch(e){alert(e.message)}};
    $('#wl')&&($('#wl').onclick=async()=>{m.ratings={};try{await dbSave(m);saved=m;paint()}catch(e){alert(e.message)}});
    $('#rm')&&($('#rm').onclick=async()=>{await dbDel(id);closeM()});
  };
  paint();
  movieTok=id;
  Promise.all([om?.Awards&&om.Awards!=='N/A'?om.Awards:'',d.external_ids?.wikidata_id?wd(d.external_ids.wikidata_id).catch(()=>null):null]).then(([note,wk])=>{
    awH=awardsHTML(wk?.awards||[],note);
    if(movieTok===id&&$('#maw .v'))$('#maw .v').innerHTML=awH;
  });
}
