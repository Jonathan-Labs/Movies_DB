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
  const prev=all.find(x=>x.id===m.id);
  const row={...m,user_id:SESS.user.id};
  /* "Recently Added" is ordered by created_at. A title moved from To Watch to Watched keeps its old row, so refresh the date
     when it gets rated, otherwise it would never show up as recently added. Plain edits keep the original date. */
  const moving=!!prev&&!isW(prev)&&isW(m);
  const send=body=>sbf('/rest/v1/movies?on_conflict=user_id,id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify(body)});
  let r=await send(moving?{...row,created_at:new Date().toISOString()}:row);
  if(!r.ok&&moving)r=await send(row);   // in case the date column cannot be written: still save the rating
  if(!r.ok)throw new Error('Supabase: '+r.status);
  all=await dbAll();split();
}
async function dbDel(id){
  const r=await sbf(`/rest/v1/movies?id=eq.${id}&user_id=eq.${SESS.user.id}`,{method:'DELETE'});
  if(!r.ok)throw new Error('Supabase: '+r.status);
  all=await dbAll();split();
}
