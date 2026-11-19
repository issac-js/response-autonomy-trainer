// Conditional reminders, not universal rules. No storage, scoring or network calls.
const PRACTICE_PRINCIPLES=[
 {id:'pause',topic:'observe',title:'先稳一下，也别耽误必要的事',memory:'心急先看事实；有真实期限，及时行动。',when:'普通消息不急、原因未知时，可以先忙自己的事。',boundary:'涉及安全、截止时间或不可逆损失时，及时传达已确认的信息；不等一切查清才行动。',pair:['Q01','Q02'],contrast:'第一题没有紧急需要；第二题有今天要确认的工作。改变行动的是期限与责任，不是“我必须一直冷静”或对方的动机。',action:'需要时确认会影响安排的风险、期限与责任，再选择等待或联系；普通熟悉的交流可以自然回应，不用固定停顿或计时。'},
 {id:'speak',topic:'silence',title:'可以停住，也能把该说的说清',memory:'没新需要可以停；影响交接就讲清。',when:'闲聊自然结束，没有新的请求时，不必继续填满空白。',boundary:'必要的澄清、职责说明和真实异议要表达。温和不等于含糊，沉默不替代交接。',pair:['Q22','Q52'],contrast:'闲聊没有新的待办；值班时间却会影响交接。选择表达或停住，要看信息有没有实际作用，不能只看说得多不多。',action:'在熟悉的交流中辨认一次：这句话是在补充必要信息，还是只想消除所有尴尬？愿意闲聊也可以自然聊。'},
 {id:'evidence',topic:'repair',title:'留住未知，有新事实就改判断',memory:'猜测先留白；听清新信息，就更正具体一处。',when:'没有收到回复等现象，可以有多种原因，暂时不知道也没关系。',boundary:'对方提供了可核对的新信息，就更新判断；不要用“看破不说破”回避必要纠错。',pair:['Q03','Q61'],contrast:'没回消息不能证明对方轻视你；听岔后已经得到清楚解释，就应按新信息回应。未知不等于坏意，也不等于永远不判断。',action:'做一次纸面模拟：写一句已知事实、留一句未知；如果有相反证据，改一个判断即可。'},
 {id:'feedback',topic:'focus',title:'抓住主线，也听具体反馈',memory:'标签不用接；真实遗漏要处理。',when:'没有新事实的人格贬低，可以设界、结束争论，必要时寻求支持。',boundary:'质量、安全、职责和他人实际损失不是杂音。不能为赶进度或维护面子而忽略已核实的问题。',pair:['Q28','Q64'],contrast:'缺页是已核实、妨碍交接的具体问题；持续贬低人格没有给出具体工作信息。前者补齐并确认，后者保留边界，不把责任一律推给自己。',action:'只核对一条反馈：它指出了什么具体事实、影响哪个目标？处理一件有依据的问题，或结束无根据的评价。'},
 {id:'repair',topic:'choice',title:'理解失望，有责就具体修复',memory:'失望不自动定责；确实失约就补救。',when:'没有承诺、没有相关义务时，可以友善拒绝额外帮助，也可以自愿协商帮助多少。',boundary:'若自己确实失约或造成影响，应倾听、说明和补救；不必消除所有不满，也不把自己整个人否定掉。',pair:['Q55','Q50'],contrast:'第一题没有承诺或义务，对方失望不足以定错；第二题漏回已答应确认的消息，实际影响别人安排。责任依据是承诺和影响，内疚只是核对信号。',action:'在一次低风险交流或纸面模拟里，分清感受与责任；有责只修复具体一件事，合理边界可以保留。'},
 {id:'scope',topic:'agency',title:'愿意帮忙，也先看权限与资源',memory:'能做的说清范围；做不到的先协调。',when:'授权、资源和时间已确认时，可以承担具体且可执行的责任。',boundary:'人手不足或超出权限时，先协调范围、期限和支持。不因夸奖、内疚或一时热心承诺无边界兜底。',pair:['Q42','Q66'],contrast:'第一题原任务量与人手不匹配，需要协商范围；第二题授权和资源已到位，可以承担指定范围。设界和负责都可合理，关键是承诺能否落实。',action:'下次准备答应一件事时，确认一次范围、资源与期限；不确定就说待确认，能做到的再明确承担。'},
 {"id":"finish-review","topic":"review","title":"复盘有终点，生活不用时时优化","memory":"选一个调整就够；有新事实再处理。","when":"已经有可行调整、无必要待办时，可以带着一点不安结束复盘。","boundary":"结束反刍不等于回避实际遗漏；出现新的必要事实或安全风险，应处理具体事项。休息不需要靠表现换取。","pair":["Q67","Q68"],"contrast":"一题没有新的必要事项，已有调整，可以结束；另一题新增已核实的缺页与影响，需要补发。决定是否继续的是新事实和责任，不是必须完全安心。","action":"可以只做一次纸面练习：留一个有效做法、一个可行调整；必要补救完成后结束，回到普通生活。"},
 {"id":"accept-support","topic":"support","title":"独立也能接受帮助，合作先讲清","memory":"支持可以接受；意愿、权限、分工要确认。","when":"双方愿意、有适当权限、范围和时间明确时，可以分工合作。","boundary":"他人热心不能替代资料授权；接受帮助不等于转交全部责任，别人也可以拒绝。","pair":["Q73","Q74"],"contrast":"一题资料允许共享、帮助范围明确，可以接受；另一题原始记录未获共享授权，应先找合适方式。独立不等于全扛，合作也不等于越权。","action":"愿意时提出一个范围清楚、允许拒绝的支持请求；也可只做模拟，不必制造求助机会。"},
 {"id":"choose-environment","topic":"environment","title":"能协调就协调，也能向外争取","memory":"具体分歧先协调；持续不当对待可求助、评估改变。","when":"普通且可调整的分歧，可以核对需要与规则，先试具体协调。","boundary":"持续不当对待或资源限制不全是自己的技巧问题。可求助或评估其他选择；改变环境也有成本，不承诺一走就好。明显安全威胁应及时寻求安全支持。","pair":["Q79","Q80"],"contrast":"一题是首次、可调整的时间分歧；另一题多次沟通后仍持续受贬低。可以协调，也可以寻求支持或评估改变，不需要把一切变成自我检讨。","action":"只了解一个有用支持渠道或替代选项及其条件、代价，不要求立即作重大决定。"}
];
function dailyPrinciple(day=TODAY()){
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day));
 if(!match)return PRACTICE_PRINCIPLES[0];
 const stamp=Date.UTC(+match[1],+match[2]-1,+match[3]),date=new Date(stamp);
 if(date.getUTCFullYear()!==+match[1]||date.getUTCMonth()!==+match[2]-1||date.getUTCDate()!==+match[3])return PRACTICE_PRINCIPLES[0];
 return PRACTICE_PRINCIPLES[((stamp/86400000)%PRACTICE_PRINCIPLES.length+PRACTICE_PRINCIPLES.length)%PRACTICE_PRINCIPLES.length];
}
function allPracticePairs(){return [...PRACTICE_PRINCIPLES,...PACE_GUIDES,...EXTRA_PRACTICE_PAIRS]}
function principleForRound(s){return s&&allPracticePairs().find(p=>s.ids.length===p.pair.length&&p.pair.every(id=>s.ids.includes(id)))}
function renderDailyPrinciple(){
 const p=dailyPrinciple(),pending=typeof quickState!=='undefined'&&quickState&&quickState.step<quickState.ids.length;
 return `<section class="panel" id="dailyPrinciple"><h2>今天只记一句 · 可跳过</h2><p class="learning-memory">${safe(p.memory)}</p><p class="small muted">${safe(p.title)}。不用打卡，也不必逐句检查自己。</p><details><summary>什么时候用，什么时候要调整？</summary><p><b>适用时：</b>${safe(p.when)}</p><p><b>换个条件：</b>${safe(p.boundary)}</p><p><b>愿意时只试一步：</b>${safe(p.action)}</p></details><div class="actions"><button class="secondary" data-principle-pair="${safe(p.id)}">${pending?'先继续上次刷题':'用两道题分清条件'}</button><button class="ghost" data-principle-lesson="${safe(p.topic)}">用自己的话练表达</button></div><p class="small muted">${pending?'已有未完成快练，这里先带你回继续入口，不替换本轮。':'两题复用现有题库，不生成新题；每题提交后看解释。'}练习可以重复、跳过或休息，不以情绪归零、对方满意作为达标条件。</p></section>`;
}
function bindDailyPrinciple(){
 root.querySelectorAll('[data-pace-topic]').forEach(button=>button.onclick=()=>openPaceGuide(button.dataset.paceTopic));
 root.querySelectorAll('[data-principle-pair]').forEach(button=>button.onclick=()=>{
  const p=allPracticePairs().find(p=>p.id===button.dataset.principlePair);if(!p)return;
  const pending=quickState&&quickState.step<quickState.ids.length;
  setPage('quick');if(page==='quick'&&!pending)quickStart(p.pair);
 });
 root.querySelectorAll('[data-principle-lesson]').forEach(button=>button.onclick=()=>{
  if(!COMMUNICATION_LESSONS.some(l=>l.id===button.dataset.principleLesson))return;
  communicationLesson=button.dataset.principleLesson;communicationSave();setPage('communication');
 });
}
function renderPrincipleComparison(p){return `<section id="principleComparison" aria-label="两种条件的对照"><h3>同一提醒，为什么换一种做法？</h3><p>${safe(p.contrast)}</p><p class="learning-memory">${safe(p.memory)}</p><p><b>可选的下一步：</b>${safe(p.action)}</p><p class="small muted">看懂或选对不等于现实里已掌握；愿意时用自己的话练一次，不用反复检查自己。</p><button class="secondary" data-principle-lesson="${safe(p.topic)}">去练独立表达与条件变化</button></section>`}

