function advance(){
 clearTimer();stopVoice();today=TODAY();
 if(!session.length){current=null;renderPlay();return}
 current=byId[session.shift()];viewOptions=current.options.map((_,i)=>i);
 for(let i=viewOptions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[viewOptions[i],viewOptions[j]]=[viewOptions[j],viewOptions[i]]}
 picked=null;phase='own';textDraft='';remaining=15;timerExpired=false;renderPlay();
 if(data.settings.timer)timerHandle=setInterval(()=>{remaining--;const el=document.getElementById('time');if(el)el.textContent=remaining>0?remaining+'秒':'可以慢慢想，不扣分';if(remaining<=0)clearTimer()},1000);
}
function renderPlay(){
 if(!current){root.innerHTML=`<section class="panel"><h2>本轮完成</h2><p>已保存本轮练习。留意自己原话中做得好的地方，下次只改一个具体点。</p><button class="primary" onclick="appBack()">返回今日训练</button></section>`;return}
 const c=current;
 let body='';
 if(phase==='own')body=`<h2>第一步 · 先自己回应</h2><p class="small muted">用自己的话写1–3句；有意沉默时可写“（停顿，暂不回应）”。先判断事实、责任和相关性。</p>${data.settings.timer?`<p id="time">${remaining}秒</p>`:''}<label for="reply">我当场会说的话</label><textarea id="reply"${unsavedAttrs('single',c.id,'','reply')} maxlength="1500" placeholder="先试着说一句，暂不显示示范或选项。">${safe(textDraft)}</textarea><div id="voice-slot"></div><div class="actions"><button id="commitSingle" class="primary" disabled>确认原话 · 查看策略</button></div>`;
 else if(phase==='pick')body=`<h2>第二步 · 对照你的回应策略</h2><p class="small muted">原话已经锁定。选最接近的策略；不同的合理表达可以保留。</p><div class="quote-reply">${safe(textDraft)}</div>${viewOptions.map((n,i)=>`<button class="option" data-choice="${n}">${'ABCD'[i]}. ${safe(c.options[n])}</button>`).join('')}<button class="option" data-choice="other">其他：我的回应不属于这些选项</button>`;
 else {
  const correct=picked===c.correct,other=picked==='other';
  const now=new Date(),preview=Object.fromEntries(['again','hard','good','easy'].map(r=>[r,scheduleReview(state(c.id),r,now).card.due]));
  body=`<h2>第三步 · 反馈与自评</h2><div class="quote-reply"><b>你的原话：</b>${safe(textDraft)}</div><div class="feedback ${correct?'good':'bad'}"><b>${other?'保留你的独立回应':correct?'策略判断方向合适':'可以重新检查这一处判断'}</b><p>${safe(c.rationale)}</p><b>结构要点：</b>${safe(c.principle)}</div><details><summary>查看一种示范表达</summary><p>${safe(c.model)}</p></details><p class="small muted">系统没有自动评判你的原话。请对照情境：该答的是否回答？不实前提是否纠正？信息是否合乎授权？表达是否自然、适量？</p><label for="reflection">一个做得好的点 / 下次想改的点（可选）</label><textarea id="reflection"${unsavedAttrs('single',c.id,'','reflection')} maxlength="1000" placeholder="例如：我说明了进度；下次补上下一次更新时间。"></textarea><h3>按自己原话的实际表现选择</h3><p class="small muted">选项判断和自由回应分开记录。以下选择决定复习时间；不要求逐字复述示范。</p><div class="actions">${[['again','需要再练'],['hard','勉强做到'],['good','独立做到'],['easy','轻松做到']].map(([r,label])=>`<button class="${r==='good'?'primary':'secondary'}" data-rate="${r}">${label}<br><span class="small">${formatDue(preview[r],now)}</span></button>`).join('')}</div>`;
 }
 root.innerHTML=`<section class="panel"><div class="split"><span class="pill">${safe(c.group)}</span><span class="step">${session.length}张待练</span></div><div class="scene"><div class="small muted">${safe(c.scene)}</div><div class="quote">“${safe(c.question)}”</div></div>${body}</section>`;
 if(phase==='own'){
  const input=document.getElementById('reply'),commit=document.getElementById('commitSingle');
  input.oninput=()=>{textDraft=input.value;commit.disabled=!textDraft.trim()};
  commit.onclick=()=>{if(!textDraft.trim())return;clearTimer();stopVoice();phase='pick';renderPlay()};mountVoice('voice-slot');
 }
 if(phase==='pick')root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(b.dataset.choice==='other'?'other':Number(b.dataset.choice)));
 if(phase==='rate')root.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>rate(b.dataset.rate));
}
function formatDue(d,now=new Date()){
 const minutes=Math.max(1,Math.round((new Date(d)-now)/60000));
 return minutes<60?minutes+'分钟后':minutes<1440?Math.round(minutes/60)+'小时后':Math.round(minutes/1440)+'天后';
}
function choose(n){if(phase!=='pick'||!textDraft.trim())return;picked=n;phase='rate';renderPlay()}
function rate(r){
 if(phase!=='rate'||!['again','hard','good','easy'].includes(r))return;
 today=TODAY();const c=current,s={...state(c.id)},now=new Date(),result=scheduleReview(s,r,now),correct=picked==='other'?null:picked===c.correct;
 s.first||=today;s.seen=(s.seen||0)+1;s.correct=(s.correct||0)+(correct===true?1:0);s.last=today;s.due=new Date(result.card.due).toLocaleDateString('sv-SE');s.fsrs=JSON.parse(JSON.stringify(result.card));
 data.cards[c.id]=s;data.history.push({date:today,at:now.toISOString(),id:c.id,correct,grade:r,mode:source,answer:textDraft.trim(),selected:picked,reflection:document.getElementById('reflection').value,engine:'ts-fsrs@5.4.2/FSRS-6',fsrsLog:JSON.parse(JSON.stringify(result.log))});
 if(!save())return;
 unsavedClear('single',c.id);
 // The FSRS due time controls reappearance. No immediate artificial repeat.
 advance();
}
