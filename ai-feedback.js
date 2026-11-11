// Model feedback is a temporary learning suggestion, never an FSRS rating.
function feedbackText(value,max){return typeof value==='string'?value.trim().slice(0,max):''}
function feedbackAnswer(value){return String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,1500)}
function normalizeAiFeedback(value,answer){
 const o=value&&typeof value==='object'&&!Array.isArray(value)?value:null;
 if(!o)return null;
 const evidence=(item,allowMissing=false)=>{
  if(item===null)return null;
  if(!item||typeof item!=='object'||Array.isArray(item)||typeof item.quote!=='string'||!feedbackText(item.reason,180))return undefined;
  const quote=feedbackText(item.quote,150),reason=feedbackText(item.reason,180);
  if(!quote&&!allowMissing)return undefined;
  return {quote,reason,quoteVerified:!!quote&&item.quote.trim()===quote&&feedbackAnswer(answer).includes(quote)};
 };
 if(Object.hasOwn(o,'strength')&&Object.hasOwn(o,'improvement')&&feedbackText(o.rewrite,300)&&feedbackText(o.memory,140)){
  const strength=evidence(o.strength),improvement=evidence(o.improvement,true);
  if(strength===undefined||improvement===undefined)return null;
  if(improvement&&!feedbackText(o.improvement.next,160))return null;
  if(improvement)improvement.next=feedbackText(o.improvement.next,160);
  return {feedbackVersion:2,strength,improvement,rewrite:feedbackText(o.rewrite,300),memory:feedbackText(o.memory,140)};
 }
 if(['fact','boundary','length','rewrite'].every(k=>feedbackText(o[k],500))){
  return Object.fromEntries(['fact','boundary','length','rewrite','tip'].map(k=>[k,feedbackText(o[k],500)]));
 }
 return null;
}
function parseJsonBlock(text){
 const raw=String(text||'');
 const a=raw.indexOf('{'),b=raw.lastIndexOf('}');
 if(a<0||b<=a)return null;
 try{const o=JSON.parse(raw.slice(a,b+1));return o&&typeof o==='object'?o:null}catch(e){return null}
}

