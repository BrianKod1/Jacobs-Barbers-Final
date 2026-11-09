import {neon} from '@neondatabase/serverless';
import {createHash,createHmac,scryptSync,timingSafeEqual,randomBytes} from 'node:crypto';
export const services=[
 {id:'classic',name:'Classic Cut',price:45},{id:'fade',name:'Skin Fade',price:45},
 {id:'kids',name:'Kids Cut',price:45},{id:'beard',name:'Beard Trim & Shape',price:null},
 {id:'combo',name:'Cut & Beard Combo',price:null}
];
export const hours={2:[10,18],3:[10,18],4:[11.5,17],5:[10,18],6:[10,15]};
export function sql(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL missing');return neon(process.env.DATABASE_URL)}
export function send(res,status,data){res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.status(status).json(data)}
export function allow(req,res,methods){if(methods.includes(req.method))return true;res.setHeader('Allow',methods.join(', '));send(res,405,{error:'Method not allowed'});return false}
export function sameOrigin(req){try{const origin=new URL(req.headers.origin||'');return origin.protocol==='https:' && origin.host===req.headers.host}catch{return false}}
export function dateInfo(v){
 if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return null;
 const [y,m,d]=v.split('-').map(Number),dt=new Date(Date.UTC(y,m-1,d));
 return dt.toISOString().slice(0,10)===v?{day:dt.getUTCDay(),date:v}:null;
}
export function today(){const v=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));return v.year+'-'+v.month+'-'+v.day}
export function slots(date){
 const dt=dateInfo(date);if(!dt||date<today()||date>new Date(Date.now()+90*86400000).toISOString().slice(0,10))return [];
 const range=hours[dt.day];if(!range)return [];
 const localClock=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Toronto',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
 const list=[];
 for(let t=range[0];t+0.5<=range[1];t+=0.5){
  const time=String(Math.floor(t)).padStart(2,'0')+':'+(t%1?'30':'00');
  if(date===today()&&time<=localClock)continue;
  list.push(time)
 }
 return list;
}
export function clean(v,n){return typeof v==='string'?v.trim().slice(0,n):''}
export function digestIp(req){const raw=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];return createHash('sha256').update(raw).digest('hex')}
export function ref(){return 'JB-'+randomBytes(6).toString('hex').toUpperCase()}
export function passwordMatches(v){const parts=(process.env.ADMIN_PASSWORD_HASH||'').split(':');if(parts.length!==3||parts[0]!=='scrypt'||typeof v!=='string')return false;try{const got=scryptSync(v,Buffer.from(parts[1],'hex'),32),want=Buffer.from(parts[2],'hex');return got.length===want.length&&timingSafeEqual(got,want)}catch{return false}}
function secret(){return process.env.ADMIN_SESSION_SECRET||''}
export function sessionToken(){if(secret().length<64)throw new Error('ADMIN_SESSION_SECRET missing');const expiration=String(Date.now()+12*3600000);return expiration+'.'+createHmac('sha256',secret()).update(expiration).digest('hex')}
export function admin(req){if(secret().length<64)return false;const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('jacobs_session='))?.slice(15)||'';const [exp,sig]=cookie.split('.');if(!exp||!sig||Number(exp)<Date.now()||Number(exp)>Date.now()+13*3600000)return false;const expected=createHmac('sha256',secret()).update(exp).digest('hex');return sig.length===expected.length&&timingSafeEqual(Buffer.from(sig),Buffer.from(expected))}
export function requireAdmin(req,res){if(admin(req))return true;send(res,401,{error:'Sign in required'});return false}
export function fail(res,e){console.error('Booking API:',e?.message);send(res,503,{error:'Booking service is temporarily unavailable. Please call Jacobs Barbers.'})}
