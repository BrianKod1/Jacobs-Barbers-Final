import {sql,send,allow,sameOrigin,requireAdmin,clean,slots,dateInfo,ref,fail} from '../_core.js';
export default async function handler(req,res){
 if(!allow(req,res,['GET','POST','PATCH']))return;
 if(!requireAdmin(req,res))return;
 if(req.method!=='GET'&&!sameOrigin(req))return send(res,403,{error:'Invalid origin'});
 try{
  const db=sql();
  if(req.method==='GET'){
   const from=clean(req.query.from,10),to=clean(req.query.to,10);
   if(!dateInfo(from)||!dateInfo(to)||from>to||Date.parse(to)-Date.parse(from)>93*86400000)return send(res,400,{error:'Invalid date range'});
   const entries=await db.query("SELECT id,reference,service,customer_name,customer_email,customer_phone,notes,to_char(booking_date,'YYYY-MM-DD') AS date,to_char(booking_time,'HH24:MI') AS time,status FROM appointments WHERE booking_date BETWEEN $1 AND $2 ORDER BY booking_date,booking_time",[from,to]);
   return send(res,200,{entries});
  }
  if(req.method==='POST'){
   const date=clean(req.body?.date,10),time=clean(req.body?.time,5);
   if(!slots(date).includes(time))return send(res,400,{error:'Invalid slot'});
   const rows=await db.query("INSERT INTO appointments(reference,booking_date,booking_time,status) VALUES($1,$2,$3,'blocked') ON CONFLICT DO NOTHING RETURNING id",[ref(),date,time]);
   if(!rows.length)return send(res,409,{error:'Slot occupied'});
   return send(res,201,{ok:true});
  }
  const id=clean(req.body?.id,36),action=req.body?.action;
  if(!/^[a-f0-9-]{36}$/i.test(id)||!['cancel','unblock'].includes(action))return send(res,400,{error:'Invalid change'});
  // Blocked slots have no customer fields; deleting them is the safe inverse of blocking.
  // Customer cancellations retain their record for the owner dashboard.
  const rows=action==='unblock'
   ? await db.query("DELETE FROM appointments WHERE id=$1::uuid AND status='blocked' RETURNING id",[id])
   : await db.query("UPDATE appointments SET status='cancelled' WHERE id=$1::uuid AND status='confirmed' RETURNING id",[id]);
  send(res,rows.length?200:404,rows.length?{ok:true}:{error:'Entry not found'});
 }catch(e){fail(res,e)}
}
