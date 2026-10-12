import http from 'node:http';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { seed, createCase, registerItem, candidates, act, publicState, DomainError } from './domain.mjs';

const root=dirname(fileURLToPath(import.meta.url));
const dataDir=process.env.RAILRECOVER_DATA_DIR || join(root,'data');
await mkdir(dataDir,{recursive:true});
const dataFile=join(dataDir,'demo.json');
let db;
try { db=JSON.parse(await readFile(dataFile,'utf8')); }
catch(e) { if(e.code!=='ENOENT') throw e; db=seed(); await writeFile(dataFile,JSON.stringify(db,null,2)); }
let queue=Promise.resolve();
const files={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/styles.css':['styles.css','text/css']};
const port=Number(process.env.PORT || 3000);
const host=process.env.HOST || '127.0.0.1';
function send(res,status,value) {res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
async function body(req) {
  let raw=''; for await(const chunk of req) {raw+=chunk; if(Buffer.byteLength(raw)>16384) throw new DomainError('Request too large.',413);}
  try {return JSON.parse(raw || '{}');} catch {throw new DomainError('Invalid JSON.');}
}
const server=http.createServer(async(req,res)=> {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  try {
    const path=new URL(req.url,'http://localhost').pathname;
    if(req.method==='GET' && files[path]) {const [file,type]=files[path];res.writeHead(200,{'Content-Type':type+'; charset=utf-8'});res.end(await readFile(join(root,'public',file)));return;}
    if(req.method==='GET' && path==='/api/state') {send(res,200,publicState(db));return;}
    if(req.method==='GET' && /^\/api\/cases\/[^/]+\/candidates$/.test(path)) {
      const c=db.cases.find(c=>c.id===path.split('/')[3]);if(!c)throw new DomainError('Case not found.',404);send(res,200,candidates(db,c));return;
    }
    if(req.method!=='POST') throw new DomainError('Not found.',404);
    // Same-origin mutation boundary. This is a synthetic single-user demo, not production authentication.
    if(req.headers.origin && req.headers.origin!==`http://${req.headers.host}`) throw new DomainError('Origin rejected.',403);
    if(req.headers['content-type']?.split(';')[0]!=='application/json') throw new DomainError('JSON content type required.',415);
    const input=await body(req);
    const operation=queue.then(async()=> {
      const next=structuredClone(db);let result;
      if(path==='/api/cases') result=createCase(next,input);
      else if(path==='/api/items') result=registerItem(next,input);
      else if(path==='/api/reset') {if(input.confirm!==true) throw new DomainError('Reset confirmation required.');Object.assign(next,seed());result={reset:true};}
      else if(/^\/api\/cases\/[^/]+\/actions$/.test(path)) {
        const c=next.cases.find(c=>c.id===path.split('/')[3]);if(!c)throw new DomainError('Case not found.',404);result=act(next,c,input.action,input);
      } else throw new DomainError('Not found.',404);
      await writeFile(dataFile+'.tmp',JSON.stringify(next,null,2));await rename(dataFile+'.tmp',dataFile);db=next;
      // Identifying details never leave the API, including create responses.
      if(result?.proof) {const {proof,...safe}=result;result=safe;}
      return result;
    });
    queue=operation.catch(()=>{});send(res,200,await operation);
  } catch(e) {send(res,e.status || 500,{error:e.status ? e.message : 'Server error. Check server logs.'});if(!e.status) console.error(e);}
});
server.listen(port,host,()=>console.log(`RailRecover demo: http://${host}:${server.address().port}`));
