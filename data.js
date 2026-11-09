// Persistence and migration are independent of UI and scheduler internals.
const STORE='response-autonomy-v01', APP_VERSION='0.10.0';
const TODAY=()=>new Date().toLocaleDateString('sv-SE');
const defaultData=()=>({version:1,schemaVersion:3,appVersion:APP_VERSION,revision:0,created:new Date().toISOString(),settings:{newPerDay:5,timer:false,showReason:true},cards:{},history:[],writes:{},dialogueHistory:[],coach:newCoach()});
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const validTime=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT/.test(s)&&Number.isFinite(Date.parse(s));
function validGeneratedSnapshot(c){
 const text=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 return record(c)&&c.generated===true&&/^RA-\d{3}$/.test(c.id)&&text(c.scene,300)&&text(c.question,200)&&Array.isArray(c.options)&&c.options.length===4&&c.options.every(v=>text(v,120))&&Number.isInteger(c.correct)&&c.correct>=0&&c.correct<4&&['rationale','principle','model'].every(k=>text(c[k],300));
}
function validateData(obj){
 const fail=s=>{throw Error('备份校验失败：'+s)};
 const text=(x,max)=>typeof x==='string'&&x.length<=max;
 function scan(x,depth=0){if(depth>24)fail('结构过深');if(x&&typeof x==='object')for(const k of Object.keys(x)){if(['__proto__','constructor','prototype'].includes(k))fail('包含不安全字段');scan(x[k],depth+1)}}
 scan(obj);
 if(!record(obj)||obj.version!==1)fail('不支持的版本');
 if(obj.schemaVersion!==undefined&&(!Number.isInteger(obj.schemaVersion)||obj.schemaVersion<1||obj.schemaVersion>3))fail('数据来自更新版本，请使用对应应用');
 if(!record(obj.cards)||!record(obj.settings)||!Array.isArray(obj.history))fail('缺少卡片、设置或历史');
 if(![3,5,8,10].includes(obj.settings.newPerDay)||typeof obj.settings.timer!=='boolean')fail('复习设置不合法');
 if(obj.revision!==undefined&&(!Number.isSafeInteger(obj.revision)||obj.revision<0))fail('记录版本无效');
 for(const [id,s] of Object.entries(obj.cards)){
  if(!/^RA-\d{3}$/.test(id)||!record(s))fail('卡片编号或状态无效');
  for(const k of ['first','last','due'])if(s[k]!==undefined&&!validDate(s[k]))fail(id+' '+k+' 日期无效');
  for(const k of ['seen','correct','level'])if(s[k]!==undefined&&(!Number.isSafeInteger(s[k])||s[k]<0))fail(id+' 次数无效');
  if(s.correct!==undefined&&s.seen!==undefined&&s.correct>s.seen)fail(id+' 正确次数大于作答次数');
  if(s.fsrs!==undefined){const f=s.fsrs;if(!record(f)||!validTime(f.due)||!validTime(f.last_review)||![0,1,2,3].includes(f.state))fail(id+' FSRS状态无效');
   for(const k of ['stability','difficulty','elapsed_days','scheduled_days','reps','lapses','learning_steps'])if(!Number.isFinite(f[k])||f[k]<0)fail(id+' FSRS参数无效');
   if(f.stability<=0||f.difficulty<1||f.difficulty>10||f.scheduled_days>36500)fail(id+' FSRS参数超出范围');
   for(const k of ['reps','lapses','learning_steps','state'])if(!Number.isSafeInteger(f[k]))fail(id+' FSRS计数无效');
   if(f.reps<1||f.lapses>f.reps)fail(id+' FSRS次数不一致');
  }
 }
 for(const h of obj.history){if(!record(h)||!/^RA-\d{3}$/.test(h.id)||!validDate(h.date)||![true,false,null].includes(h.correct)||!['again','hard','good','easy'].includes(h.grade)||!text(h.answer,1500))fail('单轮历史无效');
  if(h.self!==undefined){const sc=h.self;if(!record(sc))fail('自评结构无效');for(const k of Object.keys(sc))if(!['fact','length','pause'].includes(k))fail('自评包含未知字段');for(const [k,vals] of [['fact',['fact','guess','unsure']],['length',['ok','long','short']],['pause',['yes','no','unsure']]])if(sc[k]!==undefined&&!vals.includes(sc[k]))fail('自评取值无效')}
 if(h.fsrsLog!==undefined){const l=h.fsrsLog;if(!record(l)||!validTime(l.review)||!validTime(l.due)||![1,2,3,4].includes(l.rating))fail('复习日志无效');
   for(const k of ['stability','difficulty','elapsed_days','last_elapsed_days','scheduled_days','learning_steps','state'])if(!Number.isFinite(l[k])||l[k]<0)fail('复习日志参数无效');
  }
 }
 if(obj.writes!==undefined&&!record(obj.writes))fail('自由回答结构无效');
 if(obj.dialogueHistory!==undefined&&!Array.isArray(obj.dialogueHistory))fail('多轮历史必须为数组');
 for(const h of obj.dialogueHistory||[]){if(!record(h)||!text(h.scenario,100)||!validDate(h.date)||!Array.isArray(h.steps)||h.steps.length<1||h.steps.length>20)fail('多轮记录结构无效');
  for(const s of h.steps)if(!record(s)||!Number.isInteger(s.turn)||s.turn<1||!text(s.prompt,4000)||!text(s.own,1200)||!text(s.chosen,4000)||!text(s.reason,4000)||![0,1,2].includes(s.score)||typeof s.match!=='boolean')fail('多轮对话步骤无效');
  if(h.max!==h.steps.length*2||h.score!==h.steps.reduce((n,s)=>n+s.score,0))fail('多轮汇总与步骤不一致');
 }
 const coach=obj.coach===undefined?newCoach():checkCoach(obj.coach);
 return {...obj,coach,schemaVersion:3,appVersion:APP_VERSION,revision:obj.revision||0,writes:obj.writes||{},dialogueHistory:obj.dialogueHistory||[]};
}
let data=defaultData(), persistedRaw=null, storageFault='', pendingBackup=null;
try{persistedRaw=localStorage.getItem(STORE);if(persistedRaw!==null)data=validateData(JSON.parse(persistedRaw))}catch(e){storageFault='已有记录无法读取：'+e.message+'。原始内容已保留，请先导出原始记录，再导入有效备份。'}
function save(){
 try{
  if(storageFault)throw Error(storageFault);
  if(localStorage.getItem(STORE)!==persistedRaw)throw Error('另一个页面已修改学习记录。请先导出本页未保存记录，再重新打开应用，避免覆盖较新的进度。');
  const next=validateData({...data,revision:(data.revision||0)+1}),raw=JSON.stringify(next);
  localStorage.setItem(STORE,raw);persistedRaw=raw;data=next;
 if(typeof cloudAfterSave==='function')cloudAfterSave();
 return true;
 }catch(e){pendingBackup=JSON.stringify(data);try{data=persistedRaw?validateData(JSON.parse(persistedRaw)):defaultData()}catch(_){}alert('保存未完成：'+e.message+' 当前练习仍留在页面，可重试或在设置中导出未保存记录。');return false}
}
function restoreBackup(obj){
 const candidate=validateData(obj); // All validation precedes every mutation.
 const before=localStorage.getItem(STORE);
 if(before!==persistedRaw)throw Error('其他页面已修改记录，请重新打开应用后再导入');
 const next={...candidate,revision:Math.max(candidate.revision,data.revision||0)+1};
 const raw=JSON.stringify(next);
 // Write the record first. A failed import must never leave a stale
 // "before-import" snapshot that looks like a valid rollback point.
 localStorage.setItem(STORE,raw);
 // Three distinct outcomes: a real snapshot, nothing to snapshot, or a failed snapshot.
 let snapshot=before===null?'none':'saved';
 if(before!==null)try{localStorage.setItem(STORE+'-before-import',before)}catch(e){snapshot='failed';try{localStorage.removeItem(STORE+'-before-import')}catch(_){}}
 data=next;persistedRaw=raw;storageFault='';pendingBackup=null;
 return snapshot;
}
// Replace the local record with a validated cloud snapshot. The current bytes
// are kept under -before-remote so a wrong choice stays recoverable.
function adoptRemote(obj,revision){
 const candidate=validateData(obj);
 const rev=Number.isSafeInteger(revision)&&revision>0?revision:(candidate.revision||0);
 const next={...candidate,revision:rev};
 const before=localStorage.getItem(STORE),raw=JSON.stringify(next);
 if(before!==persistedRaw)throw Error('其他页面已修改记录，未覆盖本机。');
 if(before!==null)localStorage.setItem(STORE+'-before-remote',before);
 localStorage.setItem(STORE,raw);
 data=next;persistedRaw=raw;storageFault='';pendingBackup=null;
 return true;
}
const scheduler=FSRS.fsrs({request_retention:0.9,maximum_interval:36500,enable_fuzz:false,enable_short_term:true,learning_steps:['1m','10m'],relearning_steps:['10m']});
function scheduleReview(s,grade,now=new Date()){
 const base=s.fsrs?{...s.fsrs,due:new Date(s.fsrs.due),last_review:new Date(s.fsrs.last_review)}:FSRS.createEmptyCard(now);
 return scheduler.next(base,now,{again:1,hard:2,good:3,easy:4}[grade]);
}
