// Verified migration/rollback path between the delivered build and the
// untouched v0.4.0 baseline. Requires RAT_BASELINE_HTML (defaults to a sibling
// baseline-v0.4.0/index.html). A missing baseline is reported as blocked.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
const fixedUrl='file://'+path.join(root,'index.html');
const baseline=process.env.RAT_BASELINE_HTML||path.resolve(root,'../baseline-v0.4.0/index.html');
const baselineUrl='file://'+baseline;
const PAYLOAD_KEYS=['cards','history','writes','dialogueHistory','coach'];
async function main(){
 const b=await chromium.launch({headless:true});
 const out={baselinePath:baseline,checks:[]};
 if(!fs.existsSync(baseline))throw Error('v0.4.0 baseline not found: '+baseline+' — set RAT_BASELINE_HTML');
 async function page(url){
  const ctx=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true});
  const p=await ctx.newPage();p.on('dialog',d=>d.accept());
  p.on('pageerror',e=>{out.pageErrors=out.pageErrors||[];out.pageErrors.push(e.message)});
  await p.goto(url);return {ctx,p};
 }
 async function exportJSON(p,file){
  await p.click('[data-nav=settings]');const dl=p.waitForEvent('download');await p.click('#export');
  await (await dl).saveAs(file);return JSON.parse(fs.readFileSync(file,'utf8'));
 }
 async function importJSON(p,obj,file){
  fs.writeFileSync(file,JSON.stringify(obj));
  await p.click('[data-nav=settings]');await p.locator('#importFile').setInputFiles(file);
  await p.waitForFunction(()=>document.getElementById('importStatus').textContent.length>0);
  return p.locator('#importStatus').textContent();
 }
 const rich=`(()=>{
  const now=new Date('2026-11-08T01:00:00Z'),r=scheduleReview({},'good',now);
  data.settings.newPerDay=8;
  data.cards['RA-001']={first:'2026-11-01',last:'2026-11-02',due:'2026-11-14',seen:2,correct:1,fsrs:JSON.parse(JSON.stringify(r.card))};
  data.history.push({id:'RA-001',date:'2026-11-02',correct:true,grade:'good',answer:'合成迁移回答',mode:'daily',reflection:'合成复盘',fsrsLog:JSON.parse(JSON.stringify(r.log))});
  data.writes['RA-001']='保留自由回答';
  data.dialogueHistory.push({date:'2026-11-03',scenario:'DL-01',title:'合成情境',steps:[{turn:1,prompt:'合成',own:'合成',chosen:'合成',reason:'合成',score:2,match:true}],score:2,max:2});
  data.coach.session=3;
  data.coach.runs.push({kind:'simulation',id:'rollback-run',session:3,scenario:'video',prediction:'担心冷场',before:4,turn:3,
   steps:[0,1,2].map(i=>({turn:i,own:'合成原话'+i,urge:'',action:'fact'})),own:'',urge:'',ready:false,
   date:'2026-11-08',at:'2026-11-08T04:00:00Z',after:6,learning:'合成复盘',checks:{noticed:true,chose:null,enough:false,space:null}});
  data.coach.experiments.push({kind:'real',id:'rollback-exp',status:'observed',date:'2026-11-08',at:'2026-11-08T04:00:00Z',
   context:'合成情境',prediction:'合成预测',action:'合成动作',before:2,observedDate:'2026-11-08',observedAt:'2026-11-08T05:00:00Z',
   actual:'对方没有回复',evidence:'uncertain',after:5,learning:'允许不确定',checks:{noticed:true,chose:false,enough:null,space:null}});
  if(!save())throw Error('save failed');
  return JSON.stringify(Object.fromEntries(${JSON.stringify(PAYLOAD_KEYS)}.map(k=>[k,data[k]])));
 })()`;
 const tmpDir=path.join(root,'tests');const f1=path.join(tmpDir,'.rollback-v041.json'),f2=path.join(tmpDir,'.rollback-v040.json');
 try{
  // 1. the current build produces a full backup.
  const A=await page(fixedUrl);
  const expected=JSON.parse(await A.p.evaluate(rich));
  const v041=await exportJSON(A.p,f1);
  for(const k of PAYLOAD_KEYS)assert.deepEqual(v041[k],expected[k],'current export '+k);
  out.checks.push('current build export contains FSRS, due, history, writes, dialogue and both coach record types');
  await A.ctx.close();

  // 2. Rollback: the untouched v0.4.0 app imports it without losing anything.
  const B=await page(baselineUrl);
  const s1=await importJSON(B.p,v041,f1);
  assert.match(s1,/已恢复/);
  const got=JSON.parse(await B.p.evaluate(`JSON.stringify(Object.fromEntries(${JSON.stringify(PAYLOAD_KEYS)}.map(k=>[k,data[k]])))`));
  for(const k of PAYLOAD_KEYS)assert.deepEqual(got[k],expected[k],'v0.4.0 import '+k);
  assert.equal(await B.p.evaluate('data.schemaVersion'),3);
  out.checks.push('rollback to v0.4.0: every payload byte-equal after import');
  const v040=await exportJSON(B.p,f2);
  await B.ctx.close();

  // 3. Forward again: the current build re-imports the v0.4.0 export.
  const C=await page(fixedUrl);
  const s2=await importJSON(C.p,v040,f2);
  assert.match(s2,/已恢复/);
  const back=JSON.parse(await C.p.evaluate(`JSON.stringify(Object.fromEntries(${JSON.stringify(PAYLOAD_KEYS)}.map(k=>[k,data[k]])))`));
  for(const k of PAYLOAD_KEYS)assert.deepEqual(back[k],expected[k],'current re-import '+k);
  assert.equal(await C.p.evaluate('data.version'),1);
  assert.equal(await C.p.evaluate('data.schemaVersion'),3);
  out.checks.push('forward v0.4.0 -> current build re-import: every payload byte-equal');
  await C.ctx.close();

  // 4. A/B evidence for the import-snapshot fix, using the untouched baseline.
  async function snapshotProbe(url){
   const S=await page(url);
   await S.p.evaluate("data.settings.newPerDay=3;save()");
   const initial=await S.p.evaluate(`localStorage.getItem('${'response-autonomy-v01'}')`);
   const t=path.join(tmpDir,'.rollback-snap.json');
   const runImport=async obj=>{fs.writeFileSync(t,JSON.stringify(obj));await S.p.click('[data-nav=settings]');await S.p.locator('#importFile').setInputFiles(t);await S.p.waitForFunction(()=>document.getElementById('importStatus').textContent.length>0);return S.p.locator('#importStatus').textContent()};
   await runImport(await S.p.evaluate('defaultData()'));
   const preservedAfterSuccess=await S.p.evaluate("localStorage.getItem('response-autonomy-v01-before-import')")===initial;
   await S.p.evaluate("data.settings.newPerDay=10;save()");
   await S.p.evaluate("window.__o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='response-autonomy-v01')throw Error('quota');return window.__o.call(this,k,v)}");
   const failStatus=await runImport(await S.p.evaluate('defaultData()'));
   const preservedAfterFailure=await S.p.evaluate("localStorage.getItem('response-autonomy-v01-before-import')")===initial;
   await S.p.evaluate('Storage.prototype.setItem=window.__o');
   fs.unlinkSync(t);await S.ctx.close();
   return {preservedAfterSuccess,preservedAfterFailure,failStatus};
  }
  const before=await snapshotProbe(baselineUrl),after=await snapshotProbe(fixedUrl);
  assert.equal(before.preservedAfterSuccess,true);
  assert.equal(before.preservedAfterFailure,false);
  assert.equal(after.preservedAfterFailure,true);
  out.checks.push('failed import no longer destroys the earlier rollback snapshot (baseline: lost, current: kept)');
  // 5. A/B: a snapshot-only quota failure no longer aborts an otherwise valid import.
  async function snapshotOnlyProbe(url){
   const S=await page(url);
   await S.p.evaluate("data.settings.newPerDay=3;save()");
   await S.p.evaluate("window.__o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='response-autonomy-v01-before-import')throw Error('quota');return window.__o.call(this,k,v)}");
   const t=path.join(tmpDir,'.rollback-snap2.json');fs.writeFileSync(t,JSON.stringify(await S.p.evaluate('defaultData()')));
   await S.p.click('[data-nav=settings]');await S.p.locator('#importFile').setInputFiles(t);
   await S.p.waitForFunction(()=>document.getElementById('importStatus').textContent.length>0);
   const status=await S.p.locator('#importStatus').textContent(),value=await S.p.evaluate('data.settings.newPerDay');
   fs.unlinkSync(t);await S.ctx.close();return {status,value};
  }
  const bOnly=await snapshotOnlyProbe(baselineUrl),fOnly=await snapshotOnlyProbe(fixedUrl);
  assert.match(bOnly.status,/导入失败/);assert.equal(bOnly.value,3);
  assert.match(fOnly.status,/已恢复/);assert.equal(fOnly.value,5);
  out.checks.push('snapshot-only quota failure: baseline aborts a valid import, current build imports and warns');

  assert.deepEqual(out.pageErrors||[],[]);
  out.status='passed';
 }finally{for(const f of [f1,f2])if(fs.existsSync(f))fs.unlinkSync(f)}
 await b.close();
 out.passed=out.checks.length;
 fs.writeFileSync(path.join(root,'tests/rollback-results.json'),JSON.stringify(out,null,2));
 out.checks.forEach(c=>console.log('PASS '+c));
 console.log(JSON.stringify({status:out.status,passed:out.passed}));
}
main().catch(e=>{console.error(e);process.exit(1)});
