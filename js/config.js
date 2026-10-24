/* Config, small helpers, localStorage and shared app state */
/* ---------- config & storage ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const load=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const DEF={tmdb:'839adee8e20e6a241d50bf54b4e86116',omdb:'f994cdc4',sbUrl:'https://cnktxqtdrtztkcveuimj.supabase.co',sbKey:'sb_publishable_Z4hYMpx8Ehk87fAjAi5Gnw_L9VcmYB_'};
let cfg={...DEF,...(load('cfg')||{})};
if(!cfg.sbUrl)cfg.sbUrl=DEF.sbUrl;
if(!cfg.sbKey)cfg.sbKey=DEF.sbKey;
cfg.sbUrl=cfg.sbUrl.replace(/\/rest\/v1\/?$/,'').replace(/\/$/,'');
if(!cfg.tmdb)cfg.tmdb=DEF.tmdb;
if(!cfg.omdb)cfg.omdb=DEF.omdb;
let lib=[],view='library',results=[];
let all=[],wl=[];
const isW=m=>CATS.every(([k])=>m.ratings&&m.ratings[k]);
function split(){lib=all.filter(isW);wl=all.filter(m=>!isW(m))}
const IMG='https://image.tmdb.org/t/p/';
/* Series are stored with a negative id (-tmdbId) so they never clash with movie ids; no table change needed */
const norm=r=>({id:r.media_type==='tv'?-r.id:r.id,title:r.title||r.name,release_date:r.release_date||r.first_air_date,poster_path:r.poster_path});
const CATS=[['story','Story'],['prod','Quality'],['perf','Performance'],['like','BidoMeter']];

const sbOn=()=>cfg.sbUrl&&cfg.sbKey;
