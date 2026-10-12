import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';

test('HTTP workflow persists, rejects invalid actions and withholds evidence',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'railrecover-'));let proc;
 async function start(){
  proc=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'0',RAILRECOVER_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
  const output=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout')),5000);proc.stdout.once('data',d=>{clearTimeout(timer);resolve(d.toString());});proc.once('error',reject);});
  return output.match(/http:\/\/[^\s]+/)[0];
 }
 async function stop(){const exit=once(proc,'exit');proc.kill();await exit;proc=null;}
 try {
  let base=await start();
  const call=async(path,data,headers={})=>{const r=await fetch(base+path,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};};
  assert.equal((await fetch(base)).status,200);
  let r=await call('/api/state');assert.ok(!JSON.stringify(r.data).includes('Blue spiral notebook'));
  const id=r.data.cases[0].id,route=`/api/cases/${id}/actions`;
  assert.equal((await call(route,{action:'return',confirm:true})).status,400);
  assert.equal((await call(route,{action:'team-ack',taskId:r.data.cases[0].searchTasks[0].id},{Origin:'https://unrelated.example'})).status,403);
  assert.equal((await call(route,{action:'team-ack',taskId:r.data.cases[0].searchTasks[0].id})).status,200);
  await call(route,{action:'match',itemId:'FI-DEMO-01'});
  assert.equal((await call(route,{action:'verify',evidence:'wrong'})).data.verificationFailed,true);
  await call(route,{action:'verify',evidence:'Blue spiral notebook'});
  await call(route,{action:'handover',destination:'Demo collection desk'});
  await call(route,{action:'return',confirm:true});
  const item=await call('/api/items',{category:'Phone',color:'Blue',train:'DEMO',date:'2026-10-12',description:'Synthetic phone',location:'Demo office',proof:'private marker'});
  assert.equal(item.status,200);assert.ok(!('proof' in item.data));
  await stop();base=await start();r=await call('/api/state');assert.equal(r.data.cases[0].status,'Returned');assert.equal(r.data.items.length,2);assert.ok(!JSON.stringify(r.data).includes('private marker'));
 }finally{if(proc)await stop();await rm(dir,{recursive:true,force:true});}
});
