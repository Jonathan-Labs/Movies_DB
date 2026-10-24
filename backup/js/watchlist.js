/* To Watch screen */
function watchView(){
  const per=24,pages=Math.max(1,Math.ceil(wl.length/per));wlPage=Math.min(wlPage,pages);
  PG=n=>{wlPage=n;watchView()};
  $('#main').innerHTML=`<h2>To Watch (${wl.length})</h2>`+(wl.length?`<div class="grid">${wl.slice((wlPage-1)*per,wlPage*per).map(card).join('')}</div>${pager(wlPage,pages)}`:'<p class="empty">Nothing on your list yet. Search for a movie or series and press + To Watch.</p>');
}
