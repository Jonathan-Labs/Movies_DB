/* Light / dark theme: saved choice wins, otherwise follow the device setting.
   The <html data-theme> attribute is first set by a tiny inline script in index.html (avoids a flash). */
(function(){
  const KEY='bm-theme',root=document.documentElement,btn=document.getElementById('themeBtn');
  const meta=document.querySelector('meta[name="theme-color"]');
  const apply=t=>{
    root.setAttribute('data-theme',t);
    if(meta)meta.setAttribute('content',t==='light'?'#f6f5f9':'#0a0a0a');
    if(btn){btn.setAttribute('aria-pressed',t==='light');btn.title=btn.ariaLabel=t==='light'?'Switch to dark mode':'Switch to light mode'}
  };
  apply(root.getAttribute('data-theme')==='light'?'light':'dark');
  if(btn)btn.onclick=()=>{
    const t=root.getAttribute('data-theme')==='light'?'dark':'light';
    apply(t);try{localStorage.setItem(KEY,t)}catch{}
  };
  /* follow the device setting live, but only until the person picks a theme themselves */
  const mq=window.matchMedia&&matchMedia('(prefers-color-scheme: light)');
  if(mq&&mq.addEventListener)mq.addEventListener('change',e=>{let s=null;try{s=localStorage.getItem(KEY)}catch{}if(!s)apply(e.matches?'light':'dark')});
})();
