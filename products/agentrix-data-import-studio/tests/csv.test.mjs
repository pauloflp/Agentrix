import test from 'node:test';import assert from 'node:assert/strict';
import {parseCSV,detectDelimiter,normalizeSchema,sourceColumns,autoMap,transform,serializeCSV,errorsCSV,formulaRisk,LIMITS} from '../src/csv.mjs';
const schema=normalizeSchema({fields:[{name:'email',type:'email',required:true},{name:'amount',type:'number',required:true},{name:'date',type:'date',required:false}]});
test('quoted commas, escaped quotes, multiline, CRLF and BOM',()=>{
 const rows=parseCSV('\uFEFFemail,amount,date\r\n"a""b@example.com",12,2026-10-10\r\n"hello,\r\nworld",9,2026-10-11\r\n');
 assert.equal(rows.length,3);assert.equal(rows[1].values[0],'a"b@example.com');assert.equal(rows[2].values[0],'hello,\r\nworld');assert.equal(rows[2].line,3);
});
test('detects semicolon and tab',()=>{assert.equal(detectDelimiter('a;b;c\n1;2;3\n4;5;6'),';');assert.equal(detectDelimiter('a\tb\tc\n1\t2\t3'),'\t');});
test('rejects malformed quotes and too many columns',()=>{
 assert.throws(()=>parseCSV('a,"broken'),/Unclosed/);
 assert.throws(()=>parseCSV('a,"x"oops'),/Unexpected character/);
 assert.throws(()=>parseCSV('a,b,c',',',{maxColumns:2}),/More than 2/);
});
test('headerless mapping and Unicode',()=>{
 const rows=parseCSV('zoë@example.com,3,2026-10-12\n山田@example.jp,2,2026-10-13');
 const cols=sourceColumns(rows,false);assert.equal(cols[0].label,'Column 1');
 const r=transform(rows,schema,{email:0,amount:1,date:2},{header:false});assert.equal(r.ok.length,2);
});
test('incomplete rows, email, number, impossible date',()=>{
 const rows=parseCSV('email,amount,date\na@example.com,9,2026-02-29\nbad-email,2,2026-10-11\nc@example.com,no,2026-10-12\nd@example.com\n');
 const r=transform(rows,schema,{email:0,amount:1,date:2});assert.equal(r.errors.length,4);assert.match(r.errors[0].issues[0],/date/);assert.match(r.errors[3].issues[0],/amount/);
});
test('mapping preview, required unmapped field',()=>{
 const rows=parseCSV('Email,Amount\na@example.com,1');const map=autoMap(sourceColumns(rows),schema);assert.equal(map.email,0);assert.equal(map.amount,1);
 assert.equal(transform(rows,schema,{email:0,amount:null}).errors.length,1);
});
test('serializes round-trip and escapes CSV formulas by default',()=>{
 const items=[{email:'=2+3',amount:'-2',date:'a,"b"\nc'},{email:' +SUM(1)',amount:'@cmd',date:'\t=4'}];
 const csv=serializeCSV(items,['email','amount','date']);const p=parseCSV(csv);
 assert.equal(p[1].values[0],"'=2+3");assert.equal(p[1].values[1],"'-2");assert.equal(p[1].values[2],'a,"b"\nc');
 assert.equal(p[2].values[0],"' +SUM(1)");assert.equal(p[2].values[1],"'@cmd");assert.equal(p[2].values[2],"'\t=4");
});
test('error report contains line and validation issues',()=>{
 const csv=errorsCSV([{line:4,values:['bad','123'],issues:['email: Invalid email']}]);
 const p=parseCSV(csv);assert.equal(p[1].values[0],'4');assert.match(p[1].values[1],/Invalid email/);
});
test('invalid schema rejected',()=>{assert.throws(()=>normalizeSchema({fields:[{name:'x',type:'string'},{name:'x',type:'email'}]}),/Duplicate/);assert.throws(()=>normalizeSchema({fields:[{name:'x',type:'unknown'}]}),/Unsupported/);});
test('size and row limits enforced',()=>{
 assert.throws(()=>parseCSV('a'.repeat(LIMITS.bytes+1)),/5 MiB/);
 assert.throws(()=>parseCSV('a\nb\nc',',',{maxRows:1}),/More than 1/);
});
test('formula detection',()=>{assert.equal(formulaRisk('=SUM(1)'),true);assert.equal(formulaRisk(' \t@HYPERLINK'),true);assert.equal(formulaRisk('-42'),true);assert.equal(formulaRisk('hello'),false);});

test('headerless detects maximum column width across rows',()=>{const p=parseCSV('one\ntwo,three');assert.equal(sourceColumns(p,false).length,2);});
test('year 0001 is accepted as an ISO calendar date',()=>{const r=transform(parseCSV('date\n0001-01-01'),normalizeSchema({fields:[{name:'date',type:'date',required:true}]}),{date:0});assert.equal(r.ok.length,1);});