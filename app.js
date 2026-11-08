
'use strict';
const CARDS=JSON.parse(document.getElementById('bank').textContent), byId=Object.fromEntries(CARDS.map(x=>[x.id,x]));
const root=document.getElementById('root');let page='home', session=[], current=null, picked=null, phase='pick', textDraft='', source='daily', timerHandle=null, remaining=15, timerExpired=false;
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state=id=>data.cards[id]||{};let today=TODAY();let viewOptions=[];
const startedToday=()=>Object.values(data.cards).filter(x=>x.first===today).length;
const dueList=()=>CARDS.filter(c=>{const s=state(c.id);return s.fsrs?Date.parse(s.fsrs.due)<=Date.now():s.due&&s.due<=TODAY()}).sort((a,b)=>String(state(a.id).fsrs?.due||state(a.id).due).localeCompare(String(state(b.id).fsrs?.due||state(b.id).due)));
const freshList=()=>CARDS.filter(x=>!state(x.id).first);
const stats=()=>{const h=data.history,judged=h.filter(x=>typeof x.correct==='boolean');return {judged:judged.length,created:CARDS.filter(c=>state(c.id).first).length,correct:judged.filter(x=>x.correct).length,total:h.length,rate:judged.length?Math.round(judged.filter(x=>x.correct).length/judged.length*100):0,due:dueList().length,newRemain:Math.max(0,data.settings.newPerDay-startedToday())}};
const clearTimer=()=>{if(timerHandle){clearInterval(timerHandle);timerHandle=null}};
function setPage(p){clearTimer();stopVoice();if(page==='coach'&&data.coach?.draft&&!storageFault){if(!save())return;unsavedClear('coachSim:')}current=null;page=p;render()}
function nav(){const active=page==='play'?(source==='single'?'bank':'home'):page;document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===active))}
function render(){today=TODAY();nav();if(storageFault&&page!=='settings'){root.innerHTML=`<section class="panel"><h2>已有记录需要恢复</h2><p class="notice" role="alert">${safe(storageFault)}</p><button class="primary" onclick="appSettings()">前往备份与恢复</button></section>`;return}if(page==='home')renderHome();if(page==='bank')renderBank();if(page==='coach')renderCoach();if(page==='stats'){renderStats();renderDialogueStats();renderCoachHistory()};if(page==='dialogue')renderDialogue();if(page==='settings')renderSettings();if(page==='play')renderPlay()}
function renderHome(){let s=stats(),done=data.history.filter(x=>x.date===today).length;root.innerHTML=`<section class="panel"><h2>今日训练</h2><p class="muted">每天先复习到期卡片，再学习新卡。先独立回应，再对照策略，最后按自己的表现自评。</p><div class="grid"><div class="stat"><strong>${s.due}</strong><span>到期复习</span></div><div class="stat"><strong>${s.newRemain}</strong><span>今日可学新卡</span></div><div class="stat"><strong>${done}</strong><span>今日卡片练习次数</span></div></div><div class="actions"><button class="primary" id="daily">开始今日训练</button><button class="secondary" id="random">混合自由练习</button></div><p class="small muted">卡库 ${CARDS.length} 张，已接触 ${s.created} 张。自由练习不受每日新卡限制；完成自评的新卡计入今日已学数量。复习卡按到期时间出现。</p></section><section class="panel"><h2>针对 A＋B＋D 的自主回应练习</h2><p>先记录担心的结果，再完成三轮模拟，观察想追加解释的冲动，并用低风险真实交流核对预测。</p><button class="primary" onclick="coachOpen()">进入个人练习</button><h3>反应选择权：先不急着答</h3><div class="scene"><b>遇到突兀或带预设的问题</b><div class="quote">“怎么突然问这个？你指的是哪件具体的事？”</div></div><p>如果是职责内且事实清楚的问题，直接如实回答；如果涉及隐私、错误前提或权限，先澄清、纠正或拒绝。目标是做对判断，而不是一律防备别人。</p><div class="notice"><b>今日微练习：</b>遇到提问时，先默念“我有选择”，然后自然判断是否直接答。不要刻意制造紧张。</div></section>`;document.getElementById('daily').onclick=()=>start('daily');document.getElementById('random').onclick=()=>start('mixed')}
function start(kind,ids){stopVoice();unsavedClear('single:');today=TODAY();source=kind;let due=dueList().map(c=>c.id),fresh=freshList().slice(0,Math.max(0,data.settings.newPerDay-startedToday())).map(c=>c.id);
if(ids)session=[...ids];else if(kind==='daily')session=[...due,...fresh];else session=[...CARDS.map(x=>x.id)].sort(()=>Math.random()-.5).slice(0,Math.min(10,CARDS.length));
if(!session.length){alert('目前没有到期卡或新卡。可以选择“混合自由练习”。');return}page='play';nav();advance()}
function renderBank(){let groups=[...new Set(CARDS.map(x=>x.group))];root.innerHTML=`<section class="panel"><h2>53张情境卡片</h2><p class="muted">可按主题筛选，也可点击单张卡开始完整练习。浏览卡片不会自动泄露答案。</p><div class="filters"><select id="group"><option value="">全部主题</option>${groups.map(g=>`<option value="${safe(g)}">${safe(g)}</option>`).join('')}</select><input type="text" id="search" placeholder="搜索提问、情境或关键词" aria-label="搜索卡片"></div><div id="bankrows"></div></section>`;let g=document.getElementById('group'),s=document.getElementById('search');const update=()=>{let list=CARDS.filter(c=>(!g.value||c.group===g.value)&&(!s.value||[c.question,c.signal,c.scene,c.group].join(' ').includes(s.value.trim())));document.getElementById('bankrows').innerHTML=list.map(c=>`<div class="tablelike"><div><div><span class="tag">${safe(c.id)}</span> · ${safe(c.signal)}</div><div class="small muted">${safe(c.question)}</div></div><button class="ghost" data-start="${c.id}">练习</button></div>`).join('')||'<p class="muted">无匹配卡片。</p>';document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start('single',[b.dataset.start]))};g.onchange=update;s.oninput=update;update()}
function renderStats(){let t=stats(),rate=t.rate;let recent=data.history.slice(-20).reverse();let groupStats={};for(let h of data.history.filter(x=>typeof x.correct==='boolean')){let g=byId[h.id]?.group||'其他';groupStats[g]??={total:0,correct:0};groupStats[g].total++;groupStats[g].correct+=h.correct?1:0}root.innerHTML=`<section class="panel"><h2>学习记录</h2><div class="grid"><div class="stat"><strong>${t.created}/${CARDS.length}</strong><span>已接触卡片</span></div><div class="stat"><strong>${t.total}</strong><span>总练习次数</span></div><div class="stat"><strong>${t.judged?rate+'%':'—'}</strong><span>已判策略正确率</span></div></div><div class="progressbar"><div class="progressfill" style="width:${t.created/CARDS.length*100}%"></div></div><p class="small muted">比例只统计已判分的选项，其他回应不计入。自由回应另行自评，不能用此比例替代现实沟通效果。</p></section><section class="panel"><h2>主题表现</h2>${Object.keys(groupStats).length?Object.entries(groupStats).map(([g,v])=>`<div class="tablelike"><span>${safe(g)}</span><span class="muted">${v.correct}/${v.total} · ${Math.round(v.correct/v.total*100)}%</span></div>`).join(''):'<p class="muted">尚无已判分的策略记录。</p>'}</section><section class="panel"><h2>最近练习</h2>${recent.length?recent.map(h=>`<details><summary>${safe(h.id)} · ${safe(h.date)} · ${h.correct===null?'其他回应 · 未自动判分':h.correct?'策略判断合适':'策略判断可改进'}</summary><p class="small"><b>我的原话：</b>${safe(h.answer)}</p>${h.reflection?`<p class="small"><b>我的复盘：</b>${safe(h.reflection)}</p>`:''}<p class="small muted">自评：${safe(({again:'需要再练',hard:'勉强做到',good:'独立做到',easy:'轻松做到'})[h.grade])}</p></details>`).join(''):'<p class="muted">开始练习后会显示记录。</p>'}</section>`}
function download(name,content,type){let b=new Blob([content],{type:type+';charset=utf-8'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}

// v0.2 branching dialogue simulation. Fixed authored branches; no model inference.
const SCENARIOS=JSON.parse(document.getElementById('dialogue-bank').textContent);
let dialogueState=null;
function renderDialogue(){
  if(!dialogueState){
    const h=Array.isArray(data.dialogueHistory)?data.dialogueHistory:[];
    const last=h.length?h[h.length-1]:null;
    root.innerHTML=`<section class="panel"><h2>多轮对话模拟 · 8个情境</h2><p class="muted">每轮先<strong>自己写一句回答</strong>，再选择与你实际回应最接近的行动。对方的下一句话会根据所选行动改变。幽默只是可选策略，不是通关秘诀。</p><div class="notice"><b>判分边界：</b>系统仅对你选择的预设行动作规则反馈，不分析自由文本，也不能检测对方真实动机。请勿把模拟成绩当作现实能力证明。</div><p class="small muted">已完成 ${h.length} 轮多轮模拟${last?' · 最近一次 '+safe(last.scenario):''}</p><div class="dialoguegrid">${SCENARIOS.map(sc=>`<button class="dialogue-tile" data-scene="${safe(sc.id)}"><b>${safe(sc.title)}</b><span class="small muted">${sc.tags.map(t=>'#'+safe(t)).join(' ')}</span><span class="small">开始模拟 →</span></button>`).join('')}</div></section><section class="panel"><h2>学习目的</h2><p>不是识破谁有恶意，而是训练“直接答 / 澄清 / 幽默 / 边界 / 修正 / 沉默 / 正常履职”的灵活切换。每个情境包含三轮对话和真实分支。</p></section>`;
    root.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>startDialogue(b.dataset.scene));
    return;
  }
  const ds=dialogueState,sc=ds.scenario,node=sc.nodes[ds.node];
  if(ds.finished){renderDialogueFinished();return}
  const selected=ds.selected;
  const header=`<section class="panel"><div class="split"><span class="pill">${safe(sc.id)}</span><span class="step">第${ds.turn+1}轮 · 预计3轮</span></div><h2>${safe(sc.title)}</h2><p class="muted small">${safe(sc.context)}</p><div class="scene"><span class="small muted">对方说：</span><div class="quote">“${safe(node.line)}”</div></div>`;
  if(selected===null){
    if(!ds.ready){
      root.innerHTML=header+`<label class="prompt-label" for="dialogueOwn">第一步 · 先自己回答（建议出声说一遍再输入）</label><div id="voice-slot"></div><textarea id="dialogueOwn" data-unsaved="dialogue:dialogueOwn" aria-label="自己的口头回应" maxlength="1200" placeholder="写下你当场会说的一到三句话……">${safe(ds.draft)}</textarea><p class="small muted">先自主作答，不显示候选行动，避免提前看到选项才想出答案。</p><div class="actions"><button class="primary" id="commitReply" disabled>确认我的回答 · 查看行动选项</button><button class="ghost" id="dialogueBack">退出本轮</button></div></section>`;
      const own=document.getElementById('dialogueOwn'),commit=document.getElementById('commitReply');
      function sync(){ds.draft=own.value;commit.disabled=!own.value.trim()}
      own.addEventListener('input',sync);sync();mountVoice('voice-slot');
      commit.onclick=()=>{if(!ds.draft.trim())return;stopVoice();ds.ready=true;renderDialogue()};
      document.getElementById('dialogueBack').onclick=()=>{if(confirm('退出当前模拟？本轮尚未完成的练习不会保存。')){stopVoice();unsavedClear('dialogue:');dialogueState=null;renderDialogue()}};
    }else{
      root.innerHTML=header+`<h3>第二步 · 选择与你原话最接近的行动</h3><div class="quote-reply"><b>你的原话：</b>${safe(ds.draft)}</div><p class="small muted">系统只会评估所选行动的适当性，请如实选择最接近你自己原话的选项。</p><div id="branchOptions">${node.options.map((opt,i)=>`<button class="option" data-dialogue-choice="${i}">${safe(opt.text)}</button>`).join('')}</div><p class="small muted">已保留先前独立作答的原话，选项出现后不再改写。</p></section>`;
      root.querySelectorAll('[data-dialogue-choice]').forEach(b=>b.onclick=()=>pickDialogue(Number(b.dataset.dialogueChoice)));
    }
  }else{
    const opt=node.options[selected];
    root.innerHTML=header+`<div class="feedback ${opt.score===2?'good':opt.score===0?'bad':''}"><b>${opt.score===2?'较合适的应对':opt.score===1?'部分有效，仍可优化':'这类反应容易引出新的问题'}</b><p>${safe(opt.reason)}</p><p class="small"><b>你的原话：</b>${safe(ds.draft)}</p><p class="small"><b>所选模拟行动：</b>${safe(opt.text)}</p></div><div class="notice small">自由回答尚未自动评估。请自己确认两者是否真的一致，不要因为选了最佳行动就把原话当作已掌握。</div><label class="small"><input type="checkbox" id="realMatch"> 我写的原话与所选行动大体一致</label><div class="actions"><button class="primary" id="dialogueNext">${opt.next?'查看对方下一句':'完成本轮并查看复盘'}</button></div></section>`;
    document.getElementById('dialogueNext').onclick=()=>nextDialogue(document.getElementById('realMatch').checked);
  }
}
function startDialogue(id){stopVoice();unsavedClear('dialogue:');let sc=SCENARIOS.find(x=>x.id===id);if(!sc)return;dialogueState={scenario:sc,node:sc.start,turn:0,selected:null,ready:false,draft:'',steps:[],finished:false};page='dialogue';render()}
function pickDialogue(i){let ds=dialogueState;if(!ds||ds.selected!==null||!ds.draft.trim())return;let opts=ds.scenario.nodes[ds.node].options;if(i<0||i>=opts.length)return;ds.selected=i;renderDialogue()}
function nextDialogue(match){
 const ds=dialogueState;if(!ds||ds.selected===null)return;
 unsavedClear('dialogue:');
 const node=ds.scenario.nodes[ds.node],opt=node.options[ds.selected];
 ds.steps.push({turn:ds.turn+1,prompt:node.line,own:ds.draft.slice(0,1200),chosen:opt.text,score:opt.score,reason:opt.reason,match:!!match});
 if(opt.next){ds.node=opt.next;ds.turn++;ds.selected=null;ds.ready=false;ds.draft='';renderDialogue();return}
 data.dialogueHistory ||= [];
 data.dialogueHistory.push({date:TODAY(),scenario:ds.scenario.id,title:ds.scenario.title,steps:ds.steps,score:ds.steps.reduce((a,x)=>a+x.score,0),max:ds.steps.length*2});
 if(!save()){ds.steps.pop();return}
 ds.finished=true;renderDialogueFinished();
}
function renderDialogueFinished(){
 const ds=dialogueState,steps=ds.steps,total=steps.reduce((a,x)=>a+x.score,0),max=steps.length*2;
 root.innerHTML=`<section class="panel"><span class="pill">完整模拟已完成</span><h2>${safe(ds.scenario.title)}</h2><div class="grid"><div class="stat"><strong>${total}/${max}</strong><span>选择策略得分</span></div><div class="stat"><strong>${steps.filter(x=>x.match).length}/${steps.length}</strong><span>自评：原话与选项一致</span></div><div class="stat"><strong>${steps.length}</strong><span>完成的对话轮数</span></div></div><p class="muted small">得分只代表预设策略选择，不代表你的自由回答已被自动评价，更不代表真实沟通水平。</p>${steps.map(x=>`<details><summary>第${x.turn}轮 · ${x.score===2?'较合适':x.score===1?'部分有效':'有待改进'}</summary><div class="small"><b>对方：</b>${safe(x.prompt)}</div><div class="small"><b>你写的：</b>${safe(x.own)}</div><div class="small"><b>选的：</b>${safe(x.chosen)}</div><div class="small"><b>解析：</b>${safe(x.reason)}</div></details>`).join('')}<div class="notice"><b>下一次真实对话微任务：</b>当你想立刻解释时，先判断“这是真正需要回答的工作/生活问题，还是含有未证实的前提？”再选择一句简洁回应。</div><div class="actions"><button class="primary" id="againScene">重新练习此场景</button><button class="secondary" id="sceneHome">返回情境库</button></div></section>`;
 document.getElementById('againScene').onclick=()=>startDialogue(ds.scenario.id);
 document.getElementById('sceneHome').onclick=()=>{stopVoice();unsavedClear('dialogue:');dialogueState=null;renderDialogue()};
}
function renderDialogueStats(){
 const hist=Array.isArray(data.dialogueHistory)?data.dialogueHistory:[];
 const recent=hist.slice(-6).reverse();
 root.insertAdjacentHTML('beforeend',`<section class="panel"><h2>多轮对话练习记录</h2><p class="muted small">模拟成绩是预设选项评分，自由表达仍依赖自评和现实复盘。</p><div class="grid"><div class="stat"><strong>${hist.length}</strong><span>完成的模拟</span></div><div class="stat"><strong>${hist.length?Math.round(100*hist.reduce((a,x)=>a+x.score,0)/Math.max(1,hist.reduce((a,x)=>a+x.max,0))):0}%</strong><span>策略选择得分率</span></div><div class="stat"><strong>${hist.reduce((a,x)=>a+x.steps.length,0)}</strong><span>对话轮次</span></div></div>${recent.map(x=>`<div class="tablelike"><div><b>${safe(x.title||x.scenario)}</b><div class="small muted">${safe(x.date)}</div></div><span class="small">${x.score}/${x.max}</span></div>`).join('')||'<p class="small muted">尚未完成多轮模拟。</p>'}</section>`);
}

window.appSettings=()=>setPage('settings');window.appBack=()=>setPage('home');window.appMix=()=>start('mixed');document.querySelectorAll('[data-nav]').forEach(x=>x.onclick=()=>setPage(x.dataset.nav));render();
