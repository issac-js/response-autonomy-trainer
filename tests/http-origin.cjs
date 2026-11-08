// Verify the single-file app under an http(s) origin, not just file://.
// Cloud hosting changes localStorage/sessionStorage origins and secure-context
// behaviour, so this suite is the gate before publishing.
// Run: PLAYWRIGHT_MODULE=... PLAYWRIGHT_BROWSERS_PATH=... node tests/http-origin.cjs
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'));
const result={tests:[],errors:[],externalRequests:[]};
async function main(){
 const server=http.createServer((req,res)=>{
  if(req.url==='/'||req.url==='/index.html'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','content-length':html.length});res.end(html)}
  else{res.writeHead(404,{'content-type':'text/plain'});res.end('not found')}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port+'/';
 const b=await chromium.launch({headless:true});
 async function fresh(){
  const p=await b.newPage({viewport:{width:390,height:844}});
  p.on('pageerror',e=>result.errors.push(e.message));
  p.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))result.externalRequests.push(r.url())});
  p.on('dialog',d=>d.accept());
  await p.goto(base);return p;
 }
 async function test(name,f){await f();result.tests.push(name);console.log('PASS '+name)}
 const p=await fresh();

 await test('http origin serves the self-contained app with both storages available',async()=>{
  assert.match(await p.title(),/v0\.7\.0/);
  assert.equal(await p.evaluate('APP_VERSION'),'0.7.0');
  assert.equal(await p.evaluate("(()=>{try{localStorage.setItem('__probe','1');sessionStorage.setItem('__probe','1');localStorage.removeItem('__probe');sessionStorage.removeItem('__probe');return true}catch(e){return false}})()"),true);
  assert.equal(await p.evaluate('typeof crypto.randomUUID'),'function');
 });

 await test('recall, FSRS and the daily counter persist across an http reload',async()=>{
  await p.click('#daily');
  await p.fill('#reply','合成 HTTP 单轮回答');await p.click('#commitSingle');
  await p.click('[data-choice=other]');await p.fill('#reflection','合成复盘');await p.click('[data-rate=good]');
  const due=await p.evaluate("data.cards['RA-001'].fsrs.due");
  assert.ok(due);
  await p.reload();
  assert.equal(await p.evaluate("data.cards['RA-001'].fsrs.due"),due);
  assert.equal(await p.evaluate('data.history.length'),1);
 });

 await test('coach simulation, real plan and observation survive an http reload',async()=>{
  await p.click('[data-nav=coach]');await p.click('[data-coach-tab=practice]');
  await p.fill('#coachPrediction','合成 HTTP 预测');await p.click('#coachStart');
  for(let i=0;i<3;i++){
   await p.fill('#coachOwn','合成 HTTP 第'+(i+1)+'轮原话');
   await p.fill('#coachUrge','合成追加冲动');
   await p.click('#coachCommit');
   await p.click('[data-coach-action=fact]');
  }
  await p.selectOption('#coachAfter','7');await p.fill('#coachLearning','合成 HTTP 复盘');
  await p.click('#coachFinish');
  assert.equal(await p.evaluate('data.coach.runs.length'),1);
  await p.click('[data-coach-tab=real]');
  await p.fill('#realContext','合成 HTTP 情境');await p.fill('#realPrediction','合成 HTTP 担心');await p.fill('#realAction','合成 HTTP 动作');
  await p.click('#realPlan');
  await p.reload();
  assert.equal(await p.evaluate('data.coach.runs.length'),1);
  assert.equal(await p.evaluate('data.coach.experiments[0].status'),'planned');
 });

 await test('unsaved form protection works under http (sessionStorage per origin)',async()=>{
  await p.click('[data-nav=coach]');await p.click('[data-coach-tab=real]');
  await p.fill('#realContext','HTTP 未保存文本');
  await p.reload();await p.click('[data-nav=coach]');await p.click('[data-coach-tab=real]');
  assert.equal(await p.locator('#realContext').inputValue(),'HTTP 未保存文本');
  assert.equal(await p.evaluate('data.coach.experiments.length'),1);
  assert.equal(await p.locator('#unsavedNotice').isVisible(),true);
  await p.click('#unsavedClear');
  assert.equal(await p.evaluate("sessionStorage.getItem(UNSAVED_KEY)"),null);
 });

 await test('export and import round-trip under http',async()=>{
  const expected=await p.evaluate('JSON.stringify({cards:data.cards,history:data.history,coach:data.coach})');
  await p.evaluate("data.settings.newPerDay=8;save()");
  const dl=p.waitForEvent('download');await p.click('[data-nav=settings]');await p.click('#export');
  const tmp=path.join(root,'tests/.http-roundtrip.json');await (await dl).saveAs(tmp);
  const obj=JSON.parse(fs.readFileSync(tmp,'utf8'));
  await p.locator('#importFile').setInputFiles(tmp);
  await p.waitForFunction(()=>document.getElementById('importStatus').textContent.includes('已恢复'));
  assert.equal(await p.evaluate('JSON.stringify({cards:data.cards,history:data.history,coach:data.coach})'),expected);
  fs.unlinkSync(tmp);
 });

 await test('320px layout has no horizontal overflow under http',async()=>{
  await p.setViewportSize({width:320,height:844});
  for(const name of ['home','bank','coach','dialogue','stats','settings']){
   await p.evaluate(n=>{dialogueState=null;setPage(n)},name);
   assert.ok(await p.evaluate('document.documentElement.scrollWidth<=innerWidth'),name);
  }
 });

 await test('no page errors and no external requests from the http build',async()=>{
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.externalRequests,[]);
 });

 await p.close();await b.close();await new Promise(r=>server.close(r));
 fs.writeFileSync(path.join(root,'tests/http-origin-results.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({passed:result.tests.length,errors:result.errors,externalRequests:result.externalRequests}));
}
main().catch(e=>{console.error(e);process.exit(1)});
