import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
test('Pages build uses relative assets and browser workflow survives reload',async()=>{
  execFileSync(process.execPath,['build.mjs'],{cwd:new URL('..',import.meta.url)});
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('src="./app.js"'));assert.ok(html.includes('href="./styles.css"'));
  const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  try {
    const {browserApi}=await import('../dist/demo-api.js');
    const db=browserApi('/api/state');const route=`/api/cases/${db.cases[0].id}/actions`;
    browserApi(route,{action:'acknowledge'});browserApi(route,{action:'match',itemId:'FI-DEMO-01'});
    assert.equal(browserApi(route,{action:'verify',evidence:'wrong'}).verificationFailed,true);
    browserApi(route,{action:'verify',evidence:'Blue spiral notebook'});
    browserApi(route,{action:'handover',destination:'Demo office'});browserApi(route,{action:'return',confirm:true});
    assert.equal(browserApi('/api/state').cases[0].status,'Returned');
    assert.ok(!JSON.stringify(browserApi('/api/state')).includes('Blue spiral notebook'));
  } finally {delete globalThis.localStorage;}
});
