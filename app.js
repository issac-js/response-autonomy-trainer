
'use strict';
const CARDS=JSON.parse(document.getElementById('bank').textContent), byId=Object.fromEntries(CARDS.map(x=>[x.id,x]));
const root=document.getElementById('root');let page='home', session=[], current=null, picked=null, phase='pick', textDraft='', source='daily', timerHandle=null, remaining=15, timerExpired=false, selfDraft={}, mechGuess=null, aiText='', aiBusy=false, challengeLevel=null, challengeStep=0, challengeBusy=false;
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state=id=>data.cards[id]||{};let today=TODAY();let viewOptions=[], requestEpoch=0;
const startedToday=()=>CARDS.filter(c=>state(c.id).first===today).length;
const dueList=()=>CARDS.filter(c=>{const s=state(c.id);return s.fsrs?Date.parse(s.fsrs.due)<=Date.now():s.due&&s.due<=TODAY()}).sort((a,b)=>String(state(a.id).fsrs?.due||state(a.id).due).localeCompare(String(state(b.id).fsrs?.due||state(b.id).due)));
const freshList=()=>CARDS.filter(x=>!state(x.id).first);
const stats=()=>{const h=data.history,judged=h.filter(x=>typeof x.correct==='boolean');return {judged:judged.length,created:CARDS.filter(c=>state(c.id).first).length,correct:judged.filter(x=>x.correct).length,total:h.length,rate:judged.length?Math.round(judged.filter(x=>x.correct).length/judged.length*100):0,due:dueList().length,newRemain:Math.max(0,data.settings.newPerDay-startedToday())}};
const clearTimer=()=>{if(timerHandle){clearInterval(timerHandle);timerHandle=null}};
function clearPracticeStatus(){const status=document.getElementById('practiceStatus');if(status)status.textContent=''}
function setPage(p){clearPracticeStatus();requestEpoch++;if(typeof practiceRemember==='function')practiceRemember();clearTimer();stopVoice();if(page==='coach'&&data.coach?.draft&&!storageFault){if(!save())return;unsavedClear('coachSim')}current=null;page=p;render()}
function nav(){const active=page==='play'?(source==='single'?'bank':'home'):page;document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===active))}
function render(){today=TODAY();nav();if(storageFault&&page!=='settings'){root.innerHTML=`<section class="panel"><h2>已有记录需要恢复</h2><p class="notice" role="alert">${safe(storageFault)}</p><button class="primary" onclick="appSettings()">前往备份与恢复</button></section>`;return}if(page==='home')renderHome();if(page==='communication')renderCommunication();if(page==='quick')renderQuickPractice();if(page==='bank')renderBank();if(page==='coach')renderCoach();if(page==='stats'){renderStats();renderDialogueStats();renderCoachHistory()};if(page==='dialogue')renderDialogue();if(page==='settings')renderSettings();if(page==='play')renderPlay()}
function renderHome(){let s=stats(),done=data.history.filter(x=>x.date===today).length;root.innerHTML=`<section class="panel"><h2>今日训练</h2><div id="practiceResume"></div><p class="muted">每天先复习到期卡片，再学习新卡。先独立回应，再对照策略，最后按自己的表现自评。</p><div class="grid"><div class="stat"><strong>${s.due}</strong><span>到期复习</span></div><div class="stat"><strong>${s.newRemain}</strong><span>今日可学新卡</span></div><div class="stat"><strong>${done}</strong><span>今日卡片练习次数</span></div></div><div class="actions"><button class="primary" id="daily">开始今日训练</button><button class="secondary" id="random">混合自由练习</button><button class="secondary" id="quickHome" onclick="setPage('quick')">快速刷题 · 单选、多选、判断</button><button class="secondary" onclick="setPage('communication')">沟通方法：汇报、判断、接话与协调</button></div><p class="small muted">卡库 ${CARDS.length} 张，已接触 ${s.created} 张。自由练习不受每日新卡限制；完成自评的新卡计入今日已学数量。复习卡按到期时间出现。</p></section><section class="panel"><h2>针对 A＋B＋D 的自主回应练习</h2><p>先记录担心的结果，再完成三轮模拟，观察想追加解释的冲动，并用低风险真实交流核对预测。</p><button class="primary" onclick="coachOpen()">进入个人练习</button><h3>反应选择权：先不急着答</h3><div class="scene"><b>遇到突兀或带预设的问题</b><div class="quote">“怎么突然问这个？你指的是哪件具体的事？”</div></div><p>如果是职责内且事实清楚的问题，直接如实回答；如果涉及隐私、错误前提或权限，先澄清、纠正或拒绝。目标是做对判断，而不是一律防备别人。</p><div class="notice"><b>今日微练习：</b>遇到提问时，先默念“我有选择”，然后自然判断是否直接答。不要刻意制造紧张。</div></section>`;document.getElementById('daily').onclick=()=>start('daily');document.getElementById('random').onclick=()=>start('mixed')}
function start(kind,ids){requestEpoch++;challengeLevel=null;stopVoice();today=TODAY();source=kind;let due=dueList().map(c=>c.id),fresh=freshList().slice(0,Math.max(0,data.settings.newPerDay-startedToday())).map(c=>c.id);
if(ids)session=[...ids];else if(kind==='daily')session=[...due,...fresh];else session=[...CARDS.map(x=>x.id)].sort(()=>Math.random()-.5).slice(0,Math.min(10,CARDS.length));
if(!session.length){alert('目前没有到期卡或新卡。可以选择“混合自由练习”。');return}page='play';nav();advance()}
function renderBank(){let groups=[...new Set(CARDS.map(x=>x.group))];root.innerHTML=`<section class="panel"><h2>随机挑战</h2><p class="small muted">按难度实时生成新题，训练识别而不是背句子。需要联网；生成题不进入卡片库统计，但会记录在复盘历史。</p><div class="actions"><button class="secondary" data-challenge="ramp">难度递增</button><button class="secondary" data-challenge="hard">高难度</button><button class="secondary" data-challenge="hell">地狱</button></div></section><section class="panel"><h2>${CARDS.length}张情境卡片</h2><p class="muted">可按主题筛选，也可点击单张卡开始完整练习。浏览卡片不会自动泄露答案。</p><div class="filters"><select id="group"><option value="">全部主题</option>${groups.map(g=>`<option value="${safe(g)}">${safe(g)}</option>`).join('')}</select><input type="text" id="search" placeholder="搜索提问、情境或关键词" aria-label="搜索卡片"></div><div id="bankrows"></div></section>`;let g=document.getElementById('group'),s=document.getElementById('search');const update=()=>{let list=CARDS.filter(c=>(!g.value||c.group===g.value)&&(!s.value||[c.question,c.signal,c.scene,c.group].join(' ').includes(s.value.trim())));document.getElementById('bankrows').innerHTML=list.map(c=>`<div class="tablelike"><div><div><span class="tag">${safe(c.id)}</span> · ${safe(c.signal)} ${unsavedHas('single',c.id)?'<span class="tag">有未提交草稿</span>':''}</div><div class="small muted">${safe(c.question)}</div></div><button class="ghost" data-start="${c.id}">练习</button></div>`).join('')||'<p class="muted">无匹配卡片。</p>';document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start('single',[b.dataset.start]))};g.onchange=update;s.oninput=update;update();root.querySelectorAll('[data-challenge]').forEach(b=>b.onclick=()=>startChallenge(b.dataset.challenge));renderPreparation()}
const CHALLENGE_LABEL={ramp:'难度递增',hard:'高难',hell:'地狱'};
function challengeLevelFor(){if(challengeLevel==='hell')return '地狱';if(challengeLevel==='hard')return '高难';return challengeStep<3?'进阶':challengeStep<6?'高难':'地狱'}
async function startChallenge(level,step=0){challengeLevel=level;challengeStep=step;await generateNext()}
function startGenerated(card){if(typeof practiceEnable==='function')practiceEnable();requestEpoch++;stopVoice();clearTimer();source='challenge';current=card;session=[];viewOptions=card.options.map((_,i)=>i);for(let i=viewOptions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[viewOptions[i],viewOptions[j]]=[viewOptions[j],viewOptions[i]]}picked=null;phase='own';textDraft='';selfDraft={};mechGuess=null;aiText='';page='play';render()}
async function generateNext(){
 if(challengeBusy)return;
 const level=challengeLevelFor(),epoch=++requestEpoch;challengeBusy=true;stopVoice();clearTimer();current=null;
 root.innerHTML=`<section class="panel"><h2>随机挑战 · ${level}</h2><p class="muted">正在准备题目…</p><p class="small muted">AI生成需要等待；已有73张本地卡片可立即练习。离开后生成成功的题目会暂存，不会强制切页。</p><button class="secondary" id="genLocal">先练本地卡片，不等生成</button></section>`;
 document.getElementById('genLocal').onclick=()=>{challengeLevel=null;setPage('bank')};
 try{
  const card=takePrepared(level)||await aiGenerateCase(level);
  if(epoch!==requestEpoch){putPrepared(card);return;}startGenerated(card);
 }catch(e){
  if(epoch!==requestEpoch)return;
  root.innerHTML=`<section class="panel"><h2>随机挑战 · ${level}</h2><p class="notice small">${safe(aiErrorMessage(e))}</p><div class="actions"><button class="primary" id="genRetry">重试</button><button class="secondary" id="genBack">返回卡片库</button></div></section>`;
  document.getElementById('genRetry').onclick=()=>generateNext();
  document.getElementById('genBack').onclick=()=>{challengeLevel=null;setPage('bank')};
 }finally{challengeBusy=false}
}
function renderChallengeDone(){
 const next=challengeLevelFor();
 root.innerHTML=`<section class="panel"><h2>挑战完成一题</h2><p class="muted">已完成 ${challengeStep+1} 题。下一题难度：${next}。</p><div class="actions"><button class="primary" id="chNext">下一题</button><button class="secondary" id="chBank">返回卡片库</button></div><p class="small muted">生成题不进入卡片库统计，但会记录在复盘历史；左右两种选择都不影响已有复习进度。</p></section>`;
 document.getElementById('chNext').onclick=()=>{challengeStep++;generateNext()};
 document.getElementById('chBank').onclick=()=>{challengeLevel=null;setPage('bank')};
}
function renderStats(){let t=stats(),rate=t.rate;let recent=data.history.slice(-20).reverse();let groupStats={};for(let h of data.history.filter(x=>typeof x.correct==='boolean')){let g=byId[h.id]?.group||'其他';groupStats[g]??={total:0,correct:0};groupStats[g].total++;groupStats[g].correct+=h.correct?1:0}root.innerHTML=`<section class="panel"><h2>学习记录</h2><div class="grid"><div class="stat"><strong>${t.created}/${CARDS.length}</strong><span>已接触卡片</span></div><div class="stat"><strong>${t.total}</strong><span>总练习次数</span></div><div class="stat"><strong>${t.judged?rate+'%':'—'}</strong><span>已判策略正确率</span></div></div><div class="progressbar"><div class="progressfill" style="width:${t.created/CARDS.length*100}%"></div></div><p class="small muted">比例只统计已判分的选项，其他回应不计入。自由回应另行自评，不能用此比例替代现实沟通效果。</p></section><section class="panel"><h2>主题表现</h2>${Object.keys(groupStats).length?Object.entries(groupStats).map(([g,v])=>`<div class="tablelike"><span>${safe(g)}</span><span class="muted">${v.correct}/${v.total} · ${Math.round(v.correct/v.total*100)}%</span></div>`).join(''):'<p class="muted">尚无已判分的策略记录。</p>'}</section><section class="panel"><h2>自评倾向</h2><p class="small muted">只统计你主动勾选的三项，是反思提示，不是能力测量；样本少于 8 次不生成倾向。</p>${(()=>{const h=data.history.filter(x=>x.self&&typeof x.self==='object');const n=h.length;const c=(k,v)=>h.filter(x=>x.self[k]===v).length;const fact=c('fact','fact'),guess=c('fact','guess'),unsure=c('fact','unsure'),ok=c('length','ok'),long=c('length','long'),short=c('length','short'),yes=c('pause','yes'),no=c('pause','no'),pu=c('pause','unsure');let tip=null;if(n>=8){if(guess>fact)tip=['推测多于事实。下次先写你看到或听到的那一句。','单元 6 · 模糊请求先澄清'];else if(long>ok)tip=['偏长多于刚好。下次说完必要信息就停。','单元 4 · 事实够清楚就停'];else if(no>yes)tip=['说完后常又补充。下次试一次只说明一句。','单元 2 · 给自己一拍'];else tip=['三项相对稳定。继续保持“只改一个点”的节奏。','']}return `<div class="tablelike"><span>我说明的是</span><span class="muted">事实 ${fact} · 推测 ${guess} · 不确定 ${unsure}</span></div><div class="tablelike"><span>这次的篇幅</span><span class="muted">刚好 ${ok} · 偏长 ${long} · 偏短 ${short}</span></div><div class="tablelike"><span>说完后停住了吗</span><span class="muted">停住 ${yes} · 又补 ${no} · 不确定 ${pu}</span></div><p class="small">已自评 ${n} 次。${tip?`观察到的倾向：${tip[0]}${tip[1]?` → ${tip[1]}`:''}`:'样本还不够，先积累观察，不做结论。'}</p>`})()}</section><section class="panel"><h2>最近练习</h2>${recent.length?recent.map(h=>`<details><summary>${safe(h.id)} · ${safe(h.date)} · ${h.correct===null?'其他回应 · 未自动判分':h.correct?'策略判断合适':'策略判断可改进'}</summary>${generatedFor(h)?`<p><b>当时的问题：</b>${safe(generatedFor(h).question)}</p><p class="small muted">${safe(generatedFor(h).scene)}</p>`:''}<p class="small"><b>我的原话：</b>${safe(h.answer)}</p>${h.reflection?`<p class="small"><b>我的复盘：</b>${safe(h.reflection)}</p>`:''}<p class="small muted">自评：${safe(({again:'需要再练',hard:'勉强做到',good:'独立做到',easy:'轻松做到'})[h.grade])}</p></details>`).join(''):'<p class="muted">开始练习后会显示记录。</p>'}</section>`}
function download(name,content,type){let b=new Blob([content],{type:type+';charset=utf-8'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}

// v0.2 branching dialogue simulation. Fixed authored branches; no model inference.
const SCENARIOS=JSON.parse(document.getElementById('dialogue-bank').textContent);
let dialogueState=null;
// Transient dialogue progress (per tab). Lets a reload resume the same scenario
// at the same turn, instead of dropping the only copy of the wording.
const DIALOGUE_KEY='response-autonomy-v01-dialogue-v1';
function dialogueSaved(){try{const raw=sessionStorage.getItem(DIALOGUE_KEY);const s=raw?JSON.parse(raw):null;return s&&typeof s==='object'?s:null}catch(e){return null}}
function dialogueSave(){
 try{
  const d=dialogueState;
  const empty=!d||d.finished||(!d.draft.trim()&&!d.steps.length&&d.selected===null&&!d.ready);
  if(empty){sessionStorage.removeItem(DIALOGUE_KEY);return}
  sessionStorage.setItem(DIALOGUE_KEY,JSON.stringify({scenario:d.scenario.id,node:d.node,turn:d.turn,selected:d.selected,ready:d.ready,draft:d.draft,steps:d.steps,referenceOnly:!!d.referenceOnly}));
 }catch(e){}
}
function dialogueResume(id){
 const s=dialogueSaved();if(!s||s.scenario!==id)return null;
 const sc=SCENARIOS.find(x=>x.id===id);
 if(!sc||typeof s.node!=='string'||!sc.nodes[s.node]||!Number.isInteger(s.turn)||s.turn<0||s.turn>2||!Array.isArray(s.steps))return null;
 return {scenario:sc,node:s.node,turn:s.turn,selected:s.selected===null||s.selected===undefined?null:(Number.isInteger(s.selected)?s.selected:null),ready:!!s.ready,draft:typeof s.draft==='string'?s.draft:'',steps:s.steps,referenceOnly:s.referenceOnly===true,finished:false};
}
function dialogueClear(){try{sessionStorage.removeItem(DIALOGUE_KEY)}catch(e){}}
function renderDialogue(){
  if(!dialogueState){
    const h=Array.isArray(data.dialogueHistory)?data.dialogueHistory:[];
    const last=h.length?h[h.length-1]:null;
    root.innerHTML=`<section class="panel"><h2>多轮对话模拟 · ${SCENARIOS.length}个情境</h2><p class="muted">每轮先<strong>自己写一句回答</strong>，再选择与你实际回应最接近的行动。对方的下一句话会根据所选行动改变。幽默只是可选策略，不是通关秘诀。</p><div class="notice"><b>判分边界：</b>系统仅对你选择的预设行动作规则反馈，不分析自由文本，也不能检测对方真实动机。请勿把模拟成绩当作现实能力证明。</div><p class="small muted">已完成 ${h.length} 轮多轮模拟${last?' · 最近一次 '+safe(last.scenario):''}</p>${(()=>{const s=dialogueSaved();if(!s)return'';const sc=SCENARIOS.find(x=>x.id===s.scenario);return `<p class="notice small">已保留未完成的多轮模拟：${safe(sc?sc.title:s.scenario)} · 第${(Number(s.turn)||0)+1}轮。点击同一情境可继续，退出或完成后清除。</p>`})()}<div class="dialoguegrid">${SCENARIOS.map(sc=>`<button class="dialogue-tile" data-scene="${safe(sc.id)}"><b>${safe(sc.title)}</b><span class="small muted">${sc.tags.map(t=>'#'+safe(t)).join(' ')}</span><span class="small">开始模拟 →</span></button>`).join('')}</div></section><section class="panel"><h2>学习目的</h2><p>不是识破谁有恶意，而是训练“直接答 / 澄清 / 幽默 / 边界 / 修正 / 沉默 / 正常履职”的灵活切换。每个情境包含三轮对话和真实分支。</p></section>`;
    root.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>startDialogue(b.dataset.scene));
    return;
  }
  const ds=dialogueState,sc=ds.scenario,node=sc.nodes[ds.node];
  if(ds.finished){renderDialogueFinished();return}
  const selected=ds.selected;
  const header=`<section class="panel"><div class="split"><span class="pill">${safe(sc.id)}</span><span class="step">第${ds.turn+1}轮 · 预计3轮</span></div><h2>${safe(sc.title)}</h2><p class="muted small">${safe(sc.context)}</p><div class="scene"><span class="small muted">对方说：</span><div class="quote">“${safe(node.line)}”</div></div>`;
  if(selected===null){
    if(!ds.ready){
      root.innerHTML=header+`<label class="prompt-label" for="dialogueOwn">第一步 · 先自己回答（建议出声说一遍再输入）</label><div id="voice-slot"></div><textarea id="dialogueOwn"${unsavedAttrs('dialogue',sc.id,String(ds.turn),'own')} aria-label="自己的口头回应" maxlength="1200" placeholder="写下你当场会说的一到三句话……">${safe(ds.draft)}</textarea><p class="small muted">先自主作答，不显示候选行动，避免提前看到选项才想出答案。</p><div class="actions"><button class="primary" id="commitReply" disabled>确认我的回答 · 查看行动选项</button><button class="ghost" id="dialogueBack">退出本轮</button></div></section>`;
      const own=document.getElementById('dialogueOwn'),commit=document.getElementById('commitReply');
      function sync(){ds.draft=own.value;commit.disabled=!own.value.trim();dialogueSave()}
      own.addEventListener('input',sync);sync();mountVoice('voice-slot');
      firstTap(commit,()=>{if(!ds.draft.trim())return;stopVoice();ds.ready=true;dialogueSave();renderDialogue()});
      document.getElementById('dialogueBack').onclick=()=>{if(confirm('退出当前模拟？本轮尚未完成的练习不会保存。')){stopVoice();unsavedClear('dialogue',sc.id);dialogueClear();dialogueState=null;renderDialogue()}};
    }else{
      root.innerHTML=header+`<h3>${ds.referenceOnly?'第二步 · 选一条参考路线探索':'第二步 · 选择与你原话最接近的行动'}</h3><div class="quote-reply"><b>你的原话：</b>${safe(ds.draft)}</div><p class="small muted">这里是预设脚本，不会根据你的原话推断对方反应。没有匹配项也可保留原话，选择一条参考路线探索；这不代表你实际这样回答。</p>${ds.referenceOnly?'<p class="notice" role="status">已标记为参考路线：本轮不会记为原话与行动一致。</p>':'<button class="secondary" id="dialogueUnmatched">没有匹配项 · 仅探索参考路线</button>'}<div id="branchOptions">${node.options.map((opt,i)=>`<button class="option" data-dialogue-choice="${i}">${safe(opt.text)}</button>`).join('')}</div><p class="small muted">已保留先前独立作答的原话，选项出现后不再改写。</p></section>`;
      const unmatched=document.getElementById('dialogueUnmatched');if(unmatched)unmatched.onclick=()=>{ds.referenceOnly=true;dialogueSave();renderDialogue()};
      root.querySelectorAll('[data-dialogue-choice]').forEach(b=>firstTap(b,()=>pickDialogue(Number(b.dataset.dialogueChoice))));
    }
  }else{
    const opt=node.options[selected];
    root.innerHTML=header+`<div class="feedback ${opt.score===2?'good':opt.score===0?'bad':''}"><b>参考行动：${opt.score===2?'较合适的应对':opt.score===1?'部分有效，仍可优化':'这类反应容易引出新的问题'}</b><p>${safe(opt.reason)}</p><p class="small"><b>你的原话：</b>${safe(ds.draft)}</p><p class="small"><b>所选模拟行动：</b>${safe(opt.text)}</p></div><div class="notice small">以上只评价所选参考行动，未评价你的原话。不一致或不确定时，不要勾选；可按参考分支继续探索，或返回重练。不需要把自己改写成示范原句。</div><label class="small"><input type="checkbox" id="realMatch" ${ds.referenceOnly?'disabled':''}> 我写的原话与所选行动大体一致</label><div class="actions"><button class="primary" id="dialogueNext">${opt.next?'按参考分支查看下一句':'完成参考分支并查看复盘'}</button><button class="secondary" id="dialogueRevise">不一致 · 返回重练这一轮</button></div></section>`;
    firstTap(document.getElementById('dialogueNext'),()=>nextDialogue(!ds.referenceOnly&&document.getElementById('realMatch').checked));
    document.getElementById('dialogueRevise').onclick=()=>{ds.ready=false;ds.selected=null;ds.referenceOnly=false;dialogueSave();renderDialogue()};
  }
}
function startDialogue(id){clearPracticeStatus();requestEpoch++;challengeLevel=null;stopVoice();let sc=SCENARIOS.find(x=>x.id===id);if(!sc)return;dialogueState=dialogueResume(id)||{scenario:sc,node:sc.start,turn:0,selected:null,ready:false,draft:'',steps:[],finished:false};page='dialogue';render()}
function pickDialogue(i){let ds=dialogueState;if(!ds||ds.selected!==null||!ds.draft.trim())return;let opts=ds.scenario.nodes[ds.node].options;if(i<0||i>=opts.length)return;ds.selected=i;dialogueSave();renderDialogue()}
function nextDialogue(match){
 const ds=dialogueState;if(!ds||ds.selected===null)return;
 const node=ds.scenario.nodes[ds.node],opt=node.options[ds.selected];
 match=!ds.referenceOnly&&!!match;
 ds.steps.push({turn:ds.turn+1,prompt:node.line,own:ds.draft.slice(0,1200),chosen:opt.text,score:opt.score,reason:opt.reason,match:!!match});
 // The committed turn is now part of the steps; its transient copy is no longer needed.
 unsavedClear('dialogue',ds.scenario.id);
 if(opt.next){ds.node=opt.next;ds.turn++;ds.selected=null;ds.ready=false;ds.referenceOnly=false;ds.draft='';dialogueSave();renderDialogue();return}
 data.dialogueHistory ||= [];
 data.dialogueHistory.push({date:TODAY(),scenario:ds.scenario.id,title:ds.scenario.title,steps:ds.steps,score:ds.steps.reduce((a,x)=>a+x.score,0),max:ds.steps.length*2});
 if(!save()){ds.steps.pop();dialogueSave();return}
 ds.finished=true;dialogueClear();renderDialogueFinished();
}
function renderDialogueFinished(){
 const ds=dialogueState,steps=ds.steps,total=steps.reduce((a,x)=>a+x.score,0),max=steps.length*2;
 root.innerHTML=`<section class="panel"><span class="pill">完整模拟已完成</span><h2>${safe(ds.scenario.title)}</h2><p>完成脚本只是第一步。接下来只带走一个判断、练一句自己的话，再到低风险交流中试一次。</p><details><summary>查看脚本选择与自评记录（不代表现实能力）</summary><div class="grid"><div class="stat"><strong>${total}/${max}</strong><span>选择策略得分</span></div><div class="stat"><strong>${steps.filter(x=>x.match).length}/${steps.length}</strong><span>自评：原话与选项一致</span></div><div class="stat"><strong>${steps.length}</strong><span>完成的对话轮数</span></div></div><p class="muted small">得分只代表预设策略选择；一致轮数也是你的自评，不是能力测量。选对参考行动不等于已经能独立说出来。</p></details>${steps.map(x=>`<details><summary>第${x.turn}轮 · ${x.score===2?'较合适':x.score===1?'部分有效':'有待改进'}</summary><div class="small"><b>对方：</b>${safe(x.prompt)}</div><div class="small"><b>你写的：</b>${safe(x.own)}</div><div class="small"><b>选的：</b>${safe(x.chosen)}</div><div class="small"><b>解析：</b>${safe(x.reason)}</div></details>`).join('')}<section class="notice" aria-label="模拟后的内化步骤"><h3>练完之后：理解 → 说出 → 变式 → 实践</h3><ol><li><b>只选一轮：</b>展开上面的原话与参考行动，找一个值得保留或调整的判断，不要求每轮都完美。</li><li><b>收起示范再说一次：</b>用自己的话口头回应，再重新练这一个场景；无需背参考句。</li><li><b>改变条件：</b>如果换成熟悉朋友倾诉、正式职责核查，或事实尚不清楚，还会这样说吗？在“沟通方法”中练条件变化。</li><li><b>低风险试一次：</b>写一个具体预测和小动作，之后记录实际观察；结果未知也可保存。复盘一次后回到生活，不必反复检查自己。</li></ol><p>进步可以是更能察觉、独立表达、按反馈调整与修复，不要求焦虑归零或对方立即满意。</p></section><p id="dialogueTransferStatus" class="small" role="status"></p><div class="actions"><button class="primary" id="againScene">收起示范 · 再练本场景</button><button class="secondary" id="dialogueVariant">到沟通方法练条件变化</button><button class="secondary" id="dialogueTransfer">填写一次真实交流计划</button><button class="secondary" id="sceneHome">返回情境库</button></div></section>`;
 document.getElementById('dialogueVariant').onclick=()=>setPage('communication');
 document.getElementById('dialogueTransfer').onclick=()=>openRealPractice('', 'dialogueTransferStatus');
 document.getElementById('againScene').onclick=()=>startDialogue(ds.scenario.id);
 document.getElementById('sceneHome').onclick=()=>{stopVoice();unsavedClear('dialogue',ds.scenario.id);dialogueClear();dialogueState=null;renderDialogue()};
}
function renderDialogueStats(){
 const hist=Array.isArray(data.dialogueHistory)?data.dialogueHistory:[];
 const recent=hist.slice(-6).reverse();
 root.insertAdjacentHTML('beforeend',`<section class="panel"><h2>多轮对话练习记录</h2><p class="muted small">模拟成绩是预设选项评分，自由表达仍依赖自评和现实复盘。</p><div class="grid"><div class="stat"><strong>${hist.length}</strong><span>完成的模拟</span></div><div class="stat"><strong>${hist.length?Math.round(100*hist.reduce((a,x)=>a+x.score,0)/Math.max(1,hist.reduce((a,x)=>a+x.max,0))):0}%</strong><span>策略选择得分率</span></div><div class="stat"><strong>${hist.reduce((a,x)=>a+x.steps.length,0)}</strong><span>对话轮次</span></div></div>${recent.map(x=>`<div class="tablelike"><div><b>${safe(x.title||x.scenario)}</b><div class="small muted">${safe(x.date)}</div></div><span class="small">${x.score}/${x.max}</span></div>`).join('')||'<p class="small muted">尚未完成多轮模拟。</p>'}</section>`);
}

window.appSettings=()=>setPage('settings');window.appBack=()=>setPage('home');window.appMix=()=>start('mixed');document.querySelectorAll('[data-nav]').forEach(x=>x.onclick=()=>setPage(x.dataset.nav));render();
