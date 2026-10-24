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
   This builds 24-item pages (3 full rows of 8, 4 of 6, ...) by stitching together TMDB's 20-item pages.
   Same shape as a normal TMDB response: { results, total_results, total_pages }. */
const PER_PAGE=24;
async function tmdbPaged(path,page,per=PER_PAGE){
  const sep=path.includes('?')?'&':'?';
  const start=(page-1)*per,end=start+per;
  const first=Math.floor(start/20)+1,last=Math.min(Math.floor((end-1)/20)+1,500);   // TMDB serves at most 500 pages
  const nums=[];for(let p=first;p<=last;p++)nums.push(p);
  if(!nums.length)return{results:[],total_results:0,total_pages:1};
  const ds=await Promise.all(nums.map(p=>tmdb(`${path}${sep}page=${p}`)));
  const total=ds[0].total_results||0,offset=start-(first-1)*20;
  return{
    results:ds.flatMap(d=>d.results||[]).slice(offset,offset+per),
    total_results:total,
    total_pages:Math.max(1,Math.ceil(Math.min(total,10000)/per))   // 10,000 = 500 pages x 20
  };
}
