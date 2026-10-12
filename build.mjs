import {rm,mkdir,cp,copyFile,writeFile,readFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});await copyFile('domain.mjs','dist/domain.mjs');await copyFile('coordination.mjs','dist/coordination.mjs');
await writeFile('dist/demo-api.js',(await readFile('public/demo-api.js','utf8')).replace("from '../domain.mjs'","from './domain.mjs'"));
await writeFile('dist/.nojekyll','');
console.log('GitHub Pages demo built in dist/');
