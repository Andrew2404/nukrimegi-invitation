const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const {validate,submit}=require('../api/rsvp');
test('locked invitation has no editor or font override entry point',()=>{
 for(const name of ['admin.html','admin.js','admin.css','api/site-content.js','site-config.js','font-switch.js'])assert.equal(fs.existsSync(path.join(root,name)),false,name);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),js=fs.readFileSync(path.join(root,'garden.js'),'utf8');
 assert.doesNotMatch(html+js,/NM_CONFIG|font-switch|site-config|api\/site-content/);
 assert.match(html,/დიდი სიხარულით გიწვევთ/);assert.match(html,/18:00/);assert.match(html,/BRqukrnV2iHShZTJ7/);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8')).rewrites,undefined);
});
test('RSVP validates household answers without retired publishing dependencies',()=>{
 const id='12345678-1234-4234-8234-123456789012';
 assert.deepEqual(validate({id,guests:[{name:'  Test   Guest ',attendance:'yes'}]}).guests,[{name:'Test Guest',attendance:'yes'}]);
 assert.throws(()=>validate({id,guests:[{name:'A',attendance:'yes'}]}));
 assert.throws(()=>validate({id,guests:[{name:'Test Guest',attendance:''}]}));
});
test('RSVP only reports success after upstream confirmation',async()=>{
 const payload={id:'12345678-1234-4234-8234-123456789012',guests:[{name:'Test Guest',attendance:'yes'}]};
 const confirmed=await submit(payload,async()=>({ok:true,text:async()=>'Your response has been recorded'}));assert.equal(confirmed.ok,true);assert.equal(confirmed.yes,1);
 await assert.rejects(submit(payload,async()=>({ok:true,text:async()=>'Please sign in'})));
});
