// Explicit preparation only: no model invocation on startup, page open or rating.
const PREPARED_KEY='response-autonomy-prepared-v1',PREPARED_LEVELS=['进阶','高难','地狱'];
let preparationBusy=false,preparationStatus='默认不自动出题；点击准备才会联网调用模型。';
function preparedRead(){try{const cache=JSON.parse(sessionStorage.getItem(PREPARED_KEY)||'[]');const used=new Set([...CARDS.map(c=>c.id),...Object.keys(data.cards),...data.history.map(h=>h.id)]);return Array.isArray(cache)?cache.filter(c=>validGeneratedSnapshot(c)&&PREPARED_LEVELS.includes(c.level)&&!used.has(c.id)).slice(0,9):[]}catch(e){return []}}
function preparedWrite(cards){try{sessionStorage.setItem(PREPARED_KEY,JSON.stringify(cards));return true}catch(e){return false}}
function putPrepared(card){
 if(!validGeneratedSnapshot(card)||!PREPARED_LEVELS.includes(card.level))return false;
 const cards=preparedRead();if(cards.some(c=>c.id===card.id)||cards.filter(c=>c.level===card.level).length>=3)return false;
 const saved=preparedWrite([...cards,card]);const counts=document.getElementById('preparedCounts');if(saved&&counts)counts.textContent=preparationCounts();return saved;
}
function takePrepared(level){
 const used=new Set([...CARDS.map(c=>c.id),...Object.keys(data.cards),...data.history.map(h=>h.id)]);
 const cards=preparedRead().filter(c=>!used.has(c.id));const index=cards.findIndex(c=>c.level===level);
 if(index<0){preparedWrite(cards);return null}
 const [card]=cards.splice(index,1);preparedWrite(cards);return card;
}
function preparationCounts(){const cards=preparedRead();return PREPARED_LEVELS.map(level=>level+' '+cards.filter(c=>c.level===level).length+'题').join(' · ')}
function renderPreparation(){
 root.insertAdjacentHTML('beforeend',`<section class="panel"><h2>提前备题，练习时少等待</h2><p>73张本地卡片无需AI、无需等待。随机挑战需要联网；可以明确准备最多3题，之后同难度优先取本标签页备题。</p><p id="preparedCounts" class="small">${safe(preparationCounts())}</p><label for="prepareLevel">备题难度</label><select id="prepareLevel">${PREPARED_LEVELS.map(level=>`<option>${level}</option>`).join('')}</select><div class="actions"><button class="secondary" id="prepareCases" ${preparationBusy?'disabled':''}>准备最多3题（会调用模型）</button><button class="ghost" id="clearPrepared">清除本标签页备题</button></div><p class="small muted" id="preparedStatus" role="status">${safe(preparationStatus)}</p><p class="small muted">备题不计学习次数、不上传练习原话；关闭标签页后可能丢失。不会在完成一题后自动补货。</p></section>`);
 document.getElementById('prepareCases').onclick=async()=>{
  if(preparationBusy)return;
  const level=document.getElementById('prepareLevel').value,count=3-preparedRead().filter(c=>c.level===level).length;
  if(count<=0){document.getElementById('preparedStatus').textContent='该难度已备好3题，可直接开始随机挑战。';return}
  preparationBusy=true;preparationStatus=`正在准备${level}${count}题，可先练本地卡片；不会自动切换页面。`;
  document.getElementById('prepareCases').disabled=true;document.getElementById('preparedStatus').textContent=preparationStatus;
  try{const cards=await aiGenerateBatch(level,count);let saved=0;for(const card of cards)if(putPrepared(card))saved++;preparationStatus=`${level}已准备${saved}题。${saved<cards.length?'本标签页暂存空间不足或队列已满；已有备题保留。':''}`}
  catch(e){preparationStatus=aiErrorMessage(e)+' 已有备题和学习记录保持不变。'}
  finally{preparationBusy=false;const status=document.getElementById('preparedStatus'),button=document.getElementById('prepareCases'),counts=document.getElementById('preparedCounts');if(status)status.textContent=preparationStatus;if(button)button.disabled=false;if(counts)counts.textContent=preparationCounts()}
 };
 document.getElementById('clearPrepared').onclick=()=>{if(preparationBusy){document.getElementById('preparedStatus').textContent='备题仍在进行，请完成后再清除。';return}preparedWrite([]);document.getElementById('preparedCounts').textContent=preparationCounts();document.getElementById('preparedStatus').textContent='本标签页备题已清除，学习记录不变。'};
}
