import { randomUUID } from 'node:crypto';

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
  return { schemaVersion: 1, cases: [{ id: 'RR-DEMO-001', item: 'Graphite laptop backpack', category: 'Bag', color: 'Graphite', description: 'A fabric backpack with a small orange luggage tag. Left in the luggage rack.', train: 'ICE DEMO 701', date: at.slice(0,10), station: 'Nürnberg Hbf', coach: '12', priority: 'Business device', status: 'Reported', team: 'Demo destination recovery team', task: 'Awaiting acknowledgment', dueAt: new Date(Date.now()+30*60000).toISOString(), candidateId: null, verified: false, custody: [], events: [{ id: randomUUID(), at, actor: 'Passenger', message: 'Synthetic loss report submitted. Search task created; train has not yet been checked.' }] }], items: [{ id: 'FI-DEMO-01', category: 'Bag', color: 'Graphite', train: 'ICE DEMO 701', date: at.slice(0,10), description: 'Fabric laptop backpack with an orange tag.', location: 'Demo destination office', proof: 'Blue spiral notebook', claimedBy: null }] };
}
export function createCase(db, input) {
  const category = text(input.category, 'Category', 30);
  if (!['Bag','Phone','Wallet','Other'].includes(category)) fail('Choose a valid category.');
  const date = text(input.date,'Journey date',10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date+'T00:00:00Z')) || new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date) fail('Enter a valid journey date.');
  const c = { id: 'RR-'+randomUUID().slice(0,8).toUpperCase(), item: text(input.item,'Item',100), category, color: text(input.color,'Colour',40), description: text(input.description,'Description',800), train: text(input.train,'Train',50), date, station: text(input.station,'Exit station',100), coach: String(input.coach || '').trim().slice(0,20), priority: input.priority==='Business device' ? 'Business device' : 'Standard', status: 'Reported', team: 'Demo destination recovery team', task: 'Awaiting acknowledgment', dueAt: new Date(Date.now()+30*60000).toISOString(), candidateId: null, verified: false, custody: [], events: [] };
  event(c,'Passenger','Loss report submitted. Demo routing assigned a search task; no operator has been contacted.'); db.cases.unshift(c); return c;
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
  switch(action) {
    case 'acknowledge':
      if(c.task!=='Awaiting acknowledgment') fail('Task has already been acknowledged.');
      c.task='Search in progress'; c.status='Searching'; event(c,'Demo operations','Search task acknowledged. Acknowledgment does not confirm an item was found.'); break;
    case 'not-found':
      if(c.task!=='Search in progress' || c.status!=='Searching') fail('An active search is required.');
      c.task='Search completed — no item found'; c.status='Awaiting inventory'; event(c,'Demo operations','Train check completed: no item found. Loss report remains open for later inventory matching.'); break;
    case 'match': {
      if(!['Searching','Awaiting inventory'].includes(c.status)) fail('Acknowledge the task before reviewing a match.');
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
      item.claimedBy=c.id; c.verified=true; c.status='Verified'; event(c,'Demo operations','Private identifying detail confirmed by demo staff. Item reserved to this case.'); break;
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
      c.status='Returned'; c.task='Closed'; event(c,'Demo operations','Simulated collection recorded. Case closed.'); break;
    case 'escalate':
      if(c.task!=='Awaiting acknowledgment') fail('Only unacknowledged tasks can be escalated.');
      if(Date.now()<Date.parse(c.dueAt)) fail('Acknowledgment deadline has not passed.');
      c.team='Demo recovery supervisor'; c.dueAt=new Date(Date.now()+30*60000).toISOString(); event(c,'Demo workflow','Overdue task escalated to recovery supervisor; new acknowledgment deadline set.'); break;
    default: fail('Unknown action.');
  }
  return { verificationFailed:false };
}
export function publicState(db) {
  return { ...db, items:db.items.map(({proof,...i})=>i) };
}
