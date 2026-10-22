import {rm,mkdir,cp,copyFile,writeFile,readFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});await copyFile('domain.mjs','dist/domain.mjs');await copyFile('coordination.mjs','dist/coordination.mjs');await copyFile('metrics.mjs','dist/metrics.mjs');await copyFile('financial.mjs','dist/financial.mjs');
await writeFile('dist/demo-api.js',(await readFile('public/demo-api.js','utf8')).replaceAll("from '../domain.mjs'","from './domain.mjs'").replaceAll("from '../metrics.mjs'","from './metrics.mjs'").replaceAll("from '../financial.mjs'","from './financial.mjs'"));
await writeFile('dist/.nojekyll','');
console.log('GitHub Pages demo built in dist/');