// 模型偶尔把 next 并入 reason：只补该字段，不放弃整条反馈。
function needsNextRepair(o){
 return !!(o&&typeof o==='object'&&!Array.isArray(o)&&o.improvement&&typeof o.improvement==='object'&&!Array.isArray(o.improvement)&&!String(o.improvement.next||'').trim());
}
function renderAiResult(out){
 const box=document.getElementById('aiOut');if(!box)return;
 if(!out||out.plain){box.innerHTML='<p>本次未返回完整的分项反馈，请自行核对。</p><details><summary>查看模型原文</summary><p>'+safe((out&&out.plain)||'').replace(/\n/g,'<br>')+'</p></details>';return}
 if(out.feedbackVersion!==2){
  const row=(k,label,cls)=>out[k]?`<div class="ai-block ${cls}"><b>${label}</b><p>${mdBold(out[k])}</p></div>`:'';
  box.innerHTML='<p class="small muted">本次为旧版反馈，未提供逐条原话依据；请自行核对，也不能据文字确认真实停顿。</p>'+row('fact','事实','fact')+row('boundary','前提与边界','boundary')+row('length','篇幅与停顿','length')+row('rewrite','可替换说法','rewrite')+row('tip','技巧','tip');return;
 }
 const item=(value,label,cls,empty)=>`<section class="ai-block ${cls}"><h4>${label}</h4>${value?`${value.quote?`<p class="ai-evidence"><b>原话片段：</b>“${safe(value.quote)}”</p>${value.quoteVerified?'':'<p class="learning-caution">这段引文未在提交的原话中找到，AI的依据与判断待核对。</p>'}`:'<p class="small muted">这里指出的是可能缺少的信息，没有可引用的原话片段，请结合情境核对。</p>'}<p>${mdBold(value.reason)}</p>${value.next?`<p><b>下次只改一步：</b>${mdBold(value.next)}</p>`:''}`:`<p>${empty}</p>`}</section>`;
 box.innerHTML=`<p class="small muted">AI只看文字，建议可能有误；不能据此确认真实停顿、语气、对方动机或沟通效果。</p><div id="aiReference">${item(out.strength,'做得好的地方','strength','AI本次未指出有充分原话依据的具体优点，可对照情境再看。')}${item(out.improvement,'最值得改的一点','improvement','AI本次未指出明确不足，可以保留合适表达，不必为了修改而修改。')}<section class="ai-block rewrite"><h4>一种示范表达</h4><p>${mdBold(out.rewrite)}</p><p class="small muted">可换成自己的说法，不要求逐字照背。</p></section><section class="ai-block memory"><h4>下次记住一句</h4><p>${mdBold(out.memory)}</p></section></div><details id="aiRecall"><summary>收起参考，用自己的话再说一次（可选）</summary><p>回想情境：遇到类似情况，我先做什么、怎样说？有新条件时也可以换做法。</p><label for="aiRecallOwn">我现在会怎样回应</label><textarea id="aiRecallOwn" ${unsavedAttrs('single',current.id,'','aiRecall')} maxlength="1000" placeholder="不用抄示范，试着用自己的话说一句。"></textarea><button class="secondary" id="aiRecallBack">我已试说 · 回看参考</button><p class="small muted">这是巩固练习，暂存于本标签页，不再调用AI、不自动判分、不增加学习次数。</p></details><div class="actions"><button class="secondary" id="aiRemember">把提醒加入复盘草稿</button><button class="ghost" id="aiVary">到沟通方法换个情境练</button></div><p class="small muted">加入草稿后可编辑；按下方评分保存时，复盘文字会进入已有学习备份及开启的云同步。原始AI反馈不会自动保存。</p><p class="small" id="aiMemoryStatus" role="status"></p><p class="learning-caution">看懂示范是学习过程。下方自评仍按首次原话的独立表现选择，不因AI表扬或刚照着示范说过就提高自评；复习时间由现有排程决定。</p>`;
 const recall=document.getElementById('aiRecall'),reference=document.getElementById('aiReference');
 recall.addEventListener('toggle',()=>{reference.hidden=recall.open;if(recall.open){const example=document.getElementById('cardExample');if(example)example.open=false}});
 document.getElementById('aiRecallBack').onclick=()=>{recall.open=false;reference.hidden=false};
 document.getElementById('aiRemember').onclick=()=>{
  const field=document.getElementById('reflection'),status=document.getElementById('aiMemoryStatus');if(!field)return;
  const plain=text=>String(text||'').replace(/\*\*/g,'');
  const note=(out.strength?.quoteVerified?'这次保留：“'+out.strength.quote+'”\n':'')+'AI提醒（可编辑）：'+plain(out.memory)+'\n下次动作：'+plain(out.improvement?.next||'保留合适表达，有新信息再调整。');
  if(field.value.includes(note)){status.textContent='提醒已在草稿中，不重复添加。';return}
  const next=(field.value?field.value+'\n':'')+note;
  if(next.length>field.maxLength){status.textContent='复盘接近字数上限，请先自行精简；原内容已保留。';return}
  field.value=next;field.dispatchEvent(new Event('input',{bubbles:true}));status.textContent='已加入复盘草稿，可自行修改；尚未保存到学习记录。';
 };
 document.getElementById('aiVary').onclick=()=>setPage('communication');
 unsavedRestore();
}

function previousReflectionFor(card){
 for(let i=data.history.length-1;i>=0;i--){
  const h=data.history[i];if(!h||h.id!==card.id||typeof h.reflection!=='string'||!h.reflection.trim())continue;
  if(card.generated){const snapshot=typeof generatedFor==='function'?generatedFor(h):null;if(!snapshot||snapshot.question!==card.question||snapshot.scene!==card.scene)continue;}
  return h.reflection;
 }
 return '';
}
