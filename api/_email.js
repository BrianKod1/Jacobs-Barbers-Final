// Transactional email is optional until Lucy verifies a sending domain in Resend.
// A failure to send does not roll back a confirmed database reservation.
export async function notifyBooking({reference,date,time,service,name,email,phone,notes}){
 const key=process.env.RESEND_API_KEY,from=process.env.BOOKING_FROM_EMAIL,to=process.env.BOOKING_SHOP_EMAIL;
 if(!key||!from||!to)return {customer:false,shop:false};
 async function send(toAddress,subject,content){
  try{
   const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:[toAddress],subject,text:content})});
   if(!r.ok){console.error('Booking email delivery failed:',r.status);return false}
   return true;
  }catch(e){console.error('Booking email delivery failed:',e?.message);return false}
 }
 const details=[
  'Reference: '+reference,
  'Service: '+service,
  'Date: '+date,
  'Time: '+time+' (Toronto time)',
  '',
  'Customer: '+name,
  'Email: '+email,
  'Phone: '+phone,
  'Notes: '+(notes||'None')
 ].join('\n');
 const [shop,customer]=await Promise.all([
  send(to,'New Jacobs Barbers booking '+reference,details),
  send(email,'Jacobs Barbers booking confirmation '+reference,'Your appointment is confirmed in the Jacobs Barbers calendar.\n\n'+details+'\n\nNeed to change or cancel? Please call 647 688 3094.')
 ]);
 return {shop,customer};
}
