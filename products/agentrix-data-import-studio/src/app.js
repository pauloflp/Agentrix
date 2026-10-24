// UI controller. All user-provided values are rendered with textContent, never innerHTML.
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const DEMO='Full name,Email,Company,Deal value,Joined on\r\n"Alex Rivera",alex@example.com,"Northwind, Inc.",2500.00,2026-10-10\r\n"Jordan Kim",jordan@example.com,Atlas Studio,750,2026-10-11\r\n"Taylor Moss",invalid-email,Evergreen Labs,320,2026-10-12\r\n"Morgan Lee",morgan@example.com,Field Works,not-a-number,2026-10-13\r\n"Riley Stone",riley@example.com,Beacon Agency,1100,2026-02-30\r\n';
let schema={name:'CRM contacts',fields:[{name:'full_name',label:'Full name',type:'string',required:true},{name:'email',label:'Email',type:'email',required:true},{name:'company',label:'Company',type:'string',required:false},{name:'deal_value',label:'Deal value',type:'number',required:false},{name:'joined_on',label:'Joined on',type:'date',required:false}]};
let text='',parsed=[],fields=normalizeSchema(schema),columns=[],mapping={},result=null,filename='';
function toast(message,error=false){const el=$('toast');el.textContent=message;el.classList.toggle('error',error);el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,6000);}
function setBadge(id,value,state='muted'){const el=$(id);el.textContent=value;el.className=`status ${state}`;}
function element(tag,content,cls){const el=document.createElement(tag);if(content!==undefined)el.textContent=content;if(cls)el.className=cls;return el;}
function showTable(container,headers,rows){container.replaceChildren();const table=element('table');const thead=element('thead'),tr=element('tr');for(const h of headers)tr.append(element('th',h));thead.append(tr);table.append(thead);const body=element('tbody');for(const row of rows){const r=element('tr');for(const v of row)r.append(element('td',String(v??'')));body.append(r);}table.append(body);container.append(table);container.hidden=false;}
function updateSource(){
 if(!text){return;}
 try{
  const mode=$('delimiter').value;const delimiter=mode==='auto'?detectDelimiter(text):mode==='tab'?'\t':mode;
  parsed=parseCSV(text,delimiter);const header=$('hasHeader').checked;
  if(parsed.length-(header?1:0)>LIMITS.rows)throw new Error('More than 20,000 data rows');
  if(!parsed.length)throw new Error('CSV is empty');
  columns=sourceColumns(parsed,header);
  if(!columns.length)throw new Error('No columns detected');
  mapping=autoMap(columns,fields);result=null;
  $('fileMeta').hidden=false;$('fileMeta').textContent=`${filename}  ·  ${parsed.length-(header?1:0)} data rows  ·  ${columns.length} columns  ·  ${delimiter==='\t'?'tab':delimiter} delimiter`;
  setBadge('sourceBadge','FILE LOADED','good');setBadge('mapBadge',`${fields.length} FIELDS`,'good');setBadge('resultBadge','NOT RUN');
  const previews=parsed.slice(header?1:0,(header?1:0)+4).map(row=>columns.map(c=>row.values[c.index]??''));
  showTable($('sourcePreview'),columns.map(c=>c.label),previews);
  drawMapping();resetReport();$('validateBtn').disabled=false;
 }catch(err){parsed=[];columns=[];result=null;setBadge('sourceBadge','INVALID CSV','bad');setBadge('mapBadge','NO SOURCE');$('fileMeta').hidden=true;$('sourcePreview').hidden=true;$('mappingTable').replaceChildren(element('p','Unable to parse this CSV. Try a different delimiter or check quotes.','empty'));$('validateBtn').disabled=true;resetReport();toast(err.message,true);}
}
function drawMapping(){const root=$('mappingTable');root.replaceChildren();const header=element('div',undefined,'mapping-head');header.append(element('span','DESTINATION FIELD'),element('span','SOURCE COLUMN'));root.append(header);
 for(const f of fields){const item=element('div',undefined,'mapping-item'),label=element('div');label.append(element('strong',f.label));label.append(element('small',f.type));if(f.required)label.append(element('small','REQUIRED','required'));
 const select=element('select');select.setAttribute('aria-label',`Source column for ${f.label}`);const empty=element('option','— Not mapped —');empty.value='';select.append(empty);
 for(const c of columns){const opt=element('option',`${c.label} · column ${c.index+1}`);opt.value=String(c.index);select.append(opt);}
 select.value=mapping[f.name]===null||mapping[f.name]===undefined?'':String(mapping[f.name]);select.addEventListener('change',()=>{mapping[f.name]=select.value===''?null:Number(select.value);resetReport();});item.append(label,select);root.append(item);
 }}
