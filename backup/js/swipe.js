/* Swipe/arrow-key browsing between titles and actors */
/* ---------- swipe to browse the next / previous title or actor ---------- */
let NAV=null;
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-m],[data-a]');if(!el)return;
  const k=el.dataset.m!==undefined?'m':'a';
  const box=el.closest('.grid,.lb,.cast,.hero,.atop,.lst')||document;
  const ids=[...box.querySelectorAll(`[data-${k}]`)].map(x=>+x.dataset[k]);
  NAV={k,ids,i:ids.indexOf(+el.dataset[k])};
},true);
function navStep(d){
  if(!NAV)return;const j=NAV.i+d;if(j<0||j>=NAV.ids.length)return;
  NAV.i=j;$('#modal').scrollTop=0;
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches)$('#sheet').animate([{transform:`translateX(${d*48}px)`,opacity:.2},{transform:'none',opacity:1}],{duration:220,easing:'ease-out'});
  MODE='replace';
  NAV.k==='m'?openMovie(NAV.ids[j]):openActor(NAV.ids[j]);
}
function onSwipe(el,cb,skip){
  let x,y,ok;
  el.addEventListener('touchstart',e=>{const t=e.touches[0];x=t.clientX;y=t.clientY;ok=!(skip&&e.target.closest(skip))},{passive:true});
  el.addEventListener('touchend',e=>{if(!ok)return;const t=e.changedTouches[0],dx=t.clientX-x,dy=t.clientY-y;if(Math.abs(dx)>60&&Math.abs(dx)>1.5*Math.abs(dy))cb(dx<0?1:-1)},{passive:true});
}
onSwipe($('#modal'),navStep,'.strip,.cast');
onSwipe(lb,lbStep,null);
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;
  if(!lb.hidden)lbStep(d);else if($('#modal').classList.contains('open'))navStep(d);
});
