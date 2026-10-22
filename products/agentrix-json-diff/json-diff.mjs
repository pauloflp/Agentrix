#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function compare(left,right,path='$'){
  if(Object.is(left,right)) return [];
  const obj=v=>v!==null&&typeof v==='object';
  if(!obj(left)||!obj(right)||Array.isArray(left)!==Array.isArray(right))
    return [{path,type:'changed',before:left,after:right}];
  const changes=[];
  for(const key of [...new Set([...Object.keys(left),...Object.keys(right)])].sort()){
    const next=Array.isArray(left)?path+'['+key+']':path+'['+JSON.stringify(key)+']';
    if(!Object.hasOwn(left,key)) changes.push({path:next,type:'added',after:right[key]});
    else if(!Object.hasOwn(right,key)) changes.push({path:next,type:'removed',before:left[key]});
    else changes.push(...compare(left[key],right[key],next));
  }
  return changes;
}
export async function main(args=process.argv.slice(2)){
  const json=args.includes('--json'), paths=args.filter(a=>a!=='--json');
  if(paths.length!==2||paths.some(a=>a.startsWith('--'))){
    console.error('Usage: node json-diff.mjs [--json] <before.json> <after.json>');
    return 2;
  }
  try{
    const [before,after]=await Promise.all(paths.map(async p=>JSON.parse(await readFile(p,'utf8'))));
    const changes=compare(before,after);
    if(json) console.log(JSON.stringify({equal:changes.length===0,changes},null,2));
    else if(!changes.length) console.log('No differences.');
    else for(const c of changes) console.log(c.type.toUpperCase()+' '+c.path);
    return changes.length?1:0;
  }catch(e){console.error('JSON Diff: '+e.message);return 2;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) process.exitCode=await main();