// Optional rhythm scaffold: reuse courses, pair submission and draft protection.
const PACE_GUIDES=[
 {id:'pace-urgency',topic:'observe',title:'心里着急，还是事情真急？',memory:'催促先核对；真有期限，及时说清。',pair:['Q85','Q86'],contrast:'一题只有模糊催促，需要确认用途与期限；另一题已有五分钟的决定期限，应及时报告可靠进度、风险与未知。速度依据事情，不以完全平静或信息齐全为前提。',action:'需要时只问一个会改变安排的问题：最晚何时需要什么结果？已确认紧急时先完成必要响应。'},
 {id:'pace-resources',topic:'agency',title:'安排能落实，还是需要协商资源？',memory:'可行就按步推进；资源不足先协调。',pair:['Q87','Q88'],contrast:'一题已有工作量与人手的冲突，需要协商优先级或支持；另一题任务可行，只是有些心急，可以带着感受推进。放松不能代替资源，心急也不自动证明做不到。',action:'把范围、期限和现有资源说清；需要时协商，确认可行后先做关键一步。'},
 {id:'pace-review',topic:'review',title:'可以自然结束，还是出现新事项？',memory:'没新事项不用检查；新错误及时补救。',pair:['Q89','Q90'],contrast:'一题普通交流已结束，无需补做计时检查；另一题新发现错误时间影响别人，要及时更正。四步法是需要时借用的工具，不是时时自我监督的规则。',action:'有必要事项就具体处理；没有新信息就回到生活，不必为了“更稳”追加检查。'}
];
function renderPaceGuide(topic){
 const p=PACE_GUIDES.find(p=>p.topic===topic);if(!p)return '';
 const pending=quickState&&quickState.step<quickState.ids.length;
 return `<details id="paceGuide"><summary>内在节律 · 分清心急与事急（可选）</summary><p class="learning-memory">${safe(p.memory)}</p><p>外部期限是真实的时间、安全责任与约定；内部催促是“必须马上、不能出错”的念头。急促感也可能提醒疲惫或负荷过高，值得核对，不必消灭。</p><ol><li>觉察：我现在被什么念头催促？</li><li>分辨：哪些风险、期限和需要已确认？</li><li>排序：哪一步能先降低风险或推进结果？</li><li>复核：关键事实和下一步是否够清楚？需要的检查完成就结束。</li></ol><p class="learning-caution">只核对会影响当前决定的关键事实，不等信息全部完整。普通熟悉的交流可以自然回应；没有固定停顿时长，不计时、不评分。明确紧急危险时及时寻求安全支持，不等做完四步。</p><p>节奏可以变快或变慢。任务可行就推进，资源不足就协调；有助于减少不必要的错误与返工，但不保证从容就一定高效。</p><button class="secondary" data-principle-pair="${safe(p.id)}">${pending?'先继续上次刷题':'用两道题练行动节奏'}</button><p class="small muted">${pending?'已有未完成快练，进入继续入口，不替换本轮。':'每题先答再解释，两题完成后对照条件。'}只在需要时借用，随时可以跳过。</p><div class="actions">${PACE_GUIDES.filter(x=>x.topic!==topic).map(x=>`<button class="ghost" data-pace-topic="${safe(x.topic)}">${safe(x.title)}</button>`).join('')}</div></details>`;
}
function openPaceGuide(topic='observe'){
 if(!PACE_GUIDES.some(p=>p.topic===topic))return;
 communicationLesson=topic;communicationSave();setPage('communication');
 const guide=document.getElementById('paceGuide');if(guide){guide.open=true;requestAnimationFrame(()=>guide.scrollIntoView({block:'start'}))}
}

