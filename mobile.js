// Local practice continuity. Persisting private text beyond the tab is opt-in.
const PRACTICE_KEY='response-autonomy-practice-v1',KEEP_KEY='response-autonomy-keep-drafts';
let practiceRestoring=false,practiceSuppressed=false;
function keepDrafts(){try{return localStorage.getItem(KEEP_KEY)==='yes'}catch(e){return false}}
function practiceRead(){
 try{
  const raw=sessionStorage.getItem(PRACTICE_KEY)||(keepDrafts()?localStorage.getItem(PRACTICE_KEY):null);
  const s=raw?JSON.parse(raw):null;
  if(!s||s.version!==1||!Number.isFinite(s.at))return null;
  if(Date.now()-s.at>7*86400000||s.at>Date.now()+300000){practiceClear();return null}
  if(!s.card)return null;const c=byId[s.card.id]||s.card;if(!byId[c.id]&&!validGeneratedSnapshot(c))return null;
  if(!['own','pick','rate'].includes(s.phase)||!Array.isArray(s.queue)||s.queue.length>CARDS.length||!s.queue.every(id=>byId[id]))return null;
  if(typeof s.answer!=='string'||s.answer.length>1500||typeof s.reflection!=='string'||s.reflection.length>1000)return null;
  if(!Array.isArray(s.options)||s.options.length!==c.options.length||new Set(s.options).size!==c.options.length||!s.options.every(n=>Number.isInteger(n)&&n>=0&&n<c.options.length))return null;
  if(s.phase==='rate'&&!['skip','other',0,1,2,3].includes(s.picked))return null;
  return s;
 }catch(e){return null}
}
function practiceRemember(){
 if(practiceRestoring||practiceSuppressed||page!=='play'||!current)return;
 const value={version:1,at:Date.now(),card:current,queue:session,phase,picked,answer:textDraft,reflection:document.getElementById('reflection')?.value||'',options:viewOptions,self:selfDraft,mech:mechGuess,source,challengeLevel,challengeStep};
 try{
  const raw=JSON.stringify(value);sessionStorage.setItem(PRACTICE_KEY,raw);
  if(keepDrafts())localStorage.setItem(PRACTICE_KEY,raw);
 }catch(e){document.getElementById('practiceStatus').textContent='进度暂存失败，请先保存或导出记录。'}
}
function practiceEnable(){practiceSuppressed=false}
function practiceClear(){practiceSuppressed=true;try{sessionStorage.removeItem(PRACTICE_KEY);localStorage.removeItem(PRACTICE_KEY)}catch(e){}}
function practiceResume(){
 const s=practiceRead();if(!s)return;
 practiceSuppressed=false;practiceRestoring=true;requestEpoch++;stopVoice();clearTimer();
 current=byId[s.card.id]||s.card;session=s.queue;phase=s.phase;picked=s.picked;textDraft=s.answer;viewOptions=s.options;
 selfDraft=Object.fromEntries(SELF_ROWS.filter(r=>r.opts.some(o=>o[0]===s.self?.[r.k])).map(r=>[r.k,s.self[r.k]]));
 mechGuess=typeof s.mech==='string'?s.mech:null;source=['daily','single','mixed','targeted','challenge'].includes(s.source)?s.source:'single';
 challengeLevel=['hard','hell','ramp'].includes(s.challengeLevel)?s.challengeLevel:null;challengeStep=Number.isSafeInteger(s.challengeStep)&&s.challengeStep>=0?s.challengeStep:0;
 page='play';render();
 const reflection=document.getElementById('reflection');if(reflection)reflection.value=s.reflection;
 practiceRestoring=false;mobileRefresh();
}
function practiceLeave(){
 if(page==='coach'&&data.coach.draft)coachSyncInput();
 practiceRemember();setPage('home');
}
function mobileRefresh(){
 const active=(page==='play'&&!!current)||(page==='dialogue'&&!!dialogueState&&!dialogueState.finished)||(page==='coach'&&!!data.coach.draft);
 document.body.classList.toggle('in-practice',active);
 const bar=document.getElementById('practiceBar');bar.hidden=!active;
 document.getElementById('practiceStep').textContent=page==='play'?`回应 → 策略 → 自评 · ${phase==='own'?'1':phase==='pick'?'2':'3'}/3`:page==='dialogue'?`多轮模拟 · 第${(dialogueState?.turn||0)+1}轮`:'三轮自主回应练习';
 const resume=document.getElementById('practiceResume'),saved=practiceRead();
 if(resume&&saved&&!resume.firstChild){const button=document.createElement('button');button.className='secondary';button.textContent='继续上次卡片练习';button.onclick=practiceResume;resume.appendChild(button)}
 // Fixed controls reserve their measured height, including text enlargement.
 const actions=root.querySelector('.grade-actions')||root.querySelector('#commitSingle, #commitReply, #coachCommit, #dialogueNext, #coachFinish')?.closest('.actions');
 root.querySelectorAll('.mobile-actions').forEach(el=>{if(el!==actions)el.classList.remove('mobile-actions')});
 if(actions)actions.classList.add('mobile-actions');
 const fixed=actions&&getComputedStyle(actions).position==='fixed';
 document.documentElement.style.setProperty('--action-clearance',fixed?Math.ceil(actions.getBoundingClientRect().height+24)+'px':'0px');
 practiceRemember();
}
function keyboardTarget(el){return el&&((el.tagName==='INPUT'&&!/^(checkbox|radio|range|button|submit|reset|file|color|hidden)$/i.test(el.type))||/^(TEXTAREA|SELECT)$/.test(el.tagName))}
let blurTimer;
function keyboardFinish(){clearTimeout(blurTimer);if(!keyboardTarget(document.activeElement))document.body.classList.remove('keyboard-open');mobileRefresh()}
document.addEventListener('focusin',e=>{if(matchMedia('(pointer: coarse)').matches&&keyboardTarget(e.target)){clearTimeout(blurTimer);document.body.classList.add('keyboard-open');mobileRefresh()}});
document.addEventListener('focusout',()=>{blurTimer=setTimeout(keyboardFinish,300)});
document.addEventListener('click',keyboardFinish);
document.addEventListener('input',()=>{practiceEnable();queueMicrotask(practiceRemember)});
window.addEventListener('pagehide',practiceRemember);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')practiceRemember()});
window.addEventListener('resize',mobileRefresh);window.visualViewport?.addEventListener('resize',mobileRefresh);
new MutationObserver(()=>{mobileRefresh();if(document.body.classList.contains('in-practice')){window.scrollTo(0,0);const heading=root.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}}).observe(root,{childList:true});
const actionObserver=new ResizeObserver(()=>{const actions=root.querySelector('.mobile-actions');if(actions&&getComputedStyle(actions).position==='fixed')document.documentElement.style.setProperty('--action-clearance',Math.ceil(actions.getBoundingClientRect().height+24)+'px')});
new MutationObserver(()=>{actionObserver.disconnect();const actions=root.querySelector('.mobile-actions');if(actions)actionObserver.observe(actions)}).observe(root,{childList:true});
document.getElementById('practiceBack').onclick=practiceLeave;
mobileRefresh();

