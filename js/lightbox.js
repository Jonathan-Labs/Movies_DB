/* Full-screen photo viewer */
/* ---------- full-screen photos ---------- */
const lb=document.createElement('div');lb.id='lb';lb.hidden=true;
lb.innerHTML='<img alt=""><button class="lbx" aria-label="Close">✕</button><button class="lbp l" aria-label="Previous photo">‹</button><button class="lbp r" aria-label="Next photo">›</button>';
document.body.appendChild(lb);
let LB={list:[],i:0};
function lbShow(){lb.querySelector('img').src=LB.list[LB.i];lb.querySelectorAll('.lbp').forEach(b=>b.hidden=LB.list.length<2)}
function lbStep(d){const j=LB.i+d;if(j<0||j>=LB.list.length)return;LB.i=j;lbShow()}
lb.onclick=e=>{const c=e.target.classList;if(c.contains('lbp'))lbStep(c.contains('r')?1:-1);else lb.hidden=true};
document.addEventListener('click',e=>{
  const i=e.target.closest('img.zm');if(!i)return;
  const grp=[...(i.closest('.strip')||i.parentElement).querySelectorAll('img.zm')];
  LB={list:grp.map(x=>x.dataset.full||x.src),i:grp.indexOf(i)};lbShow();lb.hidden=false;
});
