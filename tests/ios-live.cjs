// Live iPhone-shaped checks for the v0.7 controls (skip / mechanism / AI / self-check).
// WebKit device emulation only — not a real iPhone.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const LIVE=process.env.RAT_LIVE||'https://response-autonomy-trainer.app.workbuddy.host/?sharecode=O6CO6UZJWZ';
const result={target:LIVE,engine:'webkit device emulation (not real iOS)',tests:[],errors:[],externalRequests:[]};
async function main(){
 const b=await pw.webkit.launch({headless:true});
 async function open(device){
  const c=await b.newContext({...pw.devices[device]});const p=await c.newPage();
  p.on('pageerror',e=>result.errors.push(device+': '+e.message));
  p.on('request',r=>{const u=r.url();if(/^https?:/.test(u)&&!u.startsWith('https://response-autonomy-trainer.app.workbuddy.host/'))result.externalRequests.push(u)});
  p.on('dialog',d=>d.accept());
  await p.goto(LIVE,{waitUntil:'load',timeout:60000});
  await p.waitForFunction("typeof start==='function'");
  return {c,p};
 }
 async function test(name,f){await f();result.tests.push(name);console.log('PASS '+name)}
 const {c,p}=await open('iPhone 13');
 result.device=p.viewportSize();

 await test('live build exposes the v0.7 controls on an iPhone viewport',async()=>{
  assert.match(await p.title(),/v0\.7\.1/);
  await p.evaluate("start('single',['RA-054'])");await p.fill('#reply','合成原话');await p.click('#commitSingle');
  assert.equal(await p.locator('[data-choice=skip]').count(),1);
  await p.click('[data-choice=skip]');
  assert.equal(await p.locator('[data-mech]').count(),4);
  assert.equal(await p.locator('#aiAnalyze').count(),1);
  assert.equal(await p.locator('[data-self]').count(),9);
 });

 await test('new controls meet the 44px target and do not overflow 390px',async()=>{
  assert.ok(await p.evaluate('document.documentElement.scrollWidth<=innerWidth'),'horizontal overflow');
  const sizes=await p.evaluate(()=>({
   mech:[...document.querySelectorAll('[data-mech]')].map(e=>e.getBoundingClientRect().height),
   self:[...document.querySelectorAll('[data-self]')].map(e=>e.getBoundingClientRect().height),
   ai:document.getElementById('aiAnalyze').getBoundingClientRect().height,
   rate:document.querySelector('[data-rate]').getBoundingClientRect().height,
   nav:[...document.querySelectorAll('[data-nav]')].map(e=>e.getBoundingClientRect().height)}));
  for(const [k,v] of Object.entries(sizes)){const arr=[].concat(v);assert.ok(arr.every(h=>h>=44),k+' heights '+arr.join(','))}
 });

 await test('mechanism and self-check rows wrap inside the panel',async()=>{
  const ok=await p.evaluate(()=>[...document.querySelectorAll('.seg')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1}));
  assert.equal(ok,true);
 });

 await test('cloud panel stays usable at 390px',async()=>{
  await p.evaluate('setPage("settings")');
  assert.equal(await p.locator('#cloudPanel').count(),1);
  assert.equal(await p.evaluate("parseFloat(getComputedStyle(document.getElementById('cloudEmail')).fontSize)"),16);
  assert.ok(await p.evaluate('document.documentElement.scrollWidth<=innerWidth'));
 });

 await test('larger iPhone keeps the same layout',async()=>{
  await c.close();
  const s=await open('iPhone 14 Pro Max');
  result.device2=s.p.viewportSize();
  for(const name of ['home','bank','coach','dialogue','stats','settings']){
   await s.p.evaluate(n=>{dialogueState=null;setPage(n)},name);
   assert.ok(await s.p.evaluate('document.documentElement.scrollWidth<=innerWidth'),name);
  }
  await s.p.evaluate("start('single',['RA-054'])");await s.p.fill('#reply','合成');await s.p.click('#commitSingle');await s.p.click('[data-choice=skip]');
  assert.ok(await s.p.evaluate('document.documentElement.scrollWidth<=innerWidth'),'rate');
  await s.c.close();
 });

 await test('no page errors and no unexpected external hosts',async()=>{
  assert.deepEqual(result.errors,[]);
  const hosts=[...new Set(result.externalRequests.map(u=>new URL(u).host))];
  assert.deepEqual(hosts,[]);
 });

 await b.close();
 fs.writeFileSync(path.join(path.resolve(__dirname,'..'),'tests/ios-live-results.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({passed:result.tests.length,errors:result.errors,external:result.externalRequests}));
}
main().catch(e=>{console.error(e);process.exit(1)});
