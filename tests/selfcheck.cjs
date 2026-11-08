const {navigate}=require('./ui-helpers.cjs');
// A+B minimal: three-tap self-check after rating, counters without scores,
// and a tendency only after 8 self-checked records.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),url=process.env.RAT_TEST_ORIGIN||'file://'+path.join(root,'index.html');
const result={tests:[],errors:[]};
async function main(){
 const b=await chromium.launch({headless:true});
 async function fresh(){
  const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
  p.on('pageerror',e=>result.errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(url);return {c,p};
 }
 async function test(name,f){await f();result.tests.push(name);console.log('PASS '+name)}
 async function answer(p,self){
  await p.evaluate("start('single',['RA-001'])");await p.fill('#reply','合成自评原话');
  await p.click('#commitSingle');await p.click('[data-choice="0"]');await p.locator('.optional-review > summary').click();
  if(self)for(const [k,v] of Object.entries(self))await p.click(`[data-self="${k}:${v}"]`);
  await p.click('[data-rate="good"]');
 }

 await test('rate step offers nine one-tap options in three groups',async()=>{
  const {c,p}=await fresh();
  await p.evaluate("start('single',['RA-001'])");await p.fill('#reply','合成原话');
  await p.click('#commitSingle');await p.click('[data-choice="0"]');await p.locator('.optional-review > summary').click();
  assert.equal(await p.locator('[data-self]').count(),9);
  assert.equal(await p.locator('.selfrow').count(),3);
  await c.close();
 });

 await test('selected self-checks are stored and unselected keys are omitted',async()=>{
  const {c,p}=await fresh();
  await answer(p,{fact:'guess',length:'long'});
  const self=await p.evaluate('data.history[0].self');
  assert.deepEqual(self,{fact:'guess',length:'long'});
  await c.close();
 });

 await test('tapping the same option again clears that dimension',async()=>{
  const {c,p}=await fresh();
  await p.evaluate("start('single',['RA-001'])");await p.fill('#reply','合成原话');
  await p.click('#commitSingle');await p.click('[data-choice="0"]');await p.locator('.optional-review > summary').click();
  await p.click('[data-self="fact:guess"]');
  assert.equal(await p.getAttribute('[data-self="fact:guess"]','aria-pressed'),'true');
  await p.click('[data-self="fact:guess"]');
  assert.equal(await p.getAttribute('[data-self="fact:guess"]','aria-pressed'),'false');
  await p.click('[data-rate="good"]');
  assert.equal(await p.evaluate('data.history[0].self===undefined'),true);
  await c.close();
 });

 await test('export and re-import keep the self-check fields',async()=>{
  const {c,p}=await fresh();
  await answer(p,{fact:'fact',length:'ok',pause:'yes'});
  await p.evaluate("data.settings.newPerDay=8;save()");
  const raw=await p.evaluate('JSON.stringify(data)');
  await p.evaluate(`(()=>{const o=JSON.parse(${JSON.stringify(raw)});restoreBackup(o)})()`);
  assert.deepEqual(await p.evaluate('data.history[0].self'),{fact:'fact',length:'ok',pause:'yes'});
  await c.close();
 });

 await test('stats show raw counters but no tendency below eight samples',async()=>{
  const {c,p}=await fresh();
  await answer(p,{fact:'guess',length:'long',pause:'no'});
  await p.evaluate('setPage("stats")');
  const text=await p.locator('#root').innerText();
  assert.match(text,/自评倾向/);
  assert.match(text,/事实 0 · 推测 1/);
  assert.match(text,/样本还不够/);
  assert.equal(text.includes('观察到的倾向'),false);
  assert.equal(/已自评 1 次/.test(text),true);
  await c.close();
 });

 await test('a tendency appears once eight records exist and stays non-scoring',async()=>{
  const {c,p}=await fresh();
  await p.evaluate(`(()=>{
   for(let i=0;i<8;i++)data.history.push({id:'RA-001',date:'2026-11-08',correct:true,grade:'good',answer:'合成',self:{fact:'guess',length:'long',pause:'no'}});
   save();
  })()`);
  await p.evaluate('setPage("stats")');
  const text=await p.locator('#root').innerText();
  assert.match(text,/已自评 8 次/);
  assert.match(text,/观察到的倾向：推测多于事实/);
  assert.match(text,/单元 6/);
  assert.equal(/%/.test(text.split('自评倾向')[1].split('最近练习')[0]),false);
  await c.close();
 });

 await test('no page errors in the self-check runs',async()=>{
  assert.deepEqual(result.errors,[]);
 });

 await b.close();
 fs.writeFileSync(path.join(root,'tests/selfcheck-results.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({passed:result.tests.length,errors:result.errors}));
}
main().catch(e=>{console.error(e);process.exit(1)});
