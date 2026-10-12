import test from 'node:test';
import assert from 'node:assert/strict';
import {seed,act,candidates,publicState,createCase,registerItem} from '../domain.mjs';
const accept=(db,c,t=c.searchTasks[0])=>act(db,c,'team-ack',{taskId:t.id});
test('return requires ownership verification and accepted custody',()=>{
 const db=seed(),c=db.cases[0];assert.throws(()=>act(db,c,'return',{confirm:true}));
 accept(db,c);act(db,c,'match',{itemId:db.items[0].id});assert.throws(()=>act(db,c,'handover',{destination:'Demo desk'}));
 assert.equal(act(db,c,'verify',{evidence:'wrong'}).verificationFailed,true);assert.equal(db.items[0].claimedBy,null);
 act(db,c,'verify',{evidence:'Blue spiral notebook'});assert.throws(()=>act(db,c,'return',{confirm:true}));
 act(db,c,'handover',{destination:'Demo desk'});act(db,c,'return',{confirm:true});assert.equal(c.status,'Returned');assert.throws(()=>accept(db,c));
});
test('route fans out only after exit plus onboard and terminal teams',()=>{
 const c=seed().cases[0];assert.equal(c.searchTasks.length,5);assert.ok(!c.searchTasks.some(t=>t.name==='Frankfurt (Main) Hbf'));assert.ok(c.searchTasks.some(t=>t.name==='Hamburg Hbf'));assert.equal(c.routeConfirmed,false);
});
test('one negative check does not close case or hide pending tasks',()=>{
 const db=seed(),c=db.cases[0],t=c.searchTasks[0];accept(db,c,t);act(db,c,'team-response',{taskId:t.id,outcome:'Checked — not found',note:'Checked coach 12 luggage rack.'});assert.equal(t.status,'Checked — not found');assert.equal(c.status,'Reported');assert.equal(c.searchTasks.filter(t=>t.status==='Pending').length,4);
});
test('all negative or unavailable responses leave the loss report open',()=>{
 const db=seed(),c=db.cases[0];for(const t of c.searchTasks){accept(db,c,t);act(db,c,'team-response',{taskId:t.id,outcome:'Unable to check',note:'Demo staffing unavailable.'});}assert.equal(c.status,'Awaiting inventory');assert.equal(c.verified,false);
});
test('found response records location without proving ownership',()=>{
 const db=seed(),c=db.cases[0],t=c.searchTasks.find(t=>t.name==='Hamburg Hbf');assert.throws(()=>act(db,c,'team-response',{taskId:t.id,outcome:'Found',note:'Office inventory checked.',itemId:db.items[0].id}));accept(db,c,t);
 assert.throws(()=>act(db,c,'team-response',{taskId:t.id,outcome:'Found',note:'Found.',itemId:'missing'}));
 act(db,c,'team-response',{taskId:t.id,outcome:'Found',note:'Office inventory checked.',itemId:db.items[0].id});assert.equal(t.foundItemId,db.items[0].id);assert.equal(c.verified,false);assert.equal(c.candidateId,null);assert.ok(db.items[0].location.includes('Hamburg'));
});
test('private proof is withheld from reads and ranking',()=>{
 const db=seed();assert.ok(!JSON.stringify(publicState(db)).includes('Blue spiral notebook'));const list=candidates(db,db.cases[0]);assert.equal(list[0].score,100);assert.ok(!('proof' in list[0]));
});
test('two cases cannot claim the same found item',()=>{
 const db=seed(),a=db.cases[0],b=structuredClone(a);b.id='SECOND';db.cases.push(b);for(const c of [a,b]){accept(db,c);act(db,c,'match',{itemId:db.items[0].id});}act(db,a,'verify',{evidence:'Blue spiral notebook'});assert.throws(()=>act(db,b,'verify',{evidence:'Blue spiral notebook'}));
});
test('escalation requires overdue task; duplicate acknowledgment rejected',()=>{
 const db=seed(),c=db.cases[0],t=c.searchTasks[0];assert.throws(()=>act(db,c,'team-escalate',{taskId:t.id}));t.dueAt=new Date(Date.now()-1).toISOString();act(db,c,'team-escalate',{taskId:t.id});assert.equal(t.escalations,1);accept(db,c);assert.throws(()=>accept(db,c));
});
test('invalid inputs and route do not create reports',()=>{
 const db=seed();assert.throws(()=>createCase(db,{category:'Bag',date:'2026-02-30'}));assert.throws(()=>registerItem(db,{category:'Bag',date:'2026-02-30'}));
 const input={category:'Bag',date:'2026-10-12',item:'Demo bag',color:'Blue',description:'Fictional',train:'Demo',station:'Berlin Hbf',routeId:'north'};assert.throws(()=>createCase(db,input));assert.equal(db.cases.length,1);
 const c=createCase(db,{...input,station:'Nürnberg Hbf',priority:'Urgent essentials'});assert.equal(c.priority,'Urgent essentials');assert.equal(c.searchTasks.length,5);
});
