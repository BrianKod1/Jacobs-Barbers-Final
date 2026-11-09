import {sql,send,allow,slots,dateInfo,today,fail} from './_core.js';
export default async function handler(req,res){
 if(!allow(req,res,['GET']))return;
 const date=req.query.date;
 if(!dateInfo(date)||date<today())return send(res,400,{error:'Choose a valid date'});
 try{
  const all=slots(date);
  if(!all.length)return send(res,200,{date,slots:[]});
  const rows=await sql().query("SELECT to_char(booking_time,'HH24:MI') AS time FROM appointments WHERE booking_date=$1 AND status IN ('confirmed','blocked')",[date]);
  const occupied=new Set(rows.map(x=>x.time));
  send(res,200,{date,slots:all.filter(t=>!occupied.has(t)),timezone:'America/Toronto',durationMinutes:30});
 }catch(e){fail(res,e)}
}
