import {send,allow,sameOrigin} from '../_core.js';
export default function handler(req,res){
 if(!allow(req,res,['POST']))return;
 if(!sameOrigin(req))return send(res,403,{error:'Invalid origin'});
 res.setHeader('Set-Cookie','jacobs_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
 send(res,200,{ok:true})
}
