'use strict';
const crypto = require('node:crypto');
const { validateConfig } = require('../lib/validate-config');
const defaults = require('../lib/default-config.json');
const auth = require('../lib/publish-auth.json');
const PATH = 'invitation/published.json';
function createHandler(storage, expectedHash = auth.sha256) {
  return async function handler(req,res) {
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Type','application/json; charset=utf-8');
    const reply = (code,data) => { res.statusCode=code;res.end(JSON.stringify(data)); };
    if (!['GET','POST'].includes(req.method)) { res.setHeader('Allow','GET, POST');return reply(405,{error:'Method not allowed'}); }
    if (req.method === 'POST') {
      if (req.headers.origin !== 'https://nukrimegi.vercel.app') return reply(403,{error:'Open the official admin page.'});
      const supplied = String(req.headers.authorization || '').replace(/^Bearer /,'');
      const digest = crypto.createHash('sha256').update(supplied).digest();
      if (!crypto.timingSafeEqual(digest,Buffer.from(expectedHash,'hex'))) return reply(401,{error:'გამოქვეყნების გასაღები არასწორია.'});
      if (!String(req.headers['content-type']).startsWith('application/json')) return reply(415,{error:'JSON required'});
    }
    try {
      const current = await storage.get(PATH,{access:'private',useCache:false});
      const revision = current?.blob.etag || null;
      const config = current ? await new Response(current.stream).json() : defaults;
      if (req.method === 'GET') return reply(200,{config,revision});
      let body, next;
      try {
        if (Number(req.headers['content-length']) > 100000) return reply(413,{error:'Configuration too large'});
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (Buffer.byteLength(JSON.stringify(body) || '') > 100000) return reply(413,{error:'Configuration too large'});
        next = validateConfig(body.config);
      } catch { return reply(400,{error:'შეამოწმეთ თარიღი, დრო, ფერები და ბმულები.'}); }
      if (body.revision !== revision) return reply(409,{error:'საიტი სხვა ჩანართში შეიცვალა. შეინახეთ Export და განაახლეთ გვერდი.'});
      const result = await storage.put(PATH,JSON.stringify(next),{access:'private',contentType:'application/json',addRandomSuffix:false,allowOverwrite:!!revision,...(revision ? {ifMatch:revision} : {})});
      return reply(200,{ok:true,revision:result.etag});
    } catch (error) {
      if (error.name === 'BlobPreconditionFailedError' || /already exists/i.test(error.message)) return reply(409,{error:'სხვა ცვლილება უკვე გამოქვეყნდა. განაახლეთ გვერდი.'});
      return reply(503,{error:'გამოქვეყნება დროებით მიუწვდომელია. მონახაზი შენახულია; სცადეთ ხელახლა.'});
    }
  };
}
module.exports = async (req,res) => {
  if(!process.env.BLOB_READ_WRITE_TOKEN) {
    res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
    res.statusCode=req.method==='GET'?200:503;
    return res.end(JSON.stringify(req.method==='GET'?{config:defaults,revision:null,publishingEnabled:false}:{error:'გამოქვეყნების საცავი ჯერ არ არის დაკავშირებული.'}));
  }
  return createHandler(await import('@vercel/blob'))(req,res);
};
module.exports.createHandler = createHandler;
