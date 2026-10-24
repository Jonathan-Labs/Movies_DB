/* Account page: change username and PIN */
function accountView(){
  const el=$('#main');
  if(PROF){
    const pend=!PROF.approved,note=ACCMSG;ACCMSG='';
    el.innerHTML=`<h2>Account</h2><div class="acc">${avatar(PROF.username).replace('uav','uav lg')}<h3>@${esc(PROF.username)}</h3>
     <p class="meta">${isAdmin()?'Admin':pend?'Waiting for approval':'Member'}</p>
     ${note?`<div class="msg ok">${esc(note)}</div>`:''}
     ${pend?'<div class="msg">Your account is waiting for the admin to approve it. Until then you can browse the Public dashboard and watch through the links.</div><button class="btn" data-au="refresh:">Check again</button>':''}
     <div class="accf">
      <details class="kwd"><summary>Change username</summary>
       <form id="cu-form" class="aform"><label>New username<input id="cu-name" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="20" placeholder="3–20 letters, numbers or _"></label>
        <button class="btn">Save username</button><p class="meta" id="cu-msg"></p></form></details>
      <details class="kwd"><summary>Change PIN</summary>
       <form id="cp-form" class="aform"><label>Current PIN<input id="cp-old" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="current-password" placeholder="••••"></label>
        <label>New PIN<input id="cp-new" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="new-password" placeholder="••••"></label>
        <label>Repeat new PIN<input id="cp-new2" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="new-password" placeholder="••••"></label>
        <button class="btn">Save PIN</button><p class="meta" id="cp-msg"></p></form></details>
     </div></div>`;
    const say=(id,t)=>{const m=$(id);if(m){m.textContent=t;m.style.color='var(--red)'}};
    $('#cu-form').onsubmit=async e=>{
      e.preventDefault();
      const nn=$('#cu-name').value.trim(),btn=$('#cu-form .btn');
      if(!/^[a-z0-9_]{3,20}$/i.test(nn)){say('#cu-msg','Username: 3–20 letters, numbers or underscores.');return}
      if(nn.toLowerCase()===PROF.username.toLowerCase()){say('#cu-msg','That is already your username.');return}
      btn.disabled=true;
      try{
        const r=await sbf('/rest/v1/rpc/change_username',{method:'POST',body:JSON.stringify({new_name:nn})});
        if(!r.ok){
          const d=await r.json().catch(()=>({}));
          throw new Error(/taken|unique|duplicate/i.test(JSON.stringify(d))?'That username is taken.':r.status===404?'The database needs the latest SQL first (Part 3 in supabase-accounts.sql).':(d.message||'Could not change the username.'));
        }
        await loadProfile();USERS=null;ACCMSG=`Your username is now @${PROF.username}.`;nav();accountView();
      }catch(ex){say('#cu-msg',ex.message);btn.disabled=false}
    };
    $('#cp-form').onsubmit=async e=>{
      e.preventDefault();
      const cur=$('#cp-old').value.trim(),n1=$('#cp-new').value.trim(),n2=$('#cp-new2').value.trim(),btn=$('#cp-form .btn');
      if(!/^\d{4}$/.test(cur)||!/^\d{4}$/.test(n1)){say('#cp-msg','PINs must be exactly 4 digits.');return}
      if(n1!==n2){say('#cp-msg','The two new PINs do not match.');return}
      if(n1===cur){say('#cp-msg','The new PIN is the same as the current one.');return}
      btn.disabled=true;
      try{
        const email=await myEmail(),h=email.split('@')[0];
        try{await authCall('/token?grant_type=password',{email,password:authPass(h,cur)})}catch{throw new Error('Your current PIN is wrong.')}
        const put=()=>fetch(cfg.sbUrl+'/auth/v1/user',{method:'PUT',headers:sbH(),body:JSON.stringify({password:authPass(h,n1),current_password:authPass(h,cur)})});
        let r=await put();
        if(r.status===401&&await refreshSess())r=await put();
        if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.msg||d.message||'Could not change the PIN.')}
        ACCMSG='Your PIN was changed.';accountView();
      }catch(ex){say('#cp-msg',ex.message);btn.disabled=false}
    };
    return;
  }
  el.innerHTML=`<h2>Account</h2><p class="meta">Log in to rate titles, keep a To Watch list, play games and see your statistics.</p><button class="btn" data-login>Log in or create account</button>`;
}
