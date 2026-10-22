import test from 'node:test';
import assert from 'node:assert/strict';
import {compare,main} from './json-diff.mjs';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('key order does not matter',()=>assert.deepEqual(compare({a:1,b:2},{b:2,a:1}),[]));
test('nested add remove change',()=>assert.deepEqual(compare({a:{x:1,y:2}},{a:{x:3,z:4}}).map(x=>x.type),['changed','removed','added']));
test('array indexes',()=>assert.equal(compare([1,2],[1,3])[0].path,'$[1]'));
test('type change',()=>assert.equal(compare([],{})[0].type,'changed'));
test('null change',()=>assert.equal(compare(null,{}).length,1));
test('unambiguous keys',()=>assert.equal(compare({'a.b':1},{'a.b':2})[0].path,'$["a.b"]'));
test('CLI exit codes',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'agentrix-json-'));
 try{
  const a=join(dir,'a.json'),b=join(dir,'b.json');
  await writeFile(a,'{"x":1}');await writeFile(b,'{"x":1}');
  assert.equal(await main([a,b]),0);
  await writeFile(b,'{"x":2}');assert.equal(await main([a,b]),1);
  await writeFile(b,'{bad');assert.equal(await main([a,b]),2);
 }finally{await rm(dir,{recursive:true,force:true});}
});
