/* TMDB and OMDb requests */
/* ---------- APIs ---------- */
async function tmdb(path){
  if(!cfg.tmdb)throw new Error('TMDB API key is missing.');
  const r=await fetch('https://api.themoviedb.org/3'+path+(path.includes('?')?'&':'?')+'api_key='+cfg.tmdb);
  if(!r.ok)throw new Error('TMDB error '+r.status+'. Check your API key.');
  return r.json();
}
async function omdbData(id){
  if(!cfg.omdb||!id)return null;
  try{return await(await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${cfg.omdb}`)).json()}catch{return null}
}
async function imdbRating(id){
  if(!cfg.omdb||!id)return null;
  try{const d=await(await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${cfg.omdb}`)).json();return d.imdbRating&&d.imdbRating!=='N/A'?d.imdbRating:null}catch{return null}
}

/* TMDB sends 20 results per page, which leaves the last grid row half empty on wide screens.
   This builds full 24-item pages (3 rows of 8, 4 of 6, ...) out of TMDB's 20-item pages.
   If TMDB repeats a title or sends a short page, the page is topped up from the following results,
   so every page has 24 titles (only the very last page of a list can be shorter).
   Same shape as a normal TMDB response: { results, total_results, total_pages }. */
const PER_PAGE=24;
async function tmdbPaged(path,page,per=PER_PAGE){
  const sep=path.includes('?')?'&':'?';
  const start=(page-1)*per,p0=Math.floor(start/20)+1,skip=start-(p0-1)*20;
  if(p0>500)return{results:[],total_results:0,total_pages:1};   // TMDB serves at most 500 pages
  const got=new Map();
  const load=p=>{if(!got.has(p))got.set(p,tmdb(`${path}${sep}page=${p}`));return got.get(p)};
  if(p0<500)load(p0+1).catch(()=>{});   // usually needed as well, so request both at once
  const d0=await load(p0),lastPage=Math.min(d0.total_pages||1,500),out=[],seen=new Set();
  for(let p=p0;p<=lastPage&&p<p0+6&&out.length<per;p++){
    const d=p===p0?d0:await load(p);
    for(const r of (d.results||[]).slice(p===p0?skip:0)){
      const k=(r.media_type||'')+':'+r.id;
      if(out.length<per&&!seen.has(k)){seen.add(k);out.push(r)}
    }
  }
  const total=d0.total_results||0;
  return{results:out,total_results:total,total_pages:Math.max(1,Math.ceil(Math.min(total,10000)/per))};   // 10,000 = 500 pages x 20
}
