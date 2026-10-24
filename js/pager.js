/* Pagination buttons */
function pager(cur,total,k='pg'){
  if(total<2)return'';
  const nums=[...new Set([1,total,cur-1,cur,cur+1])].filter(n=>n>=1&&n<=total).sort((x,y)=>x-y);
  let h='',prev=0;
  nums.forEach(n=>{if(n-prev>1)h+='<span class="gap">…</span>';h+=`<button class="pgb${n===cur?' on':''}" data-${k}="${n}"${n===cur?' aria-current="page"':''}>${n}</button>`;prev=n});
  return`<div class="pg"><button class="pgb" data-${k}="${cur-1}" aria-label="Previous page"${cur<2?' disabled':''}>‹</button>${h}<button class="pgb" data-${k}="${cur+1}" aria-label="Next page"${cur>=total?' disabled':''}>›</button></div>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pg]');if(b&&PG){PG(+b.dataset.pg);window.scrollTo({top:0})}});
