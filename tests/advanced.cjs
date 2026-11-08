// P1 skip-classification, P2 mechanism recognition, P4 AI entry point.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),url='file://'+path.join(root,'index.html');
const result={tests:[],errors:[],externalRequests:[]};
async function main(){
 const b=await chromium.launch({headless:true});
 async function fresh(){
  const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
  p.on('pageerror',e=>result.errors.push(e.message));
  p.on('request',r=>{if(/^https?:/.test(r.url()))result.externalRequests.push(r.url())});
  p.on('dialog',d=>d.accept());
  await p.goto(url);return {c,p};
 }
 async function test(name,f){await f();result.tests.push(name);console.log('PASS '+name)}
 async function toRate(p,id='RA-054',skip=true){
  await p.evaluate(`start('single',['${id}'])`);
  await p.fill('#reply','合成原话：我需要先确认授权范围。');
  await p.click('#commitSingle');
  if(skip)await p.click('[data-choice=skip]');else await p.click('[data-choice="0"]');
 }

 await test('advanced pack is present with one mechanism each',async()=>{
  const {c,p}=await fresh();
  const n=await p.evaluate('CARDS.filter(c=>c.level==="advanced").length');
  assert.equal(n,20);
  assert.equal(await p.evaluate('CARDS.length'),73);
  assert.equal(await p.evaluate('CARDS.filter(c=>c.level==="advanced"&&!c.mechanism).length'),0);
  await c.close();
 });

 await test('classification can be skipped and still shows the rationale',async()=>{
  const {c,p}=await fresh();
  await p.evaluate("start('single',['RA-054'])");await p.fill('#reply','合成原话');
  await p.click('#commitSingle');
  assert.equal(await p.locator('[data-choice]').count(),6);
  await p.click('[data-choice=skip]');
  const text=await p.locator('#root').innerText();
  assert.match(text,/已跳过分类/);
  assert.match(text,/结构要点/);
  assert.match(text,/查看一种示范表达/);
  await p.click('[data-rate=good]');
  assert.equal(await p.evaluate('data.history[0].selected'),'skip');
  assert.equal(await p.evaluate('data.history[0].correct'),null);
  await c.close();
 });

 await test('mechanism question marks a correct recognition',async()=>{
  const {c,p}=await fresh();
  await toRate(p);
  assert.equal(await p.locator('[data-mech]').count(),4);
  await p.click('[data-mech=authority]');
  assert.match(await p.locator('#mechResult').textContent(),/识别正确/);
  await p.click('[data-rate=good]');
  assert.equal(await p.evaluate('data.history[0].mech'),'authority');
  assert.equal(await p.evaluate('data.history[0].mechOk'),true);
  await c.close();
 });

 await test('a wrong mechanism reveals the real one without blocking the rating',async()=>{
  const {c,p}=await fresh();
  await toRate(p);
  await p.click('[data-mech=urgency]');
  assert.match(await p.locator('#mechResult').textContent(),/这次是「权威借力」/);
  assert.equal(await p.locator('[data-rate=good]').isDisabled(),false);
  await p.click('[data-rate=good]');
  assert.equal(await p.evaluate('data.history[0].mechOk'),false);
  await c.close();
 });

 await test('classic cards have no mechanism block but still offer the AI entry',async()=>{
  const {c,p}=await fresh();
  await toRate(p,'RA-001',false);
  assert.equal(await p.locator('[data-mech]').count(),0);
  assert.equal(await p.locator('#aiAnalyze').count(),1);
  assert.deepEqual(result.externalRequests,[],'AI must not auto-load the SDK');
  await c.close();
 });

 await test('no page errors in the advanced runs',async()=>{assert.deepEqual(result.errors,[])});

 await b.close();
 fs.writeFileSync(path.join(root,'tests/advanced-results.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({passed:result.tests.length,errors:result.errors}));
}
main().catch(e=>{console.error(e);process.exit(1)});
