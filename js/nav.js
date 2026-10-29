/* Header navigation: tab icons, tab list and search-box handlers */
/* ---------- views ---------- */
const IC={
 public:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.8 0 4.5 2 4.5 5"/>',
 admin:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 account:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
 login:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
 dashboard:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
 library:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h18M3 16h4M17 8h4M17 16h4"/>',
 watch:'<path d="M6 3h12v18l-6-4-6 4z"/>',
 quiz:'<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18.5" cy="13.5" r=".8"/>',
 stats:'<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
 board:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'};
function tabs(){
  const t=[['public','Public']];
  if(canUse())t.push(['dashboard','Dashboard'],['library','Library'],['watch','To Watch'],['board','Leaderboard'],['stats','Statistics'],['quiz','Quiz'],['users','Users']);
  if(isAdmin())t.push(['admin','Admin']);
  return t;
}
function nav(){
  const sv='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const hd=document.querySelector('header');hd.classList.toggle('few',tabs().length<=3);hd.classList.toggle('in',!!PROF);
  $('#hacct').innerHTML=PROF
    ?`<button class="hu" data-hv title="Your account">${avatar(PROF.username)}<span class="hn">@${esc(PROF.username)}</span>${ACCREQ?`<span class="dot" title="${ACCREQ} library access request${ACCREQ===1?'':'s'}">${ACCREQ}</span>`:''}</button><button class="btn ghost hb" data-hout aria-label="Log out" title="Log out"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg><span class="lt">Log out</span></button>`
    :'<button class="btn hb" data-login>Log in</button>';
  $('#nav').innerHTML=tabs().map(([k,l])=>`<button class="${view===k||(k==='users'&&view==='ulib')?'on':''}" data-v="${k}" aria-label="${l}" title="${l}"><svg ${sv}>${IC[k==='account'&&!PROF?'login':k]}</svg>${k==='admin'&&PENDING?`<span class="dot">${PENDING}</span>`:''}</button>`).join('');
}
$('#nav').onclick=e=>{const b=e.target.closest('[data-v]');if(b){if(b.dataset.v==='account'&&!PROF){openAuth('in');return}view=b.dataset.v;render();window.scrollTo(0,0)}};
$('#sf').onsubmit=e=>{e.preventDefault();const q=$('#q').value.trim();if(!q)return;SQ={q,type:'multi',page:1,data:null};window.scrollTo(0,0);runSearch()};
