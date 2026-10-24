import {readFileSync,writeFileSync} from 'node:fs';
const dir=new URL('./',import.meta.url);
const read=name=>readFileSync(new URL(name,dir),'utf8');
const core=read('src/csv.mjs').replaceAll(/\bexport\s+(?=(?:const|function|class)\b)/g,'');
const app=read('src/app.js');const css=read('src/style.css');
const safe=s=>s.replaceAll('</script','<\\/script').replaceAll('<!--','<\\!--');
const html=read('src/index.template.html').replace('/*__CSS__*/',css).replace('/*__CORE__*/',safe(core)).replace('/*__APP__*/',safe(app));
writeFileSync(new URL('index.html',dir),html);console.log(`Built standalone offline index.html (${Buffer.byteLength(html)} bytes)`);