export const routes=[
 {id:'north',name:'Illustrative northbound journey',stops:['Frankfurt (Main) Hbf','Nürnberg Hbf','Würzburg Hbf','Hannover Hbf','Hamburg Hbf']},
 {id:'south',name:'Illustrative southbound journey',stops:['Hamburg Hbf','Hannover Hbf','Würzburg Hbf','Nürnberg Hbf','München Hbf']}
];
const uuid=()=>crypto.randomUUID(),now=()=>new Date().toISOString();
const fail=m=>{const e=new Error(m);e.status=400;throw e;};
const log=(c,actor,message)=>c.events.push({id:uuid(),at:now(),actor,message});
export function attachTasks(c,routeId){
 const route=routes.find(r=>r.id===routeId),exit=route?.stops.indexOf(c.station)??-1;
 if(!route||exit<0)fail('Select an exit station on the illustrative route.');
 c.routeId=route.id;c.routeStops=route.stops;c.routeConfirmed=false;
 const recipients=[{name:`${c.train} · onboard team`,kind:'Onboard',scope:`Coach ${c.coach||'unknown'}, luggage area`},...route.stops.slice(exit+1).map(name=>({name,kind:'Station',scope:'Local found-item inventory and handover desk'})),{name:`${route.stops.at(-1)} · cleaning / depot team`,kind:'Terminal',scope:'End-of-journey train sweep'}];
 c.searchTasks=recipients.map(r=>({...r,id:uuid(),status:'Pending',sentAt:now(),ackAt:null,responseAt:null,dueAt:new Date(Date.now()+(c.priority==='Urgent essentials'?15:30)*60000).toISOString(),note:'',foundItemId:null,escalations:0}));
 c.team='Shared route coordination';c.task='Responses pending';
 log(c,'Demo routing',`${recipients.length} relevant team tasks created locally. Journey is illustrative; no railway team was notified.`);
}
export function upgrade(db){
 db.schemaVersion=2;
 for(const c of db.cases)if(!c.searchTasks){const r=routes.find(r=>r.stops.includes(c.station));if(r)attachTasks(c,r.id);else {c.routeStops=[];c.routeConfirmed=false;c.searchTasks=[{id:uuid(),name:'Demo coordination desk',kind:'Unconfirmed route',scope:'Confirm journey and team ownership before routing',status:'Pending',sentAt:now(),ackAt:null,responseAt:null,dueAt:new Date(Date.now()+30*60000).toISOString(),note:'',foundItemId:null,escalations:0}];}}
 return db;
}
function sync(c){
 const pending=c.searchTasks.filter(t=>['Pending','Accepted'].includes(t.status)).length;
 c.task=pending?`${pending} team response(s) pending`:'All teams responded — report remains open';
 if(['Reported','Searching','Awaiting inventory'].includes(c.status))c.status=c.searchTasks.some(t=>t.status==='Accepted')?'Searching':pending?'Reported':'Awaiting inventory';
}
export function teamAction(db,c,action,input){
 const t=c.searchTasks.find(t=>t.id===input.taskId);if(!t)fail('Search team not found.');
 if(action==='team-ack'){
  if(t.status!=='Pending')fail('Only a pending task can be accepted.');
  t.status='Accepted';t.ackAt=now();t.dueAt=new Date(Date.now()+(c.priority==='Urgent essentials'?30:60)*60000).toISOString();log(c,t.name,'Search request accepted (simulation); response pending.');
 }else if(action==='team-escalate'){
  if(!['Pending','Accepted'].includes(t.status)||Date.now()<Date.parse(t.dueAt))fail('Only an overdue pending or accepted task can be escalated.');
  t.escalations++;t.dueAt=new Date(Date.now()+15*60000).toISOString();log(c,'Demo supervisor',`Overdue request for ${t.name} escalated. No external message sent.`);
 }else{
  if(t.status!=='Accepted')fail('Accept the task before recording a response.');
  if(!['Found','Checked — not found','Unable to check'].includes(input.outcome))fail('Choose a valid response.');
  const note=typeof input.note==='string'?input.note.trim():'';if(!note||note.length>500)fail('Describe the check or reason (maximum 500 characters).');
  if(input.outcome==='Found'){
   const i=db.items.find(i=>i.id===input.itemId&&!i.claimedBy&&i.category===c.category);if(!i)fail('Select a registered available item of the same category.');t.foundItemId=i.id;
  }
  t.status=input.outcome;t.note=note;t.responseAt=now();log(c,t.name,`${t.status}: ${note}${t.foundItemId?' · Inventory reference '+t.foundItemId:''}`);
 }
 sync(c);return {verificationFailed:false};
}
