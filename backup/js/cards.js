/* Shared view helpers: poster cards, average rating, "view more" clamps */
const num=x=>+x||0;
function card(m){
  if(m.person)return `<button class="poster" data-a="${m.id}">${m.photo?`<img loading="lazy" src="${m.photo}" alt="">`:'<div class="ph">No photo</div>'}<div>${esc(m.title)}<small>${m.dept==='Acting'?'Actor':esc(m.dept)}</small></div></button>`;
  const w=(CSRC||all).find(x=>x.id===m.id);
  const yr=(m.year||(m.release_date||'').slice(0,4)||'');
  const poster=m.poster||(m.poster_path?IMG+'w342'+m.poster_path:'');
  const avg=w?(CRS==='imdb'?(w.imdb_rating?'IMDb '+w.imdb_rating:null):CRS==='tmdb'?(w.tmdb_rating?'TMDB '+w.tmdb_rating:null):(avgOf(w)?'★ '+avgOf(w):null)):null;
  return `<button class="poster" data-m="${m.id}">${poster?`<img loading="lazy" src="${poster}" alt="">`:`<div class="ph">No poster</div>`}
  <div>${esc(m.title)}<small>${m.st?(m.id<0?'Series':'Movie')+' · ':''}${yr}${!m.st&&m.id<0?' · Series':''}${w&&!isW(w)?' · To Watch':''}${avg?` · <span class="score">${avg}</span>`:''}</small></div></button>`;
}
const avgOf=m=>{const v=Object.values(m.ratings||{}).filter(Boolean);return v.length?(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):null};

function wireClips(root){
  root.querySelectorAll('.clip').forEach(el=>{
    const b=el.nextElementSibling;if(!b||!b.classList.contains('vm'))return;
    if(el.scrollHeight<=el.clientHeight+1){b.hidden=true;return}
    b.onclick=()=>{const o=el.classList.toggle('open');b.textContent=o?'View less':'View more'};
  });
}