// Question cache is deliberately separate from the schema-3 learning backup.
const GENERATED_KEY='response-autonomy-generated-v1';
function generatedCache(){try{const o=JSON.parse(localStorage.getItem(GENERATED_KEY)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{}}catch(e){return {}}}
function generatedKey(entry){return entry.id+'|'+entry.at}
function generatedFor(entry){const c=generatedCache()[generatedKey(entry)];return validGeneratedSnapshot(c)?c:null}
function generatedRemember(entry,card){try{const cache=generatedCache();cache[generatedKey(entry)]=card;localStorage.setItem(GENERATED_KEY,JSON.stringify(cache));return true}catch(e){return false}}

function generatedReserve(used){
 const key='response-autonomy-generated-reserved-v1';
 let reserved=[];
 try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))reserved=saved.filter(id=>typeof id==='string'&&/^RA-\d{3}$/.test(id))}catch(e){}
 for(const id of reserved)used.add(id);
 const id=Array.from({length:926},(_,i)=>'RA-'+String(i+74).padStart(3,'0')).find(id=>!used.has(id));
 if(!id)throw Error('随机题编号已用完；现有记录已保留，请先导出备份。');
 try{localStorage.setItem(key,JSON.stringify([...reserved,id]))}catch(e){throw Error('无法保留随机题编号，请检查本机存储空间后重试。')}
 return id;
}
