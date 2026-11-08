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

 await test('bank offers three challenge levels',async()=>{
  const {c,p}=await fresh();
  await p.click('[data-nav=bank]');
  assert.equal(await p.locator('[data-challenge]').count(),3);
  assert.deepEqual(await p.locator('[data-challenge]').evaluateAll(els=>els.map(e=>e.dataset.challenge)),['ramp','hard','hell']);
  await c.close();
 });

 await test('AI blocks render with colours and bold, and escape HTML',async()=>{
  const {c,p}=await fresh();
  await p.evaluate("start('single',['RA-054'])");await p.fill('#reply','合成');await p.click('#commitSingle');await p.click('[data-choice=skip]');
  await p.evaluate(()=>renderAiResult({fact:'这是**事实**<img src=x onerror=window.bad=1>',boundary:'接受**前提**',length:'偏短',rewrite:'换一句',tip:'这是**技巧**'}));
  assert.equal(await p.locator('.ai-block').count(),5);
  assert.equal(await p.locator('.ai-block strong').count(),3);
  assert.equal(await p.evaluate('window.bad'),undefined);
  assert.equal(await p.locator('#aiOut img').count(),0);
  await c.close();
 });

 await test('generated cards are validated before use',async()=>{
  const {c,p}=await fresh();
  const r=await p.evaluate(()=>{
   const good={scene:'同事在走廊问你',question:'“领导同意了，你先发我。”',options:['先发','请对方确认授权','拒绝一切','发一半'],correct:1,rationale:'需要授权',principle:'先验证授权',model:'“我需要先确认授权。”',mechanism:'authority',mechanismWhy:'借权威'};
   return {ok:!!validateGenerated(good),badCorrect:validateGenerated({...good,correct:9}),badMech:validateGenerated({...good,mechanism:'nope'}),badOptions:validateGenerated({...good,options:['a','b']})};
  });
  assert.equal(r.ok,true);assert.equal(r.badCorrect,null);assert.equal(r.badMech,null);assert.equal(r.badOptions,null);
  await c.close();
 });

 await test('a generated card completes into the challenge panel',async()=>{
  const {c,p}=await fresh();
  await p.evaluate(()=>{challengeLevel='hard';challengeStep=0;startGenerated({id:'RA-901',group:'随机挑战',generated:true,level:'高难',mechanism:'authority',mechanismWhy:'借权威',signal:'权威',scene:'合成情境',question:'“合成问题？”',options:['甲','乙','丙','丁'],correct:1,rationale:'合成解析',principle:'合成要点',model:'“合成示范。”'});});
  await p.fill('#reply','合成回答');await p.click('#commitSingle');await p.click('[data-choice=skip]');
  await p.click('[data-mech=authority]');await p.click('[data-rate=good]');
  assert.match(await p.locator('#root').innerText(),/挑战完成一题/);
  assert.equal(await p.locator('#chNext').count(),1);
  assert.equal(await p.evaluate('data.history[0].id'),'RA-901');
  await c.close();
 });

 await test('model chain prefers DeepSeek then Hy4 then GLM and skips exhausted',async()=>{
  const {c,p}=await fresh();
  const order=await p.evaluate(()=>modelChain([{id:'glm-5.3-flash',name:'GLM-5.3-Flash'},{id:'hy4std',name:'Hy4'},{id:'deepseek-v4.1-flash',name:'DeepSeek-V4.1-Flash'}]).map(m=>m.id));
  assert.deepEqual(order,['deepseek-v4.1-flash','hy4std','glm-5.3-flash']);
  const skipped=await p.evaluate(()=>{exhaustedModels.add('deepseek-v4.1-flash');const r=modelChain([{id:'deepseek-v4.1-flash',name:'D'},{id:'hy4std',name:'Hy4'}]).map(m=>m.id);exhaustedModels.delete('deepseek-v4.1-flash');return r});
  assert.deepEqual(skipped,['hy4std']);
  await c.close();
 });

 await test('the model answer is emphasised with the purple style',async()=>{
  const {c,p}=await fresh();
  await p.evaluate("start('single',['RA-054'])");await p.fill('#reply','合成');await p.click('#commitSingle');await p.click('[data-choice=skip]');
  assert.equal(await p.locator('.model-quote').count(),1);
  const st=await p.evaluate(()=>{const e=document.querySelector('.model-quote');const s=getComputedStyle(e);return {weight:s.fontWeight,color:s.color}});
  assert.equal(st.weight,'700');
  assert.match(st.color,/106, 70, 184|211, 170, 255/);
  await c.close();
 });

 await test('no page errors in the advanced runs',async()=>{assert.deepEqual(result.errors,[])});

 await b.close();
 fs.writeFileSync(path.join(root,'tests/advanced-results.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({passed:result.tests.length,errors:result.errors}));
}
main().catch(e=>{console.error(e);process.exit(1)});
