/* Film/actor pop-up shell: history, scroll lock, close handling */
/* ---------- modal ---------- */
const open=h=>{$('#sheet').innerHTML=`<button class="x" aria-label="Close" onclick="closeM()">✕</button>`+(depth>1?'<div class="bar"><button class="bk" onclick="history.back()">‹ Back</button></div>':'')+h;$('#modal').classList.add('open');lockPage()};
try{history.scrollRestoration='manual'}catch{}
let depth=0,MODE='push';
function track(k,id){
  const m=MODE;MODE='push';
  if(NAV&&!(NAV.k===k&&NAV.ids[NAV.i]===id)){const j=NAV.k===k?NAV.ids.indexOf(id):-1;if(j<0)NAV=null;else NAV.i=j}
  if(m==='pop')return;
  if(m==='replace'&&$('#modal').classList.contains('open'))history.replaceState({k,id,d:depth},'');
  else{depth++;history.pushState({k,id,d:depth},'')}
}
let lockY=null,lockTop=false;
function lockPage(){
  if(lockY!==null)return;
  lockY=window.scrollY;const b=document.body.style;
  b.position='fixed';b.top=`-${lockY}px`;b.left='0';b.right='0';
}
function unlockPage(){
  if(lockY===null)return;
  const b=document.body.style,y=lockY;
  b.position='';b.top='';b.left='';b.right='';lockY=null;
  window.scrollTo(0,lockTop?0:y);lockTop=false;
}
function doClose(){$('#modal').classList.remove('open');unlockPage();render()}
function closeM(){if(depth>0)history.go(-depth);else doClose()}
window.addEventListener('popstate',e=>{
  lb.hidden=true;const st=e.state;
  if(st&&st.k){depth=st.d;MODE='pop';st.k==='m'?openMovie(st.id):openActor(st.id)}
  else{depth=0;doClose()}
});
$('#modal').onclick=e=>{if(e.target.id==='modal')closeM()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lb.hidden){if(!am.hidden)closeAuth();else closeM()}});
