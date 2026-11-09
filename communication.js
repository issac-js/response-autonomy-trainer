// Structured knowledge -> independent response -> changed conditions -> real observation.
// These are communication exercises, not exposure therapy or a diagnostic scale.
const COMMUNICATION_LESSONS=[
 {id:'observe',title:'从情绪中退一步，看清事实',why:'感受能提醒需要，但不能单独证明对方的动机；换视角是增加信息，不是获得全知视角。',steps:['事实：只写能看到、听到的内容。','感受：承认紧张、委屈或生气，不要求先消除它。','推测：用“可能”表达，保留其他解释。','需要与行动：确认当前需要，再选一个能做的小动作。'],scene:'你给熟悉同事发了一条普通消息，半天没收到回复。没有紧急事项，也不知道对方是否看见。',prompt:'你准备怎样理解这件事，又会怎样回应？',example:'事实是暂时没回复；我有点不安，但原因还不知道。这件事不急，我先做手头的事。',variants:[['urgent','现在确有一项职责内事项需要今天确认，且有正式联系渠道。','这项需要今天三点前确认。方便时请回复；若你不在，我会按流程联系值班同事。'],['clarified','对方后来说明手机没电，并正常回复了内容。','原来如此，谢谢回复。我们接着确认刚才那件事。']],transfer:'在一条不紧急、无敏感内容的日常消息中，区分一次事实和自己的猜测。'},
 {id:'listen',title:'倾听与自然接话',why:'先接住对方正在说的事，通常比急着展示自己或找漂亮句子更能让交流继续。',steps:['先听完整：对方是在分享、求助，还是只想被听见？','复述一个具体信息，允许对方纠正。','问一个相关、不过度打探的问题，或分享一点自己的真实体验。','观察对方是否愿意继续；话题自然结束也可以。'],scene:'熟悉同事午休说：“我周末去了一家小店，等了好久，不过味道挺不错。”没有工作请求。',prompt:'怎样接一句，既回应内容又给对方选择空间？',example:'等那么久还觉得不错，看来有亮点。你最推荐哪一道？',variants:[['ending','对方看了一眼时间，说现在要去处理工作，不想继续聊。','好，你先忙。有机会再聊。'],['support','对方转而说最近很累，只想有人听听，不需要建议。','听起来这阵子挺耗精力的。我可以听你说，不急着给建议。']],transfer:'在一次愿意参与的闲聊中，先接住一个具体信息，再决定问一句或自然结束。'},
 {id:'appreciate',title:'真诚认可，不靠夸奖换承诺',why:'具体认可让对方知道什么帮助了你；夸奖与请求分开，才能保留双方的选择。',steps:['说可观察到的行为，不猜人格或动机。','说明这件事对任务或自己的具体帮助。','表达真实感谢，不编造评价。','若有请求，单独说明范围，允许对方拒绝或协商。'],scene:'同事整理的表格让你很快找到了交接事项，你确实觉得有帮助。',prompt:'你会怎样表达认可？',example:'你把待办和负责人分开列了，我一下就找到交接项了，谢谢。',variants:[['request','你还想请对方周末额外帮忙，但对方没有答应，也没有这项义务。','另外有个请求：周末能否帮我核对一页内容？不方便的话我另作安排，刚才的感谢仍然是真心的。'],['credit','你后来发现表格是团队共同整理，对方只负责其中一部分。','这份表格帮了我不少，谢谢你负责的交接部分；其他同事的整理也很重要。']],transfer:'对一次真实帮助作具体感谢，不把恭维作为让别人答应的工具。'},
 {id:'privacy',title:'保留隐私，也把合作所需说清',why:'不必公开所有私人打算；但会影响授权、职责或他人决定的信息，应在适当范围诚实说明。',steps:['区分私人想法与对当前合作有实质影响的信息。','选择愿意分享的范围，不靠编造理由维持边界。','对相关职责说明事实、限制和下一步。','信息不足时先澄清用途；不把所有询问当试探。'],scene:'普通闲聊中，同事问你下半年是否准备换工作。你还没有决定，也不想讨论私人规划。',prompt:'怎样回应，既保留空间又不编造说法？',example:'这方面我还没定，暂时想自己考虑。有和工作交接有关的事，我们可以具体聊。',variants:[['duty','你已正式确认将离开当前项目，负责交接的人需要核对任务安排；私人去向仍无关。','我的项目交接已确认。我会按安排整理未完成事项和时间，私人去向暂时不展开。'],['ordinary','对方说明只是随口聊，你愿意分享一点学习兴趣，没有保密事项。','工作规划还没定，不过最近在学一些新东西，觉得挺有意思。']],transfer:'在低风险日常交流中选一次分享范围，同时补足确有必要的合作信息。'},
 {id:'coordinate',title:'地铁离座：多视角与实际协调',why:'双方的出发点可以都合理，行动仍可能互相妨碍。理解需要不等于责任总要各担一半；规则、安全与特殊需要会改变优先顺序。',steps:['先看事实：谁要离开、谁要落座，是否挡路或发生碰撞？','分别提出可能的需要，再核对，别把视角转换当读心。','区分意图与影响：没想妨碍别人，仍可以调整位置或时机。','先协调一个可行顺序；涉及安全、优先需要或明确侵扰时，不能只说“各有道理”。'],scene:'模拟：你准备下车，刚站起转身拿包；另一位乘客急着坐下，你们暂时互相挡住。没有碰撞、辱骂或已知特殊需要。',prompt:'此时怎样协调，比争谁离座快、谁找座慢更有用？',example:'我拿一下包就让开，麻烦等一小会儿。对方也可以说“好，你先拿”。先给出动作顺序，不急着给人贴标签。',variants:[['priority','对方持杖，明确说站不稳、需要先坐；你可以先侧身，再从另一侧拿包。','您先坐，我侧一下再拿包。先保证安全，不坚持刚才的顺序。'],['uncertain','对方没有坐下，只是想经过，你原先猜错了对方的意图。','你是要过去吗？我先让一下。根据新信息换方案，不继续争座位。']],transfer:'仅做纸面模拟，或在熟悉、安全的场合协商一次先后顺序；不要在拥挤车厢制造冲突练习。'},
 {id:'repair',title:'有误解时修复，不给自己判人格分',why:'表达可能产生不同影响；说明意图与承认具体影响可以同时成立。修复不要求保证对方马上满意。',steps:['指出具体事件，不把一次失误扩成“我不会社交”。','承认已知影响；尚未证实的部分先核对。','说明必要事实，提出一个能落实的调整。','给对方回应空间，复盘一次后回到生活。'],scene:'你在讨论中打断了同事，对方说：“我刚才还没讲完。”你确实抢先说了自己的方案。',prompt:'你怎样让对话继续，而不是长篇证明自己没有恶意？',example:'刚才我抢着说了，你先把想法讲完，我听完再补充。',variants:[['misheard','对方后来说明不是指你打断，而是线上会议掉线了，没听清后半句。','原来是连接问题。我把后半句再说一下，也确认你听到了。'],['boundary','对方开始当众贬低你的人格，而不是讨论这次打断。','刚才打断这点我会调整。具体问题我们可以继续谈，但请不要作人格评价。']],transfer:'在一次小误解中，只澄清一件事或做一个调整；不必反复道歉到完全安心。'}
];
// Adapt the learning structure from incident-analysis; everyday communication
// examples below are authored here, not copied from professional incident cases.
const COMMUNICATION_GUIDES={
 observe:{information:'先看事项是否紧急、自己承担什么职责和已有约定；必要时向相关同事确认截止时间与正式联系渠道。这些信息决定等待还是联系，不需要追查对方私人行程。',boundary:'不靠重复发消息换取确定感；有职责期限时也不把“容许不确定”当作不处理任务的理由。',fallback:'若期限或任务风险变化，核对可用渠道并按职责联系；若没有新需求，继续手头的事即可。',variants:{urgent:['尚不清楚对方是否在岗、能否及时回复。','职责内事项有明确期限，等待成本已经变化；用清楚的时间和正式渠道推进，比猜测是否被轻视更有用。'],clarified:['仍无法知道对方所有想法，但本次未回复已有具体解释。','手机没电与后来正常回复是新证据，应更新原先猜测，回到事情本身，不继续搜集“对方不重视我”的证据。']}},
 listen:{information:'先听对方已说出的内容，观察其时间与继续聊的意愿；不确定时问“你想聊聊，还是希望一起想办法？”这会决定倾听、建议或结束。',boundary:'对方可以结束话题或不接受建议；你也可以说明自己能听多久，不必靠不断提问维持聊天。',fallback:'如果对方的需要变了，重新确认再调整；若只是普通分享，接住一个具体信息就够，不必挖掘隐藏问题。',variants:{ending:['不必查明对方结束闲聊的所有原因。','对方明确表示要工作，是足够的结束信号。友好收尾能尊重时间，不需要用更多话证明热情。'],support:['尚不知道对方是否会稍后需要实际帮助。','对方已经说明想被倾听而非得到建议，当前应把回应从推荐菜品或解决问题调整为听见感受；之后有新请求再讨论帮助。']}},
 appreciate:{information:'具体帮助是什么、谁贡献了哪一部分，可从工作成果和参与者处核对；提出额外请求时另问是否方便。这会影响感谢对象、请求范围和安排。',boundary:'感谢不构成对方答应额外工作的义务；没有证据时不揽功，也不替别人承诺。',fallback:'对方若拒绝额外请求，保留感谢并另作安排；发现贡献归属不准确，就修正称赞对象和范围。',variants:{request:['尚不知道对方周末是否有空、是否愿意承担额外工作。','真实感谢与额外请求是两件事。明确范围并允许拒绝，可以表达需要，也避免让夸奖变成隐性压力。'],credit:['团队成员其他部分的具体贡献尚未全部核实。','新信息说明成果来自团队，应把感谢细化到已知贡献；修正归属并不需要撤回真实感谢。']}},
 privacy:{information:'核对询问用途、对方是否承担相关职责、哪些信息会影响交接；只向合适对象确认必要安排。这会决定分享范围，而不是先判定所有询问都有恶意。',boundary:'私人去向可以保留；对影响他人安排的已确认交接事实如实说明，不用编造说法来维护隐私。',fallback:'用途或授权若变化，重新确认必要范围；普通闲聊中愿意分享一点也可以，不必为了守界而一律拒绝。',variants:{duty:['私人去向与原因没有提供，也不是当前交接所必需的信息。','离开项目已经确认且会影响协作，交接事实应说明；合作所需信息与私人去向分开，能同时保护隐私和履行职责。'],ordinary:['未确定的工作规划仍然没有答案。','对方说明只是闲聊，而你愿意分享学习兴趣，可以自然交流。边界是自主选择分享范围，不是固定地把话题挡回去。']}},
 coordinate:{information:'向对方确认是要坐下还是经过，观察是否挡路；对明确表达的站立困难先作安全协调，不要求对方证明私人病史。这会改变先坐、先拿包或先让路的顺序。',boundary:'规则、安全与明确需要影响先后；理解双方不代表责任一律均分，也不需要在拥挤车厢制造冲突练习。',fallback:'如果位置调整仍不安全，就暂停争抢并寻找可行空间或现场协助；信息不足时用一句澄清代替读心。',variants:{priority:['不清楚对方的具体健康状况，也无需为侧身让座而追问诊断。','持杖且明确站不稳带来优先的安全需要；既然可先侧身再拿包，就有更安全的顺序，原先“我先拿”的安排应调整。'],uncertain:['此前“对方急着坐”的推测不成立；经过的具体方向可再确认。','目标变成通行后，应解决挡路而不是争座。承认并修正对意图的误判，比继续证明谁有理更有效。']}},
 repair:{information:'核对具体哪句话没听清、哪个动作产生影响，可请当事人指出；把可核实事件与人格评价分开。这会决定重述、道歉修复还是明确边界。',boundary:'承认可核实的影响不等于接受人格贬低；修复也不要求保证对方立刻满意。',fallback:'若又有相反证据就修正判断；若持续出现贬低或无法有效沟通，可暂停并约定合适方式继续讨论具体问题。',variants:{misheard:['连接问题解决后是否听清，仍需简短确认。','新信息把问题从打断修正为没听清；应重述遗漏内容并确认接收，不继续为已经澄清的误会长篇自证。'],boundary:['对方是否愿意回到具体事项尚未知。','自己确实打断过，仍应调整；但当众人格贬低是另一件事，可以同时承认具体失误并要求讨论回到事情本身。']}}
};
function communicationGuide(lesson,variant){
 const g=COMMUNICATION_GUIDES[lesson.id],v=g.variants[variant[0]];
 const sections=[
  ['已知与未知','本轮补充或更正：'+variant[1]+' 尚未知：'+v[0]+' 以新证据修正起始判断，不把未知填成动机。'],
  ['必要信息与获取方式',g.information],
  ['暂定判断与依据',v[1]],
  ['优先行动与边界','一种表达：'+variant[2]+' 边界：'+g.boundary],
  ['变化与备用路径',g.fallback],
  ['巩固与现实迁移','先收起参考，用自己的话说：我依据什么作判断？什么信息会让我改变做法？如果没有新信息，是否可以保持原安排？低风险小练习：'+lesson.transfer]
 ];
 return `<details id="communicationGuide"><summary>完整判断思路 · 为什么这样调整</summary>${sections.map(([title,text])=>`<h3>${safe(title)}</h3><p>${safe(text)}</p>`).join('')}<p class="small muted">这是情境参考，不是对你的原话自动评分。合理表达可以不同；阅读或完成模拟不等于已形成现实能力。</p></details>`;
}
const COMMUNICATION_KEY='response-autonomy-communication-v1';
let communicationStorageOK=true;
let communicationProgress=communicationRead(),communicationLesson=communicationLastLesson();
function communicationLastLesson(){try{const selected=JSON.parse(sessionStorage.getItem(COMMUNICATION_KEY)||'{}').selected;if(COMMUNICATION_LESSONS.some(x=>x.id===selected))return selected}catch(e){}return 'observe'}
function communicationRead(){
 try{const value=JSON.parse(sessionStorage.getItem(COMMUNICATION_KEY)||'{}'),out={};for(const lesson of COMMUNICATION_LESSONS){const s=value?.[lesson.id];if(s&&[0,1,2].includes(s.stage)&&Array.isArray(s.answers)&&s.answers.length===2&&s.answers.every(x=>typeof x==='string'&&x.length<=1200)&&lesson.variants.some(v=>v[0]===s.variant))out[lesson.id]={stage:s.stage,answers:s.answers,variant:s.variant}}return out}catch(e){return {}}
}
function communicationClear(){communicationProgress={};try{sessionStorage.removeItem(COMMUNICATION_KEY)}catch(e){}}
function communicationSave(){try{sessionStorage.setItem(COMMUNICATION_KEY,JSON.stringify({...communicationProgress,selected:communicationLesson}));communicationStorageOK=true;return true}catch(e){communicationStorageOK=false;return false}}
function renderCommunication(){
 const lesson=COMMUNICATION_LESSONS.find(x=>x.id===communicationLesson)||COMMUNICATION_LESSONS[0];
 const s=communicationProgress[lesson.id]||={stage:0,answers:['',''],variant:lesson.variants[0][0]},variant=lesson.variants.find(v=>v[0]===s.variant);
 root.innerHTML=`<section class="panel"><h2>沟通方法 · 先理解，再练习</h2><p>每次只练一个小动作。允许紧张、重复、跳过或休息；不按焦虑下降升级，也不要求每句话都完美。</p><label for="communicationLesson">选择能力</label><select id="communicationLesson">${COMMUNICATION_LESSONS.map(x=>`<option value="${x.id}" ${x.id===lesson.id?'selected':''}>${safe(x.title)}</option>`).join('')}</select><details ${s.stage===0?'open':''}><summary>知识顺序与判断依据</summary><h3>${safe(lesson.title)}</h3><p>${safe(lesson.why)}</p><ol>${lesson.steps.map(x=>`<li>${safe(x)}</li>`).join('')}</ol></details><details><summary>低压力练习顺序与使用边界</summary><p>先纸面模拟 → 愿意时在熟悉、安全的交流中试一个动作 → 复盘后再自主选择是否增加一点变化。可以只做模拟，不要求制造冲突或等到不紧张才行动。这是沟通练习，不是临床脱敏治疗。</p><p>情绪是信息，不需要压住或消灭。换视角仍会有未知；理解对方也不代表必须让步。私人意图可保留，涉及授权和职责时不误导他人。</p></details></section><section class="panel"><span class="pill">${s.stage===0?'独立回应':s.stage===1?'改变条件后重答':'本次模拟完成'}</span><h2 ${s.stage>0?'data-practice-focus':''}>${s.stage===0?'先写自己的判断和原话':s.stage===1?'条件变了，还用原来的说法吗？':'只选一个现实小动作'}</h2><p class="scene">${safe(lesson.scene)}</p>${s.stage>0?`<details><summary>回看第一轮原话与一种示范</summary><p class="quote-reply">${safe(s.answers[0])}</p><p>${safe(lesson.example)}</p><p class="small muted">示范不是标准答案，也不证明对方一定会这样回应。</p></details>`:''}${s.stage===1?`<label for="communicationVariant">改变一个条件</label><select id="communicationVariant">${lesson.variants.map(v=>`<option value="${v[0]}" ${v[0]===s.variant?'selected':''}>${safe(v[1])}</option>`).join('')}</select><p class="notice">${safe(variant[1])}</p>`:''}${s.stage<2?`<label for="communicationOwn">${s.stage===0?safe(lesson.prompt):'哪些新信息改变了判断？现在会怎么说、怎么做？'}</label><textarea id="communicationOwn" ${unsavedAttrs('communication',lesson.id,String(s.stage)+':'+s.variant,'own')} maxlength="1200" placeholder="写自己的判断和一两句回应；可以保留不确定。">${safe(s.answers[s.stage])}</textarea><div class="actions"><button class="primary" id="communicationCommit" ${s.answers[s.stage].trim()?'':'disabled'}>${s.stage===0?'确认原话 · 看条件变化':'确认调整 · 查看复盘'}</button></div>`:`<p><b>变化条件：</b>${safe(variant[1])}</p><p class="quote-reply">${safe(s.answers[1])}</p>${communicationGuide(lesson,variant)}<p>复盘一次即可：新信息是什么？我调整了哪个动作？什么仍然未知？不以对方满意、拒绝次数或不适下降判定成功。</p><p><b>低风险实践：</b>${safe(lesson.transfer)}</p><p>可进入已有“真实交流”填写自己的预测与小动作；实际结果可以是顺利、未知或不理想。</p><div class="actions"><button class="primary" id="communicationTransfer">填写真实交流计划</button><button class="secondary" id="communicationAgain">换个条件再练</button></div>`}<p class="small muted" id="communicationStatus" role="status">${communicationStorageOK?'当前课程只在本标签页暂存，不写入学习记录、不进入备份或云同步。真实计划需另行明确保存。':'暂存不可用，请自行保留需要的文字；关闭或刷新页面可能丢失。'}</p><button class="ghost" id="communicationRest">暂存并休息</button></section>`;
 document.getElementById('communicationLesson').onchange=e=>{communicationLesson=e.target.value;communicationSave();renderCommunication()};
 document.getElementById('communicationRest').onclick=()=>setPage('home');
 if(s.stage<2){
  const input=document.getElementById('communicationOwn'),button=document.getElementById('communicationCommit');
  input.oninput=()=>{communicationProgress[lesson.id]=s;s.answers[s.stage]=input.value;button.disabled=!input.value.trim();if(!communicationSave())document.getElementById('communicationStatus').textContent='本标签页暂存不可用，请先自行保留需要的文字。'};
  firstTap(button,()=>{if(!input.value.trim())return;communicationProgress[lesson.id]=s;s.answers[s.stage]=input.value;s.stage++;communicationSave();unsavedClear('communication',lesson.id);renderCommunication()});
  const select=document.getElementById('communicationVariant');if(select)select.onchange=e=>{s.variant=e.target.value;s.answers[1]='';communicationSave();renderCommunication()};
 }else{
  document.getElementById('communicationAgain').onclick=()=>{s.variant=lesson.variants.find(v=>v[0]!==s.variant)[0];s.stage=1;s.answers[1]='';communicationSave();renderCommunication()};
  document.getElementById('communicationTransfer').onclick=()=>openRealPractice(lesson.transfer,'communicationStatus');
 }
}

// Shared handoff: keep existing drafts and require the user to save a real plan.
function openRealPractice(context='',statusId=''){
 if(data.coach.draft){const status=document.getElementById(statusId);if(status)status.textContent='已有未完成模拟，请先结束该模拟，再填写新的真实交流计划。';return}
 coachPane='real';setPage('coach');unsavedRestore();
 const field=document.getElementById('realContext');if(field&&!field.value.trim()&&context){field.value=context;field.dispatchEvent(new Event('input',{bubbles:true}))}
}
