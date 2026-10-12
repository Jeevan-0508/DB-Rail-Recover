import test from 'node:test';
import assert from 'node:assert/strict';
import {seed,act,candidates,publicState,createCase,registerItem} from '../domain.mjs';
test('return requires human verification and accepted custody',()=>{
 const db=seed(),c=db.cases[0];
 assert.throws(()=>act(db,c,'return',{confirm:true}));
 act(db,c,'acknowledge');act(db,c,'match',{itemId:db.items[0].id});
 assert.throws(()=>act(db,c,'handover',{destination:'Demo collection desk'}));
 assert.equal(act(db,c,'verify',{evidence:'Wrong detail'}).verificationFailed,true);
 assert.equal(c.status,'Candidate review');assert.equal(db.items[0].claimedBy,null);
 act(db,c,'verify',{evidence:'Blue spiral notebook'});
 assert.throws(()=>act(db,c,'return',{confirm:true}));
 act(db,c,'handover',{destination:'Demo collection desk'});act(db,c,'return',{confirm:true});
 assert.equal(c.status,'Returned');assert.equal(c.custody.length,1);
 assert.throws(()=>act(db,c,'acknowledge'));
});
test('negative search keeps report open for later inventory',()=>{
 const db=seed(),c=db.cases[0];act(db,c,'acknowledge');act(db,c,'not-found');
 assert.equal(c.status,'Awaiting inventory');act(db,c,'match',{itemId:db.items[0].id});act(db,c,'reject');assert.equal(c.candidateId,null);assert.equal(c.status,'Awaiting inventory');
});
test('private identifying details are withheld from reads and ranking',()=>{
 const db=seed();assert.ok(!JSON.stringify(publicState(db)).includes('Blue spiral notebook'));
 const matches=candidates(db,db.cases[0]);assert.equal(matches[0].score,100);assert.ok(!('proof' in matches[0]));
});
test('two cases cannot claim the same inventory item',()=>{
 const db=seed(),a=db.cases[0],b=structuredClone(a);b.id='RR-SECOND';db.cases.push(b);
 for(const c of [a,b]){act(db,c,'acknowledge');act(db,c,'match',{itemId:db.items[0].id});}
 act(db,a,'verify',{evidence:'Blue spiral notebook'});
 assert.throws(()=>act(db,b,'verify',{evidence:'Blue spiral notebook'}));
});
test('escalation requires an overdue unacknowledged task',()=>{
 const db=seed(),c=db.cases[0];assert.throws(()=>act(db,c,'escalate'));
 c.dueAt=new Date(Date.now()-1000).toISOString();act(db,c,'escalate');assert.equal(c.team,'Demo recovery supervisor');
 act(db,c,'acknowledge');assert.throws(()=>act(db,c,'escalate'));
});
test('invalid input cannot create a case or found item',()=>{
 const db=seed();assert.throws(()=>createCase(db,{category:'Bag',date:'2026-02-30'}));
 assert.throws(()=>registerItem(db,{category:'Bag',date:'2026-02-30'}));assert.equal(db.cases.length,1);
});
