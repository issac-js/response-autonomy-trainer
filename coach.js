let coachPane='practice',coachFlash='';
function setCoachPane(pane){coachPane=pane;root.querySelectorAll('[data-coach-pane]').forEach(el=>el.hidden=el.dataset.coachPane!==pane);root.querySelectorAll('[data-coach-tab]').forEach(el=>{el.classList.toggle('active',el.dataset.coachTab===pane);el.setAttribute('aria-pressed',String(el.dataset.coachTab===pane))})}
function coachScore(id){const v=document.getElementById(id)?.value;return v===''||v===undefined?null:Number(v)}
// Dynamic ids come from imported backups: escape every interpolated attribute.
// DOM lookups still use the raw id, because HTML entity decoding restores it.
function coachScoreInput(id,label,value=null,group='',owner='',field=''){
 const htmlId=safe(id),attr=group?unsavedAttrs(group,owner,'',field||id):'';
 return `<label for="${htmlId}">${safe(label)}（可选，0–10）</label><select id="${htmlId}"${attr}><option value="">暂不记录</option>${Array.from({length:11},(_,n)=>`<option value="${n}" ${value===n?'selected':''}>${n}</option>`).join('')}</select>`
}
function coachCheckInputs(prefix,group='',owner=''){
 return Object.entries(COACH_CHECKS).map(([k,v])=>{
  const htmlId=safe(prefix+'-'+k),attr=group?unsavedAttrs(group,owner,'','check:'+k):'';
  return `<label class="coach-check" for="${htmlId}">${safe(v)}<select id="${htmlId}"${attr}><option value="unknown">尚不确定 / 没观察</option><option value="yes">有做到</option><option value="no">这次没做到</option></select></label>`
 }).join('')
}
function coachChecks(prefix){return Object.fromEntries(Object.keys(COACH_CHECKS).map(k=>{const v=document.getElementById(prefix+'-'+k).value;return [k,v==='yes'?true:v==='no'?false:null]}))}
function coachId(){try{const id=window.crypto?.randomUUID?.();if(id)return id}catch(e){}return Date.now()+'-'+Math.random().toString(36).slice(2)}
function coachPrompt(d,turn=d.turn){const s=PRACTICES[d.scenario];return turn===0?s.prompt:turn===1?(s.branches[d.steps[0]?.action]||s.branches.other):s.work}
function coachFacts(d,turn=d.turn){const s=PRACTICES[d.scenario];return turn===0?s.facts:turn===1?s.second:s.required}
function coachOpen(){requestEpoch++;challengeLevel=null;stopVoice();clearTimer();page='coach';render()}
function coachReviewCards(){
 today=TODAY();const targetIds=new Set(['RA-003','RA-010',...data.coach.triggers.flatMap(t=>COACH_CARD_IDS[t])]);
 const due=dueList().filter(c=>targetIds.has(c.id)).map(c=>c.id).slice(0,3),allowance=Math.max(0,data.settings.newPerDay-startedToday());
 const fresh=freshList().filter(c=>targetIds.has(c.id)).slice(0,Math.min(3-due.length,allowance)).map(c=>c.id),ids=[...due,...fresh];
 if(!ids.length){alert('相关卡片目前未到期，或今日新卡额度已用完。可以继续模拟；想加练也可去卡片库自主选择。');return}
 start('targeted',ids);
}
function coachBegin(scenario,prediction,before){
 if(!Object.hasOwn(PRACTICES,scenario)||!prediction.trim())return false;
 data.coach.draft={kind:'simulation',id:coachId(),session:data.coach.session,scenario,prediction:prediction.trim().slice(0,1200),before,turn:0,steps:[],own:'',urge:'',ready:false};
 if(!save())return false;unsavedClear('coachPractice');unsavedClear('coachSim');unsavedClear('coachReview');renderCoach();return true;
}
function coachCommit(){const d=data.coach.draft;if(!d||d.turn>=3||!d.own.trim()||d.ready)return;stopVoice();d.ready=true;if(save()){unsavedClear('coachSim');renderCoach()}}
function coachSyncInput(){const d=data.coach.draft,own=document.getElementById('coachOwn'),urge=document.getElementById('coachUrge');if(d&&!d.ready&&own){d.own=own.value;d.urge=urge?.value||''}}
function coachAction(action){
 const d=data.coach.draft;if(!d||!d.ready||d.turn>=3||!Object.hasOwn(COACH_ACTIONS,action))return;
 d.steps.push({turn:d.turn,own:d.own,urge:d.urge,action});d.turn++;d.own='';d.urge='';d.ready=false;
 if(save()){unsavedClear('coachSim');renderCoach()}
}
function coachFinish(after,learning,checks){
 const d=data.coach.draft;if(!d||d.turn!==3)return false;
 data.coach.runs.push({...d,kind:'simulation',at:new Date().toISOString(),date:TODAY(),after,learning,checks});data.coach.draft=null;
 if(!save())return false;unsavedClear('coachReview');coachPane='review';coachFlash='这次模拟复盘已保存。可以休息，也可以在低风险真实交流中尝试一个小动作。';renderCoach();return true;
}
function coachPlan(context,prediction,action,before){
 if(!context.trim()||!prediction.trim()||!action.trim())return false;
 data.coach.experiments.push({kind:'real',id:coachId(),status:'planned',date:TODAY(),at:new Date().toISOString(),context:context.trim().slice(0,1200),prediction:prediction.trim().slice(0,1200),action:action.trim().slice(0,1200),before});
 if(!save())return false;unsavedClear('coachReal');coachPane='real';coachFlash='计划已保存。等有合适机会再做，之后补充实际观察。';renderCoach();return true;
}
function coachObserve(id,actual,evidence,after,learning,checks){
 const x=data.coach.experiments.find(x=>x.id===id);if(!x||x.status!=='planned'||!actual.trim())return false;
 Object.assign(x,{status:'observed',observedDate:TODAY(),observedAt:new Date().toISOString(),actual:actual.trim().slice(0,1200),evidence,after,learning:String(learning||'').slice(0,1200),checks});
 if(!save())return false;unsavedClear('coachObserve',id);coachPane='review';coachFlash='实际观察已保存；结果不确定也有记录价值。';renderCoach();return true;
}
function coachMetrics(c=data.coach){
 const observed=c.experiments.filter(x=>x.status==='observed');
 return Object.fromEntries(Object.keys(COACH_CHECKS).map(k=>{const known=observed.filter(x=>typeof x.checks[k]==='boolean');return [k,{yes:known.filter(x=>x.checks[k]).length,total:known.length}]}));
}
function renderCoach(){
 const c=data.coach,session=COACH_SESSIONS[c.session-1];
 if(c.draft){renderCoachDraft();return}
 const completed=new Set(c.runs.map(r=>r.session)).size,observed=c.experiments.filter(x=>x.status==='observed');
 root.innerHTML=`<section class="panel"><span class="pill">个人练习 · ${c.triggers.length?c.triggers.join('＋'):'自主选择'}</span><h2>先判断，再自主回应</h2><p>不是所有话题都需要答案；该答的要说明白，愿意聊的自然聊，不想展开的可以收住。练习带着一点不安作选择，不要求焦虑清零。每次只记录一次，之后回到日常生活，不必反复检查自己。</p><p class="small muted">这是一套日常沟通自助练习，不是诊断或治疗；不承诺形成永不失误的条件反射。场景反应为固定编写，不会推断你写的原话。</p><details><summary>先看判断顺序：事实 → 责任 → 意愿 → 范围</summary><ol><li>问题的事实前提成立吗？不清楚就澄清。</li><li>是职责、授权或已作出的承诺吗？需要时充分说明。</li><li>我愿意分享吗？愿意就自然交流，也可以保留。</li><li>现在需要多少信息？有用就补充，无关信息可以停住。</li></ol><p>暂停不必固定两秒，解释不必一律省略。先选择，再观察，而非要求每句话完美。</p></details><div class="grid"><div class="stat"><strong>${completed}/14</strong><span>尝试过的练习单元</span></div><div class="stat"><strong>${c.runs.length}</strong><span>已复盘模拟</span></div><div class="stat"><strong>${observed.length}</strong><span>真实观察记录</span></div></div></section>
 <div class="actions" aria-label="自主回应练习内容">${[['practice','模拟练习'],['real','真实交流'],['review','复盘记录']].map(([id,title])=>`<button class="tab" data-coach-tab="${id}">${title}</button>`).join('')}</div>${coachFlash?`<p class="notice" role="status">${safe(coachFlash)}</p>`:''}<section class="panel" data-coach-pane="practice"><details><summary>复习相关判断卡</summary><h3>判断知识也要间隔巩固</h3><p>按所选触发点复习相关卡片，同时保留正常闲聊和职责内应答的反例。优先到期卡，再按今日剩余新卡额度补充，最多3张。</p><button class="secondary" onclick="coachReviewCards()">复习相关判断卡</button><p class="small muted">FSRS用于安排判断知识的复习，不衡量焦虑、潜意识或真实沟通成效。</p></details></section><section class="panel" data-coach-pane="practice"><details id="coachProfileDetails"><summary>调整我的触发点（默认 A＋B＋D）</summary><p class="small muted">初始勾选你明确提到的三项，可调整。寻求认可、怕沉默等不作为已确认的心理结论。</p>${Object.entries(TRIGGERS).map(([k,t])=>`<label class="coach-trigger"><input type="checkbox" data-trigger="${k}" ${c.triggers.includes(k)?'checked':''}> ${k} · ${t.name}</label><p class="small muted">${safe(t.cue)}</p>`).join('')}<button id="coachProfile" class="secondary">保存我的选择</button><p id="coachProfileStatus" role="status" class="small"></p></details></section>
 <section class="panel" data-coach-pane="practice"><h2>循序练习 · 可以重复或跳过</h2><p class="small muted">14个单元不是14天任务，没有连续打卡或惩罚。每次选一个可承受的点，模拟约5分钟；没有合适现实机会也不必制造冲突。</p><label for="coachSession">选择练习单元</label><select id="coachSession">${COACH_SESSIONS.map(x=>`<option value="${x.id}" ${x.id===c.session?'selected':''}>${x.id}. ${safe(x.title)}</option>`).join('')}</select><p id="coachAim">${safe(session.aim)}</p><p class="small"><b>本次提醒：</b>${safe(TRIGGERS[session.trigger].cue)}</p><label for="coachScenario">选择模拟场景（按自己的承受程度选择）</label><select id="coachScenario">${Object.entries(PRACTICES).map(([id,s])=>`<option value="${id}" ${id===session.scenario?'selected':''}>${safe(s.title)} · ${s.difficulty===1?'较轻松':'含追问或职责判断'}</option>`).join('')}</select><label for="coachPrediction">开始前：我担心不立即回应 / 不解释完整，会发生什么？</label><textarea id="coachPrediction"${unsavedAttrs('coachPractice','','','coachPrediction')} maxlength="1200" placeholder="可以写：还不确定；或写一个具体、能观察的预测。"></textarea>${coachScoreInput('coachBefore','此刻不适程度',null,'coachPractice','','coachBefore')}<div class="actions"><button id="coachStart" class="primary">开始三轮模拟</button></div><p id="coachStartStatus" role="status" class="small"></p></section>
 <section class="panel" data-coach-pane="real"><h2>真实交流：先计划，再看发生了什么</h2><p class="small muted">只选低风险、可控的日常交流并脱敏记录。紧急安全处置、重大冲突或职责内必要沟通，按实际责任处理，不用于练习隐瞒或拖延。</p><label for="realContext">情境（不写姓名或敏感信息）</label><textarea id="realContext"${unsavedAttrs('coachReal','','','realContext')} maxlength="1200" placeholder="例如：熟悉同事分享一个普通视频。"></textarea><label for="realPrediction">我的担心 / 预测</label><textarea id="realPrediction"${unsavedAttrs('coachReal','','','realPrediction')} maxlength="1200" placeholder="例如：如果不继续找话题，对方可能觉得我冷淡。"></textarea><label for="realAction">这次只试一个小动作</label><textarea id="realAction"${unsavedAttrs('coachReal','','','realAction')} maxlength="1200" placeholder="例如：真诚回应后先不追加消息；有真正需要时仍回应。"></textarea>${coachScoreInput('realBefore','练习前不适程度',null,'coachReal','','realBefore')}<button id="realPlan" class="primary">保存计划，稍后补实际观察</button><p id="realPlanStatus" role="status" class="small"></p>${c.experiments.filter(x=>x.status==='planned').map(x=>`<details class="coach-pending"><summary>待观察 · ${safe(x.context)}</summary><p><b>原先预测：</b>${safe(x.prediction)}</p><p><b>计划动作：</b>${safe(x.action)}</p><label for="actual-${safe(x.id)}">实际发生的事（未知也可以如实记录）</label><textarea id="actual-${safe(x.id)}"${unsavedAttrs('coachObserve',x.id,'','actual')} maxlength="1200" placeholder="记录看见、听见的事实，区分自己的推测。"></textarea><label for="evidence-${safe(x.id)}">与预测相比</label><select id="evidence-${safe(x.id)}"${unsavedAttrs('coachObserve',x.id,'','evidence')}><option value="uncertain">仍不确定 / 信息不足</option><option value="supported">观察到支持原预测的事实</option><option value="not-observed">这次没有观察到所担心的后果</option></select>${coachScoreInput('after-'+x.id,'观察后不适程度',null,'coachObserve',x.id,'after')}${coachCheckInputs('real-'+x.id,'coachObserve',x.id)}<label for="learning-${safe(x.id)}">学到什么 / 下次想调整什么（可选）</label><textarea id="learning-${safe(x.id)}"${unsavedAttrs('coachObserve',x.id,'','learning')} maxlength="1200"></textarea><button class="secondary" data-observe="${safe(x.id)}">保存实际观察</button><p id="status-${safe(x.id)}" role="status" class="small"></p></details>`).join('')}</section>`;
 renderCoachHistory();setCoachPane(coachPane);coachFlash='';root.querySelectorAll('[data-coach-tab]').forEach(b=>b.onclick=()=>setCoachPane(b.dataset.coachTab));
 document.getElementById('coachProfile').onclick=()=>{data.coach.triggers=[...root.querySelectorAll('[data-trigger]:checked')].map(el=>el.dataset.trigger);if(save())document.getElementById('coachProfileStatus').textContent='已保存，可随时调整。'};
 document.getElementById('coachSession').onchange=e=>{data.coach.session=Number(e.target.value);if(save())renderCoach()};
 document.getElementById('coachStart').onclick=()=>{const pred=document.getElementById('coachPrediction').value.trim();if(!pred){document.getElementById('coachStartStatus').textContent='先写一个预测，或写“还不确定”。';return}coachBegin(document.getElementById('coachScenario').value,pred,coachScore('coachBefore'))};
 document.getElementById('realPlan').onclick=()=>{const values=['realContext','realPrediction','realAction'].map(id=>document.getElementById(id).value.trim());if(values.some(x=>!x)){document.getElementById('realPlanStatus').textContent='请填写情境、预测和一个小动作；不必安排高难度练习。';return}coachPlan(...values,coachScore('realBefore'))};
 root.querySelectorAll('[data-observe]').forEach(b=>b.onclick=()=>{const id=b.dataset.observe,actual=document.getElementById('actual-'+id).value.trim();if(!actual){document.getElementById('status-'+id).textContent='先记录实际发生的事；可以写“目前还不确定”。';return}coachObserve(id,actual,document.getElementById('evidence-'+id).value,coachScore('after-'+id),document.getElementById('learning-'+id).value,coachChecks('real-'+id))});
}
function renderCoachDraft(){
 const d=data.coach.draft,s=PRACTICES[d.scenario];
 if(d.turn===3){renderCoachReview();return}
 root.innerHTML=`<section class="panel"><span class="pill">三轮模拟 · 第${d.turn+1}轮</span><h2>${safe(s.title)}</h2><p class="small muted">${safe(coachFacts(d))}</p><div class="scene"><div class="quote">“${safe(coachPrompt(d))}”</div></div>${d.ready?`<h3>原话已锁定 · 选择最接近的行动</h3><div class="quote-reply">${safe(d.own)}</div><p class="small muted">只用于选择固定后续情节，不分析自由文本、不判对错。解释较多可能有必要；没有匹配选项可选“其他”。</p>${Object.entries(COACH_ACTIONS).map(([id,label])=>`<button class="option" data-coach-action="${id}">${safe(label)}</button>`).join('')}`:`<label for="coachOwn">我当场会说什么 / 做什么？</label><textarea id="coachOwn"${unsavedAttrs('coachSim','','','coachOwn')} maxlength="1200" placeholder="用自己的话回应；若选择暂时停顿，也可以如实写明。">${safe(d.own)}</textarea>${d.turn!==2&&d.scenario!=='work'?'<button id="coachPause" class="ghost">此刻选择停顿，暂不接话</button>':''}<div id="voice-slot"></div><label for="coachUrge">我还想追加什么？是必要信息，还是想让自己安心？（可选）</label><textarea id="coachUrge"${unsavedAttrs('coachSim','','','coachUrge')} maxlength="1200">${safe(d.urge)}</textarea><div class="actions"><button id="coachCommit" class="primary" ${d.own.trim()?'':'disabled'}>锁定原话 · 查看行动</button><button id="coachSaveDraft" class="secondary">保存草稿</button></div><p class="small muted" id="coachDraftStatus" role="status">确认或保存草稿时才写入记录。无需等待到完全不紧张。</p>`}<div class="actions"><button id="coachLeave" class="ghost">保存到此处，返回其他练习</button><button id="coachDiscard" class="ghost">结束这次模拟</button></div></section>`;
 document.getElementById('coachLeave').onclick=()=>{coachSyncInput();stopVoice();if(save())setPage('home')};
 document.getElementById('coachDiscard').onclick=()=>{if(confirm('结束这次尚未完成的模拟？不会计入完成单元，已有历史保留。')){stopVoice();data.coach.draft=null;if(save()){unsavedClear('coachSim');unsavedClear('coachReview');renderCoach()}}};
 if(d.ready)root.querySelectorAll('[data-coach-action]').forEach(b=>b.onclick=()=>coachAction(b.dataset.coachAction));
 else{
  const own=document.getElementById('coachOwn'),urge=document.getElementById('coachUrge'),commit=document.getElementById('coachCommit');
  own.oninput=()=>{data.coach.draft.own=own.value;commit.disabled=!own.value.trim()};urge.oninput=()=>data.coach.draft.urge=urge.value;
  const pause=document.getElementById('coachPause');if(pause)pause.onclick=()=>{own.value='（有意停顿，暂不接话）';own.dispatchEvent(new Event('input'))};
  commit.onclick=()=>{coachSyncInput();coachCommit()};mountVoice('voice-slot');
  document.getElementById('coachSaveDraft').onclick=()=>{coachSyncInput();if(save()){unsavedClear('coachSim');document.getElementById('coachDraftStatus').textContent='草稿已保存，可稍后继续。'}};
 }
}
function renderCoachReview(){
 const d=data.coach.draft,s=PRACTICES[d.scenario];
 root.innerHTML=`<section class="panel"><span class="pill">三轮已完成 · 还未保存复盘</span><h2>看判断过程，不给人格打分</h2><p><b>开始前预测：</b>${safe(d.prediction)}</p><p class="small muted">以下对方反应由脚本编写，不能证明真实同事会如何反应。你的原话没有被自动语义评分。</p>${d.steps.map((x,i)=>`<details><summary>第${i+1}轮 · ${safe(COACH_ACTIONS[x.action])}</summary><p><b>对方：</b>${safe(coachPrompt(d,i))}</p><p><b>我的原话：</b>${safe(x.own)}</p><p><b>想追加的内容：</b>${safe(x.urge||'未记录')}</p></details>`).join('')}<h3>本场景的复盘依据</h3><ul>${s.points.map(p=>`<li>${safe(p)}</li>`).join('')}<li>最后一轮需要正常履职：说明必要事实或可实现的承诺。简短确认可以自然，重要时间最好明确。</li><li>是否过度解释，要看信息的作用和自己的意图，不能只数句子、道歉或表情。</li></ul>${coachCheckInputs('sim','coachReview')}${coachScoreInput('coachAfter','此刻不适程度',null,'coachReview','','coachAfter')}<label for="coachLearning">一个做得好的点 / 下次只改一个点（可选）</label><textarea id="coachLearning"${unsavedAttrs('coachReview','','','coachLearning')} maxlength="1200"></textarea><p class="small muted">不适没有下降也可保存。模拟与真实记录分开；不会因为分数高或不适下降而自动升难度。</p><div class="actions"><button id="coachFinish" class="primary">保存这次复盘</button></div></section>`;
 document.getElementById('coachFinish').onclick=()=>coachFinish(coachScore('coachAfter'),document.getElementById('coachLearning').value,coachChecks('sim'));
}
function renderCoachHistory(){
 const c=data.coach,metrics=coachMetrics(),observed=c.experiments.filter(x=>x.status==='observed');
 const rows=Object.entries(COACH_CHECKS).map(([k,label])=>{const m=metrics[k];return `<div class="tablelike"><span>${safe(label)}</span><span>${m.total?m.yes+'/'+m.total:'—'}</span></div>`}).join('');
 root.insertAdjacentHTML('beforeend',`<section class="panel" data-coach-pane="review"><h2>真实行为观察</h2><p class="small muted">只统计真实交流中你明确记录的自评：有做到次数 / 已知观察次数。不确定不计入分母；模拟不计入这里。不把拒绝次数、字数或焦虑下降当作疗效。</p>${rows}<p class="small muted">可以在开始后约14天、28天回顾这些记录。这里只提供回顾方法，没有设置提醒或保证改变期限。</p>${observed.slice(-10).reverse().map(x=>`<details><summary>${safe(x.observedDate)} · ${safe(x.context)}</summary><p><b>原先预测：</b>${safe(x.prediction)}</p><p><b>尝试动作：</b>${safe(x.action)}</p><p><b>实际观察：</b>${safe(x.actual)}</p><p><b>证据：</b>${safe({'supported':'有事实支持原预测','not-observed':'这次未观察到所担心的后果','uncertain':'仍不确定'}[x.evidence])}</p><p class="small">自记不适：${x.before??'未记'} → ${x.after??'未记'}（不作诊断或疗效判断）</p><p>${safe(x.learning)}</p></details>`).join('')||'<p class="muted">还没有真实观察；不需要虚构成功经历。</p>'}</section><section class="panel" data-coach-pane="review"><h2>最近模拟 · 与现实证据分开</h2>${c.runs.slice(-6).reverse().map(r=>`<details><summary>${safe(r.date)} · 单元${r.session} · ${safe(PRACTICES[r.scenario].title)}</summary><p><b>原先预测：</b>${safe(r.prediction)}</p>${r.steps.map((x,i)=>`<p><b>第${i+1}轮原话：</b>${safe(x.own)}</p><p class="small muted">${safe(COACH_ACTIONS[x.action])}${x.urge?' · 想追加：'+safe(x.urge):''}</p>`).join('')}<p><b>复盘：</b>${safe(r.learning||'未记录')}</p><p class="small">自记不适：${r.before??'未记'} → ${r.after??'未记'}</p></details>`).join('')||'<p class="muted">可以先从一个轻松场景开始。</p>'}<details><summary>依据与使用边界</summary><p>参考 CCI 自信表达训练中的思维记录、行为实验、由易到难的练习，以及 NHS 的 CBT 自助建议。这里是据此设计的沟通练习，不是经过临床验证的治疗产品。</p><p><a href="https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Assertiveness" target="_blank" rel="noopener noreferrer">CCI 自信表达资源</a> · <a href="https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/" target="_blank" rel="noopener noreferrer">NHS CBT 自助建议</a></p><p>如果焦虑持续影响睡眠、工作或社交，可以找心理咨询师共同评估和练习。训练无需硬撑或证明自己。</p></details></section>`);
}
