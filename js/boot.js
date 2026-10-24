/* Start-up: load data after login and show the first screen */
/* ---------- boot ---------- */
async function reloadAll(){
  if(SESS&&SESS.expires_at<Date.now()/1000+60)await refreshSess();
  await loadProfile();
  QZ=load(qzKey())||(isAdmin()&&load('quiz'))||{best:{},hist:[]};
  const sp=sitesLoad();
  all=[];
  if(canUse()){try{all=await dbAll()}catch(e){console.error(e)}}
  split();await sp;
  PENDING=0;
  if(isAdmin()){try{const r=await sbf('/rest/v1/profiles?approved=eq.false&select=id');if(r.ok)PENDING=(await r.json()).length}catch{}}
}
async function afterAuth(go){
  USERS=null;await reloadAll();
  view=go==='account'&&PROF?'account':canUse()?(go&&go!=='public'?go:'dashboard'):(go==='public'||!PROF?'public':'account');
  render();window.scrollTo(0,0);
}
async function boot(){await reloadAll()}
if(history.state&&history.state.k)history.replaceState(null,'');
boot().then(()=>{split();view=canUse()?'dashboard':'public';render()});
