import {sql,send,allow,sameOrigin,services,slots,clean,ref,fail} from './_core.js';
export default async function handler(req,res){
 if(!allow(req,res,['POST']))return;
 if(!sameOrigin(req)||!String(req.headers['content-type']||'').startsWith('application/json'))return send(res,403,{error:'Invalid request'});
 const b=req.body||{},service=services.find(x=>x.id===b.service);
 const date=clean(b.date,10),time=clean(b.time,5),name=clean(b.name,100),email=clean(b.email,200).toLowerCase(),phone=clean(b.phone,35),notes=clean(b.notes,600);
 if(b.website||!service||!slots(date).includes(time)||name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||phone.replace(/\D/g,'').length<7)return send(res,400,{error:'Check the required fields and selected time'});
 try{
  const db=sql();
  const count=await db.query("SELECT count(*)::int AS n FROM appointments WHERE customer_email=$1 AND created_at>now()-interval '24 hours' AND status='confirmed'",[email]);
  if(count[0].n>=3)return send(res,429,{error:'Too many bookings. Please call the shop.'});
  const reference=ref();
  const rows=await db.query("INSERT INTO appointments (reference,booking_date,booking_time,service,customer_name,customer_email,customer_phone,notes,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'confirmed') ON CONFLICT DO NOTHING RETURNING reference",[reference,date,time,service.name,name,email,phone,notes]);
  if(!rows.length)return send(res,409,{error:'That time has just been booked. Choose another slot.'});
  send(res,201,{status:'confirmed',reference,date,time,service:service.name,price:service.price,message:'Your appointment is recorded. Save this reference and call the shop if you need a change.',emailSent:false});
 }catch(e){fail(res,e)}
}
