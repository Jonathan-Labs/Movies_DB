/* To Watch screen */
function watchView(){
  const per=LV==='list'?50:24,pages=Math.max(1,Math.ceil(wl.length/per));wlPage=Math.min(wlPage,pages);
  PG=n=>{wlPage=n;watchView()};
  const el=$('#main'),part=wl.slice((wlPage-1)*per,wlPage*per);
  let body;
  if(LV==='list'){CRS='imdb';body=listHTML(part);CRS='mine'}   // nothing here is rated yet, so the list shows IMDb ratings
  else body=`<div class="grid">${part.map(card).join('')}</div>`;
  el.innerHTML=`<div class="hrow"><h2>To Watch (${wl.length})</h2>${viewToggle('vw',LV)}</div>`+(wl.length?`${body}${pager(wlPage,pages)}`:'<p class="empty">Nothing on your list yet. Search for a movie or series and press + To Watch.</p>');
  el.querySelectorAll('[data-vw]').forEach(b=>b.onclick=()=>{LV=b.dataset.vw;save('lview',LV);wlPage=1;watchView()});
}
