import { seed, createCase, registerItem, submitFeedback, candidates, act, publicState } from '../domain.mjs';
import { calculateKpis } from '../metrics.mjs';
import { calculateFinancialModel, sensitivity } from '../financial.mjs';
const key='railrecover-pages-v2';
export function browserApi(path,input) {
  let db;
  try { db=JSON.parse(localStorage.getItem(key)) || seed(); }
  catch { db=seed(); }
  // Persist generated team IDs before the first read so subsequent actions address the same tasks.
  localStorage.setItem(key,JSON.stringify(db));
  if(input===undefined){
    if(path==='/api/state')return publicState(db);
    if(path.startsWith('/api/metrics'))return calculateKpis(db,{filters:Object.fromEntries(new URL(path,'http://demo').searchParams)});
    const c=db.cases.find(c=>c.id===path.split('/')[3]);
    if(!c)throw Error('Case not found.');return candidates(db,c);
  }
  let result;
  if(path==='/api/cases')result=createCase(db,input);
  else if(path==='/api/items')result=registerItem(db,input);
  else if(path==='/api/feedback')result=submitFeedback(db,input);
  else if(path==='/api/financial')result={model:calculateFinancialModel(input),sensitivity:sensitivity(input)};
  else if(path==='/api/reset'){if(!input.confirm)throw Error('Confirm reset.');db=seed();result={reset:true};}
  else {const c=db.cases.find(c=>c.id===path.split('/')[3]);if(!c)throw Error('Case not found.');result=act(db,c,input.action,input);}
  localStorage.setItem(key,JSON.stringify(db));
  if(result?.proof){const {proof,...safe}=result;return safe;}return result;
}
