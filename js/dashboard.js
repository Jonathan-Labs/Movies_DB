/* Dashboard: hero slideshows, top actors and recently added */
const H={};
function heroGo(key,n){
  const box=$('#h_'+key);if(!box)return;
  const sl=box.querySelectorAll('.slide'),ds=box.querySelectorAll('.dots button'),h=H[key];
  h.i=(n+sl.length)%sl.length;
  sl.forEach((e,i)=>e.classList.toggle('on',i===h.i));ds.forEach((e,i)=>e.classList.toggle('on',i===h.i));
}
function heroBox(key,title,n,fn){
  const h=H[key]=H[key]||{i:0,t:0};h.i%=n;
  const range=Array.from({length:n},(_,i)=>i);
  return`<section class="hsec">${title?`<h2 class="hh">${title}</h2>`:''}<div class="hero" id="h_${key}">${range.map(i=>fn(i,i===h.i?' on':'')).join('')}<button class="arrow l" aria-label="Previous">‹</button><button class="arrow r" aria-label="Next">›</button><div class="dots">${range.map(i=>`<button aria-label="Show slide ${i+1}" class="${i===h.i?'on':''}"></button>`).join('')}</div></div></section>`;
}
function heroWire(key,n,ms){
  const box=$('#h_'+key),h=H[key];
  const start=()=>{clearInterval(h.t);if(n>1)h.t=setInterval(()=>heroGo(key,h.i+1),ms)};
  box.querySelectorAll('.dots button').forEach((b,i)=>b.onclick=()=>{heroGo(key,i);start()});
  box.querySelector('.arrow.l').onclick=()=>{heroGo(key,h.i-1);start()};
  box.querySelector('.arrow.r').onclick=()=>{heroGo(key,h.i+1);start()};
  box.onmouseenter=()=>clearInterval(h.t);box.onmouseleave=start;start();
}
function dash(){
  const el=$('#main');
  if(!lib.length){el.innerHTML='<h2>Dashboard</h2><p class="empty">Your top rated titles will play here once you log something. Search for a movie or series above to start.</p>';return}
  const top=a=>a.filter(m=>num(avgOf(m))).sort((x,y)=>num(avgOf(y))-num(avgOf(x))||num(y.imdb_rating)-num(x.imdb_rating)).slice(0,6);
  const tm=top(lib.filter(m=>m.id>0)),ts=top(lib.filter(m=>m.id<0));
  const ac={};lib.forEach(m=>(m.cast||[]).forEach(a=>{const o=ac[a.id]??={id:a.id,name:a.name,photo:a.photo,n:0,films:[]};o.n++;o.films.push(m.title)}));
  const acts=Object.values(ac).filter(a=>a.photo).sort((x,y)=>y.n-x.n||x.name.localeCompare(y.name)).slice(0,10);
  const stat=(v,l)=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`;
  const SP='M12 1.7l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 17.8l-6.4 3.6L7 14.2 1.7 9.2l7.2-.9z';
  const star=(n,u)=>[0,1,2,3,4].map(i=>{const f=Math.round(Math.max(0,Math.min(1,n-i))*100);return `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="g${u}_${i}"><stop offset="${f}%" style="stop-color:var(--hot)"/><stop offset="${f}%" style="stop-color:#4a4a4a"/></linearGradient></defs><path d="${SP}" fill="url(#g${u}_${i})"/></svg>`}).join('');
  const titleSlide=(key,items)=>(i,on)=>{const m=items[i],a=avgOf(m);return`<div class="slide${on}">${m.poster?`<img class="full" src="${m.poster.replace('/w342/','/w780/')}" alt="">`:''}<div class="shade"></div>
    <div class="txt"><p class="meta">#${i+1} · ${m.id<0?'Series':'Movie'} · ${m.year}</p><h2>${esc(m.title)}</h2>
    <p><span class="sr">${star(a,key+i)}</span> <span class="score">${a}</span> <span class="meta">your rating</span></p>
    <div class="badges">${m.imdb_rating?`<span class="badge">IMDb <span class="score">${m.imdb_rating}</span></span>`:''}${m.tmdb_rating?`<span class="badge">TMDB <span class="score">${m.tmdb_rating}</span></span>`:''}${m.genres?`<span class="badge">${esc(m.genres)}</span>`:''}</div>
    <button class="btn" data-m="${m.id}">View details</button></div></div>`};
  const atop=acts.length?`<h2 class="hh">Top Watched Actors</h2><div class="atop">${acts.map(a=>`<button class="at" data-a="${a.id}">${a.photo?`<img loading="lazy" src="${a.photo.replace('/w185/','/h632/')}" alt="">`:'<div class="ph"></div>'}<b>${esc(a.name)}</b><small>${a.n} title${a.n===1?'':'s'}</small></button>`).join('')}</div>`:'';
  el.innerHTML=`<div class="stats">${stat(lib.length,'Titles watched')}${stat(lib.filter(m=>m.id>0).length,'Movies')}${stat(lib.filter(m=>m.id<0).length,'Series')}</div>`
    +((tm.length||ts.length)?`<div class="duo">${tm.length?heroBox('m','Top Rated Movies',tm.length,titleSlide('m',tm)):''}${ts.length?heroBox('s','Top Rated Series',ts.length,titleSlide('s',ts)):''}</div>`:'')
    +atop
    +`<h3>Recently Added</h3><div class="grid">${lib.slice(0,8).map(card).join('')}</div>`;
  [['m',tm],['s',ts]].forEach(([k,l],j)=>{if(l.length)heroWire(k,l.length,5000+j*700)});
}
