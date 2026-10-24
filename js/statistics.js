/* Statistics screen */
/* ---------- statistics ---------- */
let META=load('meta')||{},statTok=0,RN;
try{RN=new Intl.DisplayNames(['en'],{type:'region'})}catch{}
const region=c=>{try{return RN?.of(c)||c}catch{return c}};
const timeCard=(v,l,sub)=>`<div class="stat"><b>${v}</b>${sub?`<em>${sub}</em>`:''}<span class="tl">${l}</span></div>`;
const statCard=(v,l,sub)=>`<div class="stat"><b>${v}</b><span>${l}</span>${sub?`<em>${sub}</em>`:''}</div>`;
const fmtH=min=>`${Math.floor(min/60).toLocaleString()} h`;
const fmtR=min=>`${min%60} m<br>${(min/1440).toFixed(1)} days`;
const EXP={},CH={};
function bars(rows,limit,key){
  if(!rows.length)return'<p class="meta">Nothing to show yet.</p>';
  CH[key]=[rows,limit];
  const open=!!EXP[key],show=open?rows:rows.slice(0,limit);
  const max=Math.max(...rows.map(r=>r[1]),1);
  return`<div class="chart">${show.map(([l,n])=>`<div class="br"><span class="bl" title="${esc(l)}">${esc(l)}</span><span class="bt"><i style="width:${n?Math.max(n/max*100,2):0}%"></i></span><span class="bn">${n}</span></div>`).join('')}${rows.length>limit?`<button class="vm" data-exp="${key}">${open?'Show less':`Show all (${rows.length})`}</button>`:''}</div>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-exp]');if(!b)return;
  const k=b.dataset.exp;EXP[k]=!EXP[k];
  const box=b.closest('.chart');if(box&&CH[k])box.outerHTML=bars(CH[k][0],CH[k][1],k);
});
/* countries and running time are not saved with each title, so they are fetched once from TMDB and cached in this browser */
async function ensureMeta(items,onP){
  const q=items.filter(m=>!META[m.id]),total=q.length;let done=0;onP(0,total);
  const worker=async()=>{
    while(q.length){
      const m=q.shift();
      try{
        const d=await tmdb(m.id>0?`/movie/${m.id}`:`/tv/${-m.id}`);
        const codes=m.id>0?(d.production_countries||[]).map(c=>c.iso_3166_1):(d.origin_country?.length?d.origin_country:(d.production_countries||[]).map(c=>c.iso_3166_1));
        let rt=0,ep=0;
        if(m.id>0)rt=d.runtime||m.runtime||0;
        else{ep=d.number_of_episodes||0;const per=(d.episode_run_time||[]).filter(Boolean);const avg=per.length?per.reduce((a,b)=>a+b,0)/per.length:(d.last_episode_to_air?.runtime||0);rt=Math.round(ep*avg)}
        META[m.id]={c:[...new Set(codes)],rt,ep};
      }catch{}
      done++;onP(done,total);if(done%20===0)save('meta',META);
    }
  };
  await Promise.all(Array.from({length:Math.min(6,total)},worker));
  save('meta',META);
}
async function statsView(){
  const tok=++statTok,el=$('#main');
  if(!lib.length){el.innerHTML='<h2>Statistics</h2><p class="empty">Rate a few titles and your statistics will show up here.</p>';return}
  const mv=lib.filter(m=>m.id>0),sr=lib.filter(m=>m.id<0);
  const cnt=(arr,f)=>{const o={};arr.forEach(m=>f(m).forEach(k=>o[k]=(o[k]||0)+1));return Object.entries(o).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))};
  const raw=m=>{const v=Object.values(m.ratings||{}).filter(Boolean);return v.length?v.reduce((x,y)=>x+y,0)/v.length:0};
  const rate=a=>[5,4,3,2,1].map(st=>[st===5?'5.0':`${st}.0 – ${st}.9`,a.filter(m=>Math.floor(raw(m))===st).length]);
  const labs=['All titles','Movies','Series'];
  el.innerHTML=`<h2>Statistics</h2>
   <div class="stats">${statCard(lib.length,'Titles watched')}${statCard(mv.length,'Movies')}${statCard(sr.length,'Series')}</div>
   <h2 class="hh">Total watch time</h2>
   <div class="stats" id="st-time">${labs.map(l=>timeCard('…',l)).join('')}</div>
   <p class="meta" id="st-load"></p>
   <h2 class="hh">Movies by My Rating</h2>${mv.length?bars(rate(mv),5,'rm'):'<p class="meta">No movies yet.</p>'}
   <h2 class="hh">Series by My Rating</h2>${sr.length?bars(rate(sr),5,'rs'):'<p class="meta">No series yet.</p>'}
   <h2 class="hh">Genres</h2>${bars(cnt(lib,m=>(m.genres||'').split(', ').filter(Boolean)),10,'g')}
   <h2 class="hh">Countries</h2><div id="st-country"><p class="meta">Loading…</p></div>`;
  const live=()=>tok===statTok&&view==='stats';
  await ensureMeta(lib,(d,n)=>{if(live()&&$('#st-load'))$('#st-load').textContent=n&&d<n?`Loading details… ${d}/${n}`:''});
  if(!live())return;
  const sum=a=>a.reduce((t,m)=>t+(META[m.id]?.rt||0),0),T=[sum(lib),sum(mv),sum(sr)];
  $('#st-time').innerHTML=labs.map((l,i)=>timeCard(fmtH(T[i]),l,fmtR(T[i]))).join('');
  $('#st-country').innerHTML=bars(cnt(lib,m=>(META[m.id]?.c||[]).map(region)),10,'c');
  const miss=lib.filter(m=>!META[m.id]).length;
  $('#st-load').textContent=miss?`${miss} title${miss===1?'':'s'} could not be loaded and ${miss===1?'is':'are'} left out of watch time and countries. Reopen this tab to try again.`:'';
}
