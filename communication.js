// Structured knowledge -> independent response -> changed conditions -> real observation.
// These are communication exercises, not exposure therapy or a diagnostic scale.
// Plain-language communication lessons. Stable IDs preserve per-tab progress.
const COMMUNICATION_LESSONS=[
 {
  "id": "observe",
  "title": "没收到回复：先分清事实和猜测",
  "why": "“还没回消息”是事实，“他看不起我”只是猜测。先看这件事急不急，再决定等一等还是联系。",
  "steps": [
   "看事实：我亲眼看到、亲耳听到了什么？",
   "认感受：我有点慌或委屈，可以先承认。",
   "留余地：原因还不知道，不急着猜对方的心思。",
   "选动作：不急就先忙自己的事；真有期限就说明时间。"
  ],
  "scene": "你给熟悉的同事发了一条普通消息，半天没收到回复。这件事不急，你也不知道对方看没看见。",
  "prompt": "你现在知道什么？你会怎么想、怎么说？",
  "example": "目前只知道他还没回。我有点不安，但原因还不清楚。这件事不急，我先忙手头的事。",
  "variants": [
   [
    "urgent",
    "情况变了：有一项你负责的工作今天必须确认，而且有工作电话可以联系。",
    "这件事需要今天三点前确认。方便时请回复；如果你不在，我会按工作安排联系值班同事。"
   ],
   [
    "clarified",
    "后来对方说手机没电了，并正常回复了你的消息。",
    "原来如此，谢谢回复。我们接着确认刚才那件事。"
   ]
  ],
  "transfer": "遇到一条不紧急的日常消息时，试着说清：哪些是事实，哪些只是我的猜测。"
 },
 {
  "id": "listen",
  "title": "自然接话：先接住对方正在说的事",
  "why": "接话不需要句句精彩。先回应对方刚说的一点，再看他想继续聊，还是想停一停。",
  "steps": [
   "先听：对方在分享、求助，还是只想有人听？",
   "接一点：回应他刚说的具体内容。",
   "轻问一句：问相关的小问题，不追问隐私。",
   "看意愿：对方要忙就收尾，安静一会儿也没关系。"
  ],
  "scene": "午休时，熟悉的同事说：“我周末去了一家小店，等了好久，不过味道挺不错。”这不是工作请求。",
  "prompt": "你会怎样自然接一句？",
  "example": "等那么久还觉得不错，看来有亮点。你最推荐哪一道？",
  "variants": [
   [
    "ending",
    "对方看了看时间，说要去忙工作，现在不想继续聊了。",
    "好，你先忙。有机会再聊。"
   ],
   [
    "support",
    "对方转而说最近很累，只想有人听听，不需要你帮他出主意。",
    "听起来这阵子挺累的。我可以听你说，不急着给建议。"
   ]
  ],
  "transfer": "下次愿意闲聊时，先回应一个具体信息，再决定问一句或自然结束。"
 },
 {
  "id": "appreciate",
  "title": "真诚感谢：夸具体，提请求要分开",
  "why": "说清“哪件事帮到了我”，比泛泛夸人更真诚。想请人额外帮忙时，另说请求，给对方选择。",
  "steps": [
   "夸具体：说对方做了什么。",
   "说帮助：这件事给你带来什么方便？",
   "真感谢：不编夸奖，不替别人抢功。",
   "请求另说：讲清想请他做什么，允许拒绝或商量。"
  ],
  "scene": "同事整理的表格让你很快找到了交接事项，你确实觉得有帮助。",
  "prompt": "你会怎样感谢这位同事？",
  "example": "你把待办和负责人分开列了，我一下就找到交接项了，谢谢。",
  "variants": [
   [
    "request",
    "你还想请对方周末额外帮忙，但这不是他的义务，他也还没答应。",
    "另外想问一下：周末能否帮我核对一页内容？不方便的话我另作安排。刚才的感谢是真心的。"
   ],
   [
    "credit",
    "你后来发现表格是团队一起整理的，这位同事只负责其中一部分。",
    "这份表格帮了我不少，谢谢你整理的交接部分，也谢谢其他同事的整理。"
   ]
  ],
  "transfer": "遇到一次真实帮助时，说清具体感谢；有额外请求就另说，不让感谢变成压力。"
 },
 {
  "id": "privacy",
  "title": "保护隐私：私事可保留，工作要交代",
  "why": "不是所有想法都要公开。但会影响别人做事的已确认安排，需要向相关的人说清楚。",
  "steps": [
   "分开看：这是我的私事，还是会影响合作的事？",
   "定范围：愿意说多少由自己决定，不必编理由。",
   "讲工作：相关的进度、交接和限制要如实说明。",
   "先问用途：没听明白就问，不把普通闲聊都当试探。"
  ],
  "scene": "普通闲聊中，同事问你下半年是否准备换工作。你还没决定，也不想聊自己的私人计划。",
  "prompt": "怎样回答，既留住空间又不说假话？",
  "example": "这方面我还没定，暂时想自己考虑。如果是工作交接的事，我们可以具体聊。",
  "variants": [
   [
    "duty",
    "现在你已经确认要离开这个项目，负责交接的人需要安排任务，但不需要知道你的私人去向。",
    "项目交接已经确认了。我会整理好未完成的事和时间，私人去向暂时不展开。"
   ],
   [
    "ordinary",
    "对方说明只是随口聊。你愿意分享一点最近的学习兴趣，也没有需要保密的内容。",
    "工作规划还没定，不过最近在学一些新东西，觉得挺有意思。"
   ]
  ],
  "transfer": "找一次低风险交流，决定愿意分享多少；如果确实影响合作，再补上必要的工作信息。"
 },
 {
  "id": "coordinate",
  "title": "互相挡路：先协调，别急着争输赢",
  "why": "两个人都可能没有坏心，却还是互相妨碍。先想怎样让事情顺利进行；有人站不稳时，安全要放前面。",
  "steps": [
   "看现场：谁要走、谁要坐，哪里挡住了？",
   "问需要：不确定就问一句，别当作自己已经知道。",
   "调动作：没有恶意，也可以挪一下位置。",
   "排先后：先看安全和实际需要，再商量谁先做什么。"
  ],
  "scene": "模拟：你准备下车，刚站起拿包；另一位乘客急着坐下，你们互相挡住了。没有碰撞、辱骂，也没发现特殊需要。",
  "prompt": "现在怎么协调，比争“谁动作快慢”更有用？",
  "example": "我拿一下包就让开，麻烦等一小会儿。先把动作顺序说清楚。",
  "variants": [
   [
    "priority",
    "对方拿着手杖，明确说自己站不稳，需要先坐。你可以先侧身，再从另一侧拿包。",
    "您先坐，我侧一下再拿包。"
   ],
   [
    "uncertain",
    "你发现对方不是要坐下，而是想从这里经过，刚才猜错了。",
    "你是要过去吗？我先让一下。"
   ]
  ],
  "transfer": "可以只做纸面模拟；或在熟悉、安全的场合商量一次先后顺序，不在拥挤车厢制造冲突。"
 },
 {
  "id": "repair",
  "title": "说错或听岔：改具体一件事就好",
  "why": "一次说话不顺，不代表你“不会社交”。把具体问题弄清，调整一个动作，就可以让对话继续。",
  "steps": [
   "说具体：是哪句话、哪个动作出了问题？",
   "认影响：确实影响了别人，就承认这一点。",
   "做调整：让对方说完、重说一句，或约个更合适的方式。",
   "留空间：不用保证对方立刻满意，也不用反复自责。"
  ],
  "scene": "讨论中，你抢先说了自己的方案。同事说：“我刚才还没讲完。”",
  "prompt": "你会怎么让对话继续？",
  "example": "刚才我抢着说了，你先讲完，我听完再补充。",
  "variants": [
   [
    "misheard",
    "对方后来说明，他是在说线上会议掉线，没听清后半句，并不是在责怪你打断。",
    "原来是连接问题。我把后半句再说一下，也确认你听到了。"
   ],
   [
    "boundary",
    "对方开始当众贬低你整个人，而不是讨论刚才打断这件事。",
    "刚才打断这点我会调整。具体问题可以继续谈，但请不要作人格评价。"
   ]
  ],
  "transfer": "下次遇到一个小误会，先弄清一件事，再做一个调整，不必反复证明自己没有恶意。"
 }
];
// Six-step review adapted from incident-analysis; everyday examples authored here.
const COMMUNICATION_GUIDES={
 "observe": {
  "memory": "**先看事情急不急，再决定等还是联系。**",
  "information": "先确认：**谁负责、几点前要答复、能找谁联系**。可以看工作约定，或问相关同事；不用追问对方去了哪里。",
  "boundary": "不急的事不用连续追问；真有工作期限，也别一直等下去。",
  "fallback": "如果快到截止时间还没回复，就按工作安排找合适的人；没有新情况时，可以继续手头的事。",
  "variants": {
   "urgent": [
    "对方现在能否回复，还不知道。",
    "现在有明确期限，继续等可能耽误工作。**把截止时间说清，再用工作渠道联系。**"
   ],
   "clarified": [
    "不需要知道对方所有想法。",
    "手机没电、后来正常回复，已经解释了这次没回消息。**有了新信息，就更新原先的猜测。**"
   ]
  }
 },
 "listen": {
  "memory": "**先回应一句，再看对方想继续还是想停。**",
  "information": "听他说了什么，看看他有没有时间。不确定时问：**“你想聊聊，还是希望我帮忙想办法？”** 这能帮你决定先听还是提建议。",
  "boundary": "对方可以结束话题；你也可以说自己能听多久，不必一直找话。",
  "fallback": "如果对方后来想要建议，再一起想办法；如果只是闲聊，接住一点内容就够。",
  "variants": {
   "ending": [
    "不必弄清对方结束聊天的所有原因。",
    "他已经说要工作了，说明现在想结束。**友好收尾就是回应，不必再追着找话。**"
   ],
   "support": [
    "他以后要不要实际帮助，还不知道。",
    "他已经说只想有人听。**先听感受，别急着替他解决问题。** 有新请求时再讨论。"
   ]
  }
 },
 "appreciate": {
  "memory": "**感谢说具体，请求另开口。**",
  "information": "从表格或参与者那里确认：**谁做了哪一部分**。要额外请人帮忙，再问是否方便，不能当作对方已答应。",
  "boundary": "感谢不等于对方欠你帮助；只夸已知的贡献，不替别人答应。",
  "fallback": "对方不方便就另作安排，感谢仍然成立；发现夸错对象，就把感谢说准确。",
  "variants": {
   "request": [
    "对方有没有空、愿不愿意，还不知道。",
    "帮过你不等于必须再帮。**把感谢和请求分开，让对方能自由答应或拒绝。**"
   ],
   "credit": [
    "其他成员各自做了多少，还没有全部弄清。",
    "现在知道是团队成果了。**感谢这位同事做的部分，也承认其他人的贡献。**"
   ]
  }
 },
 "privacy": {
  "memory": "**私事可以不说，影响工作的安排要说清。**",
  "information": "先问**“这和哪项工作安排有关？”**，确认对方需要什么。只向相关的人提供必要的交接信息，不必交代全部私事。",
  "boundary": "不想说私人去向可以直说；已确认的工作交接不要隐瞒或编造。",
  "fallback": "如果询问用途变了，就重新决定说多少；愿意闲聊时，自然分享一点也可以。",
  "variants": {
   "duty": [
    "私人去向不是这次交接需要的信息。",
    "你离开项目会影响别人安排任务。**说清交接，保留私人去向，两者可以同时做到。**"
   ],
   "ordinary": [
    "工作规划还没决定。",
    "这是普通闲聊，你也愿意分享兴趣。**愿意就自然聊，边界不是每次都要拒绝。**"
   ]
  }
 },
 "coordinate": {
  "memory": "**先看需要，再商量谁先做；安全放前面。**",
  "information": "问一句**“你是要坐下，还是要过去？”**，再看看哪边能让开。对方明确站不稳时，先协调安全位置，不用追问病史。",
  "boundary": "理解双方，不等于所有责任都各一半；不要为练习故意制造冲突。",
  "fallback": "挪位置仍不安全时，先别争抢，找可行空间或现场帮助；没弄明白时，问一句就好。",
  "variants": {
   "priority": [
    "具体健康情况不知道，也无需为让座追问。",
    "对方站不稳，而你能侧身拿包。**先让他坐稳，再拿包，更能照顾安全。**"
   ],
   "uncertain": [
    "对方经过的方向还可以再问一句。",
    "现在知道他是要经过。**问题是挡路，就先让路，不必继续争谁先坐。**"
   ]
  }
 },
 "repair": {
  "memory": "**弄清具体问题，改一个动作，不给自己贴标签。**",
  "information": "可以问**“你是没听清哪一句？”** 或确认哪个动作影响了对方。这能分清该重说、让对方讲完，还是提醒对方别做人身评价。",
  "boundary": "承认自己打断，不等于要接受别人贬低；修复也不要求对方马上满意。",
  "fallback": "发现听岔就更正；如果一直被贬低，可以暂停，约定用合适的方式继续谈具体问题。",
  "variants": {
   "misheard": [
    "重说后对方是否听清，还需要确认。",
    "新信息说明问题是没听清。**把漏掉的内容重说一次，再确认对方听到了。** 不必继续为误会解释。"
   ],
   "boundary": [
    "对方愿不愿意回到具体问题，还不知道。",
    "打断需要改，但贬低你整个人是另一件事。**可以承认具体失误，同时要求停止人身评价。**"
   ]
  }
 }
};
function communicationGuide(lesson,variant){
 const g=COMMUNICATION_GUIDES[lesson.id],v=g.variants[variant[0]];
 const sections=[
  ['1 · 现在知道什么？',variant[1]+' 还不确定：'+v[0]],
  ['2 · 先问清哪件事？',g.information],
  ['3 · 为什么这样选？',v[1]],
  ['4 · 可以怎么说？',variant[2]],
  ['5 · 要留意什么？',g.boundary+' '+g.fallback],
  ['6 · 下次怎么用？','收起参考，用自己的话说：我先确认什么？为什么这么做？什么情况会让我换个做法？不必逐项填写。']
 ];
 return `<div class="learning-keynote"><span class="learning-label">记住一句</span><p>${mdBold(g.memory)}</p></div><details id="communicationGuide"><summary>完整判断思路 · 为什么这样调整</summary>${sections.map(([title,text])=>`<h3>${safe(title)}</h3><p class="learning-copy">${mdBold(text)}</p>`).join('')}<p class="learning-caution"><b>提醒：</b>这是本题参考，不是对你的原话打分。表达可以不同；读懂后，还可以换条件试一次。</p></details>`;
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
 root.innerHTML=`<section class="panel"><h2>沟通方法 · 先理解，再练习</h2><p>每次只练一个小动作。允许紧张、重复、跳过或休息；不按焦虑下降升级，也不要求每句话都完美。</p><label for="communicationLesson">选择能力</label><select id="communicationLesson">${COMMUNICATION_LESSONS.map(x=>`<option value="${x.id}" ${x.id===lesson.id?'selected':''}>${safe(x.title)}</option>`).join('')}</select><details ${s.stage===0?'open':''}><summary>先记一句，再看怎么做</summary><h3>${safe(lesson.title)}</h3><p>${safe(lesson.why)}</p><p class="learning-memory">${mdBold(COMMUNICATION_GUIDES[lesson.id].memory)}</p><ol>${lesson.steps.map(x=>`<li>${safe(x)}</li>`).join('')}</ol></details><details><summary>怎么练更轻松？</summary><p>先在这里模拟；愿意时，在熟悉、安全的交流里试一个小动作。可以重复、休息或只做模拟，不用等到完全不紧张才开始。这个工具不代替心理治疗。</p><p>有情绪很正常，不用压住它。试着理解对方，也可以保留自己的需要。私事可以不展开，该如实说明的工作安排要讲清。</p></details></section><section class="panel"><span class="pill">${s.stage===0?'独立回应':s.stage===1?'改变条件后重答':'本次模拟完成'}</span><h2 ${s.stage>0?'data-practice-focus':''}>${s.stage===0?'先写自己的判断和原话':s.stage===1?'条件变了，还用原来的说法吗？':'只选一个现实小动作'}</h2><p class="scene">${safe(lesson.scene)}</p>${s.stage>0?`<details><summary>回看第一轮原话与一种示范</summary><p class="quote-reply">${safe(s.answers[0])}</p><p>${safe(lesson.example)}</p><p class="small muted">示范不是标准答案，也不证明对方一定会这样回应。</p></details>`:''}${s.stage===1?`<label for="communicationVariant">改变一个条件</label><select id="communicationVariant">${lesson.variants.map(v=>`<option value="${v[0]}" ${v[0]===s.variant?'selected':''}>${safe(v[1])}</option>`).join('')}</select><p class="notice">${safe(variant[1])}</p>`:''}${s.stage<2?`<label for="communicationOwn">${s.stage===0?safe(lesson.prompt):'情况变了：你会改哪一步？现在怎么说？'}</label><textarea id="communicationOwn" ${unsavedAttrs('communication',lesson.id,String(s.stage)+':'+s.variant,'own')} maxlength="1200" placeholder="写自己的判断和一两句回应；可以保留不确定。">${safe(s.answers[s.stage])}</textarea><div class="actions"><button class="primary" id="communicationCommit" ${s.answers[s.stage].trim()?'':'disabled'}>${s.stage===0?'确认原话 · 看条件变化':'确认调整 · 查看复盘'}</button></div>`:`<p><b>变化条件：</b>${safe(variant[1])}</p><p class="quote-reply">${safe(s.answers[1])}</p>${communicationGuide(lesson,variant)}<p>简单回想一次就好：多知道了什么？改了哪一步？还有什么不知道？不必用对方是否满意来评判自己。</p><p><b>低风险实践：</b>${safe(lesson.transfer)}</p><p>愿意试一试时，可以填下方的真实交流计划。结果不理想或暂时不知道，也可以如实记录。</p><div class="actions"><button class="primary" id="communicationTransfer">填写真实交流计划</button><button class="secondary" id="communicationAgain">换个条件再练</button></div>`}<p class="small muted" id="communicationStatus" role="status">${communicationStorageOK?'当前课程只在本标签页暂存，不写入学习记录、不进入备份或云同步。真实计划需另行明确保存。':'暂存不可用，请自行保留需要的文字；关闭或刷新页面可能丢失。'}</p><button class="ghost" id="communicationRest">暂存并休息</button></section>`;
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
