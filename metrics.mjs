export const METRIC_DEFINITIONS = {
  csat: {label:'CSAT', unit:'percent', numerator:'Valid survey responses rated 4 or 5', denominator:'Submitted CSAT responses', inclusion:'Only submitted surveys with a 1–5 CSAT score', timestamp:'survey submittedAt'},
  ces: {label:'CES', unit:'score', numerator:'Mean effort rating', denominator:'Submitted CES responses', inclusion:'Only submitted surveys with a 1–5 CES score; 1 means very easy', timestamp:'survey submittedAt'},
  communicationSatisfaction: {label:'Communication satisfaction', unit:'score', numerator:'Mean communication rating', denominator:'Submitted communication responses', inclusion:'Only submitted surveys with a 1–5 score', timestamp:'survey submittedAt'},
  confidence: {label:'Recovery confidence', unit:'score', numerator:'Mean confidence rating', denominator:'Submitted confidence responses', inclusion:'Only submitted surveys with a 1–5 score', timestamp:'survey submittedAt'},
  transparency: {label:'Perceived transparency', unit:'score', numerator:'Mean transparency rating', denominator:'Submitted transparency responses', inclusion:'Only submitted surveys with a 1–5 score', timestamp:'survey submittedAt'},
  surveyResponseRate: {label:'Survey response rate', unit:'percent', numerator:'Submitted surveys', denominator:'Invited surveys', inclusion:'Unanswered invitations remain non-respondents', timestamp:'invitedAt/submittedAt'},
  acknowledgementMinutes: {label:'Report → acknowledgement', unit:'minutes', numerator:'Elapsed report-to-first-task-acknowledgement', denominator:'Cases with a report timestamp and acknowledgement', inclusion:'First task acknowledgement per case', timestamp:'case report event / task ackAt'},
  firstAssignedMinutes: {label:'Report → first assigned search', unit:'minutes', numerator:'Elapsed report-to-first-task-sent', denominator:'Cases with report and task timestamps', inclusion:'First route task only', timestamp:'case report event / task sentAt'},
  firstUpdateMinutes: {label:'Report → first meaningful update', unit:'minutes', numerator:'Elapsed report-to-first-task-response', denominator:'Cases with a recorded task response', inclusion:'A response must include a terminal task state', timestamp:'case report event / task responseAt'},
  firstVerifiedMatchMinutes: {label:'Report → verified match', unit:'minutes', numerator:'Elapsed report-to-ownership verification', denominator:'Cases with verifiedAt', inclusion:'Human verification event required', timestamp:'case report event / verifiedAt'},
  verifiedRecoveryMinutes: {label:'Report → verified recovery', unit:'minutes', numerator:'Elapsed report-to-simulated collection', denominator:'Cases with recoveredAt', inclusion:'Verified ownership, custody handover and collection required', timestamp:'case report event / recoveredAt'},
  searchCompletionRate: {label:'Search-task completion rate', unit:'percent', numerator:'Terminal search tasks', denominator:'All search tasks', inclusion:'Terminal means Found, Checked — not found or Unable to check', timestamp:'task responseAt'},
  searchCoverage: {label:'Search coverage', unit:'coverage', numerator:'Responded tasks by team kind', denominator:'Created tasks by team kind', inclusion:'Reported separately for Onboard, Station and Terminal tasks', timestamp:'task sentAt/responseAt'},
  overdueTaskRate: {label:'Overdue task rate', unit:'percent', numerator:'Pending or accepted tasks past dueAt', denominator:'All pending or accepted tasks evaluated at asOf', inclusion:'Snapshot metric; no scheduler is implied', timestamp:'asOf / task dueAt'},
  duplicateEnquiryRate: {label:'Duplicate enquiry rate', unit:'percent', numerator:'Cases sharing a non-empty report reference', denominator:'Cases with a non-empty report reference', inclusion:'Requires a supplied correlation/report reference', timestamp:'case createdAt'},
  escalationResponseMinutes: {label:'Escalation response time', unit:'minutes', numerator:'Elapsed escalation-to-next acknowledgement or response', denominator:'Escalations with a subsequent response', inclusion:'Only escalations with a recorded follow-up event', timestamp:'task escalatedAt / ackAt or responseAt'},
  recoveryRate: {label:'Verified recovery rate', unit:'percent', numerator:'Cases with recoveredAt', denominator:'Eligible cases', inclusion:'Recovered means verified ownership and collection event', timestamp:'case recoveredAt'},
  unresolvedRate: {label:'Unresolved case rate', unit:'percent', numerator:'Cases without recoveredAt and not administratively closed', denominator:'Eligible cases', inclusion:'A negative search does not automatically close a case', timestamp:'asOf / case status'},
  staffHandlingMinutes: {label:'Average staff handling time', unit:'minutes', numerator:'Ack-to-response duration per responded task', denominator:'Tasks with ackAt and responseAt', inclusion:'Task handling proxy; excludes unrecorded work', timestamp:'task ackAt/responseAt'}
};

const terminal = task => ['Found','Checked — not found','Unable to check'].includes(task.status);
const finite = value => value!==null && value!==undefined && Number.isFinite(Number(value));
const pct = (n,d) => d ? Math.round((n/d)*1000)/10 : null;
const mean = values => values.length ? Math.round((values.reduce((a,b)=>a+b,0)/values.length)*10)/10 : null;
const minutes = (a,b) => a && b ? Math.max(0,(Date.parse(b)-Date.parse(a))/60000) : null;
const first = (values, key) => values.map(v=>v[key]).filter(Boolean).sort()[0] || null;
const reportAt = c => c.events?.find(e=>e.actor==='Passenger')?.at || c.createdAt || c.events?.map(e=>e.at).sort()[0] || `${c.date}T00:00:00.000Z`;

