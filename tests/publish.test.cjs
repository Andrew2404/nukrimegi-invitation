const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {createHandler}=require('../api/site-content');
const defaults=require('../lib/default-config.json');
function setup(){
  let value=null,revision=null,writes=0;
  const handler=createHandler({get:async()=>value?{blob:{etag:revision},stream:new Blob([JSON.stringify(value)]).stream()}:null,put:async(path,body,options)=>{assert.equal(options.access,'private');if(revision)assert.equal(options.ifMatch,revision);value=JSON.parse(body);revision='v'+(++writes);return {etag:revision};}},crypto.createHash('sha256').update('test-key').digest('hex'));
  return async(method='POST',body={config:defaults,revision:null},headers={})=>{const res={setHeader(){},end(s){this.body=JSON.parse(s);}};await handler({method,headers:{origin:'https://nukrimegi.vercel.app','content-type':'application/json',authorization:'Bearer test-key',...headers},body},res);return res;};
}
test('only authenticated same-origin requests can publish',async()=>{const call=setup();assert.equal((await call('POST',undefined,{authorization:''})).statusCode,401);assert.equal((await call('POST',undefined,{origin:'https://attacker.example'})).statusCode,403);assert.equal((await call('DELETE')).statusCode,405);assert.equal((await call('GET')).body.revision,null);});
test('publication is visible to fresh reads; stale drafts cannot overwrite it',async()=>{const call=setup();const config=structuredClone(defaults);config.hero.firstName='შემოწმება';const saved=await call('POST',{config,revision:null});assert.equal(saved.statusCode,200);assert.equal((await call('GET')).body.config.hero.firstName,config.hero.firstName);assert.equal((await call('POST',{config:defaults,revision:null})).statusCode,409);assert.equal((await call('POST',{config:defaults,revision:saved.body.revision})).statusCode,200);});
test('reject dangerous URLs, CSS, oversized bodies and invalid dates without publishing',async()=>{for(const mutate of [c=>c.events[0].map='javascript:alert(1)',c=>c.theme.ink='red;}body{display:none}',c=>c.hero.isoDate='2026-02-31',c=>c.layout.offsets.names={x:Infinity}]){const call=setup(),config=structuredClone(defaults);mutate(config);assert.equal((await call('POST',{config,revision:null})).statusCode,400);assert.equal((await call('GET')).body.revision,null);}assert.equal((await setup()('POST',{config:defaults,revision:null,padding:'x'.repeat(100000)})).statusCode,413);});
test('storage failure never reports publication success',async()=>{const handler=createHandler({get:async()=>{throw Error('unavailable');}});const res={setHeader(){},end(s){this.body=JSON.parse(s);}};await handler({method:'GET',headers:{}},res);assert.equal(res.statusCode,503);assert.equal(res.body.ok,undefined);});
