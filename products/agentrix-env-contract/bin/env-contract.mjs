#!/usr/bin/env node
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
function parseFile(path){
 const map=new Map(); const lines=readFileSync(path,'utf8').split(/\r?\n/);
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim(); if(!line||line.startsWith('#'))continue;
  const m=line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if(!m)throw Error(`${path}:${i+1}: invalid dotenv assignment`);
  if(map.has(m[1]))throw Error(`${path}:${i+1}: duplicate key ${m[1]}`);
  map.set(m[1],m[2]);
 } return map;
}
export function compare(sample,actual){
 const missing=[...sample.keys()].filter(k=>!actual.has(k)).sort();
 const undocumented=[...actual.keys()].filter(k=>!sample.has(k)).sort();
 return {missing,undocumented,ok:missing.length===0&&undocumented.length===0};
}
export function run(args){
 if(args.includes('--help')){console.log('Usage: node bin/env-contract.mjs --example .env.example --env .env [--allow-extra] [--json]');return 0;}
 const opt=(name,fallback)=>{const at=args.indexOf(name);if(at<0)return fallback;if(!args[at+1]||args[at+1].startsWith('--'))throw Error(`Missing value for ${name}`);return args[at+1];};
 const example=resolve(opt('--example','.env.example'));const env=resolve(opt('--env','.env'));
 for(const file of [example,env])if(!existsSync(file))throw Error(`File not found: ${file}`);
 const result=compare(parseFile(example),parseFile(env));
 const ok=result.missing.length===0&&(args.includes('--allow-extra')||result.undocumented.length===0);
 if(args.includes('--json'))console.log(JSON.stringify({...result,ok},null,2));
 else {console.log(ok?'PASS: environment keys match':'FAIL: environment key mismatch');
  if(result.missing.length)console.log(`Missing: ${result.missing.join(', ')}`);
  if(result.undocumented.length)console.log(`Undocumented: ${result.undocumented.join(', ')}`);
 }
 return ok?0:1;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname)){
 try{process.exitCode=run(process.argv.slice(2));}
 catch(err){console.error(`ERROR: ${err.message}`);process.exitCode=2;}
}
