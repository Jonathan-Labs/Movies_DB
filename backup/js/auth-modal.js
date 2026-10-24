/* Log in / create account pop-up */
/* ---------- log in / create account pop-up ---------- */
const am=document.createElement('div');am.id='authm';am.hidden=true;document.body.appendChild(am);
let authLocked=false;
function authForm(){
  const up=AUTHM==='up';
  return`<div class="chips"><button class="chip${!up?' on':''}" data-amode="in">Log in</button><button class="chip${up?' on':''}" data-amode="up">Create account</button></div>
   <form id="af" class="aform">
     <label>Username<input id="a-user" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="20" placeholder="3–20 letters, numbers or _"></label>
     <label>4-digit PIN<input id="a-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="${up?'new-password':'current-password'}" placeholder="••••"></label>
     ${up?'<label>Repeat PIN<input id="a-pin2" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="new-password" placeholder="••••"></label><p class="meta">A new account has to be approved by the admin before you can rate titles, keep a To Watch list, play games or see statistics.</p>':''}
     <button class="btn" id="a-go">${up?'Create account':'Log in'}</button><p class="meta" id="a-err"></p>
   </form>`;
}
function drawAuth(){
  am.innerHTML=`<div class="amc" role="dialog" aria-modal="true" aria-label="Log in or create an account"><button class="x" data-acl aria-label="Close">✕</button>${authForm()}</div>`;
  $('#af').onsubmit=async e=>{
    e.preventDefault();
    const up=AUTHM==='up',u=$('#a-user').value.trim(),pin=$('#a-pin').value.trim(),err=t=>{$('#a-err').textContent=t};
    if(!/^[a-z0-9_]{3,20}$/i.test(u)){err('Username: 3–20 letters, numbers or underscores.');return}
    if(!/^\d{4}$/.test(pin)){err('The PIN must be exactly 4 digits.');return}
    if(up&&pin!==$('#a-pin2').value.trim()){err('The two PINs do not match.');return}
    $('#a-go').disabled=true;err('');
    try{
      if(up)await doSignUp(u,pin);else await doSignIn(u,pin);
      closeAuth();
      if($('#modal').classList.contains('open'))closeM();   // leave the film page that asked you to log in
      await afterAuth();
    }catch(ex){err(ex.message);$('#a-go').disabled=false}
  };
}
function openAuth(mode){
  if(mode)AUTHM=mode;
  drawAuth();am.hidden=false;
  if(lockY===null){lockPage();authLocked=true}
  const i=$('#a-user');if(i)i.focus();
}
function closeAuth(){
  am.hidden=true;am.innerHTML='';
  if(authLocked){unlockPage();authLocked=false}
}
am.addEventListener('click',e=>{
  if(e.target===am||e.target.closest('[data-acl]')){closeAuth();return}
  const m=e.target.closest('[data-amode]');if(m){AUTHM=m.dataset.amode;drawAuth();const i=$('#a-user');if(i)i.focus()}
});
document.addEventListener('click',e=>{
  if(e.target.closest('[data-login]'))openAuth('in');
  else if(e.target.closest('[data-hv]')){view='account';render();window.scrollTo(0,0)}
  else if(e.target.closest('[data-hout]'))doSignOut();
});
