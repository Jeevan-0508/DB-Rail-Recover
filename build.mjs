import {rm,mkdir,cp,copyFile,writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});await copyFile('domain.mjs','dist/domain.mjs');
await writeFile('dist/.nojekyll','');
console.log('GitHub Pages demo built in dist/');
