import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
const host='127.0.0.1';
const port=Number(process.env.AGENTRIX_PORT||4177);
if(!Number.isSafeInteger(port)||port<0||port>65535)throw Error('AGENTRIX_PORT must be 0..65535');
const file=new URL('./index.html', import.meta.url);
const server=createServer(async(req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
  const url=new URL(req.url||'/',`http://${host}`);
  if(!['/','/index.html','/favicon.ico'].includes(url.pathname)){res.writeHead(404).end();return;}
  if(url.pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  try{const data=await readFile(file);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'",'Content-Length':String(data.length)}); if(req.method==='HEAD')res.end();else res.end(data);}
  catch(err){res.writeHead(500).end('Local HTML not available');}
});
server.listen(port,host,()=>console.log(`Agentrix Data Import Studio (local only): http://${host}:${server.address().port}/`));