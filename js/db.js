/* Your library in Supabase (one row per user and title) */
/* ---------- your library (one row per user and title) ---------- */
async function dbAll(){
  if(!SESS)return[];
  const r=await sbf(`/rest/v1/movies?select=*&user_id=eq.${SESS.user.id}&order=created_at.desc`);
  if(!r.ok)throw new Error('Supabase: '+r.status);
  return r.json();
}
async function dbSave(m){
  if(!canUse())throw new Error('Your account has not been approved yet.');
  const r=await sbf('/rest/v1/movies?on_conflict=user_id,id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify({...m,user_id:SESS.user.id})});
  if(!r.ok)throw new Error('Supabase: '+r.status);
  all=await dbAll();split();
}
async function dbDel(id){
  const r=await sbf(`/rest/v1/movies?id=eq.${id}&user_id=eq.${SESS.user.id}`,{method:'DELETE'});
  if(!r.ok)throw new Error('Supabase: '+r.status);
  all=await dbAll();split();
}
