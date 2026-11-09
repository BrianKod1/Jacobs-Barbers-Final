import {sql,send,allow,sameOrigin,passwordMatches,sessionToken,digestIp,fail} from '../_core.js';
export default async function handler(req,res){
 if(!allow(req,res,['POST']))return;
 if(!sameOrigin(req))return send(res,403,{error:'Invalid origin'});
 try{
  const db=sql(),fingerprint=digestIp(req),rows=await db.query('SELECT attempts,first_attempt,blocked_until FROM login_attempts WHERE fingerprint=$1',[fingerprint]);
  if(rows.length&&rows[0].blocked_until&&new Date(rows[0].blocked_until)>new Date())return send(res,429,{error:'Too many login attempts; try again later'});
  if(!passwordMatches(req.body?.password)){
   await db.query("INSERT INTO login_attempts (fingerprint,attempts,first_attempt,blocked_until) VALUES ($1,1,now(),NULL) ON CONFLICT (fingerprint) DO UPDATE SET attempts=CASE WHEN login_attempts.first_attempt<now()-interval '15 minutes' THEN 1 ELSE login_attempts.attempts+1 END,first_attempt=CASE WHEN login_attempts.first_attempt<now()-interval '15 minutes' THEN now() ELSE login_attempts.first_attempt END,blocked_until=CASE WHEN login_attempts.first_attempt>=now()-interval '15 minutes' AND login_attempts.attempts>=4 THEN now()+interval '30 minutes' ELSE NULL END",[fingerprint]);
   return send(res,401,{error:'Invalid credentials'});
  }
  await db.query('DELETE FROM login_attempts WHERE fingerprint=$1',[fingerprint]);
  res.setHeader('Set-Cookie','jacobs_session='+sessionToken()+'; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200');
  send(res,200,{ok:true});
 }catch(e){fail(res,e)}
}
