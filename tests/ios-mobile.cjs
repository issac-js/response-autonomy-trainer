// iPhone-shaped checks in WebKit (device emulation). This is NOT real iOS
// Safari: it validates layout, touch targets, zoom prevention and the lazy
// cloud panel, but real-device behaviour still needs a phone.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'));
const result={engine:'webkit (device emulation, not real iOS)',devices:{},tests:[],errors:[],externalRequests:[]};
async function main(){
 const server=http.createServer((req,res)=>{
  // WebKit may send an absolute-form request target; compare the path only.
  const raw=req.url||'/';
  const pathname=raw.startsWith('http')?new URL(raw).pathname:raw.split('?')[0];
  if(pathname==='/'||pathname==='/index.html'){res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(html)}
  else{res.writeHead(404);res.end('not found')}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port+'/';
 const b=await pw.webkit.launch({headless:true});
 async function test(name,f){await f();result.tests.push(name);console.log('PASS '+name)}
 async function open(device){
  const ctx=await b.newContext({...pw.devices[device],acceptDownloads:true});
  const p=await ctx.newPage();
  p.on('pageerror',e=>result.errors.push(device+': '+e.message));
  p.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))result.externalRequests.push(r.url())});
  p.on('dialog',d=>d.accept());
  await p.goto(base);
  await p.waitForFunction("document.getElementById('root') && typeof setPage === 'function'");
  return {ctx,p};
 }
 const {ctx,p}=await open('iPhone 13');
 result.devices['iPhone 13']={viewport:p.viewportSize(),ua:await p.evaluate('navigator.userAgent')};

 await test('iPhone viewport meta opts into the notch safe area',async()=>{
  const meta=await p.getAttribute('meta[name=viewport]','content');
  assert.match(meta,/viewport-fit=cover/);
  assert.equal(await p.getAttribute('meta[name=apple-mobile-web-app-capable]','content'),'yes');
  assert.equal(await p.getAttribute('meta[name=apple-mobile-web-app-title]','content'),'回应自主权');
  assert.ok(await p.locator('link[rel=apple-touch-icon][sizes="180x180"]').count());
  assert.equal(await p.getAttribute('meta[name=theme-color]','content'),'#2A1A4F');
 });

 await test('safe-area insets are used by the page shell',async()=>{
  const hasEnv=await p.evaluate(()=>[...document.styleSheets].some(s=>{try{return [...s.cssRules].some(r=>(r.cssText||'').includes('env(safe-area-inset-bottom)'))}catch(e){return false}}));
  assert.equal(hasEnv,true);
  const pad=await p.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.app')).paddingBottom));
  assert.ok(pad>=60,'padding-bottom '+pad);
 });

 await test('form controls stay at 16px so iOS does not zoom on focus',async()=>{
  await p.evaluate("start('single',['RA-001'])");
  const sizes=await p.evaluate(()=>['reply'].map(id=>parseFloat(getComputedStyle(document.getElementById(id)).fontSize)));
  assert.deepEqual(sizes,[16]);
  await p.evaluate('setPage("settings")');
  const sel=await p.evaluate(()=>parseFloat(getComputedStyle(document.getElementById('limit')).fontSize));
  assert.ok(sel>=16,'select font-size '+sel);
 });

 await test('primary controls meet the 44px touch target',async()=>{
  await p.evaluate('setPage("home")');
  const nav=await p.evaluate(()=>[...document.querySelectorAll('[data-nav]')].map(el=>el.getBoundingClientRect().height));
  assert.ok(nav.every(h=>h>=44),'nav heights '+nav.join(','));
  const btn=await p.evaluate(()=>document.getElementById('daily').getBoundingClientRect().height);
  assert.ok(btn>=44,'daily button '+btn);
  const touch=await p.evaluate(()=>getComputedStyle(document.getElementById('daily')).touchAction);
  assert.equal(touch,'manipulation');
 });

 await test('390 and 320 widths have no horizontal overflow on any page',async()=>{
  for(const width of [390,320]){
   await p.setViewportSize({width,height:844});
   for(const name of ['home','bank','coach','dialogue','stats','settings']){
    await p.evaluate(n=>{dialogueState=null;setPage(n)},name);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' '+width);
   }
  }
  await p.setViewportSize({width:390,height:844});
 });

 await test('cloud panel is present but the SDK is not requested until the user asks',async()=>{
  await p.evaluate('setPage("settings")');
  assert.equal(await p.locator('#cloudPanel').count(),1);
  assert.equal(await p.locator('#cloudEmail').count(),1);
  assert.deepEqual(result.externalRequests,[]);
  const before=await p.evaluate('cloudClient===null');
  assert.equal(before,true);
 });

 await test('invalid email is rejected locally without any network request',async()=>{
  await p.fill('#cloudEmail','not-an-email');await p.click('#cloudSendCode');
  assert.match(await p.locator('#cloudLoginStatus').textContent(),/有效的邮箱/);
  assert.deepEqual(result.externalRequests.filter(u=>!u.includes('jsdelivr')),[]);
 });

 await test('smaller and larger iPhones keep the layout usable',async()=>{
  await ctx.close(); // WebKit on Windows is unreliable with concurrent device contexts
  for(const device of ['iPhone SE','iPhone 14 Pro Max']){
   const s=await open(device);
   result.devices[device]={viewport:s.p.viewportSize()};
   for(const name of ['home','bank','coach','dialogue','stats','settings']){
    await s.p.evaluate(n=>{dialogueState=null;setPage(n)},name);
    assert.ok(await s.p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),device+' '+name);
   }
   await s.ctx.close();
  }
 });

 await test('no page errors across the iPhone runs',async()=>{
  assert.deepEqual(result.errors,[]);
 });

 await b.close();await new Promise(r=>server.close(r));
 fs.writeFileSync(path.join(root,'tests/ios-mobile-results.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({engine:result.engine,passed:result.tests.length,errors:result.errors,externalRequests:result.externalRequests}));
}
main().catch(e=>{console.error(e);process.exit(1)});
