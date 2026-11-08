const {navigate}=require('./ui-helpers.cjs');
// Regression for the three draft-protection defects found by the independent
// v0.4.1 audit (F1/F2/F3), plus the isolation rules they imply.
// Run: PLAYWRIGHT_MODULE=... PLAYWRIGHT_BROWSERS_PATH=... node tests/draft-regression.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),url=process.env.RAT_TEST_ORIGIN||'file://'+path.join(root,'index.html');
const result={tests:[],errors:[],externalRequests:[]};
async function main(){
 const b=await chromium.launch({headless:true});
 async function fresh(){
  const c=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true});
  const p=await c.newPage();
  p.on('pageerror',e=>result.errors.push(e.message));
  p.on('request',r=>{if(/^https?:/.test(r.url())&&(!url.startsWith('http')||new URL(r.url()).origin!==new URL(url).origin))result.externalRequests.push(r.url())});
  p.on('dialog',d=>d.accept());
  await p.goto(url);return {c,p};
 }
 async function test(name,f){await f();result.tests.push(name);console.log('PASS '+name)}
 async function importPlans(p,ids){
  const data=await p.evaluate('defaultData()');
  data.coach.experiments=ids.map(id=>({kind:'real',id,status:'planned',date:'2026-11-08',at:'2026-11-08T04:00:00Z',context:'合成计划 '+id,prediction:'合成预测',action:'合成动作',before:null}));
  await navigate(p,'settings');
  await p.locator('#importFile').setInputFiles({name:'synthetic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
  await p.waitForFunction(()=>document.getElementById('importStatus').textContent.length>0);
  return p.textContent('#importStatus');
 }

 await test('same card reopens with its draft; another card stays empty',async()=>{
  const {c,p}=await fresh();const mark='同卡草稿-未提交';
  await navigate(p,'bank');await p.click('[data-start=RA-001]');await p.fill('#reply',mark);
  await p.reload();
  assert.equal(await p.evaluate('sessionStorage.getItem(UNSAVED_KEY)').then(v=>v.includes(mark)),true);
  await navigate(p,'bank');
  assert.match(await p.locator('#root').innerText(),/有未提交草稿/);
  await p.click('[data-start=RA-001]');
  assert.equal(await p.inputValue('#reply'),mark);
  assert.equal(await p.locator('#commitSingle').isDisabled(),false);
  await navigate(p,'bank');await p.click('[data-start=RA-002]');
  assert.equal(await p.inputValue('#reply'),'');
  await c.close();
 });

 await test('saving the card clears only that card draft',async()=>{
  const {c,p}=await fresh();
  await p.evaluate("start('single',['RA-001'])");await p.fill('#reply','将被保存的原话');
  await p.click('#commitSingle');await p.click('[data-choice=other]');await p.click('[data-rate=good]');
  assert.equal(await p.evaluate("JSON.stringify(unsavedBuffer)"),'[]');
  await navigate(p,'bank');await p.click('[data-start=RA-001]');
  assert.equal(await p.inputValue('#reply'),'');
  await c.close();
 });

 await test('same dialogue scenario reopens with its draft after reload',async()=>{
  const {c,p}=await fresh();const mark='多轮同情境-未提交';
  await navigate(p,'dialogue');await p.click('[data-scene=DL-01]');await p.fill('#dialogueOwn',mark);
  await p.reload();
  await navigate(p,'dialogue');
  assert.match(await p.locator('#root').innerText(),/已保留未完成的多轮模拟/);
  await p.click('[data-scene=DL-01]');
  assert.equal(await p.inputValue('#dialogueOwn'),mark);
  assert.equal(await p.locator('#commitReply').isDisabled(),false);
  await c.close();
 });

 await test('dialogue resumes at the same turn with earlier steps intact',async()=>{
  const {c,p}=await fresh();
  await navigate(p,'dialogue');await p.click('[data-scene=DL-02]');
  await p.fill('#dialogueOwn','第一轮合成原话');await p.click('#commitReply');
  await p.click('[data-dialogue-choice="0"]');await p.click('#dialogueNext');
  await p.fill('#dialogueOwn','第二轮未提交原话');
  await p.reload();
  await navigate(p,'dialogue');await p.click('[data-scene=DL-02]');
  assert.equal(await p.inputValue('#dialogueOwn'),'第二轮未提交原话');
  assert.match(await p.locator('#root').innerText(),/第2轮/);
  assert.equal(await p.evaluate('dialogueState.steps.length'),1);
  assert.equal(await p.evaluate('dialogueState.turn'),1);
  await c.close();
 });

 await test('finishing a dialogue clears its transient progress and draft',async()=>{
  const {c,p}=await fresh();
  await navigate(p,'dialogue');await p.click('[data-scene=DL-03]');
  for(let i=0;i<3;i++){
   await p.fill('#dialogueOwn','合成第'+(i+1)+'轮');
   await p.click('#commitReply');await p.click('[data-dialogue-choice="0"]');await p.click('#dialogueNext');
  }
  assert.equal(await p.evaluate('dialogueState.finished'),true);
  assert.equal(await p.evaluate("sessionStorage.getItem('response-autonomy-v01-dialogue-v1')"),null);
  assert.equal(await p.evaluate("JSON.stringify(unsavedBuffer)"),'[]');
  assert.equal(await p.evaluate('data.dialogueHistory.length'),1);
  await c.close();
 });

 await test('records whose ids are prefixes of one another keep their drafts apart',async()=>{
  const {c,p}=await fresh();
  assert.match(await importPlans(p,['a','a:b']),/已恢复/);
  await navigate(p,'coach');await p.click('[data-coach-tab=real]');
  await p.locator('.coach-pending summary').nth(0).click();
  await p.locator('.coach-pending summary').nth(1).click();
  await p.evaluate(()=>{
   for(const [id,v] of [['actual-a','完成a的合成观察'],['actual-a:b','SYNTHETIC-OTHER-观察']]){
    const el=document.getElementById(id);el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));
   }
  });
  await p.click('[data-observe="a"]');
  assert.equal(await p.evaluate('data.coach.experiments[0].status'),'observed');
  await p.click('[data-coach-tab=real]');await p.locator('.coach-pending summary').click();
  assert.equal(await p.evaluate("document.getElementById('actual-a:b').value"),'SYNTHETIC-OTHER-观察');
  assert.equal(await p.evaluate("document.getElementById('real-a:b-noticed').value"),'unknown');
  await c.close();
 });

 await test('prefix isolation also holds when the longer id is saved first',async()=>{
  const {c,p}=await fresh();
  await importPlans(p,['a','a:b']);
  await navigate(p,'coach');await p.click('[data-coach-tab=real]');
  await p.locator('.coach-pending summary').nth(0).click();
  await p.locator('.coach-pending summary').nth(1).click();
  await p.evaluate(()=>{
   for(const [id,v] of [['actual-a','a的未提交草稿'],['actual-a:b','先保存a:b']]){
    const el=document.getElementById(id);el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));
   }
  });
  await p.click('[data-observe="a:b"]');
  await p.click('[data-coach-tab=real]');await p.locator('.coach-pending summary').click();
  assert.equal(await p.evaluate("document.getElementById('actual-a').value"),'a的未提交草稿');
  await c.close();
 });

 await test('first import into a blank browser reports no snapshot instead of claiming one',async()=>{
  const {c,p}=await fresh();
  const status=await importPlans(p,[]);
  assert.equal(await p.evaluate("localStorage.getItem(STORE+'-before-import')"),null);
  assert.equal(status.includes('快照已保留'),false);
  assert.match(status,/没有生成导入前快照/);
  await c.close();
 });

 await test('import over an existing record still keeps the exact snapshot',async()=>{
  const {c,p}=await fresh();
  await p.evaluate("data.settings.newPerDay=8;save()");
  const before=await p.evaluate('localStorage.getItem(STORE)');
  const status=await importPlans(p,[]);
  assert.match(status,/导入前快照已保留/);
  assert.equal(await p.evaluate("localStorage.getItem(STORE+'-before-import')"),before);
  await c.close();
 });

 await test('clearing transient drafts drops every group without touching the record',async()=>{
  const {c,p}=await fresh();
  await p.evaluate("data.settings.newPerDay=3;save()");
  const record=await p.evaluate('localStorage.getItem(STORE)');
  await navigate(p,'coach');await p.click('[data-coach-tab=real]');
  await p.fill('#realContext','待清除草稿');
  await p.locator('#unsavedNotice summary').click();await p.click('#unsavedClear');
  assert.equal(await p.evaluate('sessionStorage.getItem(UNSAVED_KEY)'),null);
  assert.equal(await p.evaluate('localStorage.getItem(STORE)'),record);
  assert.equal(await p.inputValue('#realContext'),'待清除草稿');
  await c.close();
 });

 await test('no page errors and no external requests',async()=>{
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.externalRequests,[]);
 });

 await b.close();
 fs.writeFileSync(path.join(root,'tests/draft-regression-results.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({passed:result.tests.length,errors:result.errors,externalRequests:result.externalRequests}));
}
main().catch(e=>{console.error(e);process.exit(1)});