function caseMatches(c, filters={}) {
  if(filters.urgency && filters.urgency!=='All' && c.priority!==filters.urgency) return false;
  if(filters.category && filters.category!=='All' && c.category!==filters.category) return false;
  if(filters.route && filters.route!=='All' && c.routeId!==filters.route) return false;
  if(filters.outcome && filters.outcome!=='All') {
    const outcome=c.recoveredAt?'Recovered':c.status==='Returned'?'Recovered':'Unresolved';
    if(outcome!==filters.outcome) return false;
  }
  if(filters.scenario && filters.scenario!=='All' && c.scenario!==filters.scenario) return false;
  if(filters.from && reportAt(c)<filters.from) return false;
  if(filters.to && reportAt(c)>filters.to) return false;
  return true;
}

function measure(value, sampleSize, extra={}) {
  return {value, sampleSize, ...extra, display:value===null?'Insufficient data':value};
}

export function calculateKpis(db, {filters={}, asOf=new Date().toISOString()}={}) {
  const cases=db.cases.filter(c=>caseMatches(c,filters));
  const feedback=(db.feedback||[]).filter(f=>!f.caseId || cases.some(c=>c.id===f.caseId));
  const submitted=feedback.filter(f=>f.status==='submitted');
  const valid=(key)=>submitted.filter(f=>Number.isInteger(Number(f[key]))&&Number(f[key])>=1&&Number(f[key])<=5);
  const score=(key)=>{const rows=valid(key);return measure(mean(rows.map(f=>Number(f[key]))),rows.length);};
  const csat=valid('csat');
  const tasks=cases.flatMap(c=>c.searchTasks||[]);
  const openTasks=tasks.filter(t=>['Pending','Accepted'].includes(t.status));
  const overdue=openTasks.filter(t=>Date.parse(t.dueAt)<Date.parse(asOf));
  const acknowledged=cases.map(c=>minutes(reportAt(c),first(c.searchTasks||[],'ackAt'))).filter(finite);
  const assigned=cases.map(c=>minutes(reportAt(c),first(c.searchTasks||[],'sentAt'))).filter(finite);
  const updated=cases.map(c=>minutes(reportAt(c),first((c.searchTasks||[]).filter(t=>terminal(t)),'responseAt'))).filter(finite);
  const verified=cases.map(c=>minutes(reportAt(c),c.verifiedAt)).filter(finite);
  const recovered=cases.map(c=>minutes(reportAt(c),c.recoveredAt)).filter(finite);
  const handling=tasks.map(t=>minutes(t.ackAt,t.responseAt)).filter(finite);
  const coverage={};
  for(const kind of ['Onboard','Station','Terminal']){
    const rows=tasks.filter(t=>t.kind===kind);coverage[kind]={responded:rows.filter(terminal).length,created:rows.length,rate:pct(rows.filter(terminal).length,rows.length)};
  }
  const refs=cases.map(c=>String(c.dbReference||'').trim().toLowerCase()).filter(Boolean);
  const duplicateRefs=refs.filter((ref,i)=>refs.indexOf(ref)!==i);
  const escalationDurations=[];
  for(const c of cases) for(const t of c.searchTasks||[]) if(t.escalatedAt){const follow=[t.ackAt,t.responseAt].filter(Boolean).sort()[0];const d=minutes(t.escalatedAt,follow);if(finite(d))escalationDurations.push(d);}
  const eligible=cases.length;
  const recoveredCount=cases.filter(c=>c.recoveredAt||c.status==='Returned').length;
  const unresolvedCount=cases.filter(c=>!c.recoveredAt&&c.status!=='Returned'&&c.status!=='Closed').length;
  const metrics={
    csat:measure(pct(csat.filter(f=>Number(f.csat)>=4).length,csat.length),csat.length),
    ces:score('ces'), communicationSatisfaction:score('communication'), confidence:score('confidence'), transparency:score('transparency'),
    surveyResponseRate:measure(pct(submitted.length,feedback.filter(f=>f.status==='invited'||f.status==='submitted').length),feedback.filter(f=>f.status==='invited'||f.status==='submitted').length,{missingResponses:feedback.filter(f=>f.status==='invited').length}),
    acknowledgementMinutes:measure(mean(acknowledged),acknowledged.length), firstAssignedMinutes:measure(mean(assigned),assigned.length), firstUpdateMinutes:measure(mean(updated),updated.length), firstVerifiedMatchMinutes:measure(mean(verified),verified.length), verifiedRecoveryMinutes:measure(mean(recovered),recovered.length),
    searchCompletionRate:measure(pct(tasks.filter(terminal).length,tasks.length),tasks.length), searchCoverage:measure(null,0,{byTeam:coverage}), overdueTaskRate:measure(pct(overdue.length,openTasks.length),openTasks.length), duplicateEnquiryRate:measure(pct(duplicateRefs.length,refs.length),refs.length), escalationResponseMinutes:measure(mean(escalationDurations),escalationDurations.length), recoveryRate:measure(pct(recoveredCount,eligible),eligible), unresolvedRate:measure(pct(unresolvedCount,eligible),eligible), staffHandlingMinutes:measure(mean(handling),handling.length)
  };
  const submittedDates=submitted.map(f=>f.submittedAt).filter(Boolean).sort();
  return {dataClass:'synthetic demonstration data',generatedAt:asOf,filters,surveyPeriod:submittedDates.length?{from:submittedDates[0],to:submittedDates.at(-1)}:null,metrics,definitions:METRIC_DEFINITIONS,eligibleCases:eligible,missingSurveyResponses:metrics.surveyResponseRate.missingResponses||0};
}
