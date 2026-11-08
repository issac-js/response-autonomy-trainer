// Live AI evaluation against the published origin (the LLM checks Origin).
// Deterministic rubric checks + latency/usage capture. Costs a few small calls.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const LIVE=process.env.RAT_LIVE||'https://response-autonomy-trainer.app.workbuddy.host/?sharecode=O6CO6UZJWZ';
const result={target:LIVE,tests:[],cases:[],usage:null,concurrency:null,errors:[]};
const CASES=[
 {id:'RA-054',label:'权威借力',answer:'行，张总同意了我就发你。',expect:['授权','确认','转述','范围']},
 {id:'RA-058',label:'假二选一',answer:'我支持先裁预算。',expect:['二选一','前提','目标','问题']},
 {id:'RA-063',label:'情绪施压',answer:'好，那我帮你把这块做了。',expect:['职责','边界','有限','责任']},
 {id:'RA-071',label:'信息拼接',answer:'我们用的是内部系统，管理员是老王，平时用账号密码登录。',expect:['安全','正式','范围','信息']},
 {id:'RA-056',label:'互惠自曝',answer:'我工资大概两万，年终奖另算。',expect:['隐私','不必','交换','义务']}
];
async function main(){
 const b=await chromium.launch({headless:true});
 const ctx=await b.newContext({viewport:{width:390,height:844}});
 const p=await ctx.newPage();
 p.on('pageerror',e=>result.errors.push(e.message));
 await p.goto(LIVE,{waitUntil:'load',timeout:60000});

 const model=await p.evaluate(async()=>{
  const c=await loadCloudSdk();const list=await c.llm.models.list();
  const models=(Array.isArray(list)?list:[]).filter(m=>m&&m.disabled!==true);
  const score=m=>{const s=((m.id||'')+' '+(m.name||'')).toLowerCase();let v=0;if(s.includes('deepseek'))v+=4;if(s.includes('v4.1')||s.includes('v4_1'))v+=2;if(s.includes('flash'))v+=2;return v};
  models.sort((a,b)=>score(b)-score(a));return models[0]?{id:models[0].id,name:models[0].name,count:models.length}:null;
 });
 assert.ok(model,'no available model');
 result.model=model;

 for(const item of CASES){
  const started=Date.now();
  let text='',thrown='';
  try{
   text=await p.evaluate(async ({id,answer})=>{
    aiLast=0; // eval paces itself instead of the UI cooldown
    return await aiAnalyze(CARDS.find(c=>c.id===id),answer);
   },{id:item.id,answer:item.answer});
  }catch(e){thrown=e.message}
  const ms=Date.now()-started;
  const checks={has4:/事实/.test(text)&&/前提/.test(text)&&/篇幅|停顿/.test(text)&&/替换/.test(text),
   length:text.length>=80&&text.length<=320,
   noScore:!/\d+\s*%|得分|评分：|正确率/.test(text),
   noDiagnosis:!/诊断|人格障碍|你有.*倾向/.test(text),
   keyword:item.expect.some(k=>text.includes(k))};
  const ok=!thrown&&Object.values(checks).every(Boolean);
  result.cases.push({id:item.id,label:item.label,ms,ok,thrown,checks,text});
  console.log((ok?'PASS ':'FAIL ')+item.label+' '+ms+'ms '+JSON.stringify(checks));
 }

 // One direct call to capture usage/credits for the same model.
 result.usage=await p.evaluate(async id=>{
  const c=await loadCloudSdk();let text='',usage=null;
  for await(const ch of c.llm.chat.completions.create({model:id,messages:[{role:'system',content:'你是简洁的中文助手。'},{role:'user',content:'用一句话说明什么是沟通中的边界。'}],stream:true,stream_options:{include_usage:true}})){
   const d=ch.choices&&ch.choices[0]&&ch.choices[0].delta;if(d&&d.content)text+=d.content;if(ch.usage)usage=ch.usage;
  }
  return {chars:text.length,usage};
 },model.id).catch(e=>({error:e.message}));

 // Two parallel calls: observe whether the platform throttles gracefully.
 result.concurrency=await p.evaluate(async id=>{
  const c=await loadCloudSdk();
  const one=async q=>{let out='';try{for await(const ch of c.llm.chat.completions.create({model:id,messages:[{role:'system',content:'你是简洁的中文助手。'},{role:'user',content:q}],stream:true})){const d=ch.choices&&ch.choices[0]&&ch.choices[0].delta;if(d&&d.content)out+=d.content}return {ok:true,chars:out.length}}catch(e){return {ok:false,code:e&&e.error&&e.error.code||'',message:e.message}}};
  return await Promise.all([one('用一句话说明什么是澄清。'),one('用一句话说明什么是授权。')]);
 },model.id).catch(e=>({error:e.message}));

 await b.close();
 result.passed=result.cases.filter(c=>c.ok).length;
 result.failed=result.cases.length-result.passed;
 fs.writeFileSync(path.join(path.resolve(__dirname,'..'),'tests/ai-eval-results.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({model:result.model.id,passed:result.passed,failed:result.failed,usage:result.usage,concurrency:result.concurrency}));
 if(result.failed||result.errors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exit(1)});
