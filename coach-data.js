// Personalised practice structure, not a diagnostic or automated text scorer.
const TRIGGERS={A:{name:'怕尴尬',thought:'不接话可能显得冷淡',cue:'我可以友好，也允许交流暂时结束。'},B:{name:'自动接话',thought:'还没判断就开口了',cue:'先看事实和责任，再决定回应。'},D:{name:'怕被误解',thought:'还想补充，确保对方完全理解',cue:'说明必要事实后，看看是否真的需要补充。'}};
const COACH_SESSIONS=[
 ['发现自动接话','B','只观察一次想抢答的时刻，不急着改变。','video'],
 ['给自己一拍','B','低风险问题前给自己一点思考时间，不要求每句话都停顿。','book'],
 ['允许闲聊结束','A','表达过真实感受后，允许没有下一句话。','video'],
 ['事实够清楚就停','D','说明真实原因；暂不补充只是为了消除不安的理由。','video'],
 ['愿意聊就自然聊','A','感兴趣的普通问题可以多聊，不把简短当作唯一目标。','book'],
 ['模糊请求先澄清','B','不知道对方需要什么时，先问清楚，避免抢答。','vague'],
 ['不接受未经核实的前提','D','讨论具体事实，不用证明完整人格。','rumour'],
 ['温和保留隐私','A','对自己不想分享的事，练习自然说明边界。','privacy'],
 ['被追问时仍有选择','A','可以重复边界、澄清用途，也可以决定分享一部分。','privacy'],
 ['沉默时观察追加冲动','D','注意想补充的内容，并判断它是否真的有用。','rumour'],
 ['别把职责当隐私','B','面对有授权的工作请求，给出必要信息和时间。','work'],
 ['从闲聊切回协作','D','刚才收住私人话题，下一刻仍可以正常配合工作。','rumour'],
 ['练习补充必要说明','D','真的漏掉关键信息时就补充；并非越短越好。','work'],
 ['带到真实交流','A','选一个可控的日常场景，记录预测与实际发生的事。','video']
].map(([title,trigger,aim,scenario],i)=>({id:i+1,title,trigger,aim,scenario}));
const PRACTICES={
 video:{title:'视频没回复',facts:'一位普通同事发了搞笑视频。你当时忙，后来忘了回复；你愿意友好相处，没有对他不满。',prompt:'昨天视频发你都没回，怎么啦，对我有意见啊？',difficulty:1,
  branches:{fact:'哦，原来在忙。',clarify:'没什么特别的事，就是随口问问。',boundary:'行，忙你的，我就是随口一问。',explain:'明白啦，我也没有着急等回复。',other:'嗯，我就是随口聊聊。'},
  second:'对方点点头，暂时没有继续说话。此刻没有待处理的请求。',required:'他随后负责汇总一个你们共同项目的进度，有权获取你负责的部分。你能在两点前整理完成。',work:'对了，下午例会要汇总进度，你负责的部分，两点前能发我吗？',
  points:['可以说明“当时忙，后来忘回了”；如果确实喜欢视频，也可以真诚表达。','不需要为普通视频回复保证随时在线；道歉或表达关心并不自动等于讨好。']},
 book:{title:'普通闲聊也可以自然回答',facts:'熟悉的同事问你最近看什么书。你愿意聊这件事，也确实在读一本沟通方面的书。没有保密或权限问题。',prompt:'最近在看什么书呀？有没有有意思的？',difficulty:1,
  branches:{fact:'听起来挺有意思，我有空也看看。',clarify:'就是想听听你的阅读感受。',boundary:'好，那我们改天再聊。',explain:'明白，不用把整本书都介绍完。',other:'嗯，我先听听你的想法。'},
  second:'对方微笑，暂时没继续问。你可以自愿交流，也可以让话题自然结束。',required:'同事负责组织明天会议，有权知道你是否参加；你已确认自己会参加。',work:'对了，明天十点的项目会你能参加吗？我需要确认名单。',points:['愿意分享时可以自然回答；无需反问对方为什么打听。','是否继续聊取决于意愿和场景，而非句子数量。']},
 vague:{title:'模糊请求先问清',facts:'同事发来“有空帮我看一下吗？”但没有附件、任务或截止时间。你目前不知道工作范围。',prompt:'有空帮我看一下吗？你这么厉害肯定很快吧？',difficulty:1,
  branches:{fact:'我还没说明白：想请你核对一页公开活动的时间表。',clarify:'想请你核对一页公开活动时间表，看看日期和地点是否一致。',boundary:'好，我先把范围说清楚，你再决定。',explain:'明白，我先发具体内容。',other:'具体是一页公开活动时间表。'},
  second:'同事去找文件，暂时没有发送新消息。任务细节还不完整，不必先承诺全部完成。',required:'他随后发送了一页公开时间表；只需核对日期和地点，非保密职责内协作，你能在今天三点前完成。',work:'文件发你了，只看日期和地点，今天三点前反馈可以吗？',points:['不清楚范围时先问任务、用途和时间，不被恭维推着承诺。','范围明确、可完成时就明确答复；不把澄清变成拖延。']},
 rumour:{title:'内部消息玩笑与工作切换',facts:'你最近与领导沟通的只是日常项目进度。目前没有调岗安排，也没有可分享的内部消息。你与这位同事关系正常。',prompt:'我发现你最近跟领导走得挺近啊，是不是有什么内部消息？透露一点呗，哈哈。',difficulty:2,
  branches:{fact:'原来是对进度啊。那是不是准备调岗位了？',clarify:'我就是随口问问，是不是准备调岗位了？',boundary:'行，不方便就不展开。那是不是准备调岗位了？',explain:'明白，不用讲每次沟通的细节。那是不是准备调岗位了？',other:'我没别的依据，就是好奇：是不是准备调岗位了？'},
  second:'你没有调岗安排，也没有需要披露的内部消息。对方只是在继续问，不能据此确定其动机。',required:'他接着负责例会进度汇总，有权获取你负责的项目进度；你能两点前完成。',work:'对了，下午例会要汇总进度，你负责的部分，两点前能发我吗？',points:['幽默、说明普通事实和适度收住都可以。无需根据一句话认定恶意。','工作任务并非一概属于私人信息；按授权和用途决定说明范围。']},
 privacy:{title:'私人信息与温和追问',facts:'同事闲聊时问具体工资。你不愿分享个人薪资，本次并非正式薪资核对或职责内问询。',prompt:'你现在一个月工资到底多少啊？',difficulty:2,
  branches:{fact:'你不想说具体数字也可以。',clarify:'没什么工作用途，就是好奇。',boundary:'有什么不能说的，大家都是同事嘛。',explain:'好，我知道你不想聊这个。',other:'我就是好奇，没有工作用途。'},
  second:'这是普通闲聊，不需要证明自己有充分理由才可以保留个人信息。对方是否满意，暂时未知。',required:'他随后负责项目通知，需要知道你是否收到一份已授权给你的材料；你已收到。',work:'对了，昨天那份项目材料你收到了吗？我核对一下发送名单。',points:['可以说不想聊，也可以自愿分享范围；不用编理由。','对方短暂失望并不自动等于你做错，也不能据此保证关系完全不受影响。']},
 work:{title:'必要说明不能省略',facts:'同项目负责人询问你负责的任务。已完成资料收集，仍待另一部门提供数据；你预计明天下午更新，但不能保证最终完成时间。对方有权了解。',prompt:'你这部分进度怎么样？今天能全部完成吗？',difficulty:2,
  branches:{fact:'明白，有依赖项的话，把需要的支持也告诉我。',clarify:'我要确认已完成部分、阻碍和下一次更新时间。',boundary:'这是职责内的进度核对，我需要必要的事实。',explain:'谢谢，关键是进度、阻碍和下一次更新，不需要讲无关背景。',other:'请按实际情况说明进度和下一次更新时间。'},
  second:'负责人等你补充必要的依赖项。这里若尚未说清进度、风险或更新时间，应补充；不要求为了简短而沉默。',required:'你已经确认明天下午三点前可发一次状态更新，但尚不能保证最终完成。',work:'那明天下午三点前给我一次状态更新，可以吗？完成时间还没把握的话请注明。',points:['把已完成、阻碍、支持需求和下一次更新说清楚；不能用边界替代履职。','可以承诺准确的状态更新，不应为了结束对话保证未知的完成时间。']}
};
const COACH_ACTIONS={fact:'直接说明事实 / 自愿自然分享',clarify:'先澄清问题、用途或范围',boundary:'说明边界 / 暂缓讨论',explain:'提供了较多解释（可能有必要）',pause:'有意停顿，暂不接话',other:'其他合理回应 / 不确定归类'};
const COACH_CHECKS={noticed:'觉察到自动接话或追加解释的冲动',chose:'根据事实、职责与意愿作了选择',enough:'需要的信息已说明，或明确了下一步',space:'允许暂时不确定，不急着补充无关解释'};
const COACH_CARD_IDS={A:['RA-001','RA-002','RA-012','RA-040','RA-045'],B:['RA-011','RA-030','RA-036','RA-037','RA-039'],D:['RA-004','RA-007','RA-025','RA-034','RA-052']};
const newCoach=()=>({triggers:['A','B','D'],session:1,draft:null,runs:[],experiments:[]});
function checkCoach(c){
 const fail=s=>{throw Error('自主回应记录无效：'+s)},txt=(s,n)=>typeof s==='string'&&s.length<=n,score=s=>s===null||(Number.isInteger(s)&&s>=0&&s<=10);
 if(!record(c)||!Array.isArray(c.triggers)||new Set(c.triggers).size!==c.triggers.length||c.triggers.some(t=>!Object.hasOwn(TRIGGERS,t))||!Number.isInteger(c.session)||c.session<1||c.session>14||!Array.isArray(c.runs)||!Array.isArray(c.experiments))fail('配置或历史');
 function draft(d,finished=false){
  if(!record(d)||d.kind!=='simulation'||!txt(d.id,100)||!d.id||!Object.hasOwn(PRACTICES,d.scenario)||!Number.isInteger(d.session)||d.session<1||d.session>14||!txt(d.prediction,1200)||!d.prediction.trim()||!score(d.before)||!Array.isArray(d.steps)||d.steps.length>3||!Number.isInteger(d.turn)||d.turn<0||d.turn>3||d.steps.length!==d.turn||typeof d.ready!=='boolean')fail('模拟结构');
  if(!txt(d.own,1200)||!txt(d.urge,1200))fail('草稿');
  d.steps.forEach((s,i)=>{if(!record(s)||s.turn!==i||!txt(s.own,1200)||!s.own.trim()||!txt(s.urge,1200)||!Object.hasOwn(COACH_ACTIONS,s.action))fail('模拟步骤')});
  if(finished){if(d.turn!==3||!validDate(d.date)||!validTime(d.at)||!score(d.after)||!txt(d.learning,1200)||!record(d.checks)||Object.keys(COACH_CHECKS).some(k=>![true,false,null].includes(d.checks[k])))fail('模拟复盘')}
 }
 if(c.draft!==null)draft(c.draft);
 for(const r of c.runs)draft(r,true);
 const ids=new Set();for(const x of c.experiments){
  if(!record(x)||x.kind!=='real'||!txt(x.id,100)||!x.id||ids.has(x.id)||!validDate(x.date)||!validTime(x.at)||!['planned','observed'].includes(x.status)||!txt(x.context,1200)||!x.context.trim()||!txt(x.prediction,1200)||!x.prediction.trim()||!txt(x.action,1200)||!x.action.trim()||!score(x.before))fail('真实练习计划');ids.add(x.id);
  if(x.status==='observed'&&(!validDate(x.observedDate)||!validTime(x.observedAt)||!txt(x.actual,1200)||!x.actual.trim()||!txt(x.learning,1200)||!score(x.after)||!['supported','not-observed','uncertain'].includes(x.evidence)||!record(x.checks)||Object.keys(COACH_CHECKS).some(k=>![true,false,null].includes(x.checks[k]))))fail('真实练习观察');
 }
 if(new Set(c.runs.map(r=>r.id)).size!==c.runs.length)fail('重复模拟编号');
 return c;
}
