import {attachTasks, upgrade, teamAction} from './coordination.mjs';
const randomUUID = () => globalThis.crypto.randomUUID();

export class DomainError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const fail = message => { throw new DomainError(message); };
export function text(value, label, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(`${label} is required (maximum ${max} characters).`);
  return value.trim();
}
const stamp = () => new Date().toISOString();
function event(c, actor, message) { c.events.push({ id: randomUUID(), at: stamp(), actor, message }); }
export function seed() {
  const at = stamp();
  const db = { schemaVersion: 3, cases: [{ id: 'RR-DEMO-001', item: 'Graphite laptop backpack', category: 'Bag', color: 'Graphite', description: 'A fabric backpack with a small orange luggage tag. Left in the luggage rack.', train: 'ICE DEMO 701', date: at.slice(0,10), station: 'Nürnberg Hbf', coach: '12', priority: 'Business device', status: 'Reported', team: 'Demo destination recovery team', task: 'Awaiting acknowledgment', dueAt: new Date(Date.now()+30*60000).toISOString(), candidateId: null, verified: false, custody: [], createdAt: at, scenario: 'missing-laptop-bag', events: [{ id: randomUUID(), at, actor: 'Passenger', message: 'Synthetic loss report submitted. Search task created; train has not yet been checked.' }] }], items: [{ id: 'FI-DEMO-01', category: 'Bag', color: 'Graphite', train: 'ICE DEMO 701', date: at.slice(0,10), description: 'Fabric laptop backpack with an orange tag.', location: 'Hamburg Hbf · demo lost-property office', proof: 'Blue spiral notebook', claimedBy: null }], feedback: [{ id: 'FB-DEMO-001', caseId: 'RR-DEMO-001', status: 'submitted', invitedAt: at, submittedAt: at, timing: 'after-update', csat: 4, ces: 2, communication: 5, confidence: 3, transparency: 5, comments: 'Synthetic unresolved-case response: the updates were clear even though the item was not recovered.', dataClass: 'synthetic' }] };
  return upgrade(db);
}
export function createCase(db, input) {
  const category = text(input.category, 'Category', 30);
  if (!['Bag','Phone','Wallet','Other'].includes(category)) fail('Choose a valid category.');
  const date = text(input.date,'Journey date',10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date+'T00:00:00Z')) || new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date) fail('Enter a valid journey date.');
  const c = { id: 'RR-'+randomUUID().slice(0,8).toUpperCase(), item: text(input.item,'Item',100), category, color: text(input.color,'Colour',40), description: text(input.description,'Description',800), train: text(input.train,'Train',50), date, station: text(input.station,'Exit station',100), coach: String(input.coach || '').trim().slice(0,20), priority: ['Business device','Urgent essentials'].includes(input.priority) ? input.priority : 'Standard', status: 'Reported', team: 'Demo destination recovery team', task: 'Awaiting acknowledgment', dueAt: new Date(Date.now()+30*60000).toISOString(), candidateId: null, verified: false, custody: [], createdAt: stamp(), scenario: String(input.scenario||'custom').slice(0,60), events: [] };
  attachTasks(c,input.routeId || 'north');
  c.dbReference=String(input.dbReference || '').trim().slice(0,80);
  event(c,'Passenger','Loss report submitted. Demo routing assigned a search task; no operator has been contacted.'); db.cases.unshift(c); db.feedback ??= []; db.feedback.unshift({id:'FB-'+randomUUID().slice(0,8).toUpperCase(),caseId:c.id,status:'invited',invitedAt:stamp(),submittedAt:null,timing:null,dataClass:'synthetic'}); return c;
}
export function submitFeedback(db,input) {
  const c=db.cases.find(row=>row.id===input.caseId); if(!c) fail('Case not found.',404);
  const rating=(value,label)=>{const n=Number(value);if(!Number.isInteger(n)||n<1||n>5)fail(`${label} must be a whole number from 1 to 5.`);return n;};
  const comments=String(input.comments||'').trim();if(comments.length>800)fail('Feedback is too long (maximum 800 characters).');
  if((db.feedback||[]).some(f=>f.caseId===c.id&&f.status==='submitted'))fail('Feedback has already been submitted for this case.');
  const row=(db.feedback||[]).find(f=>f.caseId===c.id&&f.status==='invited') || {id:'FB-'+randomUUID().slice(0,8).toUpperCase(),caseId:c.id,invitedAt:stamp(),dataClass:'synthetic'};
  Object.assign(row,{status:'submitted',submittedAt:stamp(),timing:['after-report','after-update','after-closure'].includes(input.timing)?input.timing:'after-update',csat:rating(input.csat,'CSAT'),ces:rating(input.ces,'CES'),communication:rating(input.communication,'Communication satisfaction'),confidence:rating(input.confidence,'Recovery confidence'),transparency:rating(input.transparency,'Perceived transparency'),comments});
  db.feedback ??= []; if(!db.feedback.includes(row))db.feedback.push(row); event(c,'Passenger','Synthetic feedback submitted; unanswered surveys remain excluded from satisfaction rates.'); return {id:row.id,caseId:c.id,status:row.status};
}
export function registerItem(db,input) {
  const category=text(input.category,'Category',30);
  if (!['Bag','Phone','Wallet','Other'].includes(category)) fail('Choose a valid category.');
  const date=text(input.date,'Found date',10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date+'T00:00:00Z')) || new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date) fail('Enter a valid found date.');
  const item={ id:'FI-'+randomUUID().slice(0,8).toUpperCase(), category, color:text(input.color,'Colour',40), train:text(input.train,'Train',50), date, description:text(input.description,'Description',800), location:text(input.location,'Storage location',100), proof:text(input.proof,'Private identifying detail',200), claimedBy:null };
  db.items.unshift(item); return item;
}
export function candidates(db,c) {
  return db.items.filter(i=>!i.claimedBy && i.category===c.category).map(i=> {
    const reasons=[]; let score=25; reasons.push('Same category (+25)');
    if(i.train.toLowerCase()===c.train.toLowerCase()){score+=40;reasons.push('Same train label (+40)');}
    if(i.date===c.date){score+=20;reasons.push('Same date (+20)');}
    if(i.color.toLowerCase()===c.color.toLowerCase()){score+=15;reasons.push('Same colour (+15)');}
    const {proof,...safe}=i; return {...safe,score,reasons};
  }).sort((a,b)=>b.score-a.score);
}
export function act(db,c,action,input={}) {
  if(c.status==='Returned') fail('This case is already closed.');
  upgrade(db);
  if(action.startsWith('team-'))return teamAction(db,c,action,input);
  switch(action) {
    case 'match': {
      if(!['Reported','Searching','Awaiting inventory'].includes(c.status)) fail('Acknowledge the task before reviewing a match.');
      const item=db.items.find(i=>i.id===input.itemId && !i.claimedBy);
      if(!item || item.category!==c.category) fail('Candidate is unavailable or has a different category.');
      c.candidateId=item.id; c.status='Candidate review'; c.task='Search completed — candidate under review'; event(c,'Demo operations','Candidate linked for review. Ownership has not been verified.'); break;
    }
    case 'reject':
      if(c.status!=='Candidate review') fail('No candidate to reject.');
      c.candidateId=null; c.status='Awaiting inventory'; c.task='Search completed — candidate rejected'; event(c,'Demo operations','Candidate rejected. Loss report remains open.'); break;
    case 'verify': {
      if(c.status!=='Candidate review') fail('A candidate must be reviewed first.');
      const item=db.items.find(i=>i.id===c.candidateId);
      if(!item || item.claimedBy) fail('This item is no longer available.');
      const evidence=text(input.evidence,'Ownership evidence',200);
      if(evidence.toLowerCase()!==item.proof.toLowerCase()) { event(c,'Demo operations','Ownership check unsuccessful; item remains withheld.'); return { verificationFailed:true }; }
      item.claimedBy=c.id; c.verified=true; c.verifiedAt=stamp(); c.status='Verified'; event(c,'Demo operations','Private identifying detail confirmed by demo staff. Item reserved to this case.'); break;
    }
    case 'handover': {
      if(!c.verified || !['Verified','Ready for collection'].includes(c.status)) fail('Verify ownership before a custody handover.');
      const destination=text(input.destination,'Receiving location',100);
      const item=db.items.find(i=>i.id===c.candidateId);
      c.custody.push({ at:stamp(), from:item.location, to:destination, actor:'Demo operations' }); item.location=destination; c.status='Ready for collection'; event(c,'Demo operations',`Custody handover accepted at ${destination}. Ready for simulated collection.`); break;
    }
    case 'return':
      if(c.status!=='Ready for collection' || !c.verified) fail('Accepted custody handover and verified ownership are required.');
      if(input.confirm!==true) fail('Confirm simulated collection.');
      c.status='Returned'; c.task='Closed'; c.recoveredAt=stamp(); event(c,'Demo operations','Simulated collection recorded. Case closed.'); break;
    default: fail('Unknown action.');
  }
  return { verificationFailed:false };
}
export function publicState(db) {
  upgrade(db);
  return { ...db, items:db.items.map(({proof,...i})=>i), feedback:(db.feedback||[]).map(({comments,...f})=>({...f,hasWrittenFeedback:Boolean(comments)})) };
}
