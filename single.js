const SELF_ROWS=[{k:'fact',label:'我说明的是',opts:[['fact','事实'],['guess','推测'],['unsure','不确定']]},{k:'length',label:'这次的篇幅',opts:[['ok','刚好'],['long','偏长'],['short','偏短']]},{k:'pause',label:'说完后我停住了吗',opts:[['yes','停住了'],['no','又补了'],['unsure','不确定']]}];
function advance(){
 clearTimer();stopVoice();today=TODAY();
 if(!session.length){current=null;if(typeof practiceClear==='function')practiceClear();renderPlay();return}
 if(typeof practiceEnable==='function')practiceEnable();requestEpoch++;current=byId[session.shift()];viewOptions=current.options.map((_,i)=>i);
 for(let i=viewOptions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[viewOptions[i],viewOptions[j]]=[viewOptions[j],viewOptions[i]]}
 picked=null;phase='own';textDraft='';selfDraft={};mechGuess=null;aiText='';remaining=15;timerExpired=false;renderPlay();
 if(data.settings.timer)timerHandle=setInterval(()=>{remaining--;const el=document.getElementById('time');if(el)el.textContent=remaining>0?remaining+'秒':'可以慢慢想，不扣分';if(remaining<=0)clearTimer()},1000);
}
function renderPlay(){
 if(!current){if(challengeLevel){renderChallengeDone();return}root.innerHTML=`<section class="panel"><h2>本轮完成</h2><p>已保存本轮练习。留意自己原话中做得好的地方，下次只改一个具体点。</p><button class="primary" onclick="appBack()">返回今日训练</button></section>`;return}
 const c=current;
 let body='';
 if(phase==='own')body=`<h2>第一步 · 先自己回应</h2><p class="small muted">用自己的话写1–3句；有意沉默时可写“（停顿，暂不回应）”。先判断事实、责任和相关性。</p>${data.settings.timer?`<p id="time">${remaining}秒</p>`:''}<label for="reply">我当场会说的话</label><textarea id="reply"${unsavedAttrs('single',c.id,'','reply')} maxlength="1500" placeholder="先试着说一句，暂不显示示范或选项。">${safe(textDraft)}</textarea><div id="voice-slot"></div><div class="actions"><button id="commitSingle" class="primary" disabled>确认原话 · 查看策略</button></div>`;
 else if(phase==='pick')body=`<h2>第二步 · 对照你的回应策略</h2><p class="small muted">原话已经锁定。选最接近的策略；不同的合理表达可以保留。分类只用于决定复习方向，不评价你的措辞。</p><div class="quote-reply">${safe(textDraft)}</div>${viewOptions.map((n,i)=>`<button class="option" data-choice="${n}">${'ABCD'[i]}. ${safe(c.options[n])}</button>`).join('')}<button class="option" data-choice="other">其他：我的回应不属于这些选项</button><button class="option" data-choice="skip">跳过分类 · 直接看示范与解析</button>`;
 else {
  const skipped=picked==='skip',other=picked==='other',correct=picked===c.correct;
  const previous=previousReflectionFor(c);
  const now=new Date(),preview=Object.fromEntries(['again','hard','good','easy'].map(r=>[r,scheduleReview(state(c.id),r,now).card.due]));
  const verdict=skipped?'<div class="feedback"><b>已跳过分类</b><p>分类只决定复习方向，不影响你继续看解析与示范。</p></div>'
   :`<div class="feedback ${correct?'good':'bad'}"><b>${other?'保留你的独立回应':correct?'策略判断方向合适':'可以重新检查这一处判断'}</b><p>${safe(c.rationale)}</p></div>`;
  const mech=c.mechanism?`<h3>识别套路 · 这张卡用了哪种？</h3><p class="small muted">训练识别机制，而不是背句子。答错不计入复习，也不扣分。</p><div class="segwrap" id="mechWrap">${mechanismOptions(c).map(m=>`<button type="button" class="seg" data-mech="${m.k}" aria-pressed="false">${m.label}</button>`).join('')}</div><p class="small" id="mechResult" role="status"></p>`:'';
  const ai=`<h3>AI 反馈（可选）</h3><p class="small muted">会把这段文字发送给模型服务，默认仅用于本次反馈；选择加入复盘并保存后，该段复盘会进入学习记录。请不要写入姓名、电话、单位等身份信息。</p><div class="actions"><button class="secondary" id="aiAnalyze" type="button">用 AI 分析我的原话</button></div><div id="aiOut" class="small" role="status"></div>`;
  body=`<h2>第三步 · 反馈与自评</h2><div class="quote-reply"><b>你的原话：</b>${safe(textDraft)}</div>${verdict}<div class="learning-keynote"><span class="learning-label">这题记住什么</span><p>${safe(c.principle)}</p></div>${previous?`<details id="previousReflection"><summary>回看上次给自己的提醒（先作答后再看）</summary><p>${safe(previous)}</p></details>`:''}<details id="cardExample"><summary>查看一种示范表达</summary><p class="model-quote">${safe(c.model)}</p></details><p class="small muted">固定选项不会自动评价你的原话；可选AI反馈也只供核对。请对照情境：该答的是否回答？不实前提是否纠正？信息是否合乎授权？表达是否自然、适量？</p><details class="optional-review"><summary>进一步复盘（可选）：AI、机制与观察</summary>${mech}${ai}<label for="reflection">一个做得好的点 / 下次想改的点（可选）</label><textarea id="reflection"${unsavedAttrs('single',c.id,'','reflection')} maxlength="1000" placeholder="例如：我说明了进度；下次补上下一次更新时间。"></textarea><h3>30 秒自评 · 三项</h3><p class="small muted">只记录自己的观察，不评分、不计入复习时间；样本满 8 次后才在复盘里给一条倾向。</p>${SELF_ROWS.map(r=>`<div class="selfrow"><span class="small">${r.label}</span><div class="segwrap">${r.opts.map(([v,t])=>`<button type="button" class="seg ${selfDraft[r.k]===v?'on':''}" data-self="${r.k}:${v}" aria-pressed="${selfDraft[r.k]===v}">${t}</button>`).join('')}</div></div>`).join('')}</details><h3>按自己原话的实际表现选择</h3><p class="small muted">选项判断和自由回应分开记录。以下选择决定复习时间；不要求逐字复述示范。</p><div class="actions grade-actions" aria-label="自评并保存，进入下一题">${[['again','需要再练'],['hard','勉强做到'],['good','独立做到'],['easy','轻松做到']].map(([r,label])=>`<button class="${r==='good'?'primary':'secondary'}" data-rate="${r}">${label}<br><span class="small">${formatDue(preview[r],now)}</span></button>`).join('')}</div>`;
 }
 root.innerHTML=`<section class="panel"><div class="split"><span class="pill">${safe(c.group)}</span><span class="step">${session.length}张待练</span></div><div class="scene"><div class="small muted">${safe(c.scene)}</div><div class="quote">“${safe(c.question)}”</div></div>${body}</section>`;
 if(phase==='own'){
  const input=document.getElementById('reply'),commit=document.getElementById('commitSingle');
  input.oninput=()=>{textDraft=input.value;commit.disabled=!textDraft.trim()};
  firstTap(commit,()=>{if(!textDraft.trim())return;clearTimer();stopVoice();phase='pick';renderPlay()});mountVoice('voice-slot');
 }
 if(phase==='pick')root.querySelectorAll('[data-choice]').forEach(b=>firstTap(b,()=>choose(b.dataset.choice)));
 if(phase==='rate'){
  const wrap=document.getElementById('mechWrap');
  if(wrap)wrap.querySelectorAll('[data-mech]').forEach(b=>b.onclick=()=>{
   mechGuess=b.dataset.mech;
   wrap.querySelectorAll('[data-mech]').forEach(x=>{const on=x.dataset.mech===mechGuess;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false')});
   const m=mechanismByKey(c.mechanism);
   document.getElementById('mechResult').textContent=(mechGuess===c.mechanism?'识别正确。':'这次是「'+(m?m.label:c.mechanism)+'」。')+' '+(c.mechanismWhy||(m?m.why:''));
  });
  const aiBtn=document.getElementById('aiAnalyze');
  if(aiBtn)aiBtn.onclick=async()=>{
   const out=document.getElementById('aiOut'),epoch=requestEpoch,answer=textDraft;if(aiBusy)return;
   aiBusy=true;aiBtn.disabled=true;out.textContent='正在分析…';
   try{const result=await aiAnalyze(c,answer);if(epoch!==requestEpoch||current!==c||phase!=='rate'||textDraft!==answer||!out.isConnected)return;aiText=result;renderAiResult(aiText)}
   catch(e){out.textContent=aiErrorMessage(e)}
   finally{aiBusy=false;aiBtn.disabled=false}
  };
  root.querySelectorAll('[data-self]').forEach(b=>b.onclick=()=>{const [k,v]=b.dataset.self.split(':');selfDraft[k]=selfDraft[k]===v?null:v;root.querySelectorAll('[data-self^="'+k+':"]').forEach(x=>{const on=x.dataset.self.split(':')[1]===selfDraft[k];x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false')})});
  root.querySelectorAll('[data-rate]').forEach(b=>firstTap(b,()=>rate(b.dataset.rate)));
 }
}
function mdBold(s){return safe(String(s||'')).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}
function formatDue(d,now=new Date()){
 const minutes=Math.max(1,Math.round((new Date(d)-now)/60000));
 return minutes<60?minutes+'分钟后':minutes<1440?Math.round(minutes/60)+'小时后':Math.round(minutes/1440)+'天后';
}
function choose(n){if(phase!=='pick'||!textDraft.trim())return;picked=n==='skip'?'skip':n==='other'?'other':Number(n);phase='rate';renderPlay()}
function rate(r){
 if(phase!=='rate'||!['again','hard','good','easy'].includes(r))return;
 today=TODAY();const c=current,s={...state(c.id)},now=new Date(),result=scheduleReview(s,r,now),correct=picked==='other'||picked==='skip'?null:picked===c.correct;
 s.first||=today;s.seen=(s.seen||0)+1;s.correct=(s.correct||0)+(correct===true?1:0);s.last=today;s.due=new Date(result.card.due).toLocaleDateString('sv-SE');s.fsrs=JSON.parse(JSON.stringify(result.card));
 if(!c.generated)data.cards[c.id]=s;
 const entry={date:today,at:now.toISOString(),id:c.id,correct,grade:r,mode:source,answer:textDraft.trim(),selected:picked,reflection:document.getElementById('reflection').value,engine:'ts-fsrs@5.4.2/FSRS-6',fsrsLog:JSON.parse(JSON.stringify(result.log))};
 const self=Object.fromEntries(Object.entries(selfDraft).filter(([,v])=>v));
 if(Object.keys(self).length)entry.self=self;
 if(c.mechanism&&mechGuess){entry.mech=mechGuess;entry.mechOk=mechGuess===c.mechanism}
 data.history.push(entry);
 if(!save())return;
 unsavedClear('single',c.id);
 const archived=!c.generated||generatedRemember(entry,c);
 const status=document.getElementById('practiceStatus');if(status)status.textContent=archived?'本题已保存，可继续下一题或返回。':'本题已保存，但本机空间不足，随机题原题未能缓存。';
 // The FSRS due time controls reappearance. No immediate artificial repeat.
 advance();
}
