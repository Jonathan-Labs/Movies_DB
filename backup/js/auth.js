/* Accounts: Supabase auth, sessions, roles and sign-in/sign-up */
/* ---------- accounts: guests, users (approved by the admin) and the admin ---------- */
let SESS=load('sess'),PROF=null,PENDING=0,RP=null;
/* Usernames become username@AUTH_DOMAIN inside Supabase Auth. No email is ever sent (keep "Confirm email" OFF in Supabase).
   Supabase only accepts domains that can receive mail (they need MX records), so a made-up domain is rejected.
   Use a domain you own if you have one. Do not change it once people have created accounts, or they will not be able to log in. */
const AUTH_DOMAIN='gmail.com';
const authEmail=u=>`${u.toLowerCase()}@${AUTH_DOMAIN}`;
const authPass=(u,pin)=>`${pin}-${u.toLowerCase()}-bidometer`;
const qzKey=()=>'quiz_'+(SESS?.user?.id||'x');
const role=()=>PROF?(PROF.approved?PROF.role:'pending'):'guest';
const canUse=()=>{const r=role();return r==='user'||r==='admin'};
const isAdmin=()=>role()==='admin';
const sbH=()=>{
  const tok=SESS?.access_token;
  return{apikey:cfg.sbKey,...(tok?{Authorization:'Bearer '+tok}:(cfg.sbKey.startsWith('eyJ')?{Authorization:'Bearer '+cfg.sbKey}:{})),'Content-Type':'application/json'};
};
function setSess(d){
  SESS={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at||Math.floor(Date.now()/1000)+(d.expires_in||3600),user:{id:d.user.id,email:d.user.email}};
  save('sess',SESS);
}
function clearSess(){SESS=null;PROF=null;try{localStorage.removeItem('sess')}catch{}}
async function authCall(path,body){
  const r=await fetch(cfg.sbUrl+'/auth/v1'+path,{method:'POST',headers:{apikey:cfg.sbKey,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.msg||d.error_description||d.message||`Request failed (${r.status})`);
  return d;
}
function refreshSess(){
  if(RP)return RP;
  RP=(async()=>{
    if(!SESS?.refresh_token)return false;
    try{setSess(await authCall('/token?grant_type=refresh_token',{refresh_token:SESS.refresh_token}));return true}
    catch{clearSess();return false}
  })().finally(()=>{RP=null});
  return RP;
}
async function sbf(path,o={}){
  const go=()=>fetch(cfg.sbUrl+path,{method:o.method||'GET',headers:{...sbH(),...(o.headers||{})},body:o.body});
  let r=await go();
  if(r.status===401&&SESS&&await refreshSess())r=await go();
  return r;
}
async function loadProfile(){
  PROF=null;if(!SESS)return;
  try{const r=await sbf(`/rest/v1/profiles?id=eq.${SESS.user.id}&select=*`);if(r.ok)PROF=(await r.json())[0]||null}catch{}
}
async function doSignUp(u,pin){
  let d;
  try{d=await authCall('/signup',{email:authEmail(u),password:authPass(u,pin),data:{username:u.toLowerCase()}})}
  catch(e){throw new Error(/already|registered|exists|database error/i.test(e.message)?'That username is taken.':/rate limit/i.test(e.message)?'Supabase is trying to send a confirmation email. The admin needs to turn off “Confirm email” in Supabase (Authentication → Sign In / Providers → Email) and then try again.':e.message)}
  if(!d.access_token)throw new Error('The account was created, but Supabase still wants email confirmation. Turn off “Confirm email” in Authentication → Sign In / Providers → Email, then ask the admin to remove this account and try again.');
  setSess(d);
}
/* The login address is fixed when an account is created, so a member can change the username shown on the site
   without touching the sign-in itself. This looks up the address that belongs to a username. */
async function loginEmail(u){
  try{
    const r=await fetch(cfg.sbUrl+'/rest/v1/rpc/auth_email_for',{method:'POST',headers:{apikey:cfg.sbKey,'Content-Type':'application/json'},body:JSON.stringify({u})});
    if(r.ok)return await r.json();   // null = unknown username
  }catch{}
  return authEmail(u);               // the SQL for renaming is not installed yet: usernames still match their login address
}
async function myEmail(){
  if(SESS?.user?.email)return SESS.user.email;
  const r=await fetch(cfg.sbUrl+'/auth/v1/user',{headers:sbH()});const d=await r.json().catch(()=>({}));
  if(!d.email)throw new Error('Could not read your account.');
  SESS.user.email=d.email;save('sess',SESS);return d.email;
}
async function doSignIn(u,pin){
  try{
    const email=await loginEmail(u);
    if(!email)throw new Error('Invalid login credentials');
    setSess(await authCall('/token?grant_type=password',{email,password:authPass(email.split('@')[0],pin)}));
  }
  catch(e){throw new Error(/invalid login|credentials/i.test(e.message)?'Wrong username or PIN.':/not confirmed/i.test(e.message)?'This account was never activated. Ask the admin to remove it so you can create it again.':e.message)}
}
async function doSignOut(){
  try{await fetch(cfg.sbUrl+'/auth/v1/logout',{method:'POST',headers:sbH()})}catch{}
  clearSess();USERS=null;VU=null;VIEWU=null;await afterAuth('public');
}
