'use strict';
const {createHash}=require('node:crypto');
const FORM_URL='https://docs.google.com/forms/d/e/1FAIpQLSdDixYqJdRW9yLb8ODtZydpMRJGcCPItGVeC1AA2iQfbNr19g/formResponse?hl=en';
const inflight=new Map(), completed=new Map(), attempts=new Map();
function validate(body){
  if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('არასწორი მოთხოვნა.');
  if(typeof body.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id))throw new Error('განაახლეთ გვერდი და სცადეთ ხელახლა.');
  if(body.website)throw new Error('მოთხოვნა ვერ დამუშავდა.');
  if(!Array.isArray(body.guests)||body.guests.length<1||body.guests.length>20)throw new Error('დაამატეთ 1-დან 20-მდე სტუმარი.');
  const guests=body.guests.map(guest=>{
    if(!guest||typeof guest.name!=='string'||!['yes','no'].includes(guest.attendance))throw new Error('შეავსეთ ყველა სტუმრის სახელი და პასუხი.');
    const name=guest.name.normalize('NFC').trim().replace(/\s+/g,' ');
    if(name.length<2||name.length>100||/[\x00-\x1f\x7f]/.test(guest.name))throw new Error('სახელი უნდა შეიცავდეს 2-დან 100-მდე სიმბოლოს.');
    return {name,attendance:guest.attendance};
  });
  return {id:body.id.toLowerCase(),guests};
}
function safeCell(name){return /^[=+\-@]/.test(name)?"'"+name:name;}
async function submit(payload,fetchImpl=fetch){
  const yes=payload.guests.filter(g=>g.attendance==='yes'),no=payload.guests.filter(g=>g.attendance==='no');
  const fields=new URLSearchParams({'entry.1982998391':yes.map(g=>safeCell(g.name)).join('\n'),'entry.1900543224':payload.id,'entry.1381933526':no.map(g=>safeCell(g.name)).join('\n'),'fvv':'1','pageHistory':'0'});
  const response=await fetchImpl(FORM_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:fields.toString(),signal:AbortSignal.timeout(14000),redirect:'follow'});
  const html=await response.text();
  const recorded=html.includes('Your response has been recorded')||html.includes('თქვენი პასუხი ჩაიწერა.');
  if(!response.ok||!recorded)throw new Error('UPSTREAM_NOT_CONFIRMED');
  return {ok:true,receipt:payload.id,yes:yes.length,no:no.length};
}
async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
  const reply=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{ok:false,message:'Method not allowed'});}
  const allowed=new Set(['https://nukrimegi.vercel.app']);
  for(const name of ['VERCEL_URL','VERCEL_BRANCH_URL'])if(process.env[name])allowed.add('https://'+process.env[name]);
  if(process.env.NODE_ENV!=='production'){allowed.add('http://127.0.0.1:4174');allowed.add('http://localhost:4174');}
  if(!allowed.has(req.headers.origin))return reply(403,{ok:false,message:'გახსენით მოსაწვევი მის ოფიციალურ ბმულზე.'});
  if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return reply(415,{ok:false,message:'Invalid content type'});
  if(Number(req.headers['content-length'])>16000)return reply(413,{ok:false,message:'მოთხოვნა ზედმეტად დიდია.'});
  let payload;
  try{const body=typeof req.body==='string'?JSON.parse(req.body):req.body;if(Buffer.byteLength(JSON.stringify(body)||'')>16000)return reply(413,{ok:false,message:'მოთხოვნა ზედმეტად დიდია.'});payload=validate(body);}catch(error){return reply(400,{ok:false,message:error instanceof SyntaxError?'არასწორი მოთხოვნა.':error.message});}
  const now=Date.now();for(const [key,value] of completed)if(now-value.at>3600000)completed.delete(key);for(const [key,value] of attempts)if(now-value.at>3600000)attempts.delete(key);
  const hash=createHash('sha256').update(JSON.stringify(payload.guests)).digest('hex');
  const existing=completed.get(payload.id);
  if(existing)return existing.hash===hash?reply(200,existing.result):reply(409,{ok:false,message:'ეს პასუხი უკვე შენახულია. სხვა ოჯახის დასამატებლად განაახლეთ გვერდი.'});
  const ip=createHash('sha256').update(String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0]).digest('hex');
  const count=attempts.get(ip)||{at:now,count:0};
  if(count.count>=40){res.setHeader('Retry-After','600');return reply(429,{ok:false,message:'ბევრი მცდელობა დაფიქსირდა. სცადეთ ცოტა მოგვიანებით.'});}
  if(inflight.has(payload.id)){const pending=inflight.get(payload.id);if(pending.hash!==hash)return reply(409,{ok:false,message:'პასუხი უკვე იგზავნება. დაელოდეთ დადასტურებას.'});try{return reply(200,await pending.promise);}catch{return reply(502,{ok:false,message:'შენახვა ვერ დადასტურდა. სცადეთ ხელახლა.'});}}
  count.count++;attempts.set(ip,count);
  const promise=submit(payload);inflight.set(payload.id,{hash,promise});
  try{const result=await promise;completed.set(payload.id,{at:Date.now(),hash,result});return reply(201,result);}catch(error){console.error('RSVP upstream failure',error.name);return reply(502,{ok:false,message:'პასუხის შენახვა ვერ დადასტურდა. გთხოვთ, სცადოთ ხელახლა.'});}finally{inflight.delete(payload.id);}
}
module.exports=handler;
module.exports.validate=validate;
module.exports.submit=submit;
