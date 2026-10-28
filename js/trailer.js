/* Trailer: pick the best YouTube trailer for a title and play it full-screen */
/* Prefers an official "Trailer", then any trailer, then a teaser; newest first. Returns {key,name} or null. */
function pickTrailer(d){
  const vids=(d&&d.videos&&d.videos.results||[]).filter(v=>v.site==='YouTube'&&v.key&&(v.type==='Trailer'||v.type==='Teaser'));
  const rank=v=>(v.type==='Trailer'?20:10)+(v.official?5:0);
  vids.sort((a,b)=>rank(b)-rank(a)||String(b.published_at||'').localeCompare(String(a.published_at||'')));
  return vids[0]?{key:vids[0].key,name:vids[0].name||'Trailer'}:null;
}
const tv=document.createElement('div');tv.id='tv';tv.hidden=true;
tv.innerHTML='<div class="tvbox"><div class="tvframe"></div><a class="tvyt" target="_blank" rel="noopener">Not playing? Open on YouTube</a></div><button class="tvx" aria-label="Close trailer">✕</button>';
document.body.appendChild(tv);
function playTrailer(key,title){
  tv.querySelector('.tvframe').innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?autoplay=1&rel=0&playsinline=1" title="${esc(title)} trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  tv.querySelector('.tvyt').href=`https://www.youtube.com/watch?v=${encodeURIComponent(key)}`;
  tv.hidden=false;
}
function closeTrailer(){tv.hidden=true;tv.querySelector('.tvframe').innerHTML=''}   // removing the player also stops the sound
tv.onclick=e=>{if(!e.target.closest('.tvframe,.tvyt'))closeTrailer()};
