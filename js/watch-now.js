/* Watch Now: list of streaming sites */
/* ---------- Watch Now: your own list of sites ---------- */
let sitesSb=false,STARCOL=true;   // sitesSb: Supabase "sites" table reachable; STARCOL: it has the "starred" column
async function sbPostSites(arr){
  const map=x=>STARCOL?{id:x.id,name:x.name,url:x.url,starred:!!x.starred}:{id:x.id,name:x.name,url:x.url};
  const go=()=>sbf('/rest/v1/sites',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify(arr.map(map))});
  let r=await go();
  if(!r.ok&&r.status===400&&STARCOL){STARCOL=false;r=await go()}   // column not added yet: keep going without it
  return r;
}
async function sitesLoad(){
  const local=load('sites')||[];
  try{
    const r=await sbf('/rest/v1/sites?select=*&order=created_at.asc');
    if(!r.ok)throw new Error(r.status);
    const rows=await r.json();sitesSb=true;
    if(rows.length)STARCOL='starred' in rows[0];
    if(!rows.length&&local.length&&isAdmin()){await sbPostSites(local);SITES=local}   // first time: copy the admin's old local sites up
    else{
      const lm=Object.fromEntries(local.map(x=>[x.id,!!x.starred]));
      SITES=rows.map(x=>({id:x.id,name:x.name,url:x.url,starred:STARCOL?!!x.starred:!!lm[x.id]}));
    }
    save('sites',SITES);
  }catch{SITES=isAdmin()?local:[];sitesSb=false}
}
async function sitesPutMany(arr){
  if(!sitesSb)return;
  const r=await sbPostSites(arr);
  if(!r.ok)throw new Error(`Could not save to Supabase (${r.status}).`);
}
async function sitesPut(x){
  if(!sitesSb)return;
  const r=await sbPostSites([x]);
  if(!r.ok)throw new Error(`Could not save to Supabase (${r.status}).`);
}
async function sitesDel(id){
  if(!sitesSb)return;
  const r=await sbf('/rest/v1/sites?id=eq.'+encodeURIComponent(id),{method:'DELETE'});
  if(!r.ok)throw new Error(`Could not delete from Supabase (${r.status}).`);
}
const WREG='PH';   // region used for the official streaming info (JustWatch data via TMDB)
let SITES=load('sites')||[],WM=null,WP='',WF=null;
const slug=t=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const hasTpl=u=>/\{(query|slug|year|imdb)\}/.test(u);
const hostOf=u=>{try{return new URL(u.replace(/\{[a-z]+\}/g,'x')).hostname.replace(/^www\./,'')}catch{return''}};
function siteLink(s,m){
  const t=m.title,y=m.year||'';
  if(hasTpl(s.url))return s.url.replace(/\{query\}/g,encodeURIComponent(t)).replace(/\{slug\}/g,slug(t)).replace(/\{year\}/g,y).replace(/\{imdb\}/g,m.imdb_id||'');
  return 'https://www.google.com/search?q='+encodeURIComponent(`site:${hostOf(s.url)} ${t}${y?' '+y:''}`);
}
const WSV='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
function wnBody(m){
  const adm=isAdmin();
  const star=on=>`<svg viewBox="0 0 24 24" fill="${on?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>`;
  const rows=[...SITES].sort((a,b)=>(b.starred?1:0)-(a.starred?1:0)).map(s=>`<div class="wrow${s.starred?' pref':''}"><a class="wl" href="${esc(siteLink(s,m))}" target="_blank" rel="noopener noreferrer"><b>${esc(s.name)}</b><small>${esc(hostOf(s.url))}${hasTpl(s.url)?'':' · searched through Google'}</small></a>${adm?`
    <button class="wi wstar${s.starred?' on':''}" data-ws="star:${s.id}" aria-pressed="${!!s.starred}" aria-label="${s.starred?'Remove preferred mark from':'Mark as preferred:'} ${esc(s.name)}" title="${s.starred?'Preferred (tap to unmark)':'Mark as preferred'}">${star(!!s.starred)}</button>
    <button class="wi" data-ws="edit:${s.id}" aria-label="Edit ${esc(s.name)}" title="Edit"><svg ${WSV}><path d="M4 20h4L19 9l-4-4L4 16z"/></svg></button>
    <button class="wi" data-ws="del:${s.id}" aria-label="Delete ${esc(s.name)}" title="Delete"><svg ${WSV}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>`:(s.starred?`<span class="wi wstar on" title="Preferred" aria-label="Preferred">${star(true)}</span>`:'')}</div>`).join('');
  const cur=WF&&WF.id?SITES.find(x=>x.id===WF.id)||{}:{};
  const form=!adm?'':WF?`<div class="wform"><label>Name<input id="wn-name" value="${esc(cur.name||'')}" placeholder="Any name you like"></label>
    <label>Link<input id="wn-url" value="${esc(cur.url||'')}" placeholder="https://site.com/search?q={query}" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
    <p class="meta">To search automatically, search any word on the site, copy the address of the results page, and replace that word with <code>{query}</code>. If you paste just the site address, it is searched through Google instead. Also available: <code>{year}</code>, <code>{slug}</code>, <code>{imdb}</code>.</p>
    <div class="acts"><button class="btn" data-ws="save:">Save</button><button class="btn ghost" data-ws="cancel:">Cancel</button></div><p class="meta" id="wn-err"></p></div>`
    :'<button class="btn ghost" data-ws="add:">+ Add site</button>';
  const empty=adm?'No sites yet. Add the sites you use and they will open already searching for this title.':'No watch links have been added yet.';
  const note=adm?(sbOn()&&!sitesSb?'<p class="meta">These sites are saved on this device only. Create the sites table in Supabase to sync them.</p>':(sitesSb&&!STARCOL?'<p class="meta">Stars are saved on this device only. Add the starred column in Supabase to sync them.</p>':'')):'';
  return `${WP}${rows||(WF?'':`<p class="meta">${empty}</p>`)}${form}${note}`;
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-ws]');if(!b||!isAdmin())return;
  const [a,id]=b.dataset.ws.split(':');
  const err=t=>{const x=$('#wn-err');if(x)x.textContent=t;else alert(t)};
  try{
    if(a==='add')WF={id:null};
    else if(a==='edit')WF={id};
    else if(a==='cancel')WF=null;
    else if(a==='star'){
      const s=SITES.find(x=>x.id===id);if(!s)return;
      const site={...s,starred:!s.starred};   // each link is starred on its own
      await sitesPut(site);
      SITES=SITES.map(x=>x.id===id?site:x);save('sites',SITES);
    }
    else if(a==='del'){
      const s=SITES.find(x=>x.id===id);if(!s||!confirm(`Delete “${s.name}”?`))return;
      await sitesDel(id);SITES=SITES.filter(x=>x.id!==id);save('sites',SITES);
    }else if(a==='save'){
      let name=$('#wn-name').value.trim(),url=$('#wn-url').value.trim();
      if(!url){err('Enter a link.');return}
      if(!/^https?:\/\//i.test(url))url='https://'+url;
      let u;try{u=new URL(url.replace(/\{[a-z]+\}/g,'x'))}catch{err('That link does not look valid.');return}
      if(!/^https?:$/.test(u.protocol)||!u.hostname.includes('.')){err('That link does not look valid.');return}
      if(!name)name=hostOf(url);
      b.disabled=true;
      const site=WF.id?{...(SITES.find(x=>x.id===WF.id)||{}),name,url}:{id:String(Date.now()),name,url};
      await sitesPut(site);
      SITES=WF.id?SITES.map(x=>x.id===site.id?site:x):[...SITES,site];save('sites',SITES);WF=null;
    }
  }catch(ex){err(ex.message||'Something went wrong.');b.disabled=false;return}
  const box=$('#wnb');if(box&&WM)box.innerHTML=wnBody(WM);
});
