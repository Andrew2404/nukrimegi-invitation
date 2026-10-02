// Use the already linked project and CI credentials; never print token values.
const fs=require('node:fs');
const project=JSON.parse(fs.readFileSync('.vercel/project.json','utf8'));
async function api(path,method='GET',body){
  const url=new URL(path,'https://api.vercel.com');
  if(project.orgId.startsWith('team_'))url.searchParams.set('teamId',project.orgId);
  const response=await fetch(url,{method,headers:{Authorization:'Bearer '+process.env.VERCEL_TOKEN,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();
  if(!response.ok)throw Error(`Storage ${method} failed (${response.status}): ${String(data.error?.message||data.error?.code||'request failed').replace(/[A-Za-z0-9_=-]{24,}/g,'[redacted]')}`);
  return data;
}
(async()=>{
  const stores=(await api('/v1/storage/stores')).stores || [];
  let store=stores.find(s=>s.name==='nukrimegi-content' && s.type==='blob');
  if(!store)store=(await api('/v1/storage/stores/blob','POST',{name:'nukrimegi-content',region:'iad1',access:'private'})).store;
  if(store.access!=='private')throw Error('Expected private invitation storage');
  const connections=(await api(`/v1/storage/stores/${store.id}/connections`)).connections || [];
  if(!connections.some(c=>(c.projectId===project.projectId || c.project?.id===project.projectId) && (c.envVarEnvironments||c.environments||[]).includes('production')))
    await api(`/v1/storage/stores/${store.id}/connections`,'POST',{envVarEnvironments:['production'],projectId:project.projectId,type:'integration'});
  console.log('Private invitation storage connected.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});