function resetReport(){result=null;setBadge('resultBadge','NOT RUN');const report=$('report');report.className='report-empty';report.replaceChildren(element('span','◎'),element('strong','No report yet'),element('p','Map your columns and run validation to see the results.'));$('exportClean').disabled=true;$('exportErrors').disabled=true;}
function validate(){if(!parsed.length)return;result=transform(parsed,fields,mapping,{header:$('hasHeader').checked});const root=$('report');root.className='';root.replaceChildren();const stats=element('div',undefined,'report-stats');for(const [name,count,cls] of [['TOTAL ROWS',result.total,''],['VALID ROWS',result.ok.length,'ok'],['ISSUES',result.errors.length,'error']]){const metric=element('div',undefined,`metric ${cls}`);metric.append(element('b',String(count)),element('small',name));stats.append(metric);}root.append(stats);
 root.append(element('p',result.errors.length?'Review the first issues below. Invalid rows are excluded from the clean export.':'All processed rows passed the selected schema rules.','result-message'));
 if(result.errors.length){const list=element('div',undefined,'error-list');for(const error of result.errors.slice(0,30)){const r=element('div',undefined,'error-row');r.append(element('b',`CSV line ${error.line} · `),document.createTextNode(error.issues.join(' | ')));list.append(r);}root.append(list);if(result.errors.length>30)root.append(element('p',`Showing first 30 of ${result.errors.length} errors. Download full report.`,'result-message'));}
 if(result.ok.length){const container=element('div',undefined,'table-wrap');showTable(container,fields.map(f=>f.label),result.ok.slice(0,5).map(r=>fields.map(f=>r[f.name])));root.append(container);}
 setBadge('resultBadge',result.errors.length?'REVIEW ISSUES':'ALL VALID',result.errors.length?'bad':'good');$('exportClean').disabled=!result.ok.length;$('exportErrors').disabled=!result.errors.length;toast(`Validated ${result.total} rows locally.`);
}
function download(name,csv){const blob=new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const link=element('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
// Never leave a previous file's validation/export visible after a rejected replacement.
function clearLoadedSource(){
 text='';filename='';parsed=[];columns=[];mapping={};result=null;
 $('fileMeta').hidden=true;$('fileMeta').textContent='';
 $('sourcePreview').hidden=true;$('sourcePreview').replaceChildren();
 $('mappingTable').replaceChildren(element('p','Load a CSV to map columns.','empty'));
 $('validateBtn').disabled=true;
 setBadge('sourceBadge','NO FILE');setBadge('mapBadge','NO SOURCE');
 resetReport();
}
async function readFile(file){
 if(!file)return;
 clearLoadedSource();
 if(file.size>LIMITS.bytes){toast('File exceeds 5 MiB. Please split the CSV.',true);return;}
 if(!/\.(csv|txt)$/i.test(file.name)&&!['text/csv','text/plain','application/vnd.ms-excel'].includes(file.type)){toast('Choose a CSV or plain text file.',true);return;}
 try{text=await file.text();filename=file.name;updateSource();}
 catch(err){clearLoadedSource();toast(`Could not read file: ${err.message}`,true);}
}
$('fileInput').addEventListener('change',e=>readFile(e.target.files[0]));$('chooseBtn').addEventListener('click',e=>{e.stopPropagation();$('fileInput').click();});$('dropzone').addEventListener('click',e=>{if(e.target.closest('button'))return;$('fileInput').click();});$('dropzone').addEventListener('keydown',e=>{if(e.target===$('dropzone')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();$('fileInput').click();}});
$('demoBtn').addEventListener('click',e=>{e.stopPropagation();text=DEMO;filename='contacts-demo.csv (synthetic)';$('delimiter').value='auto';$('hasHeader').checked=true;updateSource();});
for(const event of ['dragenter','dragover'])$('dropzone').addEventListener(event,e=>{e.preventDefault();$('dropzone').classList.add('drag');});
for(const event of ['dragleave','drop'])$('dropzone').addEventListener(event,e=>{e.preventDefault();$('dropzone').classList.remove('drag');});
$('dropzone').addEventListener('drop',e=>readFile(e.dataTransfer.files[0]));$('delimiter').addEventListener('change',updateSource);$('hasHeader').addEventListener('change',updateSource);
$('schemaInput').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(file.size>100*1024){toast('Schema exceeds 100 KiB.',true);return;}try{const s=JSON.parse(await file.text());const f=normalizeSchema(s);schema=s;fields=f;$('schemaName').textContent=s.name||file.name;const small=$('schemaName').nextElementSibling;small.textContent=`${fields.length} typed fields · custom JSON schema`;if(parsed.length){mapping=autoMap(columns,fields);drawMapping();resetReport();setBadge('mapBadge',`${fields.length} FIELDS`,'good');}toast('Custom schema loaded.');}catch(err){toast(`Invalid schema: ${err.message}`,true);}});
$('validateBtn').addEventListener('click',validate);$('exportClean').addEventListener('click',()=>{if(result?.ok.length)download('agentrix-clean.csv',serializeCSV(result.ok,fields.map(f=>f.name)));});$('exportErrors').addEventListener('click',()=>{if(result?.errors.length)download('agentrix-errors.csv',errorsCSV(result.errors));});
})();