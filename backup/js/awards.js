/* Awards display and Wikidata lookups */
let actorTok=0,movieTok=0;
function awardsHTML(names,note){
  if(!names.length&&!note)return'None listed';
  const rest=names.slice(3);
  const bd=(x,h)=>`<span class="badge"${h?' data-x hidden':''}>${esc(x)}</span>`;
  return`<div class="aw">${note?`<p class="awn">${esc(note)}</p>`:''}${names.length?`<div class="badges" style="margin:0">${names.slice(0,3).map(x=>bd(x)).join('')}${rest.map(x=>bd(x,1)).join('')}</div>`:''}${rest.length?`<button class="vm" data-showall="${names.length}">Show all (${names.length})</button>`:''}</div>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-showall]');if(!b)return;
  const on=b.dataset.on!=='1';b.dataset.on=on?'1':'0';
  b.closest('.aw').querySelectorAll('[data-x]').forEach(x=>x.hidden=!on);
  b.textContent=on?'Show less':`Show all (${b.dataset.showall})`;
});
/* TMDB has no awards or residence, so these come from Wikidata (via the actor's wikidata id) */
async function wd(qid){
  const u=x=>'https://www.wikidata.org/w/api.php?format=json&origin=*&'+x;
  const cl=(await(await fetch(u('action=wbgetentities&props=claims&ids='+qid))).json()).entities[qid].claims||{};
  const ids=c=>(c||[]).filter(x=>x.mainsnak?.datavalue?.value?.id);
  const aw=ids(cl.P166).map(x=>x.mainsnak.datavalue.value.id);
  const rs=ids(cl.P551).filter(x=>!x.qualifiers?.P582).map(x=>x.mainsnak.datavalue.value.id);
  const need=[...new Set([...rs.slice(-1),...aw])];
  if(!need.length)return{awards:[],total:0,home:''};
  const chunks=[];for(let i=0;i<need.length&&i<250;i+=50)chunks.push(need.slice(i,i+50));
  const parts=await Promise.all(chunks.map(c=>fetch(u('action=wbgetentities&props=labels&languages=en&ids='+c.join('|'))).then(r=>r.json())));
  const L=Object.assign({},...parts.map(x=>x.entities||{}));
  const lab=id=>L[id]?.labels?.en?.value||'';
  const pri=x=>/Academy|Oscar|Golden Globe|BAFTA|Emmy|Tony|Screen Actors|Cannes|Venice|Berlin|Grammy|César/i.test(x)?0:1;
  const names=[...new Set(aw.map(lab).filter(Boolean))].sort((x,y)=>pri(x)-pri(y));
  return{awards:names,total:new Set(aw).size,home:rs.length?lab(rs[rs.length-1]):''};
}
