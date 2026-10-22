import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';

test('Phase 2 HTTP endpoints expose metrics, feedback and financial scenarios', async()=>{
  const dir=await mkdtemp(join(tmpdir(),'railrecover-phase2-'));let proc;
  try {
    proc=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'0',RAILRECOVER_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
    const output=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout')),5000);proc.stdout.once('data',d=>{clearTimeout(timer);resolve(d.toString());});proc.once('error',reject);});
    const base=output.match(/http:\/\/[^\s]+/)[0];
    const get=async path=>{const r=await fetch(base+path);return {status:r.status,data:await r.json()};};
    const post=async(path,data)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};};
    const state=await get('/api/state');assert.equal(state.status,200);const caseId=state.data.cases[0].id;
    const metrics=await get('/api/metrics');assert.equal(metrics.status,200);assert.equal(metrics.data.metrics.csat.value,100);assert.equal(metrics.data.metrics.surveyResponseRate.sampleSize,1);
    const financial=await post('/api/financial',{annualCaseVolume:100,improvementPoints:10});assert.equal(financial.status,200);assert.ok(financial.data.sensitivity.base);
    const feedback=await post('/api/feedback',{caseId,csat:5,ces:1,communication:5,confidence:5,transparency:5,timing:'after-update'});assert.equal(feedback.status,400);assert.match(feedback.data.error,/already been submitted/i);
  } finally {if(proc){const exited=once(proc,'exit');proc.kill();await exited;}await rm(dir,{recursive:true,force:true});}
});
