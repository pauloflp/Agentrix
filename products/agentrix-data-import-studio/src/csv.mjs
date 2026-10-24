/** Agentrix Data Import Studio - local-only CSV processing core. No dependencies. */
export const LIMITS = Object.freeze({ bytes: 5 * 1024 * 1024, rows: 20000, columns: 80 });
const DELIMITERS = [',',';','\t'];
export function parseCSV(text, delimiter=',', {maxRows=LIMITS.rows,maxColumns=LIMITS.columns}={}) {
  if (typeof text !== 'string') throw new TypeError('CSV content must be text');
  if (!DELIMITERS.includes(delimiter)) throw new Error('Unsupported delimiter');
  if (new TextEncoder().encode(text).byteLength > LIMITS.bytes) throw new Error('CSV exceeds 5 MiB limit');
  const rows=[];let row=[],field='',quoted=false,afterQuote=false,atStart=true;
  let line=1, rowStart=1;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i], next=text[i+1];
    if(quoted){
      if(c==='"' && next==='"'){field+='"';i++;}
      else if(c==='"'){quoted=false;afterQuote=true;}
      else {field+=c;if(c==='\n')line++;else if(c==='\r'&&next!=='\n')line++;}
      continue;
    }
    if(afterQuote){
      if(c===delimiter){pushField();afterQuote=false;continue;}
      if(c==='\n'||c==='\r'){pushField();pushRow();if(c==='\r'&&next==='\n')i++;line++;rowStart=line;afterQuote=false;continue;}
      throw new Error(`Unexpected character after closing quote at line ${line}`);
    }
    if(c==='"'){
      if(field!=='')throw new Error(`Unexpected quote at line ${line}`);
      quoted=true;atStart=false;continue;
    }
    if(c===delimiter){pushField();continue;}
    if(c==='\n'||c==='\r'){
      pushField();pushRow();if(c==='\r'&&next==='\n')i++;line++;rowStart=line;continue;
    }
    field+=c;atStart=false;
  }
  if(quoted)throw new Error(`Unclosed quoted field at line ${line}`);
  if(field!==''||row.length>0||afterQuote){pushField();pushRow();}
  return rows;
  function pushField(){row.push(field);field='';atStart=true;if(row.length>maxColumns)throw new Error(`More than ${maxColumns} columns at line ${rowStart}`);}
  function pushRow(){if(rows.length>=maxRows+1)throw new Error(`More than ${maxRows} data rows`);rows.push({values:row,line:rowStart});row=[];}
}
export function detectDelimiter(text){
  const sample=text.slice(0,20000);
  const results=DELIMITERS.map(delimiter=>{
    try{
      const rows=parseCSV(sample,delimiter,{maxRows:200,maxColumns:LIMITS.columns}).slice(0,12).filter(r=>r.values.some(x=>x.trim()));
      const counts=rows.map(r=>r.values.length);
      const freq=new Map();for(const n of counts)freq.set(n,(freq.get(n)||0)+1);
      const [modal,occ]=[...freq].sort((a,b)=>b[1]-a[1])[0]||[1,0];
      return {delimiter,score:modal>1?occ*10+modal-(counts.length-occ)*8:0};
    }catch{return {delimiter,score:-1};}
  });
  return results.sort((a,b)=>b.score-a.score)[0].delimiter;
}
export function normalizeSchema(schema){
  if(!schema||!Array.isArray(schema.fields)||!schema.fields.length||schema.fields.length>LIMITS.columns)throw new Error('Schema needs 1–80 fields');
  const names=new Set();return schema.fields.map(f=>{
    if(!f||typeof f.name!=='string'||!/^[A-Za-z_][\w-]{0,63}$/.test(f.name))throw new Error('Invalid schema field name');
    if(names.has(f.name))throw new Error(`Duplicate schema field: ${f.name}`);
    names.add(f.name);
    if(!['string','email','number','date'].includes(f.type))throw new Error(`Unsupported type for ${f.name}`);
    if(f.required!==undefined&&typeof f.required!=='boolean')throw new Error(`Invalid required flag for ${f.name}`);
    return {name:f.name,type:f.type,required:!!f.required,label:typeof f.label==='string'?f.label.slice(0,100):f.name};
  });
}
export function sourceColumns(parsed,header=true){
  const first=parsed[0]?.values||[];
  const width=header?first.length:Math.max(0,...parsed.map(row=>row.values.length));
  const names=header?first.map((s,i)=>s.trim()||`Unnamed ${i+1}`):Array.from({length:width},(_,i)=>`Column ${i+1}`);
  return names.map((label,index)=>({label,index}));
}
export function autoMap(columns,fields){
  const clean=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
  return Object.fromEntries(fields.map(f=>{
    const match=columns.find(c=>clean(c.label)===clean(f.name)||clean(c.label)===clean(f.label));
    return [f.name,match?match.index:null];
  }));
}
function checkType(value,type){
  if(type==='email')return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&!/[\r\n]/.test(value)?null:'Invalid email';
  if(type==='number')return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)&&Number.isFinite(Number(value))?null:'Invalid number (use dot decimal)';
  if(type==='date'){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return 'Invalid date (expected YYYY-MM-DD)';
    const [y,m,d]=value.split('-').map(Number);const dt=new Date(0);dt.setUTCHours(0,0,0,0);dt.setUTCFullYear(y,m-1,d);
    return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d?null:'Invalid calendar date';
  }
  return null;
}
export function transform(parsed,fields,mapping,{header=true,trim=true}={}){
  const data=header?parsed.slice(1):parsed;
  const ok=[],errors=[];
  for(const row of data){
    if(row.values.every(v=>!v.trim()))continue;
    const output={},issues=[];
    for(const f of fields){
      const index=mapping[f.name];const raw=Number.isInteger(index)&&index>=0?row.values[index]:undefined;
      const value=raw===undefined?'':trim?raw.trim():raw;
      output[f.name]=value;
      if(raw===undefined){if(f.required)issues.push(`${f.name}: unmapped or missing column`);continue;}
      if(!value){if(f.required)issues.push(`${f.name}: required`);continue;}
      const issue=checkType(value,f.type);if(issue)issues.push(`${f.name}: ${issue}`);
    }
    if(issues.length)errors.push({line:row.line,values:row.values,issues});
    else ok.push(output);
  }
  return {ok,errors,total:ok.length+errors.length};
}
export function formulaRisk(value){return /^[\s\uFEFF\u200B\u200C\u200D]*[=+@\-\t\r]/u.test(String(value));}
function protect(value,protectFormulas){const v=String(value??'');return protectFormulas&&formulaRisk(v)?`'${v}`:v;}
export function serializeCSV(rows,headers,{delimiter=',',protectFormulas=true}={}){
  if(!DELIMITERS.includes(delimiter))throw new Error('Unsupported delimiter');
  const quote=v=>{v=protect(v,protectFormulas);return /["\r\n]/.test(v)||v.includes(delimiter)?`"${v.replaceAll('"','""')}"`:v;};
  return [headers.map(quote).join(delimiter),...rows.map(row=>headers.map(h=>quote(row[h])).join(delimiter))].join('\r\n')+'\r\n';
}
export function errorsCSV(errors){
  return serializeCSV(errors.map(e=>({line:e.line,issues:e.issues.join(' | '),source:JSON.stringify(e.values)})),['line','issues','source']);
}