// Cross-engine smoke checks. A blocked engine is recorded, never reported as passed.
// Run: PLAYWRIGHT_MODULE=... PLAYWRIGHT_BROWSERS_PATH=... node tests/compat.cjs
const fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),url='file://'+path.join(root,'index.html');
const EDGE='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const checks=[
 ['load',async p=>{if(await p.evaluate('typeof data')==='undefined')throw Error('data missing');if(await p.evaluate('data.schemaVersion')!==3)throw Error('schema')}],
 ['single-recall-and-FSRS',async p=>{await p.evaluate("start('single',['RA-001'])");await p.fill('#reply','合成跨浏览器回答');await p.click('#commitSingle');await p.click('[data-choice=other]');await p.fill('#reflection','合成复盘');await p.click('[data-rate=good]');if(await p.evaluate('data.history.length')!==1)throw Error('history');if(!await p.evaluate("data.cards['RA-001'].fsrs.due"))throw Error('fsrs due')}],
 ['coach-simulation',async p=>{await p.click('[data-nav=coach]');await p.click('[data-coach-tab=practice]');await p.fill('#coachPrediction','合成预测');await p.click('#coachStart');await p.fill('#coachOwn','合成原话');await p.click('#coachCommit');if(await p.locator('[data-coach-action]').count()!==6)throw Error('actions');await p.click('[data-coach-action=fact]');await p.evaluate('data.coach.draft=null;save();renderCoach()')}],
 ['real-plan-save',async p=>{await p.click('[data-coach-tab=real]');await p.fill('#realContext','合成情境');await p.fill('#realPrediction','合成担心');await p.fill('#realAction','合成动作');await p.click('#realPlan');if(await p.evaluate('data.coach.experiments.length')!==1)throw Error('plan')}],
 ['reload-persists-record',async p=>{await p.reload();if(await p.evaluate('data.coach.experiments.length')!==1)throw Error('lost')}],
 ['unsaved-form-guard',async p=>{await p.click('[data-nav=coach]');await p.click('[data-coach-tab=real]');await p.fill('#realContext','未保存的保护文本X');await p.reload();await p.click('[data-nav=coach]');await p.click('[data-coach-tab=real]');const v=await p.locator('#realContext').inputValue();if(v!=='未保存的保护文本X')throw Error('guard restore='+JSON.stringify(v));if(await p.evaluate('data.coach.experiments.length')!==1)throw Error('guard wrote to record')}],
 ['v0.3-backup-import',async p=>{
  const v03={version:1,schemaVersion:2,appVersion:'0.3.0',revision:2,created:'2026-11-01T00:00:00Z',settings:{newPerDay:5,timer:false,showReason:true},cards:{'RA-001':{first:'2026-11-01',due:'2026-11-14',seen:2,correct:1}},history:[{id:'RA-001',date:'2026-11-02',correct:true,grade:'good',answer:'合成迁移样例',mode:'daily'}],writes:{},dialogueHistory:[]};
  const tmp=path.join(root,'tests/.compat-import.json');fs.writeFileSync(tmp,JSON.stringify(v03));
  await p.click('[data-nav=settings]');await p.locator('#importFile').setInputFiles(tmp);
  await p.waitForFunction(()=>document.getElementById('importStatus').textContent.length>0);
  if(!/已恢复/.test(await p.locator('#importStatus').textContent()))throw Error('import');
  if(await p.evaluate("data.cards['RA-001'].due")!=='2026-11-14')throw Error('due lost');
  fs.unlinkSync(tmp);
 }],
 ['width-320',async p=>{await p.setViewportSize({width:320,height:844});await p.click('[data-nav=coach]');if(!await p.evaluate('document.documentElement.scrollWidth<=innerWidth'))throw Error('overflow')}],
 ['no-external-requests',async p=>{}],
 ['no-page-errors',async p=>{}]
];
async function main(){
 const engines=[['bundled-chromium',()=>pw.chromium.launch({headless:true}),null],
  ['system-edge',()=>pw.chromium.launch({headless:true,executablePath:EDGE}),EDGE],
  ['system-chrome',()=>pw.chromium.launch({headless:true,executablePath:CHROME}),CHROME],
  ['bundled-webkit-windows',()=>pw.webkit.launch({headless:true}),null]];
 const result={engines:{},note:'Windows WebKit via Playwright is not iOS Safari; real-device Safari, real microphone quality and manual UI inspection are not covered.'};
 for(const [name,launch,exe] of engines){
  const entry={checks:{},pageErrors:[],externalRequests:[]};
  if(exe&&!fs.existsSync(exe)){entry.status='blocked';entry.reason='browser executable not found: '+exe;result.engines[name]=entry;console.log(name+' | BLOCKED: '+entry.reason);continue}
  let browser;
  try{browser=await launch()}catch(e){entry.status='blocked';entry.reason=String(e.message).split('\n')[0];result.engines[name]=entry;console.log(name+' | BLOCKED: '+entry.reason);continue}
  const p=await browser.newPage({viewport:{width:390,height:844}});
  p.on('pageerror',e=>entry.pageErrors.push(e.message));
  p.on('request',r=>{if(/^https?:/.test(r.url()))entry.externalRequests.push(r.url())});
  p.on('dialog',d=>d.accept());
  try{
   await p.goto(url,{waitUntil:'load'});
   for(const [label,fn] of checks){
    try{
     if(label==='no-external-requests'){if(entry.externalRequests.length)throw Error(entry.externalRequests.join(','))}
     else if(label==='no-page-errors'){if(entry.pageErrors.length)throw Error(entry.pageErrors.join(' | '))}
     else await fn(p);
     entry.checks[label]='pass';
    }catch(e){entry.checks[label]='fail: '+String(e.message).split('\n')[0]}
   }
  }catch(e){entry.checks.load='fail: '+String(e.message).split('\n')[0];entry.checks.load||null}
  entry.status=Object.values(entry.checks).every(v=>v==='pass')?'passed':'failed';
  console.log(name+' | '+Object.entries(entry.checks).map(([k,v])=>k+':'+v).join(' | '));
  await browser.close();
  result.engines[name]=entry;
 }
 fs.writeFileSync(path.join(root,'tests/compat-results.json'),JSON.stringify(result,null,2));
 const failed=Object.entries(result.engines).filter(([,v])=>v.status!=='passed').map(([k])=>k);
 console.log(JSON.stringify({engines:Object.keys(result.engines).length,notPassed:failed}));
 if(failed.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exit(1)});
