import {randomBytes,scryptSync} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
const rl=createInterface({input:process.stdin,output:process.stdout});
const password=await rl.question('New admin password (input visible): ');
rl.close();
if(password.length<14)throw new Error('Use at least 14 characters');
const salt=randomBytes(16);
console.log('ADMIN_PASSWORD_HASH=scrypt:'+salt.toString('hex')+':'+scryptSync(password,salt,32).toString('hex'));
console.log('ADMIN_SESSION_SECRET='+randomBytes(48).toString('hex'));
