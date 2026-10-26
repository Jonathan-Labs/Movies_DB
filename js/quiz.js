/* Quiz games */
/* ---------- quiz ---------- */
let QZ=load(qzKey())||{best:{},hist:[]},QS={screen:'pick'},QT=0,KWC=load('kwc')||{};
const ROUNDS=10,NEED=8;
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const MODES={
  blurry:{name:'Blurry Poster',ic:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3.5"/>',desc:'A poster slowly comes into focus. Name the title before it gets clear. Faster answers score more.'},
  who:{name:'Who Was in It?',ic:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.8 0 4.5 2 4.5 5"/>',desc:'Match your actors with the films you have watched them in, or the other way around.'},
  kw:{name:'Keyword Clues',ic:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',desc:'Guess the film from its TMDB keywords. Extra clues cost points.'},
  hol:{name:'Higher or Lower',ic:'<path d="M8 20V6M4 10l4-4 4 4"/><path d="M16 4v14M12 14l4 4 4-4"/>',desc:'Is the next title rated higher or lower? Keep your streak going.'}};
function need(k){
  if(lib.length<NEED){const n=NEED-lib.length;return`Rate ${n} more title${n===1?'':'s'} to unlock`}
  if(k==='blurry'&&lib.filter(m=>m.poster).length<4)return'Needs at least 4 titles with posters';
  if(k==='who'&&lib.filter(m=>(m.cast||[]).length).length<4)return'Needs titles with saved cast lists';
  return'';
}
const qIcon=(k,c)=>`<i class="qi ${c}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${MODES[k].ic}</svg></i>`;
const optT=(m,ok)=>({ok,html:`<span>${esc(m.title)}<small> ${esc(m.year||'')}</small></span>`});
const optA=(a,ok)=>({ok,html:`<span class="qav">${a.photo?`<img src="${a.photo}" alt="">`:'<i></i>'}</span><span>${esc(a.name)}</span>`});
function opts4(c){
  const same=lib.filter(x=>x.id!==c.id&&(x.id<0)===(c.id<0));
  const pool=same.length>=3?same:lib.filter(x=>x.id!==c.id);
  return shuf([optT(c,true),...shuf(pool).slice(0,3).map(m=>optT(m,false))]);
}
const preload=u=>new Promise(r=>{const i=new Image();i.onload=i.onerror=r;i.src=u;setTimeout(r,4000)});
async function getKw(m){
  if(KWC[m.id])return KWC[m.id];
  const d=await tmdb(`/${m.id>0?'movie':'tv'}/${Math.abs(m.id)}/keywords`);
  const ks=(d.keywords||d.results||[]).map(k=>k.name);
  KWC[m.id]=ks;save('kwc',KWC);return ks;
}
const fresh=a=>{const f=a.filter(m=>!QS.used.has(m.id));return f.length?f:a};

async function qBlurry(){
  const c=rnd(fresh(lib.filter(m=>m.poster)));QS.used.add(c.id);
  const img=c.poster.replace('/w342/','/w500/');await preload(img);
  return{mode:'blurry',img,answer:c.title,opts:opts4(c),t0:Date.now()};
}
async function qWho(){
  const wc=lib.filter(m=>(m.cast||[]).length),all={};
  wc.forEach(m=>m.cast.forEach(a=>{(all[a.id]??={id:a.id,name:a.name,photo:a.photo,films:[]}).films.push(m)}));
  const actors=Object.values(all);
  for(let t=0;t<30;t++){
    if(Math.random()<.5){
      const pool=actors.filter(a=>!QS.usedA.has(a.id)),a=rnd(pool.length?pool:actors);
      const bad=lib.filter(m=>!(m.cast||[]).some(c=>c.id===a.id));
      if(bad.length<3)continue;
      QS.usedA.add(a.id);const good=rnd(a.films);
      return{mode:'who',kind:'a2f',actor:a,answer:good.title,opts:shuf([optT(good,true),...shuf(bad).slice(0,3).map(m=>optT(m,false))])};
    }else{
      const f=rnd(fresh(wc)),ids=new Set(f.cast.map(c=>c.id)),bad=actors.filter(a=>!ids.has(a.id));
      if(bad.length<3)continue;
      QS.used.add(f.id);const good=rnd(f.cast.slice(0,6));
      return{mode:'who',kind:'f2a',film:f,answer:good.name,opts:shuf([optA(good,true),...shuf(bad).slice(0,3).map(a=>optA(a,false))])};
    }
  }
  return null;
}
async function qKw(){
  for(let t=0;t<12;t++){
    const c=rnd(fresh(lib));let ks;
    try{ks=await getKw(c)}catch{continue}
    const words=c.title.toLowerCase().split(/\W+/).filter(w=>w.length>3);
    const clean=ks.filter(k=>!words.some(w=>k.toLowerCase().includes(w)));
    if(clean.length<3)continue;
    QS.used.add(c.id);
    return{mode:'kw',answer:c.title,clues:shuf(clean).slice(0,5),shown:3,opts:opts4(c)};
  }
  return null;
}
async function qHol(A0){
  const has=m=>+m.imdb_rating>0;
  for(let t=0;t<30;t++){
    const A=A0||rnd(lib),B=rnd(lib);if(B.id===A.id)continue;
    const crit=has(A)&&has(B)&&Math.random()<.5?'imdb':'mine';
    const v=m=>crit==='imdb'?+m.imdb_rating:num(avgOf(m));
    if(v(A)===v(B)&&t<25)continue;
    return{mode:'hol',A,B,crit,vA:v(A),vB:v(B)};
  }
  return null;
}

function startGame(mode){
  QS={screen:'play',mode,round:0,score:0,streak:0,maxStreak:0,used:new Set(),usedA:new Set(),q:null,answered:false,last:null,tok:0};
  nextQ();
}
async function nextQ(){
  clearInterval(QT);
  if(QS.mode!=='hol'&&QS.round>=ROUNDS){endGame();return}
  const prevB=QS.mode==='hol'&&QS.q&&QS.last?.ok?QS.q.B:null;
  QS.round++;QS.answered=false;QS.q=null;QS.fail=false;QS.pick=null;QS.last=null;drawPlay();
  const tok=++QS.tok;let q=null;
  try{q=await({blurry:qBlurry,who:qWho,kw:qKw,hol:qHol}[QS.mode])(prevB)}catch{}
  if(tok!==QS.tok||view!=='quiz'||QS.screen!=='play')return;
  if(!q)QS.fail=true;
  QS.q=q;drawPlay();
  if(q&&QS.mode==='blurry')startBlur();
}
function startBlur(){
  const q=QS.q,img=$('#qimg');if(!img)return;
  q.t0=Date.now();
  QT=setInterval(()=>{
    const f=Math.max(0,1-(Date.now()-q.t0)/12000);
    img.style.filter=`blur(${(f*26).toFixed(1)}px)`;
    const p=$('#qpts');if(p)p.textContent=`${20+Math.round(80*f)} points`;
    if(f<=0)clearInterval(QT);
  },120);
}
function answer(i){
  if(QS.answered||!QS.q)return;
  const q=QS.q;QS.answered=true;QS.pick=i;clearInterval(QT);
  const ok=!!q.opts[i].ok;let pts=0;
  if(ok){
    pts=QS.mode==='blurry'?20+Math.round(80*Math.max(0,1-(Date.now()-q.t0)/12000)):QS.mode==='kw'?Math.max(20,100-20*(q.shown-3)):100;
    QS.score+=pts;QS.streak++;QS.maxStreak=Math.max(QS.maxStreak,QS.streak);
  }else QS.streak=0;
  QS.last={ok,pts};drawPlay();
}
function holAnswer(dir){
  if(QS.answered||!QS.q)return;
  const q=QS.q;QS.answered=true;QS.pick=dir;
  const ok=dir==='h'?q.vB>=q.vA:q.vB<=q.vA;
  if(ok){QS.streak++;QS.score=QS.streak;QS.maxStreak=QS.streak}
  QS.last={ok,tie:q.vA===q.vB};drawPlay();
}
function endGame(){
  clearInterval(QT);
  const m=QS.mode,sc=m==='hol'?QS.streak:QS.score,b=QZ.best[m]||{score:0,streak:0};
  QS.newBest=sc>b.score;
  QZ.best[m]={score:Math.max(b.score,sc),streak:Math.max(b.streak,QS.maxStreak)};
  QZ.hist.unshift({m,sc,at:Date.now()});QZ.hist=QZ.hist.slice(0,20);
  save(qzKey(),QZ);QS.screen='end';drawEnd();
}
function drawPlay(){
  const q=QS.q,M=MODES[QS.mode],el=$('#main'),done=QS.answered;
  const info=QS.mode==='hol'?`Streak ${QS.streak}`:`Round ${QS.round}/${ROUNDS} · ${QS.score} pts${QS.streak>1?` · streak ${QS.streak}`:''}`;
  let h=`<div class="qbar"><b class="qt">${qIcon(QS.mode,'sm')}${M.name}</b><span>${info}</span><button class="btn ghost" data-qz="quit:">Quit</button></div>`;
  if(!q){el.innerHTML=h+(QS.fail?'<p class="empty">Could not build a question. Check your connection and try again.</p>':loadingHTML('Building a question…'));return}
  if(QS.mode==='hol'){
    const lab=q.crit==='imdb'?'IMDb rating':'your rating',fv=v=>q.crit==='imdb'?v.toFixed(1):'★ '+v.toFixed(1);
    const card=(m,val)=>`<div class="qc">${m.poster?`<img src="${m.poster}" alt="">`:'<div class="ph">No poster</div>'}<b>${esc(m.title)}</b><p class="meta">${esc(m.year||'')}</p><div class="qval">${val}</div></div>`;
    const cls=d=>done?(QS.pick===d?(QS.last.ok?' ok':' bad'):''):'';
    h+=`<p class="meta">Is the ${lab} of the right title higher or lower than the left one?</p><div class="qpair">${card(q.A,fv(q.vA))}${card(q.B,done?fv(q.vB):'?')}</div>
     <div class="qhl"><button class="qo${cls('h')}" data-qz="hl:h"${done?' disabled':''}>▲ Higher</button><button class="qo${cls('l')}" data-qz="hl:l"${done?' disabled':''}>▼ Lower</button></div>`;
    if(done)h+=`<div class="qfb ${QS.last.ok?'ok':'bad'}">${QS.last.ok?(QS.last.tie?'A tie, so that counts. ':'Correct! ')+`Streak ${QS.streak}.`:'Not quite.'}</div><button class="btn" data-qz="next:">${QS.last.ok?'Next':'See results'}</button>`;
    el.innerHTML=h;return;
  }
  if(QS.mode==='blurry')h+=`<div class="qstage"><div class="qwrap"><img id="qimg" class="qposter" src="${q.img}" style="filter:${done?'none':'blur(26px)'}" alt=""></div><p class="meta" id="qpts">${done?'':'100 points'}</p></div>`;
  if(QS.mode==='who')h+=q.kind==='a2f'
    ?`<div class="qstage">${q.actor.photo?`<img class="qposter" style="width:min(150px,42vw)" src="${q.actor.photo.replace('/w185/','/h632/')}" alt="">`:''}<h3>Which of these films was <b>${esc(q.actor.name)}</b> in?</h3></div>`
    :`<div class="qstage">${q.film.poster?`<img class="qposter" style="width:min(150px,42vw)" src="${q.film.poster}" alt="">`:''}<h3>Who was in <b>${esc(q.film.title)}</b>${q.film.year?` (${esc(q.film.year)})`:''}?</h3></div>`;
  if(QS.mode==='kw')h+=`<div class="qstage"><p class="meta">Which title do these keywords belong to?</p><div class="qclues">${q.clues.slice(0,q.shown).map(k=>`<span class="badge">${esc(k)}</span>`).join('')}</div>${!done&&q.shown<q.clues.length?'<button class="btn ghost" data-qz="clue:">Show another clue (−20 pts)</button>':''}</div>`;
  h+=`<div class="qopts">${q.opts.map((o,i)=>`<button class="qo${done?(o.ok?' ok':(QS.pick===i?' bad':'')):''}" data-qz="ans:${i}"${done?' disabled':''}>${o.html}</button>`).join('')}</div>`;
  if(done)h+=`<div class="qfb ${QS.last.ok?'ok':'bad'}">${QS.last.ok?`Correct! +${QS.last.pts} points`:`Not quite. The answer was <b>${esc(q.answer)}</b>.`}</div><button class="btn" data-qz="next:">${QS.round>=ROUNDS?'See results':'Next'}</button>`;
  el.innerHTML=h;
}
function drawEnd(){
  const m=QS.mode,M=MODES[m],hol=m==='hol',sc=hol?QS.streak:QS.score,b=QZ.best[m];
  $('#main').innerHTML=`<div class="qend">${qIcon(m,'lg')}<p class="meta">${M.name}</p><div class="big">${sc}</div><p>${hol?`in a row`:`points out of ${ROUNDS*100}`}</p>
   ${QS.newBest?'<p class="score">New personal best!</p>':`<p class="meta">Your best: ${b.score}${hol?' in a row':' points'}</p>`}
   ${hol?'':`<p class="meta">Longest streak this game: ${QS.maxStreak}</p>`}
   <div class="acts" style="justify-content:center"><button class="btn" data-qz="again:">Play again</button><button class="btn ghost" data-qz="menu:">All games</button></div></div>`;
}
function drawPick(){
  const hist=QZ.hist.slice(0,5);
  $('#main').innerHTML=`<h2>Quiz</h2><p class="meta">Every question comes from the ${lib.length} titles you have rated.</p>
   <div class="qmodes">${Object.entries(MODES).map(([k,m])=>{const why=need(k),b=QZ.best[k];
     return`<button class="qm" data-qz="start:${k}"${why?' disabled':''}>${qIcon(k,'')}<b>${m.name}</b><span>${m.desc}</span><em>${why||(b?`Best ${b.score}${k==='hol'?' in a row':' pts'} · best streak ${b.streak}`:'Not played yet')}</em></button>`}).join('')}</div>
   ${hist.length?`<h3>Recent games</h3><div class="lst">${hist.map(x=>`<div class="qhr"><span>${MODES[x.m].name}</span><span>${x.sc}${x.m==='hol'?' in a row':' pts'} · ${new Date(x.at).toLocaleDateString('en',{month:'short',day:'numeric'})}</span></div>`).join('')}</div>`:''}`;
}
function quizView(){QS={screen:'pick'};drawPick()}
function quizClick(b){
  const [a,v]=b.dataset.qz.split(':');
  if(a==='start')startGame(v);
  else if(a==='ans')answer(+v);
  else if(a==='hl')holAnswer(v);
  else if(a==='clue'){if(QS.q&&!QS.answered&&QS.q.shown<QS.q.clues.length){QS.q.shown++;drawPlay()}}
  else if(a==='next'){if(QS.mode==='hol'&&!QS.last?.ok)endGame();else nextQ()}
  else if(a==='again')startGame(QS.mode);
  else if(a==='quit'||a==='menu'){clearInterval(QT);QS={screen:'pick'};drawPick()}
}
