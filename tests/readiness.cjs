// Isolated local regression tests. Never contacts production or invokes a model.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),outDir=process.env.RAT_RESULTS_DIR||'/tmp/rat-readiness';
const result={engine:process.env.RAT_BROWSER||'chromium',tests:[],errors:[],externalRequests:[],limitations:['Device emulation, not a physical iPhone. Cloud and model responses are isolated fixtures.']};
const allowed=new Set(['index.html','sw.js','manifest.webmanifest','vendor/workbuddy-cloud-sdk.js','assets/icon-180.png','assets/icon-512.png']);
async function main(){
 fs.mkdirSync(outDir,{recursive:true});
 const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://local').pathname.slice(1)||'index.html';if(!allowed.has(name)){res.writeHead(404);res.end();return}const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png'};res.writeHead(200,{'content-type':types[path.extname(name)],'cache-control':'no-store'});res.end(fs.readFileSync(path.join(root,name)))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/`;
 async function stopServer(){
  if(!server.listening)return;
  server.closeAllConnections?.();
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
 }
 let b;
 try{
 b=await pw[result.engine].launch({headless:true});
 async function fresh(options={}){const c=await b.newContext({...pw.devices['iPhone 13'],serviceWorkers:'block',...options});await c.route('**/*',route=>{if(route.request().url().startsWith(base))return route.continue();result.externalRequests.push(route.request().url());return route.abort()});const p=await c.newPage();p.on('pageerror',e=>result.errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(base);return {c,p}}
 async function test(name,fn){await fn();result.tests.push(name);console.log('PASS '+name)}
 async function toRate(p,ids=['RA-001']){await p.evaluate(ids=>start('single',ids),ids);await p.fill('#reply','合成原话：我先核对事实');await p.click('#commitSingle');await p.click('[data-choice=skip]')}
 async function mockedSync(p){await p.evaluate(()=>{cloudSession={user:{id:'fixture-user'}};cloudEnsureSession=async()=>cloudSession;cloudMeta={base:0,baseHash:'',owner:'',enabled:false,auto:false};cloudMetaWrite=()=>{};cloudClient={};})}
 await test('mobile recall uses compact shell and a visible primary action',async()=>{const {c,p}=await fresh();await p.click('#daily');assert.equal(await p.locator('.hero').isVisible(),false);const rect=await p.locator('#commitSingle').boundingBox();assert.ok(rect.y+rect.height<=p.viewportSize().height);assert.equal(await p.locator('[data-choice]').count(),0);await c.close()});
 await test('grading stays visible in a 2x2 grid and reserves content space',async()=>{const {c,p}=await fresh();await toRate(p);assert.equal(await p.locator('.optional-review').getAttribute('open'),null);const metrics=await p.evaluate(()=>{const bar=document.querySelector('.grade-actions');return {position:getComputedStyle(bar).position,top:bar.getBoundingClientRect().top,bottom:bar.getBoundingClientRect().bottom,clearance:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--action-clearance')),height:bar.getBoundingClientRect().height}});assert.equal(metrics.position,'fixed');assert.ok(metrics.bottom<=844&&metrics.top>0);assert.ok(metrics.clearance>metrics.height);await p.screenshot({path:path.join(outDir,'iphone-feedback.png'),fullPage:false});await c.close()});
 await test('keyboard layout yields to text input and first save tap completes once',async()=>{const {c,p}=await fresh();await toRate(p);await p.locator('.optional-review > summary').click();await p.fill('#reflection','合成复盘');assert.equal(await p.evaluate("document.body.classList.contains('keyboard-open')"),true);assert.equal(await p.locator('.grade-actions').evaluate(e=>getComputedStyle(e).position),'static');await p.click('[data-rate=good]');assert.equal(await p.evaluate('data.history.length'),1);await c.close()});
 await test('320px, landscape and enlarged text keep controls inside viewport',async()=>{const {c,p}=await fresh();for(const size of [{width:320,height:568},{width:844,height:390},{width:430,height:932}]){await p.setViewportSize(size);await toRate(p);await p.addStyleTag({content:'body{font-size:20px}button{font-size:20px}'});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await p.locator('[data-rate=easy]').isVisible())}await c.close()});
 await test('tab resume restores phase, answer, queue and reflection without recording a review',async()=>{const {c,p}=await fresh();await toRate(p,['RA-001','RA-002']);await p.locator('.optional-review > summary').click();await p.fill('#reflection','恢复这段复盘');await p.reload();await p.click('#practiceResume button');assert.equal(await p.evaluate('phase'),'rate');assert.equal(await p.evaluate('session[0]'),'RA-002');assert.equal(await p.evaluate('textDraft'),'合成原话：我先核对事实');assert.equal(await p.inputValue('#reflection'),'恢复这段复盘');assert.equal(await p.evaluate('data.history.length'),0);await c.close()});
 await test('persistent draft retention is opt-in, expires and can be cleared',async()=>{const {c,p}=await fresh();await p.click('[data-nav=settings]');await p.check('#keepPractice');await toRate(p);await p.evaluate(()=>{practiceRemember();sessionStorage.clear()});await p.reload();await p.click('#practiceResume button');assert.equal(await p.evaluate('phase'),'rate');await p.click('#practiceBack');await p.click('[data-nav=settings]');await p.uncheck('#keepPractice');assert.equal(await p.evaluate('localStorage.getItem(PRACTICE_KEY)'),null);await p.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem(PRACTICE_KEY));s.at=Date.now()-8*86400000;sessionStorage.setItem(PRACTICE_KEY,JSON.stringify(s))});assert.equal(await p.evaluate('practiceRead()'),null);await c.close()});
 await test('first generated challenge has all four options and preserves the complete question',async()=>{const {c,p}=await fresh();await p.evaluate(async()=>{aiGenerateCase=async()=>({...CARDS[0],id:'RA-901',group:'随机挑战',generated:true});await startChallenge('hard')});await p.fill('#reply','合成挑战回答');await p.click('#commitSingle');assert.equal(await p.locator('[data-choice="0"],[data-choice="1"],[data-choice="2"],[data-choice="3"]').count(),4);await p.click('[data-choice=skip]');await p.click('[data-rate=good]');assert.equal(await p.evaluate('generatedFor(data.history[0]).question'),await p.evaluate('CARDS[0].question'));assert.equal(await p.evaluate('Object.hasOwn(data.history[0],\"generatedCard\")'),false);assert.equal(await p.evaluate('Object.keys(data.cards).length'),0);assert.equal(await p.evaluate('startedToday()'),0);await c.close()});
 await test('generated ids do not reuse saved ids after a reload',async()=>{const {c,p}=await fresh();const ids=await p.evaluate(async()=>{const card={...CARDS[0],mechanism:'authority'};loadCloudSdk=async()=>({llm:{models:{list:async()=>[{id:'test'}]}}});collectWithFallback=async()=>({text:JSON.stringify(card)});const a=await aiGenerateCase('高难');data.cards[a.id]={};genLast=0;genSeq=0;const z=await aiGenerateCase('高难');return [a.id,z.id]});assert.notEqual(ids[0],ids[1]);await c.close()});
 await test('late AI feedback cannot render on another card',async()=>{const {c,p}=await fresh();await toRate(p,['RA-001','RA-002']);await p.evaluate(()=>{aiAnalyze=()=>new Promise(resolve=>window.finishAI=resolve)});await p.locator('.optional-review > summary').click();await p.click('#aiAnalyze');await p.click('[data-rate=good]');await p.fill('#reply','第二题原话');await p.click('#commitSingle');await p.click('[data-choice=skip]');await p.evaluate(()=>window.finishAI({fact:'上一题结果',boundary:'边界',length:'长度',rewrite:'示范'}));await p.waitForFunction('aiBusy===false');assert.equal(await p.textContent('#aiOut'),'');await c.close()});
 await test('late case generation does not pull the user away from settings',async()=>{const {c,p}=await fresh();await p.evaluate(()=>{aiGenerateCase=()=>new Promise(resolve=>window.finishCase=resolve);window.caseTask=startChallenge('hard');setPage('settings')});await p.evaluate(async()=>{window.finishCase({...CARDS[0],id:'RA-901',generated:true});await window.caseTask});assert.equal(await p.evaluate('page'),'settings');await c.close()});
 await test('equal revisions with different payloads produce a conflict',async()=>{const {c,p}=await fresh();await mockedSync(p);await p.evaluate(async()=>{data.writes={local:'本机'};save();cloudPull=async()=>({revision:data.revision,payload:{...data,writes:{remote:'云端'}},updated_at:'2026-11-08T00:00:00Z'});await cloudSync(true)});assert.match(await p.evaluate('cloudFlash'),/内容不同/);assert.equal(await p.evaluate('data.writes.local'),'本机');assert.equal(await p.evaluate('cloudMeta.baseHash'),'');await c.close()});
 await test('identical payloads establish a content baseline',async()=>{const {c,p}=await fresh();await mockedSync(p);await p.evaluate(async()=>{save();cloudPull=async()=>({revision:data.revision,payload:JSON.parse(JSON.stringify(data))});await cloudSync(true)});assert.match(await p.evaluate('cloudFlash'),/内容一致/);assert.equal((await p.evaluate('cloudMeta.baseHash')).length,64);await c.close()});
 await test('upload uses both cloud timestamp and counter as concurrency guards',async()=>{const {c,p}=await fresh();await mockedSync(p);const v=await p.evaluate(async()=>{save();const remote={revision:data.revision,payload:JSON.parse(JSON.stringify(data)),updated_at:'2026-11-08T00:00:00Z'};await cloudBase(remote.payload,'fixture-user');data.writes={local:'新记录'};save();const guards=[];cloudClient={database:{from:()=>({update:row=>{window.uploaded=row;const q={eq:(key,value)=>{guards.push([key,value]);return q},select:async()=>({data:[{revision:row.revision}]})};return q}})}};await cloudPush(false,remote);return {guards,revision:data.revision,uploaded:window.uploaded.revision,hash:cloudMeta.baseHash}});assert.deepEqual(v.guards.map(x=>x[0]),['revision','updated_at']);assert.equal(v.revision,v.uploaded);assert.equal(v.hash.length,64);await c.close()});
 await test('edits during upload survive a delayed server acknowledgement',async()=>{const {c,p}=await fresh();await mockedSync(p);const v=await p.evaluate(async()=>{save();const remote={revision:data.revision,payload:JSON.parse(JSON.stringify(data)),updated_at:'2026-11-08T00:00:00Z'};await cloudBase(remote.payload,'fixture-user');data.writes={local:'上传版本'};save();cloudClient={database:{from:()=>({update:()=>{const q={eq:()=>q,select:async()=>{data.writes={local:'上传期间的新改动'};save();return {data:[{}]}}};return q}})}};await cloudPush(false,remote);return {value:data.writes.local,persisted:JSON.parse(localStorage.getItem(STORE)).writes.local}});assert.equal(v.value,'上传期间的新改动');assert.equal(v.persisted,v.value);await c.close()});
 await test('background sync defers adopting remote data during active recall',async()=>{const {c,p}=await fresh();await mockedSync(p);await p.evaluate(async()=>{save();await cloudBase(data,'fixture-user');const remote={revision:data.revision+1,payload:{...data,revision:data.revision+1,writes:{cloud:'云端新内容'}}};cloudPull=async()=>remote;start('single',['RA-001']);await cloudSync(false)});assert.equal(await p.locator('#reply').count(),1);assert.match(await p.evaluate('cloudFlash'),/保留当前练习/);await c.close()});
 await test('switching accounts never automatically uploads the previous account snapshot',async()=>{const {c,p}=await fresh();await mockedSync(p);await p.evaluate(async()=>{cloudMeta.owner='other-user';cloudPull=async()=>{throw Error('must not pull')};await cloudSync(true)});assert.match(await p.evaluate('cloudFlash'),/内容不同/);await c.close()});
 await test('expired input controls do not reactivate keyboard layout',async()=>{const {c,p}=await fresh();await p.click('[data-nav=settings]');await p.check('#timer');assert.equal(await p.evaluate("document.body.classList.contains('keyboard-open')"),false);await c.close()});
 await test('all communication lessons require independent recall and a changed-condition reply without learning writes',async()=>{const {c,p}=await fresh();const before=await p.evaluate('localStorage.getItem(STORE)');for(const id of await p.evaluate('COMMUNICATION_LESSONS.map(x=>x.id)')){await p.evaluate(id=>{communicationLesson=id;setPage('communication')},id);assert.equal(await p.locator('.quote-reply').count(),0);assert.equal(await p.locator('#communicationCommit').isDisabled(),true);await p.fill('#communicationOwn','第一轮：我先听清需要');await p.click('#communicationCommit');assert.equal(await p.locator('#communicationVariant').count(),1);assert.equal(await p.inputValue('#communicationOwn'),'');await p.fill('#communicationOwn','第二轮：条件变化，调整顺序');await p.click('#communicationCommit');assert.equal(await p.locator('#communicationTransfer').count(),1);await p.click('#communicationAgain');assert.equal(await p.inputValue('#communicationOwn'),'');assert.equal(await p.locator('#communicationVariant').count(),1)}assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);await c.close()});
 await test('communication session resumes and user text stays escaped',async()=>{const {c,p}=await fresh();await p.click('[data-nav=communication]');await p.selectOption('#communicationLesson','coordinate');await p.fill('#communicationOwn','<img src=x onerror=window.injected=1>');await p.click('#communicationCommit');await p.reload();await p.click('[data-nav=communication]');assert.equal(await p.locator('#communicationVariant').count(),1);assert.equal(await p.locator('.quote-reply').textContent(),'<img src=x onerror=window.injected=1>');assert.equal(await p.locator('#root img').count(),0);assert.equal(await p.evaluate('window.injected'),undefined);await p.selectOption('#communicationLesson','observe');await p.reload();await p.click('[data-nav=communication]');assert.equal(await p.inputValue('#communicationLesson'),'observe');await c.close()});
 await test('real-plan handoff preserves an existing private draft and requires explicit saving',async()=>{const {c,p}=await fresh();await p.evaluate(()=>{coachPane='real';setPage('coach')});await p.fill('#realContext','已有真实情境草稿');await p.click('[data-nav=communication]');for(let i=0;i<2;i++){await p.fill('#communicationOwn','合成独立回应');await p.click('#communicationCommit')}await p.click('#communicationTransfer');assert.equal(await p.inputValue('#realContext'),'已有真实情境草稿');assert.equal(await p.evaluate('data.coach.experiments.length'),0);await p.fill('#realPrediction','我的具体预测');await p.fill('#realAction','只试一次先复述');await p.click('#realPlan');assert.equal(await p.evaluate('data.coach.experiments[0].context'),'已有真实情境草稿');await c.close()});
 await test('clearing temporary drafts also clears communication progress',async()=>{const {c,p}=await fresh();await p.click('[data-nav=communication]');await p.fill('#communicationOwn','清除这段未提交原话');await p.click('#practiceBack');await p.locator('#unsavedNotice summary').click();await p.click('#unsavedClear');assert.equal(await p.evaluate('sessionStorage.getItem(COMMUNICATION_KEY)'),null);await p.reload();await p.click('[data-nav=communication]');assert.equal(await p.inputValue('#communicationOwn'),'');await c.close()});
 await test('communication lessons fit narrow and landscape screens with enlarged text',async()=>{const {c,p}=await fresh();await p.click('[data-nav=communication]');await p.selectOption('#communicationLesson','coordinate');await p.addStyleTag({content:'body{font-size:20px}button{font-size:20px}'});for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){await p.setViewportSize(size);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.fill('#communicationOwn','合成判断');await p.click('#communicationCommit');if(await p.locator('#communicationTransfer').count())await p.click('#communicationAgain');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await p.locator('#communicationCommit').isVisible())}await p.screenshot({path:path.join(outDir,'communication-landscape.png')});await c.close()});
 await test('communication handoff never replaces an unfinished coach simulation',async()=>{const {c,p}=await fresh();await p.evaluate(()=>{setPage('coach');coachBegin('book','合成预测',null)});const id=await p.evaluate('data.coach.draft.id');await p.click('#practiceBack');await p.click('[data-nav=communication]');for(let i=0;i<2;i++){await p.fill('#communicationOwn','合成原话');await p.click('#communicationCommit')}await p.click('#communicationTransfer');assert.equal(await p.evaluate('data.coach.draft.id'),id);assert.equal(await p.evaluate('page'),'communication');assert.match(await p.textContent('#communicationStatus'),/已有未完成模拟/);await c.close()});
 await test('unmatched dialogue preserves wording and never marks a reference route as a match',async()=>{const {c,p}=await fresh();await p.evaluate(()=>startDialogue('DL-05'));await p.fill('#dialogueOwn','哦');await p.click('#commitReply');await p.click('#dialogueUnmatched');await p.reload();await p.evaluate(()=>startDialogue('DL-05'));await p.click('[data-dialogue-choice="1"]');assert.equal(await p.locator('#realMatch').isDisabled(),true);assert.match(await p.locator('#root').innerText(),/未评价你的原话/);await p.evaluate(()=>nextDialogue(true));assert.equal(await p.evaluate('dialogueState.steps[0].match'),false);assert.equal(await p.evaluate('dialogueState.steps[0].own'),'哦');assert.equal(await p.evaluate('data.dialogueHistory.length'),0);await c.close()});
 await test('mismatched dialogue can return to independent response without recording an attempt',async()=>{const {c,p}=await fresh();await p.evaluate(()=>startDialogue('DL-05'));await p.fill('#dialogueOwn','你说话怪怪的');await p.click('#commitReply');await p.click('[data-dialogue-choice="1"]');await p.click('#dialogueRevise');assert.equal(await p.inputValue('#dialogueOwn'),'你说话怪怪的');assert.equal(await p.locator('[data-dialogue-choice]').count(),0);await p.fill('#dialogueOwn','我们先说具体哪件事');await p.click('#commitReply');assert.equal(await p.evaluate('dialogueState.steps.length'),0);assert.equal(await p.evaluate('data.dialogueHistory.length'),0);await c.close()});
 await test('discomfort descriptions keep numeric storage and an optional unanswered state',async()=>{const {c,p}=await fresh();await p.evaluate(()=>{coachPane='real';setPage('coach')});assert.equal(await p.inputValue('#realBefore'),'');const labels=await p.locator('#realBefore option').allTextContents();assert.equal(labels.length,12);assert.ok(labels.slice(1).every(label=>label.includes(' · ')));assert.match(labels[1],/很平静/);assert.match(labels[11],/最强不适/);await p.selectOption('#realBefore','5');assert.equal(await p.evaluate("coachScore('realBefore')"),5);await p.selectOption('#realBefore','');assert.equal(await p.evaluate("coachScore('realBefore')"),null);await c.close()});
 await test('preparation is opt-in and cached challenges make zero generation calls',async()=>{const {c,p}=await fresh();await p.evaluate(()=>{window.prepares=0;window.generates=0;aiGenerateBatch=async(level,count)=>{window.prepares++;return Array.from({length:count},(_,i)=>({...CARDS[0],id:'RA-'+(900+i),generated:true,level}))};aiGenerateCase=async()=>{window.generates++;throw Error('unexpected model call')};setPage('bank')});assert.equal(await p.evaluate('window.prepares'),0);await p.selectOption('#prepareLevel','高难');await p.click('#prepareCases');await p.waitForFunction('preparationBusy===false');assert.equal(await p.evaluate('window.prepares'),1);assert.equal(await p.evaluate('preparedRead().length'),3);await p.click('[data-challenge=hard]');assert.equal(await p.locator('#reply').count(),1);assert.equal(await p.evaluate('window.generates'),0);assert.equal(await p.evaluate('preparedRead().length'),2);assert.equal(await p.evaluate('data.history.length'),0);await c.close()});
 await test('batch generation validates every item and caches model discovery across requests',async()=>{const {c,p}=await fresh();const result=await p.evaluate(async()=>{let lists=0,requests=0;loadCloudSdk=async()=>({llm:{models:{list:async()=>{lists++;return [{id:'fixture-model'}]}}}});collectWithFallback=async()=>{requests++;return {text:JSON.stringify({cases:Array.from({length:3},(_,i)=>({...CARDS[53],question:'合成问题第'+i+'条'}))})}};const cards=await aiGenerateBatch('高难',3);genLast=0;collectWithFallback=async()=>{requests++;return {text:JSON.stringify(CARDS[53])}};await aiGenerateCase('高难');return {lists,requests,ids:cards.map(c=>c.id)}});assert.equal(result.lists,1);assert.equal(result.requests,2);assert.equal(new Set(result.ids).size,3);await c.close()});
 await test('invalid prepared batches never enter the queue',async()=>{const {c,p}=await fresh();await p.evaluate(()=>{putPrepared({...CARDS[0],id:'RA-900',generated:true,level:'高难'});loadCloudSdk=async()=>({llm:{models:{list:async()=>[{id:'fixture'}]}}});collectWithFallback=async()=>({text:JSON.stringify({cases:[CARDS[53],{bad:true},CARDS[53]]})})});await assert.rejects(()=>p.evaluate(()=>aiGenerateBatch('高难',3)));assert.equal(await p.evaluate('preparedRead().length'),1);assert.equal(await p.evaluate('generationInFlight'),false);await c.close()});
 await test('completed dialogue guides consolidation without turning script scores into mastery',async()=>{const {c,p}=await fresh();await p.evaluate(()=>{unsavedSet({g:'coachReal',o:'',n:'',f:'realContext'},'已有现实计划草稿');startDialogue('DL-05')});for(let i=0;i<3;i++){await p.fill('#dialogueOwn','先问具体是哪件事');await p.click('#commitReply');await p.click('[data-dialogue-choice="1"]');await p.click('#dialogueNext')}assert.equal(await p.evaluate('data.dialogueHistory.length'),1);const summary=p.getByText('查看脚本选择与自评记录（不代表现实能力）',{exact:true});assert.equal(await summary.locator('..').getAttribute('open'),null);assert.match(await p.locator('#root').innerText(),/理解 → 说出 → 变式 → 实践/);assert.equal(await p.locator('#dialogueVariant').count(),1);await p.click('#dialogueTransfer');assert.equal(await p.inputValue('#realContext'),'已有现实计划草稿');assert.equal(await p.evaluate('data.coach.experiments.length'),0);assert.equal(await p.evaluate('data.dialogueHistory.length'),1);await c.close()});
 await test('all communication variants reveal causal guides after recall and preserve original wording',async()=>{
  const {c,p}=await fresh(),before=await p.evaluate('localStorage.getItem(STORE)');
  const lessons=await p.evaluate('COMMUNICATION_LESSONS.map(x=>({id:x.id,variants:x.variants.map(v=>v[0])}))');
  for(const lesson of lessons)for(const variant of lesson.variants){
   await p.evaluate(id=>{communicationProgress={};communicationLesson=id;setPage('communication')},lesson.id);
   assert.equal(await p.locator('#communicationGuide').count(),0);
   await p.fill('#communicationOwn','先核对事实，我原先的判断');await p.click('#communicationCommit');
   assert.equal(await p.locator('#communicationGuide').count(),0);await p.selectOption('#communicationVariant',variant);
   await p.fill('#communicationOwn','条件变化后，我调整了一个动作');await p.click('#communicationCommit');
   const guide=p.locator('#communicationGuide');assert.equal(await guide.getAttribute('open'),null);
   await guide.locator('summary').click();assert.equal(await guide.locator('h3').count(),6);
   const condition=await p.evaluate(({id,variant})=>COMMUNICATION_LESSONS.find(x=>x.id===id).variants.find(v=>v[0]===variant)[1],{id:lesson.id,variant});
   assert.ok((await guide.textContent()).includes(condition));
   await p.setViewportSize({width:320,height:568});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.equal(await p.evaluate(id=>communicationProgress[id].answers[0],lesson.id),'先核对事实，我原先的判断');
   await p.click('#communicationAgain');assert.equal(await p.locator('#communicationGuide').count(),0);
   assert.equal(await p.evaluate(id=>communicationProgress[id].answers[0],lesson.id),'先核对事实，我原先的判断');
  }
  assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);await c.close();
 });
 // Real vendored SDK with synthetic credentials and routed responses only.
 // HTTPS fixture exercises production startup without contacting a live service.
 async function authPage({expired=false,meta={},token}={}){
  const {c,p}=await fresh(),calls=[];
  await p.route('https://rat-session.test/**',route=>{
   const name=new URL(route.request().url()).pathname.slice(1)||'index.html';
   if(!allowed.has(name))return route.fulfill({status:404,body:''});
   return route.fulfill({contentType:name.endsWith('.html')?'text/html':'application/javascript',body:fs.readFileSync(path.join(root,name))});
  });
  await p.route('https://response-autonomy-trainer.app.workbuddy.host/**',async route=>{
   const pathname=new URL(route.request().url()).pathname;calls.push(pathname);
   if(pathname.endsWith('/v1/token')&&token)return token(route);
   if(pathname.endsWith('/v1/user/signout'))return route.fulfill({json:{}});
   throw Error('Unexpected fixture API: '+pathname);
  });
  await p.goto('https://rat-session.test/index.html');
  await p.evaluate(({expired,meta})=>{
   localStorage.setItem('workbuddy-cloud.session.'+CLOUD_CFG.publishableKey,JSON.stringify({accessToken:'fixture-access',refreshToken:'fixture-refresh',expiresAt:Date.now()+(expired?-1000:3600000),user:{id:'fixture-user'}}));
   localStorage.setItem(CLOUD_META_KEY,JSON.stringify({enabled:true,auto:false,...meta}));
  },{expired,meta});
  await p.reload();return {c,p,calls};
 }
 await test('HTTPS startup restores SDK persistence across reload with automatic sync disabled',async()=>{
  const {c,p,calls}=await authPage();await p.waitForFunction("cloudAuthState==='signed-in'");
  await p.click('[data-nav=settings]');await p.waitForFunction('!cloudRestorePending');
  assert.equal(await p.locator('#cloudSignOut').count(),1);assert.equal(await p.locator('#cloudEmail').count(),0);
  assert.equal(calls.length,0);const before=await p.evaluate('localStorage.getItem(STORE)');
  await p.reload();await p.waitForFunction("cloudAuthState==='signed-in'");
  assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);assert.equal(calls.length,0);await c.close();
 });
 await test('remembering a session is independent of enabling synchronization',async()=>{
  const {c,p,calls}=await authPage({meta:{enabled:false,remember:true,auto:true}});
  await p.waitForFunction("cloudAuthState==='signed-in'");assert.equal(await p.evaluate('cloudMeta.enabled'),false);
  assert.equal(calls.length,0);await c.close();
 });
 await test('expired access token refreshes through the real SDK without another OTP',async()=>{
  const {c,p,calls}=await authPage({expired:true,token:route=>route.fulfill({json:{access_token:'fixture-new-access',refresh_token:'fixture-new-refresh',expires_in:3600,sub:'fixture-user'}})});
  await p.waitForFunction("cloudAuthState==='signed-in'");assert.equal(calls.length,1);assert.match(calls[0],/\/v1\/token$/);
  await p.reload();await p.waitForFunction("cloudAuthState==='signed-in'");assert.equal(calls.length,1);await c.close();
 });
 await test('temporary refresh failure preserves credentials and one retry bypasses SDK cooldown',async()=>{
  let attempts=0;
  const {c,p,calls}=await authPage({expired:true,token:route=>++attempts===1?route.fulfill({status:503,json:{message:'fixture temporarily unavailable'}}):route.fulfill({json:{access_token:'fixture-new-access',refresh_token:'fixture-new-refresh',expires_in:3600,sub:'fixture-user'}})});
  await p.waitForFunction("cloudAuthState==='paused'&&!cloudRestorePending");
  assert.equal(await p.evaluate("!!localStorage.getItem('workbuddy-cloud.session.'+CLOUD_CFG.publishableKey)"),true);
  const before=await p.evaluate('localStorage.getItem(STORE)');
  // Install the panel without entering settings, whose normal recovery is also tested.
  await p.evaluate(()=>{document.getElementById('root').innerHTML='<div id="cloudPanel"></div>';renderCloudPanel();window.syncCalls=0;cloudSync=async()=>{window.syncCalls++}});
  assert.equal(await p.locator('#cloudEmail').count(),0);await p.click('#cloudRestoreLogin');
  await p.waitForFunction("cloudAuthState==='signed-in'&&!cloudRestorePending");
  assert.equal(attempts,2);assert.equal(calls.length,2);assert.equal(await p.evaluate('window.syncCalls'),1);
  assert.equal(await p.evaluate('cloudMeta.auto'),false);assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);await c.close();
 });
 await test('rejected refresh credentials offer OTP instead of claiming a recoverable session',async()=>{
  const {c,p}=await authPage({expired:true,token:route=>route.fulfill({status:401,json:{error:'invalid_grant',error_description:'fixture credentials revoked'}})});
  await p.waitForFunction("cloudAuthState==='signed-out'&&!cloudRestorePending");
  await p.click('[data-nav=settings]');assert.equal(await p.locator('#cloudEmail').count(),1);
  assert.equal(await p.evaluate('cloudMeta.remember'),false);
  assert.equal(await p.evaluate("localStorage.getItem('workbuddy-cloud.session.'+CLOUD_CFG.publishableKey)"),null);await c.close();
 });
 await test('coming online retries a paused refresh and applies the existing automatic sync preference',async()=>{
  let attempts=0;
  const {c,p}=await authPage({expired:true,meta:{auto:true},token:route=>++attempts===1?route.fulfill({status:503,json:{message:'fixture temporarily unavailable'}}):route.fulfill({json:{access_token:'fixture-new-access',refresh_token:'fixture-new-refresh',expires_in:3600,sub:'fixture-user'}})});
  await p.waitForFunction("cloudAuthState==='paused'&&!cloudRestorePending");
  await p.evaluate(()=>{window.syncCalls=0;cloudSync=async()=>{window.syncCalls++};window.dispatchEvent(new Event('online'))});
  await p.waitForFunction("cloudAuthState==='signed-in'&&!cloudRestorePending");
  assert.equal(attempts,2);assert.equal(await p.evaluate('window.syncCalls'),1);await c.close();
 });
 await test('foreground and online recovery share one refresh and never alter local records',async()=>{
  let release;const gated=new Promise(r=>release=r);
  const {c,p,calls}=await authPage({expired:true,token:async route=>{await gated;return route.fulfill({json:{access_token:'fixture-new-access',refresh_token:'fixture-new-refresh',expires_in:3600,sub:'fixture-user'}})}});
  await p.waitForFunction('!!cloudSessionPending');const before=await p.evaluate('localStorage.getItem(STORE)');
  await p.evaluate(()=>{window.dispatchEvent(new Event('online'));document.dispatchEvent(new Event('visibilitychange'));restoreCloudSession(false)});
  release();await p.waitForFunction("cloudAuthState==='signed-in'&&!cloudRestorePending");
  assert.equal(calls.length,1);assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);await c.close();
 });
 await test('explicit signout is retained on reopen and cannot be undone by an in-flight refresh',async()=>{
  let release;const gated=new Promise(r=>release=r);
  const {c,p}=await authPage({expired:true,token:async route=>{await gated;return route.fulfill({json:{access_token:'fixture-new-access',refresh_token:'fixture-new-refresh',expires_in:3600,sub:'fixture-user'}})}});
  await p.waitForFunction('!!cloudSessionPending');const before=await p.evaluate('localStorage.getItem(STORE)');
  await p.evaluate(()=>cloudSignOut());release();await p.waitForFunction('!cloudRestorePending');
  assert.equal(await p.evaluate('cloudSession'),null);assert.equal(await p.evaluate('cloudMeta.remember'),false);
  await p.reload();await p.click('[data-nav=settings]');assert.equal(await p.locator('#cloudEmail').count(),1);
  assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);await c.close();
 });
 await test('quick practice is available from home and keeps answers hidden until one explicit submission',async()=>{
  const {c,p}=await fresh();const before=await p.evaluate('localStorage.getItem(STORE)');await p.click('#quickHome');
  await p.click('#quickStart');assert.equal(await p.locator('#quickFeedback').count(),0);assert.equal(await p.locator('#quickSubmit').isDisabled(),true);
  const kinds=await p.evaluate('quickState.ids.map(id=>quickQuestion(id).kind)');for(const kind of ['single','multi','boolean'])assert.equal(kinds.filter(k=>k===kind).length,2);
  const n=await p.evaluate('quickQuestion(quickState.ids[0]).correct[0]');await p.click(`[data-quick-choice="${n}"]`);await p.click('#quickSubmit');
  await p.evaluate(()=>quickSubmit());assert.equal(await p.evaluate('quickState.answers.length'),1);assert.equal(await p.locator('#quickFeedback').count(),1);
  assert.equal(await p.locator('#quickFeedback ol li').count(),3);await p.evaluate(()=>{quickNext();quickNext()});assert.equal(await p.evaluate('quickState.step'),1);
  assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);await c.close();
 });
 await test('all 27 quick questions give answers and explanations without scheduling a review',async()=>{
  const {c,p}=await fresh(),before=await p.evaluate('localStorage.getItem(STORE)');await p.click('#quickHome');
  const ids=await p.evaluate('QUICK_BANK.map(q=>q.id)');for(const id of ids){
   await p.evaluate(id=>quickStart([id]),id);const picks=await p.evaluate(id=>quickQuestion(id).correct,id);
   for(const n of picks)await p.click(`[data-quick-choice="${n}"]`);await p.click('#quickSubmit');
   assert.equal(await p.locator('#quickFeedback').count(),1);assert.equal(await p.locator('.quick-choice:not(:disabled)').count(),0);
   await p.click('#quickNext');assert.match(await p.locator('#root').textContent(),/1\/1 题与参考答案一致/);
  }
  assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);assert.equal(await p.evaluate('data.history.length'),0);await c.close();
 });
 await test('partial and extra multi-choice answers fail and wrong-question retry starts a distinct round',async()=>{
  const {c,p}=await fresh();await p.click('#quickHome');await p.evaluate(()=>quickStart(['Q11']));
  await p.click('[data-quick-choice="0"]');await p.click('#quickSubmit');await p.click('#quickNext');assert.match(await p.locator('#root').textContent(),/0\/1 题与参考答案一致/);
  await p.click('#quickRetry');assert.equal(await p.evaluate('quickState.answers.length'),0);for(const n of [0,1,2,3])await p.click(`[data-quick-choice="${n}"]`);
  await p.click('#quickSubmit');await p.click('#quickNext');assert.match(await p.locator('#root').textContent(),/0\/1 题与参考答案一致/);
  await p.click('#quickRetry');for(const n of [0,1,3])await p.click(`[data-quick-choice="${n}"]`);await p.click('#quickSubmit');await p.click('#quickNext');assert.match(await p.locator('#root').textContent(),/1\/1 题与参考答案一致/);await c.close();
 });
 await test('quick selections and locked first answers survive reload, with single-choice replacement and keyboard submission',async()=>{
  const {c,p}=await fresh();await p.click('#quickHome');await p.evaluate(()=>quickStart(['Q01','Q03']));
  await p.click('[data-quick-choice="0"]');await p.click('[data-quick-choice="1"]');assert.deepEqual(await p.evaluate('quickState.selected'),[1]);
  const id=await p.evaluate('quickState.ids[0]');await p.reload();await p.click('#quickHome');assert.equal(await p.evaluate('quickState.ids[0]'),id);assert.deepEqual(await p.evaluate('quickState.selected'),[1]);
  await p.locator('#quickSubmit').focus();await p.locator('#quickSubmit').press('Enter');await p.reload();await p.click('#quickHome');
  assert.equal(await p.locator('#quickFeedback').count(),1);assert.equal(await p.evaluate('quickState.answers.length'),1);assert.equal(await p.locator('.quick-choice:not(:disabled)').count(),0);
  await p.click('#quickClearRound');assert.equal(await p.evaluate('sessionStorage.getItem(QUICK_KEY)'),null);assert.equal(await p.locator('#quickStart').count(),1);await c.close();
 });
 await test('quick topic filters and reading links preserve the independent-response exercise',async()=>{
  const {c,p}=await fresh();await p.click('#quickHome');await p.selectOption('#quickTopic','privacy');await p.selectOption('#quickKind','boolean');await p.click('#quickStart');
  assert.deepEqual(await p.evaluate('quickState.ids'),['Q12']);await p.click('[data-quick-choice="1"]');await p.click('#quickSubmit');
  await p.click('#quickLearn');assert.equal(await p.inputValue('#communicationLesson'),'privacy');assert.equal(await p.locator('#communicationGuide').count(),0);
  await p.click('#practiceBack');await p.click('#quickHome');assert.equal(await p.locator('#quickFeedback').count(),1);await c.close();
 });
 await test('plain-language highlights remain selective, escaped and readable on small and dark screens',async()=>{
  const {c,p}=await fresh();await p.evaluate(()=>{communicationLesson='observe';communicationProgress.observe={stage:2,answers:['自己的第一句','自己的第二句'],variant:'urgent'};setPage('communication')});
  await p.locator('#communicationGuide summary').click();assert.ok(await p.locator('#communicationGuide p strong').count());assert.ok((await p.locator('#communicationGuide p').allTextContents()).some(t=>t.includes('截止')));
  await p.evaluate(()=>{COMMUNICATION_GUIDES.observe.memory='**<img src=x onerror=window.bad=true>**';renderCommunication()});assert.equal(await p.locator('#root img').count(),0);assert.equal(await p.evaluate('window.bad'),undefined);
  await p.emulateMedia({colorScheme:'dark'});await p.screenshot({path:path.join(outDir,'plain-guide-dark.png'),fullPage:true});
  await p.evaluate(()=>{setPage('quick');quickStart(['Q02'])});await p.click('[data-quick-choice="0"]');await p.click('#quickSubmit');
  for(const size of [{width:320,height:568},{width:844,height:390}]){await p.setViewportSize(size);await p.addStyleTag({content:'body,button{font-size:20px}'});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await p.locator('#quickNext').isVisible())}
  await p.screenshot({path:path.join(outDir,'quick-landscape-dark.png'),fullPage:false});await c.close();
 });
 await test('four principle reminders link to exercises while preserving existing independent wording',async()=>{
  const {c,p}=await fresh(),before=await p.evaluate('localStorage.getItem(STORE)');await p.click('[data-nav=communication]');
  await p.fill('#communicationOwn','这句原话要保留');await p.locator('#communicationPrinciples summary').click();assert.equal(await p.locator('[data-principle]').count(),4);
  for(const topic of ['brief','silence','agency','coordinate']){
   await p.click(`[data-principle="${topic}"]`);assert.equal(await p.inputValue('#communicationLesson'),topic);assert.equal(await p.locator('#communicationGuide').count(),0);
   await p.locator('#communicationPrinciples summary').click();
  }
  await p.selectOption('#communicationLesson','observe');assert.equal(await p.inputValue('#communicationOwn'),'这句原话要保留');
  await p.reload();await p.click('[data-nav=communication]');assert.equal(await p.inputValue('#communicationOwn'),'这句原话要保留');
  assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);await c.close();
 });
 await test('new principle themes offer all three quick kinds and retain first-choice history only in tab storage',async()=>{
  const {c,p}=await fresh(),before=await p.evaluate('localStorage.getItem(STORE)');await p.click('#quickHome');
  for(const topic of ['brief','silence','agency']){
   await p.selectOption('#quickTopic',topic);await p.click('#quickStart');
   assert.equal(await p.evaluate('quickState.ids.length'),3);assert.deepEqual((await p.evaluate('quickState.ids.map(id=>quickQuestion(id).kind)')).sort(),['boolean','multi','single']);
   for(let i=0;i<3;i++){
    assert.equal(await p.locator('#quickFeedback').count(),0);const picks=await p.evaluate('quickQuestion(quickState.ids[quickState.step]).correct');
    for(const n of picks)await p.click(`[data-quick-choice="${n}"]`);await p.click('#quickSubmit');assert.equal(await p.evaluate('quickState.answers.length'),i+1);
    await p.click('#quickNext');
   }
   assert.match(await p.locator('#root').textContent(),/3\/3 题与参考答案一致/);await p.click('#quickClearRound');
  }
  assert.equal(await p.evaluate('localStorage.getItem(STORE)'),before);assert.equal(await p.evaluate('data.history.length'),0);await c.close();
 });
 await test('installed shell opens offline and keeps unrelated caches',async()=>{
  const {c,p}=await fresh({serviceWorkers:'allow'});
  await p.evaluate(async()=>{await navigator.serviceWorker.ready;await caches.open('unrelated-fixture-cache')});
  await p.reload();await p.waitForFunction('!!navigator.serviceWorker.controller');
  await p.evaluate(()=>{window.beforeOfflineReload=true});
  // This is the final test: remove the actual HTTP listener and keep-alive
  // connections instead of WebKit's failing context.setOffline simulation.
  await stopServer();
  assert.equal(server.listening,false);
  await p.reload({waitUntil:'commit'});
  await p.waitForFunction(()=>typeof APP_VERSION!=='undefined'&&!!document.querySelector('#daily')&&window.beforeOfflineReload===undefined);
  assert.equal(await p.evaluate('APP_VERSION'),'0.12.0');
  assert.equal(await p.locator('#daily').count(),1);
  assert.ok(await p.evaluate("caches.has('unrelated-fixture-cache')"));
  await c.close();
 });
 assert.deepEqual(result.errors,[]);assert.deepEqual(result.externalRequests,[]);
 console.log(JSON.stringify({passed:result.tests.length,engine:result.engine}));
 }finally{if(b)await b.close();await stopServer();fs.writeFileSync(path.join(outDir,`readiness-${result.engine}.json`),JSON.stringify(result,null,2))}
}
main().catch(e=>{console.error(e);process.exitCode=1});