// Extra case pairs share the same registration and unfinished-round protection.
const EXTRA_PRACTICE_PAIRS=[
 {id:'collaboration-authority',topic:'clarify',title:'需要确认，还是已有授权？',memory:'讲清一个依据，商量一个下一步。',pair:['Q92','Q94'],contrast:'一题已有明确确认要求，应说明规则并商量联系与跟进；另一题书面授权已覆盖且条件满足，可以据此处理并同步分工。是否确认取决于规则、权限和风险，不从反问猜动机。',action:'在低风险协作或纸面模拟中，说清一个关键顾虑或依据，商量谁做什么；信息够用后即可结束重复解释。'}
];
function renderLessonPair(topic){
 const p=EXTRA_PRACTICE_PAIRS.find(p=>p.topic===topic);if(!p)return '';
 const pending=quickState&&quickState.step<quickState.ids.length;
 return `<details id="lessonPair"><summary>用两种权限条件练判断（可选）</summary><p class="learning-memory">${safe(p.memory)}</p><p>一次反问不能证明对方拒绝或已有办法。先核对疑问，讲清必要依据；规则与授权不同，下一步也应不同。</p><button class="secondary" data-principle-pair="${safe(p.id)}">${pending?'先继续上次刷题':'练需要确认与已有授权两题'}</button><p class="small muted">${pending?'已有未完成快练，先带你回继续入口，不替换本轮。':'每题先答后解释，完整两题后再看条件对照。'}也可以直接开始下方自主表达，不用全部做完。</p></details>`;
}
