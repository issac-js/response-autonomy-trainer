const {navigate}=require('./ui-helpers.cjs');
// v0.4.1 browser regression checks for the verified defects.
// Run: PLAYWRIGHT_MODULE=... PLAYWRIGHT_BROWSERS_PATH=... node tests/regression-browser.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),url=process.env.RAT_TEST_ORIGIN||'file://'+path.join(root,'index.html');
const STORE='response-autonomy-v01';
const result={tests:[],errors:[],externalRequests:[]};
async function main(){
 const b=await chromium.launch({headless:true});
 async function fresh(){
  const q=await b.newPage({viewport:{width:390,height:844}});
  q.on('pageerror',e=>result.errors.push(e.message));
  q.on('request',r=>{if(/^https?:/.test(r.url())&&(!url.startsWith('http')||new URL(r.url()).origin!==new URL(url).origin))result.externalRequests.push(r.url())});
  q.on('dialog',d=>{result.dialogs=result.dialogs||[];result.dialogs.push(d.type());d.accept()});
  await q.goto(url);return q;
 }
 async function test(name,f){await f();result.tests.push(name);console.log('PASS '+name)}
 async function importJSON(p,obj){
  const tmp=path.join(root,'tests/.regression-import.json');fs.writeFileSync(tmp,JSON.stringify(obj));
  await navigate(p,'settings');await p.locator('#importFile').setInputFiles(tmp);
  await p.waitForFunction(()=>document.getElementById('importStatus').textContent.length>0);
  const status=await p.locator('#importStatus').textContent();fs.unlinkSync(tmp);return status;
 }
 const MARK='ZZ-未保存标记-QQ';
 let p=await fresh();

 await test('unsaved real plan survives in-app navigation, tab switching and a full reload',async()=>{
  await navigate(p,'coach');await p.click('[data-coach-tab=real]');
  await p.fill('#realContext',MARK+'情境');await p.fill('#realPrediction',MARK+'预测');await p.fill('#realAction',MARK+'动作');
  await p.selectOption('#realBefore','4');
  await navigate(p,'home');await navigate(p,'coach');await p.click('[data-coach-tab=real]');
  assert.equal(await p.locator('#realContext').inputValue(),MARK+'情境');
  await p.reload();await navigate(p,'coach');await p.click('[data-coach-tab=real]');
  assert.equal(await p.locator('#realContext').inputValue(),MARK+'情境');
  assert.equal(await p.locator('#realPrediction').inputValue(),MARK+'预测');
  assert.equal(await p.locator('#realAction').inputValue(),MARK+'动作');
  assert.equal(await p.locator('#realBefore').inputValue(),'4');
  assert.equal(await p.locator('#unsavedNotice').isVisible(),true);
  assert.equal(await p.evaluate('data.coach.experiments.length'),0);
 });

 await test('changing the practice unit no longer wipes a half-written real plan',async()=>{
  await p.click('[data-coach-tab=practice]');await p.selectOption('#coachSession','3');
  await p.click('[data-coach-tab=real]');
  assert.equal(await p.locator('#realContext').inputValue(),MARK+'情境');
 });

 await test('unsaved form text is never written to the persistent record or JSON backup',async()=>{
  assert.equal((await p.evaluate(`localStorage.getItem('${STORE}')`)).includes(MARK),false);
  await navigate(p,'settings');
  const pending=p.waitForEvent('download');await p.click('#export');
  const tmp=path.join(root,'tests/.regression-export.json');await (await pending).saveAs(tmp);
  const text=fs.readFileSync(tmp,'utf8');fs.unlinkSync(tmp);
  assert.equal(text.includes(MARK),false);
  assert.equal(text.includes('coachReal'),false);
  assert.equal(await p.evaluate("sessionStorage.getItem(UNSAVED_KEY)!==null"),true);
 });

 await test('clear transient draft removes the buffer without rewriting visible fields',async()=>{
  await navigate(p,'coach');await p.click('[data-coach-tab=real]');
  await p.locator('#unsavedNotice summary').click();await p.click('#unsavedClear');
  assert.equal(await p.evaluate("sessionStorage.getItem(UNSAVED_KEY)"),null);
  assert.equal(await p.locator('#realContext').inputValue(),MARK+'情境');
  await navigate(p,'settings');await p.click('#export'); // export must still work
 });

 await test('coach simulation own wording and urge survive a refresh; commit still works',async()=>{
  const q=await fresh();
  await navigate(q,'coach');await q.click('[data-coach-tab=practice]');
  await q.fill('#coachPrediction','合成预测：担心冷场');await q.click('#coachStart');
  await q.fill('#coachOwn','刷新前未确认的原话');await q.fill('#coachUrge','还想多解释一段');
  await q.reload();await navigate(q,'coach');
  assert.equal(await q.locator('#coachOwn').inputValue(),'刷新前未确认的原话');
  assert.equal(await q.locator('#coachUrge').inputValue(),'还想多解释一段');
  assert.equal(await q.locator('#coachCommit').isDisabled(),false);
  await q.click('#coachCommit');
  assert.equal(await q.locator('[data-coach-action]').count(),6);
  assert.equal(await q.evaluate('data.coach.draft.ready'),true);
  assert.equal(await q.evaluate('data.coach.runs.length'),0);
  await q.close();
 });

 await test('unsaved single-card reply raises a beforeunload prompt and never leaks to another card',async()=>{
  const q=await fresh();
  result.dialogs=[];
  await q.evaluate("start('single',['RA-001'])");await q.fill('#reply','未提交的单轮原话');
  await q.reload();
  assert.ok(result.dialogs.includes('beforeunload'),'beforeunload dialog expected, got '+JSON.stringify(result.dialogs));
  await q.evaluate("start('single',['RA-002'])");
  assert.equal(await q.locator('#reply').inputValue(),'');
  await q.close();
 });

 await test('a crafted backup id cannot inject markup or execute script, and the observation still saves',async()=>{
  const q=await fresh();
  const obj=await q.evaluate('defaultData()');
  obj.coach.experiments=[{kind:'real',id:'a"><img src=x onerror=window.bad=1><span b="',status:'planned',date:'2026-11-08',at:'2026-11-08T04:00:00Z',context:'合成情境',prediction:'合成预测',action:'合成动作',before:null}];
  const status=await importJSON(q,obj);
  assert.match(status,/已恢复/);
  await navigate(q,'coach');await q.click('[data-coach-tab=real]');
  assert.equal(await q.evaluate('window.bad'),undefined);
  assert.equal(await q.locator('#root img').count(),0);
  assert.equal(await q.evaluate("[...document.querySelectorAll('.coach-check')].filter(e=>e.hasAttribute('onfocus')).length"),0);
  await q.locator('.coach-pending summary').click();
  const id=obj.coach.experiments[0].id;
  // Locators use CSS selectors; this id deliberately contains CSS metacharacters.
  await q.evaluate(x=>{
   const put=(elId,value)=>{const el=document.getElementById(elId);if(!el)throw Error('missing '+elId);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};
   put('actual-'+x,'对方没回复，原因未知');
   put('evidence-'+x,'uncertain');
   put('after-'+x,'6');
   put('real-'+x+'-noticed','yes');
   put('learning-'+x,'仍允许不确定');
  },id);
  await q.click('[data-observe]');
  assert.equal(await q.evaluate('data.coach.experiments[0].status'),'observed');
  assert.equal(await q.evaluate('data.coach.experiments[0].prediction'),'合成预测');
  assert.equal(await q.evaluate('data.coach.experiments[0].after'),6);
  assert.equal(await q.evaluate('coachMetrics().noticed.total'),1);
  await q.close();
 });

 await test('failed UI import leaves no stale pre-import snapshot (fresh page)',async()=>{
  const q=await fresh();
  await q.evaluate("data.settings.newPerDay=3;save()");
  const before=await q.evaluate(`localStorage.getItem('${STORE}')`);
  await q.evaluate("window.__orig=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='"+STORE+"')throw Error('synthetic quota');return window.__orig.call(this,k,v)}");
  const status=await importJSON(q,await q.evaluate('defaultData()'));
  assert.match(status,/导入失败/);
  assert.equal(await q.evaluate(`localStorage.getItem('${STORE}')`),before);
  assert.equal(await q.evaluate(`localStorage.getItem('${STORE}-before-import')`),null);
  await q.evaluate('Storage.prototype.setItem=window.__orig');
  await q.close();
 });

 await test('successful UI import still keeps an exact pre-import snapshot',async()=>{
  const q=await fresh();
  await q.evaluate("data.settings.newPerDay=8;save()");
  const before=await q.evaluate(`localStorage.getItem('${STORE}')`);
  const status=await importJSON(q,await q.evaluate('defaultData()'));
  assert.match(status,/已恢复，导入前快照已保留/);
  assert.equal(await q.evaluate(`localStorage.getItem('${STORE}-before-import')`),before);
  await q.close();
 });

 await test('v0.3 backup UI round-trip: FSRS/due/history/writes preserved, coach empty',async()=>{
  const q=await fresh();
  const v03={version:1,schemaVersion:2,appVersion:'0.3.0',revision:4,created:'2026-11-01T00:00:00Z',
   settings:{newPerDay:5,timer:false,showReason:true},
   cards:{'RA-001':{first:'2026-11-01',last:'2026-11-02',due:'2026-11-14',seen:2,correct:1,level:2}},
   history:[{id:'RA-001',date:'2026-11-02',correct:true,grade:'good',answer:'合成迁移样例',mode:'daily'}],
   writes:{'RA-001':'保留字段'},dialogueHistory:[]};
  const s1=await importJSON(q,v03);assert.match(s1,/已恢复/);
  assert.equal(await q.evaluate('data.schemaVersion'),3);
  assert.equal(await q.evaluate("data.cards['RA-001'].due"),'2026-11-14');
  const snapshot=await q.evaluate('JSON.stringify({cards:data.cards,history:data.history,writes:data.writes,dialogueHistory:data.dialogueHistory,coach:data.coach})');
  const dl=q.waitForEvent('download');await q.click('#export');
  const tmp=path.join(root,'tests/.regression-v03.json');await (await dl).saveAs(tmp);
  const exported=JSON.parse(fs.readFileSync(tmp,'utf8'));fs.unlinkSync(tmp);
  assert.equal(exported.schemaVersion,3);
  assert.deepEqual(exported.cards,v03.cards);assert.deepEqual(exported.history,v03.history);
  assert.deepEqual(exported.writes,v03.writes);assert.deepEqual(exported.coach,{triggers:['A','B','D'],session:1,draft:null,runs:[],experiments:[]});
  const s2=await importJSON(q,exported);assert.match(s2,/已恢复/);
  assert.equal(await q.evaluate('JSON.stringify({cards:data.cards,history:data.history,writes:data.writes,dialogueHistory:data.dialogueHistory,coach:data.coach})'),snapshot);
  await q.close();
 });

 await test('320/390/1440 layouts with the unsaved banner visible have no horizontal overflow',async()=>{
  const q=await fresh();
  await navigate(q,'coach');await q.click('[data-coach-tab=real]');
  await q.fill('#realContext','宽度检查 '+MARK);
  for(const width of [320,390,1440]){
   await q.setViewportSize({width,height:844});
   assert.ok(await q.evaluate('document.documentElement.scrollWidth<=innerWidth'),'width '+width);
  }
  await q.close();
 });

 await test('complete usage flow: card recall -> 3-round simulation -> real plan/observation -> review -> backup round-trip',async()=>{
  const q=await fresh();
  await q.click('#daily');
  await q.fill('#reply','合成完整流程单轮原话');await q.click('#commitSingle');
  await q.click('[data-choice=other]');await q.locator('.optional-review > summary').click();await q.fill('#reflection','先确认事实再回应');await q.click('[data-rate=good]');
  assert.equal(await q.evaluate('data.history.length'),1);
  assert.equal(await q.evaluate('data.history[0].correct'),null);
  await navigate(q,'coach');await q.click('[data-coach-tab=practice]');
  await q.selectOption('#coachSession','9');await q.fill('#coachPrediction','担心不解释会被误解');await q.click('#coachStart');
  for(let i=0;i<3;i++){
   await q.fill('#coachOwn',i===2?'按事实说明进度，两点前发你。':'合成第'+(i+1)+'轮原话');
   await q.fill('#coachUrge','想再补一句，但先看是否必要');
   await q.click('#coachCommit');
   assert.equal(await q.locator('[data-coach-action]').count(),6);
   await q.click('[data-coach-action='+(i===0?'boundary':'fact')+']');
  }
  assert.equal(await q.locator('#coachFinish').count(),1);
  await q.selectOption('#coachAfter','7');await q.fill('#coachLearning','不适升高也完成了必要说明');
  await q.selectOption('#sim-noticed','yes');await q.click('#coachFinish');
  assert.equal(await q.evaluate('data.coach.runs.length'),1);
  assert.equal(await q.evaluate('data.coach.runs[0].after'),7);
  assert.equal(await q.evaluate('data.coach.draft'),null);
  await q.click('[data-coach-tab=real]');
  await q.fill('#realContext','合成低风险闲聊');await q.fill('#realPrediction','担心冷场');await q.fill('#realAction','回应一次后不追加');
  await q.click('#realPlan');await q.locator('.coach-pending summary').click();
  const id=await q.evaluate('data.coach.experiments[0].id');
  await q.fill('#actual-'+id,'对方没有回复，原因未知');await q.selectOption('#evidence-'+id,'uncertain');
  await q.selectOption('#after-'+id,'6');await q.selectOption('#real-'+id+'-chose','yes');
  await q.click('[data-observe]');
  assert.equal(await q.evaluate('coachMetrics().chose.total'),1);
  assert.equal(await q.evaluate('data.coach.experiments[0].prediction'),'担心冷场');
  await navigate(q,'stats');
  assert.match(await q.locator('#root').innerText(),/真实行为观察/);
  assert.match(await q.locator('#root').innerText(),/最近模拟/);
  const snapshot=await q.evaluate('JSON.stringify({cards:data.cards,history:data.history,coach:data.coach})');
  await navigate(q,'settings');
  const dl=q.waitForEvent('download');await q.click('#export');
  const tmp=path.join(root,'tests/.regression-flow.json');await (await dl).saveAs(tmp);
  const obj=JSON.parse(fs.readFileSync(tmp,'utf8'));
  const status=await importJSON(q,obj);assert.match(status,/已恢复/);fs.unlinkSync(tmp);
  assert.equal(await q.evaluate('JSON.stringify({cards:data.cards,history:data.history,coach:data.coach})'),snapshot);
  await q.reload();
  assert.equal(await q.evaluate('data.coach.runs.length'),1);
  assert.equal(await q.evaluate('data.coach.experiments[0].status'),'observed');
  await q.close();
 });

 await test('beforeunload warning still works when sessionStorage is unavailable',async()=>{
  const q=await fresh();
  result.dialogs=[];
  await q.evaluate("Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new Error('denied')}})");
  await navigate(q,'coach');await q.click('[data-coach-tab=real]');
  await q.fill('#realContext','存储不可用时的未保存文本');
  await q.reload();
  assert.ok(result.dialogs.includes('beforeunload'),'expected beforeunload, got '+JSON.stringify(result.dialogs));
  assert.equal(await q.evaluate('typeof data'),'object');
  await q.close();
 });

 await test('no page script errors and no external HTTP requests across all regression checks',async()=>{
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.externalRequests,[]);
 });

 await p.close();await b.close();
 fs.writeFileSync(path.join(root,'tests/regression-browser-results.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({passed:result.tests.length,errors:result.errors,externalRequests:result.externalRequests}));
}
main().catch(e=>{console.error(e);process.exit(1)});
