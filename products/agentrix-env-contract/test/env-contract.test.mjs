import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const exe=fileURLToPath(new URL('../bin/env-contract.mjs',import.meta.url));
function check(example,env,extra=[]){
 const dir=mkdtempSync(join(tmpdir(),'agentrix-'));
 try{
  writeFileSync(join(dir,'.env.example'),example);writeFileSync(join(dir,'.env'),env);
  return spawnSync(process.execPath,[exe,'--example',join(dir,'.env.example'),'--env',join(dir,'.env'),...extra],{encoding:'utf8'});
 }finally{rmSync(dir,{recursive:true,force:true});}
}
test('matching keys pass without disclosing values',()=>{const r=check('TOKEN=placeholder\nPORT=3000','TOKEN=private-secret\nPORT=5000');assert.equal(r.status,0);assert.doesNotMatch(r.stdout,/private-secret/);});
test('missing key fails',()=>{const r=check('API_KEY=\nPORT=','PORT=123');assert.equal(r.status,1);assert.match(r.stdout,/Missing: API_KEY/);});
test('extra key fails',()=>{const r=check('PORT=','PORT=80\nDEBUG=true');assert.equal(r.status,1);assert.match(r.stdout,/Undocumented: DEBUG/);});
test('extra key can be allowed',()=>{assert.equal(check('PORT=','PORT=80\nDEBUG=true',['--allow-extra']).status,0);});
test('comments and export prefix',()=>{assert.equal(check('# comment\nexport PORT=80','PORT=90').status,0);});
test('duplicate keys rejected',()=>{const r=check('A=1\nA=2','A=3');assert.equal(r.status,2);assert.match(r.stderr,/duplicate key A/);});
test('invalid input rejected',()=>{assert.equal(check('invalid line','A=3').status,2);});
test('json only exposes keys',()=>{const r=check('A=','B=secret',['--json']);assert.equal(r.status,1);assert.deepEqual(JSON.parse(r.stdout).missing,['A']);assert.doesNotMatch(r.stdout,/secret/);});
