// v0.4.1 storage regression checks. Run: node tests/regression.cjs
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');let passed=0;
function test(n,f){f();passed++;console.log('PASS '+n)}
function env(raw=null,failKey=null){
 const values=new Map(raw===null?[]:[['response-autonomy-v01',raw]]);
 const ctx=vm.createContext({console,Date,JSON,Map,Math,alert:()=>{},localStorage:{
  getItem:k=>values.has(k)?values.get(k):null,
  setItem:(k,v)=>{if(failKey&&k===failKey)throw Error('quota');values.set(k,v)},
  removeItem:k=>values.delete(k)
 }});
 for(const f of ['vendor/ts-fsrs-5.4.2.umd.js','coach-data.js','data.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
 return {run:s=>vm.runInContext(s,ctx),values};
}
const legacy={
 version:1,schemaVersion:2,appVersion:'0.3.0',created:'2026-11-01T00:00:00Z',revision:7,
 settings:{newPerDay:5,timer:false,showReason:true},
 cards:{'RA-001':{first:'2026-11-01',last:'2026-11-02',due:'2026-11-14',seen:2,correct:1,level:2}},
 history:[{id:'RA-001',date:'2026-11-02',correct:true,grade:'good',answer:'合成迁移样例',mode:'daily'}],
 writes:{'RA-001':'保留字段'},dialogueHistory:[]
};
test('storage identity unchanged: key, version 1, schema 3, no new persistent fields',()=>{
 const e=env();assert.equal(e.run('STORE'),'response-autonomy-v01');
 const d=JSON.parse(e.run('JSON.stringify(defaultData())'));
 assert.equal(d.version,1);assert.equal(d.schemaVersion,3);
 assert.deepEqual(Object.keys(d).sort(),['appVersion','cards','coach','created','dialogueHistory','history','revision','schemaVersion','settings','version','writes']);
 assert.equal(e.run('APP_VERSION'),'0.14.3');
});
test('v0.3 in-memory migration does not rewrite disk; due and old payloads intact',()=>{
 const raw=JSON.stringify(legacy),e=env(raw);
 assert.equal(e.run('data.schemaVersion'),3);
 assert.equal(e.run("data.cards['RA-001'].due"),'2026-11-14');
 assert.equal(e.run('data.revision'),7);
 assert.equal(e.run('data.coach.runs.length'),0);
 assert.equal(e.values.get('response-autonomy-v01'),raw);
});
test('v0.3 -> explicit save -> JSON export -> re-import keeps every old payload byte-equal',()=>{
 const e=env(JSON.stringify(legacy));
 assert.equal(e.run('save()'),true);
 const exported=JSON.parse(e.values.get('response-autonomy-v01'));
 assert.equal(exported.schemaVersion,3);
 assert.deepEqual(exported.cards,legacy.cards);
 assert.deepEqual(exported.history,legacy.history);
 assert.deepEqual(exported.writes,legacy.writes);
 assert.deepEqual(exported.dialogueHistory,[]);
 assert.equal(e.run('restoreBackup(JSON.parse('+JSON.stringify(JSON.stringify(exported))+'))'),'saved');
 assert.deepEqual(JSON.parse(e.run('JSON.stringify(data.cards)')),legacy.cards);
 assert.deepEqual(JSON.parse(e.run('JSON.stringify(data.history)')),legacy.history);
 assert.deepEqual(JSON.parse(e.run('JSON.stringify(data.writes)')),legacy.writes);
 assert.equal(e.run('JSON.stringify(data.coach)'),JSON.stringify({triggers:['A','B','D'],session:1,draft:null,runs:[],experiments:[]}));
});
test('restoreBackup keeps the exact pre-import snapshot on success',()=>{
 const raw=JSON.stringify(legacy),e=env(raw);
 assert.equal(e.run('restoreBackup(defaultData())'),'saved');
 assert.equal(e.values.get('response-autonomy-v01-before-import'),raw);
});
test('first import with no local record reports "none" instead of claiming a snapshot',()=>{
 const e=env();
 assert.equal(e.run('restoreBackup(defaultData())'),'none');
 assert.equal(e.values.has('response-autonomy-v01-before-import'),false);
});
test('quota failure on the main write leaves no orphan pre-import snapshot',()=>{
 const raw=JSON.stringify(legacy),e=env(raw,'response-autonomy-v01');
 assert.throws(()=>e.run('restoreBackup(defaultData())'));
 assert.equal(e.values.get('response-autonomy-v01'),raw);
 assert.equal(e.values.has('response-autonomy-v01-before-import'),false);
});
test('snapshot-only failure: import still succeeds, reports no snapshot and removes stale one',()=>{
 const raw=JSON.stringify(legacy),e=env(raw,'response-autonomy-v01-before-import');
 e.values.set('response-autonomy-v01-before-import','older-stale-snapshot');
 assert.equal(e.run('restoreBackup(defaultData())'),'failed');
 assert.equal(e.values.get('response-autonomy-v01'),e.run('JSON.stringify(data)'));
 assert.equal(e.values.has('response-autonomy-v01-before-import'),false);
 assert.equal(e.run('data.schemaVersion'),3);
});
test('transient form buffer uses a separate key and never touches the persistent record',()=>{
 const guard=fs.readFileSync(path.join(root,'form-guard.js'),'utf8');
 const dataSrc=fs.readFileSync(path.join(root,'data.js'),'utf8');
 assert.match(guard,/const UNSAVED_KEY='response-autonomy-v01-unsaved-v2'/);
 assert.ok(!guard.includes('localStorage'));
 assert.ok(!dataSrc.includes('UNSAVED_KEY'));
 assert.ok(!dataSrc.includes('sessionStorage'));
});
test('coach validation still accepts legacy-shaped records with arbitrary ids',()=>{
 const e=env();
 const x={kind:'real',id:'a"><b',status:'planned',date:'2026-11-08',at:'2026-11-08T04:00:00Z',context:'合成',prediction:'合成',action:'合成',before:null};
 e.run('data.coach.experiments.push('+JSON.stringify(x)+')');
 assert.equal(e.run('save()'),true);
 assert.equal(e.run('data.coach.experiments[0].id'),'a"><b');
});
test('self-check values are validated: allowed pass, unknown keys and values fail',()=>{
 const good=JSON.parse(JSON.stringify(legacy));good.history[0].self={fact:'guess',length:'long',pause:'no'};
 assert.doesNotThrow(()=>env().run('validateData('+JSON.stringify(good)+')'));
 const badValue=JSON.parse(JSON.stringify(legacy));badValue.history[0].self={fact:'maybe'};
 assert.throws(()=>env().run('validateData('+JSON.stringify(badValue)+')'),/自评取值无效/);
 const badKey=JSON.parse(JSON.stringify(legacy));badKey.history[0].self={mood:'x'};
 assert.throws(()=>env().run('validateData('+JSON.stringify(badKey)+')'),/自评包含未知字段/);
});
console.log(JSON.stringify({passed}));
