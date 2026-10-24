"""Optional browser smoke suite. Requires Python Playwright + Chromium."""
from pathlib import Path
import subprocess, os, time, urllib.request, socket
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parents[1]
sock=socket.socket();sock.bind(('127.0.0.1',0));port=sock.getsockname()[1];sock.close()
server=subprocess.Popen(['node','serve.mjs'],cwd=root,env={**os.environ,'AGENTRIX_PORT':str(port)},stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
url=f'http://127.0.0.1:{port}/'
for _ in range(100):
 try: urllib.request.urlopen(url,timeout=0.2).close();break
 except Exception: time.sleep(0.05)
else: raise RuntimeError('Local server startup failed')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height,name in [(1440,1000,'desktop'),(390,844,'mobile')]:
  ctx=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True)
  page=ctx.new_page();requests=[];errors=[]
  page.on('request',lambda r: requests.append(r.url))
  page.on('pageerror',lambda e: errors.append(str(e)))
  page.goto("about:blank")
  page.set_content((root/"index.html").read_text(encoding="utf-8"),wait_until="load")
  page.locator('#demoBtn').click()
  expect(page.locator('#fileMeta')).to_contain_text('5 data rows'),page.locator('#fileMeta').inner_text()
  assert page.locator('#mappingTable select').count()==5
  page.locator('#validateBtn').click()
  assert page.locator('.metric').nth(0).locator('b').inner_text()=='5'
  assert page.locator('.metric').nth(1).locator('b').inner_text()=='2'
  assert page.locator('.metric').nth(2).locator('b').inner_text()=='3'
  assert page.locator('#exportClean').is_enabled() and page.locator('#exportErrors').is_enabled()
  with page.expect_download() as d: page.locator('#exportClean').click()
  download=d.value;assert download.suggested_filename=='agentrix-clean.csv'
  data=download.path().read_text(encoding='utf-8-sig')
  assert 'alex@example.com' in data and 'invalid-email' not in data
  with page.expect_download() as d: page.locator('#exportErrors').click()
  data=d.value.path().read_text(encoding='utf-8-sig')
  assert 'Invalid email' in data and 'Invalid number' in data and 'Invalid calendar date' in data
  # Screenshots optional; no binary outputs required for CI.

  page.locator('#schemaInput').set_input_files(str(root/'examples'/'contacts-schema.json'))
  assert page.locator('#schemaName').inner_text()=='CRM contacts'
  page.locator('#fileInput').set_input_files(str(root/'examples'/'contacts-demo.csv'))
  expect(page.locator('#fileMeta')).to_contain_text('5 data rows')
  page.locator('#hasHeader').uncheck()
  expect(page.locator('#fileMeta')).to_contain_text('6 data rows')
  page.locator('#hasHeader').check()
  page.locator('#delimiter').select_option(',')
  page.locator('#validateBtn').click()
  assert page.locator('.metric').nth(1).locator('b').inner_text()=='2'
  # User-controlled CSV strings must never execute as HTML or scripts.
  page.locator('#fileInput').set_input_files({'name':'untrusted.csv','mimeType':'text/csv','buffer':b'Full name,Email,Company,Deal value,Joined on\n"<img src=x onerror=alert(1)>",safe@example.com,=1+1,5,2026-10-12'})
  page.locator('#validateBtn').click()
  assert page.locator('.metric').nth(1).locator('b').inner_text()=='1'
  with page.expect_download() as d: page.locator('#exportClean').click()
  assert "'=1+1" in d.value.path().read_text(encoding='utf-8-sig')
  # Rejected replacement files must clear previous results and disable CSV exports.
  page.locator('#fileInput').set_input_files({'name':'payload.exe','mimeType':'application/octet-stream','buffer':b'bad'})
  assert page.locator('#validateBtn').is_disabled()
  assert page.locator('#exportClean').is_disabled() and page.locator('#exportErrors').is_disabled()
  assert page.locator('#fileMeta').is_hidden()
  assert page.locator('#sourceBadge').inner_text()=='NO FILE'
  page.locator('#demoBtn').click();page.locator('#validateBtn').click()
  assert page.locator('#exportClean').is_enabled()
  page.locator('#fileInput').set_input_files({'name':'oversize.csv','mimeType':'text/csv','buffer':b'x'*(5*1024*1024+1)})
  assert page.locator('#validateBtn').is_disabled()
  assert page.locator('#exportClean').is_disabled() and page.locator('#exportErrors').is_disabled()
  assert not errors,errors
  assert not any(u.startswith("http://") or u.startswith("https://") for u in requests),requests
  if name=='mobile':
   assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1'), 'Mobile horizontal overflow'
  print(f'PASS {name}: demo, mapping, validation, exports, zero network requests, no JS errors')
  ctx.close()
 browser.close()

server.terminate();server.wait(timeout=5)