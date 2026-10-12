import { seed, createCase, registerItem, candidates, act, publicState } from './domain.mjs';
const key='railrecover-pages-v1';
export function browserApi(path,input) {
  let db;
  try { db=JSON.parse(localStorage.getItem(key)) || seed(); }
  catch { db=seed(); }
  if(input===undefined){
    if(path==='/api/state')return publicState(db);
    const c=db.cases.find(c=>c.id===path.split('/')[3]);
    if(!c)throw Error('Case not found.');return candidates(db,c);
  }
  let result;
  if(path==='/api/cases')result=createCase(db,input);
  else if(path==='/api/items')result=registerItem(db,input);
  else if(path==='/api/reset'){if(!input.confirm)throw Error('Confirm reset.');db=seed();result={reset:true};}
  else {const c=db.cases.find(c=>c.id===path.split('/')[3]);if(!c)throw Error('Case not found.');result=act(db,c,input.action,input);}
  localStorage.setItem(key,JSON.stringify(db));
  if(result?.proof){const {proof,...safe}=result;return safe;}return result;
}
