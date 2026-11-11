// Offline choice practice. Separate tab state; never writes learning JSON or FSRS.
const QUICK_BANK=[
 {
  "id": "Q01",
  "topic": "observe",
  "kind": "single",
  "prompt": "这件事不急，眼下怎样做更合适？",
  "scene": "",
  "options": [
   {
    "text": "认定他看不起我，连续追问。",
    "why": "没回复不能证明他看不起你，连续追问也没有补充事实。"
   },
   {
    "text": "先忙自己的事，暂时保留对原因的判断。",
    "why": "没有紧急事项，也不知道原因，可以先等一等。"
   },
   {
    "text": "以后所有工作消息都不再回复。",
    "why": "一次没回复，不是放弃正常合作的理由。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "已知：普通消息没回，事情不急。",
   "不知道原因，就先不把猜测当事实。",
   "先做自己的事，有新情况再调整。"
  ],
  "shift": "如果今天必须确认工作，就说清截止时间，并用合适的工作渠道联系。"
 },
 {
  "id": "Q02",
  "topic": "observe",
  "kind": "multi",
  "prompt": "工作今天要确认。哪些信息会帮助你决定下一步？（可多选）",
  "scene": "一项你负责的工作今天要确认，同事还没回复。",
  "options": [
   {
    "text": "最晚几点要得到答复。",
    "why": "时间决定还能等多久，还是需要换渠道联系。"
   },
   {
    "text": "对方的全部私人行程。",
    "why": "这超出了处理当前工作所需的范围。"
   },
   {
    "text": "原先约定谁负责、联系不到时找谁。",
    "why": "知道责任与备用联系人，才能继续推进。"
   },
   {
    "text": "没有证据地猜对方是否讨厌我。",
    "why": "猜测不能代替可核实的信息。"
   }
  ],
  "correct": [
   0,
   2
  ],
  "steps": [
   "先看这项工作的期限和责任。",
   "只找会影响下一步的信息，不追查隐私。",
   "确认时间与备用联系人，再决定联系谁。"
  ],
  "shift": "如果没有明确期限，可以先核对安排，不必把所有消息都当急事。"
 },
 {
  "id": "Q03",
  "topic": "observe",
  "kind": "boolean",
  "prompt": "“他还没回，所以他一定不重视我。”这个判断有足够依据吗？",
  "scene": "",
  "options": [
   {
    "text": "有。",
    "why": "没回消息只是一件事，不能直接证明对方的想法。"
   },
   {
    "text": "没有。",
    "why": "可能有多种原因，目前缺少能证明动机的信息。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "事实是暂时没有回复。",
   "“一定不重视我”多加了一层没有证实的解释。",
   "先保留判断，有需要时问清具体事情。"
  ],
  "shift": "如果出现持续、具体的不当行为，可以据此讨论问题，不必忽略实际影响。"
 },
 {
  "id": "Q04",
  "topic": "listen",
  "kind": "single",
  "prompt": "你也想聊聊，哪句最能自然接上？",
  "scene": "",
  "options": [
   {
    "text": "“等那么久还觉得不错，你最推荐哪道菜？”",
    "why": "回应了他刚说的内容，也留了一个容易回答的问题。"
   },
   {
    "text": "立刻讲自己所有探店经历，不让对方插话。",
    "why": "分享可以，但一下占满话题就难以听见对方。"
   },
   {
    "text": "“你为什么要向我透露周末行程？”",
    "why": "题里是普通分享，没有证据表明需要这样防备。"
   }
  ],
  "correct": [
   0
  ],
  "steps": [
   "对方在分享吃饭经历。",
   "先回应一个具体点，容易让对方接下去。",
   "问一道推荐菜，或分享一点自己的体验即可。"
  ],
  "shift": "如果对方表示要忙，就友好结束，不必继续提问。"
 },
 {
  "id": "Q05",
  "topic": "listen",
  "kind": "multi",
  "prompt": "对方说“最近挺累，只想有人听听”。哪些回应合适？（可多选）",
  "scene": "同事说最近很累，只想有人听，不需要你替他出主意。",
  "options": [
   {
    "text": "还没听完就列出十条建议。",
    "why": "对方当前没有请求建议，急着出主意可能错过他的需要。"
   },
   {
    "text": "“听起来挺累的，你想说的话我可以听一会儿。”",
    "why": "先听见感受，也说明自己能提供什么。"
   },
   {
    "text": "要求他立刻想开一点。",
    "why": "这容易让对方觉得感受没有被听见。"
   },
   {
    "text": "有点不确定时问：“现在先听你说就好，对吗？”",
    "why": "用一句话核对需要，比擅自决定更稳妥。"
   }
  ],
  "correct": [
   1,
   3
  ],
  "steps": [
   "他已经说想被倾听。",
   "先听、必要时确认，不抢着解决。",
   "你也可以说明自己能听多久。"
  ],
  "shift": "如果他后来明确请求建议，再问清情况后一起想办法。"
 },
 {
  "id": "Q06",
  "topic": "listen",
  "kind": "boolean",
  "prompt": "对方说要去忙了，友好结束聊天也算一次合适的回应。",
  "scene": "聊到一半，对方看了看时间，说要去处理工作。",
  "options": [
   {
    "text": "是。",
    "why": "尊重对方现在的时间，也是在回应他的需要。"
   },
   {
    "text": "否。",
    "why": "不必靠一直聊天证明自己热情。"
   }
  ],
  "correct": [
   0
  ],
  "steps": [
   "对方明确表示要忙。",
   "现在需要的是结束，而不是更多话题。",
   "说“好，你先忙”就可以。"
  ],
  "shift": "如果对方改口表示还想聊，可以再接着聊。"
 },
 {
  "id": "Q07",
  "topic": "appreciate",
  "kind": "single",
  "prompt": "怎样感谢更具体、真实？",
  "scene": "",
  "options": [
   {
    "text": "“你是天下最可靠的人，以后都靠你了。”",
    "why": "夸大人格并附带未来期待，超过了这次已知帮助。"
   },
   {
    "text": "“既然你帮了我，周末也得继续帮。”",
    "why": "感谢不能变成对方必须继续付出的理由。"
   },
   {
    "text": "“你把待办和负责人分开列了，我很快就找到交接项，谢谢。”",
    "why": "说清行为和实际帮助，对方能知道你感谢什么。"
   }
  ],
  "correct": [
   2
  ],
  "steps": [
   "表格确实帮到了你。",
   "具体说出“做了什么、帮到哪里”，就有依据。",
   "表达感谢，不附带别人必须继续帮忙的要求。"
  ],
  "shift": "如果后来发现是团队成果，把感谢补充到相关的人和具体贡献。"
 },
 {
  "id": "Q08",
  "topic": "appreciate",
  "kind": "multi",
  "prompt": "想再请对方周末帮忙，哪些做法合适？（可多选）",
  "scene": "对方的表格帮了你，你还想请他周末额外核对一页资料。",
  "options": [
   {
    "text": "把感谢和额外请求分开说。",
    "why": "感谢保持真诚，请求也能说得清楚。"
   },
   {
    "text": "认为夸过对方，他就不好意思拒绝。",
    "why": "这是给对方施加压力，不是给他真正的选择。"
   },
   {
    "text": "说明只需核对一页内容，不方便就另作安排。",
    "why": "范围清楚，对方也可以拒绝或商量。"
   },
   {
    "text": "对方还没答应，就把名字填到值班表。",
    "why": "没有得到同意，不能替对方作承诺。"
   }
  ],
  "correct": [
   0,
   2
  ],
  "steps": [
   "额外帮忙不是对方的义务。",
   "说清范围，让对方能作决定。",
   "请求另说，也准备好被拒绝后的安排。"
  ],
  "shift": "如果本来就是职责内任务，应按真实分工讨论，不把正式工作说成私人欠情。"
 },
 {
  "id": "Q09",
  "topic": "appreciate",
  "kind": "boolean",
  "prompt": "真诚感谢了别人，他就有义务答应你的额外请求。",
  "scene": "",
  "options": [
   {
    "text": "是。",
    "why": "感谢不能自动产生额外义务。"
   },
   {
    "text": "否。",
    "why": "感谢可以成立，对方也仍可拒绝新请求。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "帮助已经发生，感谢这件事。",
   "额外请求是另一件事，还没有得到同意。",
   "允许对方答应、拒绝或商量。"
  ],
  "shift": "如果双方已经有明确承诺，应回到原承诺核对，而不是靠夸奖决定。"
 },
 {
  "id": "Q10",
  "topic": "privacy",
  "kind": "single",
  "prompt": "你已确认离开项目。负责交接的人询问安排，怎样回应更合适？",
  "scene": "你已正式确认离开当前项目，负责交接的人需要核对未完成任务和时间。",
  "options": [
   {
    "text": "所有内容都拒绝，因为换工作是隐私。",
    "why": "私人去向可保留，但确认的交接会影响工作安排。"
   },
   {
    "text": "说清任务和交接时间，私人去向暂不展开。",
    "why": "把合作所需与私事分开，能兼顾责任和边界。"
   },
   {
    "text": "编一个离开的理由，避免别人继续问。",
    "why": "可以直接说明不方便谈私事，不必用谎话守界。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "你离开项目这件事已经确认。",
   "别人需要安排任务，但不一定需要知道私人去向。",
   "交接说清楚，私事保留。"
  ],
  "shift": "如果对方只是普通闲聊，分享多少可以由你自己决定。"
 },
 {
  "id": "Q11",
  "topic": "privacy",
  "kind": "multi",
  "prompt": "面对私人规划的询问，哪些做法可以考虑？（可多选）",
  "scene": "",
  "options": [
   {
    "text": "先问这和哪项工作安排有关。",
    "why": "弄清用途，有助于决定该提供哪些必要信息。"
   },
   {
    "text": "不想聊私事时，礼貌说明暂时不展开。",
    "why": "可以直接表达分享范围，不必编理由。"
   },
   {
    "text": "只要涉及自己，就一律隐瞒已确认的工作交接。",
    "why": "影响合作的事实仍要向相关的人说明。"
   },
   {
    "text": "对方只是闲聊，而自己愿意时分享一点学习兴趣。",
    "why": "愿意分享也是一种自主选择，不必每次拒绝。"
   }
  ],
  "correct": [
   0,
   1,
   3
  ],
  "steps": [
   "先分清私事和工作需要。",
   "私事可以保留，合作所需如实说明。",
   "愿意分享时自然聊，不愿意时说明范围。"
  ],
  "shift": "涉及保密或授权限制时，只向合适对象说明必要内容。"
 },
 {
  "id": "Q12",
  "topic": "privacy",
  "kind": "boolean",
  "prompt": "为了保护隐私，已确认且影响别人安排的工作交接也可以随意隐瞒。",
  "scene": "",
  "options": [
   {
    "text": "是。",
    "why": "把工作交接当成全部私事，会妨碍别人安排任务。"
   },
   {
    "text": "否。",
    "why": "保护私人去向与说清工作交接，可以同时做到。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "交接会影响合作，不只是自己的想法。",
   "只说相关任务与时间，不需要公开全部私事。",
   "向相关的人如实交代必要安排。"
  ],
  "shift": "如果是无关的人打听私人去向，可以保留，不必扩大分享范围。"
 },
 {
  "id": "Q13",
  "topic": "coordinate",
  "kind": "single",
  "prompt": "对方明确说站不稳，你也能先侧身再拿包。现在怎样做更合适？",
  "scene": "模拟：你在地铁起身拿包，与拿着手杖、表示站不稳的乘客互相挡住。",
  "options": [
   {
    "text": "先侧身让他坐稳，再拿包。",
    "why": "这个顺序能照顾安全，也不妨碍随后拿包。"
   },
   {
    "text": "坚持一定要等自己拿完包。",
    "why": "已有更安全的可行顺序，不必坚持原安排。"
   },
   {
    "text": "要求对方先证明具体病情。",
    "why": "为侧身让座，不需要追问私人病史。"
   }
  ],
  "correct": [
   0
  ],
  "steps": [
   "对方站不稳，你有办法先让开。",
   "现在安全需要更靠前，原顺序可以改。",
   "先让他坐稳，再从另一侧拿包。"
  ],
  "shift": "如果对方只是想经过，就解决挡路问题，不继续争座位。"
 },
 {
  "id": "Q14",
  "topic": "coordinate",
  "kind": "multi",
  "prompt": "互相挡住时，哪些信息能帮助协调？（可多选）",
  "scene": "",
  "options": [
   {
    "text": "对方是想坐下，还是想从这里经过。",
    "why": "目的不同，让座或让路的动作也会不同。"
   },
   {
    "text": "猜对方属于哪种“性格不好的人”。",
    "why": "人格猜测不能直接解决眼前挡路。"
   },
   {
    "text": "有没有明显安全需要，哪边有空间挪动。",
    "why": "安全与可用空间会影响先后和动作。"
   },
   {
    "text": "一定要先争出谁的出发点更正确。",
    "why": "协调可以先解决影响，不必先争到一个输赢。"
   }
  ],
  "correct": [
   0,
   2
  ],
  "steps": [
   "先看目标和现场空间。",
   "知道要坐还是要过，才能选对动作。",
   "问一句、挪一下，优先照顾安全。"
  ],
  "shift": "如果挪位置仍不安全，先停止争抢，寻找安全空间或现场帮助。"
 },
 {
  "id": "Q15",
  "topic": "coordinate",
  "kind": "boolean",
  "prompt": "双方都没有恶意，就说明谁也不需要调整动作。",
  "scene": "",
  "options": [
   {
    "text": "是。",
    "why": "没有恶意也可能实际挡住别人，仍有必要协调。"
   },
   {
    "text": "否。",
    "why": "意图可以合理，造成的影响仍可以通过调整解决。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "看的是实际是否互相妨碍。",
   "没有恶意，不等于没有影响。",
   "给出一个可行的先后顺序，或先让出空间。"
  ],
  "shift": "遇到安全、明确规则或特别需要时，不能只说“双方都有道理”。"
 },
 {
  "id": "Q16",
  "topic": "repair",
  "kind": "single",
  "prompt": "对方说明刚才是掉线没听清，眼下怎样处理更有用？",
  "scene": "线上讨论中发生误会；对方后来说明会议掉线，没听到你后半句话。",
  "options": [
   {
    "text": "继续长篇解释自己从来没有恶意。",
    "why": "问题已经澄清，长篇自证没有补上漏听内容。"
   },
   {
    "text": "认定对方故意挑刺，不再说话。",
    "why": "题里给了连接问题这一解释，不宜继续猜恶意。"
   },
   {
    "text": "把漏听的半句重说，再确认是否听到了。",
    "why": "动作直接对应没听清这个具体问题。"
   }
  ],
  "correct": [
   2
  ],
  "steps": [
   "新信息是连接出了问题。",
   "现在要解决漏听，不是继续争论是否冒犯。",
   "重说遗漏的一句，并简单确认。"
  ],
  "shift": "如果确实是自己打断了对方，可以承认具体动作，让他先说完。"
 },
 {
  "id": "Q17",
  "topic": "repair",
  "kind": "multi",
  "prompt": "你确实打断了同事，但对方开始贬低你整个人。哪些回应可以同时做到？（可多选）",
  "scene": "你打断了同事，他随后开始当众贬低你整个人。",
  "options": [
   {
    "text": "承认刚才打断，表示会调整。",
    "why": "承认具体影响，有助于把问题说清。"
   },
   {
    "text": "接受所有人格贬低，认为自己没资格设界。",
    "why": "一个具体失误不意味着要接受人身评价。"
   },
   {
    "text": "要求回到具体问题，不作人格评价。",
    "why": "可以负责地修复，也可以明确边界。"
   },
   {
    "text": "为了反击，也开始贬低对方整个人。",
    "why": "这会把具体问题升级为相互攻击。"
   }
  ],
  "correct": [
   0,
   2
  ],
  "steps": [
   "打断与人格贬低是两件事。",
   "前者可以承认并修复，后者可以提出边界。",
   "说清“我会改哪一点，也请停止哪种评价”。"
  ],
  "shift": "如果持续被贬低，可以暂停，约定用更合适的方式继续沟通。"
 },
 {
  "id": "Q18",
  "topic": "repair",
  "kind": "boolean",
  "prompt": "一次说话不顺，就足以证明自己不会社交。",
  "scene": "",
  "options": [
   {
    "text": "是。",
    "why": "一次具体失误不能概括整个人的能力。"
   },
   {
    "text": "否。",
    "why": "先看这次具体发生了什么，再练一个能改的动作。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "这只是一次具体交流。",
   "一次结果不能给整个人下结论。",
   "找一个可调整的动作，下次再试。"
  ],
  "shift": "如果类似困难反复出现，可以找具体模式或寻求支持，不必独自贴标签。"
 },
 {
  "id": "Q19",
  "topic": "brief",
  "kind": "single",
  "prompt": "主管现在要知道进度，哪种说法更便于安排工作？",
  "scene": "",
  "options": [
   {
    "text": "先把几天来的每个细节说完，最后才提还差一页。",
    "why": "细节可以补充，但主管眼下先需要知道当前进度。"
   },
   {
    "text": "“还差一页，预计17点补齐。正在核对内容，有变化及时说明。”",
    "why": "先说已确认的进度与预计时间，再说明下一步。"
   },
   {
    "text": "为了显得有把握，直接说已经全部完成。",
    "why": "这与已核实的事实不同，会误导安排。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "主管问的是当前进度。",
   "先说已确认的重点，别人才能决定接下来怎么安排。",
   "再补依据、下一步和时间变化，不夸大完成情况。"
  ],
  "shift": "如果任务变成查明延误原因，就先核对记录，不急着认定责任。"
 },
 {
  "id": "Q20",
  "topic": "brief",
  "kind": "multi",
  "prompt": "现在要查清文件为何没收到，哪些做法合适？（可多选）",
  "scene": "周一没有收到文件。谁何时发送、是否送达、原因是什么，都还没有核实。",
  "options": [
   {
    "text": "核对发送时间、接收记录，并听相关人员说明。",
    "why": "这些事实有助于分清未发送、未送达或其他情况。"
   },
   {
    "text": "只找支持自己怀疑某人的信息。",
    "why": "这会漏掉能推翻原猜想的证据。"
   },
   {
    "text": "原因尚未明时，先报告“已确认未收到，原因仍在核实”。",
    "why": "可以先报事实与未知，不必把猜想包装成结论。"
   },
   {
    "text": "为了尽快给答案，直接认定发送者失职。",
    "why": "没收到文件还不能证明是谁失职。"
   }
  ],
  "correct": [
   0,
   2
  ],
  "steps": [
   "目前只确认没有收到文件。",
   "查原因要找支持与反对猜想的信息。",
   "先报告已知与未知，核实后再更新判断。"
  ],
  "shift": "如已确认会影响当天交付，先报告这个风险，不能因为原因未明而一直不报。"
 },
 {
  "id": "Q21",
  "topic": "brief",
  "kind": "boolean",
  "prompt": "“汇报先说重点”表示即使原因未明，也要把猜想说成确定结论。",
  "scene": "",
  "options": [
   {
    "text": "是。",
    "why": "先说重点也必须尊重证据，不能把不确定说成确定。"
   },
   {
    "text": "否。",
    "why": "可以先说已确认的情况，并清楚标明未知。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "先说重点，是为了让别人快速了解当前情况。",
   "没核实的原因，仍然是未知或初步猜想。",
   "说清已知、未知和下一步，再随证据更新。"
  ],
  "shift": "如果有初步判断，可以同时说明依据、把握程度和还需核实的部分。"
 },
 {
  "id": "Q22",
  "topic": "silence",
  "kind": "single",
  "prompt": "没有新请求，也没有待办需要确认。眼下怎样做合理？",
  "scene": "",
  "options": [
   {
    "text": "安静一会儿，或自然说“那我们先各忙吧”。",
    "why": "交流可以自然结束，不需要填满每段空白。"
   },
   {
    "text": "必须继续找话题，否则就说明不会社交。",
    "why": "暂时安静不能说明整体沟通能力。"
   },
   {
    "text": "从此连对方的工作交接消息也不回应。",
    "why": "本次闲聊可以结束，不代表以后必要请求也可忽略。"
   }
  ],
  "correct": [
   0
  ],
  "steps": [
   "当前没有新问题或必要安排。",
   "停一停不会耽误已知责任。",
   "可以安静或友好收尾，不必强行找话。"
  ],
  "shift": "如果接着出现有期限的交接请求，就把必要信息说清楚。"
 },
 {
  "id": "Q23",
  "topic": "silence",
  "kind": "multi",
  "prompt": "判断现在要回应还是停住，哪些信息值得看？（可多选）",
  "scene": "",
  "options": [
   {
    "text": "对方有没有具体请求，以及自己是否答应过这件事。",
    "why": "请求与承诺会影响需要回应什么。"
   },
   {
    "text": "不回应是否影响安全、交接或别人的必要安排。",
    "why": "实际影响能帮助判断回应是否必要。"
   },
   {
    "text": "把所有沉默都当成一种更高级的回应。",
    "why": "沉默要看情境，不能一概套用。"
   },
   {
    "text": "自己是否愿意交流，只是因为怕说错而躲开。",
    "why": "愿意交流时可以先试一句，不必等到完全有把握。"
   }
  ],
  "correct": [
   0,
   1,
   3
  ],
  "steps": [
   "先看请求、责任和实际影响。",
   "再看自己的意愿，保留停住或回应的选择。",
   "必要事项说清；愿意交流时从一句开始。"
  ],
  "shift": "如果对方重复追问无关隐私，可以说明不展开，并结束话题。"
 },
 {
  "id": "Q24",
  "topic": "silence",
  "kind": "boolean",
  "prompt": "交接同事需要确认材料何时能到，你已知道16点可发；这时应把必要信息说清。",
  "scene": "接班同事问材料能否17点前到。资料已齐，你确认16点可以发出。",
  "options": [
   {
    "text": "是。",
    "why": "明确时间能帮助接班人安排工作。"
   },
   {
    "text": "否。",
    "why": "有责任且有必要信息时，一直不回应会妨碍交接。"
   }
  ],
  "correct": [
   0
  ],
  "steps": [
   "对方有明确的交接需要。",
   "你知道资料状态和可发送时间。",
   "简洁回答这两点，再在需要时确认收到。"
  ],
  "shift": "如果时间还不确定，就如实说明当前状态和下一次更新时间，不要乱保证。"
 },
 {
  "id": "Q25",
  "topic": "agency",
  "kind": "single",
  "prompt": "发言漏了一个要点，怎样看待并调整更有帮助？",
  "scene": "",
  "options": [
   {
    "text": "认定自己不适合沟通，以后都不发言。",
    "why": "一次具体遗漏不足以判定整个人的能力。"
   },
   {
    "text": "要求自己立刻开心，假装完全没有遗漏。",
    "why": "可以承认失落与事实，才能找到具体改进。"
   },
   {
    "text": "承认漏了一点，下次先列三条提纲，改一个动作。",
    "why": "把注意力放在可调整的一步，既尊重事实也便于行动。"
   }
  ],
  "correct": [
   2
  ],
  "steps": [
   "这次是一个具体遗漏，没有严重后果。",
   "可以失落，也仍有下次练习机会。",
   "选一个能做的调整，再观察是否有帮助。"
  ],
  "shift": "如果困难来自任务量或资源不足，也可以协商范围与支持。"
 },
 {
  "id": "Q26",
  "topic": "agency",
  "kind": "multi",
  "prompt": "任务超量，或持续受到贬低时，哪些行动体现积极面对？（可多选）",
  "scene": "任务量超过现有人手可完成的范围，负责人能协调；另外，对方曾反复作人格贬低。",
  "options": [
   {
    "text": "把时间、人手和优先事项说清，协商可行安排。",
    "why": "承认现实限制，有助于找到能执行的选择。"
   },
   {
    "text": "认为一切都是自己心态不够好，全部忍下。",
    "why": "这会忽略实际资源与他人的行为责任。"
   },
   {
    "text": "针对贬低说明边界，必要时记录事实并寻求合适支持。",
    "why": "设界和求助也可以是具体、积极的行动。"
   },
   {
    "text": "超出能力仍随口保证一定完成。",
    "why": "没有依据的保证可能误导安排。"
   }
  ],
  "correct": [
   0,
   2
  ],
  "steps": [
   "先看具体限制和发生的行为。",
   "自己的调整、资源协商和他人的责任要分开看。",
   "选能落实的一步，不用把全部问题归到自己心态上。"
  ],
  "shift": "如果后来发现自己有具体失误，也可以承担那一部分并改进，不必全盘自责。"
 },
 {
  "id": "Q27",
  "topic": "agency",
  "kind": "boolean",
  "prompt": "积极面对也包括承认难受、资源限制和不公平，然后选择协调、设界或求助。",
  "scene": "",
  "options": [
   {
    "text": "是。",
    "why": "承认实际情况，才能选择更可行的行动。"
   },
   {
    "text": "否。",
    "why": "积极不要求忽视事实或独自承担所有问题。"
   }
  ],
  "correct": [
   0
  ],
  "steps": [
   "感受、限制和不当行为都可以如实看见。",
   "接纳现实后，仍可寻找一个行动方向。",
   "准备、协商、设界或求助，按情境选择。"
  ],
  "shift": "安全风险或严重困扰超出当前能力时，优先寻求适当支持，不拿真实风险当练习成本。"
 },
 {
  "id": "Q28",
  "topic": "focus",
  "kind": "single",
  "prompt": "核实附件确实缺了一页，影响了接班人的工作。现在先做什么更合适？",
  "scene": "你想按约定完成材料交接。接班人指出附件缺页，你核实确实如此。",
  "options": [
   {
    "text": "一律屏蔽批评，继续原来的安排。",
    "why": "这条反馈含有已核实的遗漏，忽略它会继续妨碍交接。"
   },
   {
    "text": "先补齐缺页，再确认接班人能否继续处理。",
    "why": "动作直接解决真实影响，也帮助完成交接目标。"
   },
   {
    "text": "放下材料，先争论自己是不是一个靠谱的人。",
    "why": "争人格不能补上缺页，可以先处理具体问题并保留边界。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "缺页和工作受阻都已核实。",
   "这条信息与交接目标直接相关，值得处理。",
   "先补齐，再确认效果；人格评价可以另行设界。"
  ],
  "shift": "如果材料和交接已核对完成，只有重复标签而无新事实，可以结束无关争辩。"
 },
 {
  "id": "Q29",
  "topic": "focus",
  "kind": "multi",
  "prompt": "为了抓住主要目标，哪些信息仍值得核对？（可多选）",
  "scene": "",
  "options": [
   {
    "text": "已指出且可核实的材料遗漏。",
    "why": "遗漏可能直接妨碍完成任务。"
   },
   {
    "text": "不提供事实、反复贬低整个人的标签。",
    "why": "可以说明边界，不必用无休止争论来回应标签。"
   },
   {
    "text": "具体的安全、质量或授权风险。",
    "why": "眼前进度不能代替对这些实际影响的核对。"
   },
   {
    "text": "会影响承诺、长期信誉或他人安排的事实。",
    "why": "主要目标也需要结合相关责任和长期成本。"
   }
  ],
  "correct": [
   0,
   2,
   3
  ],
  "steps": [
   "先明确当前要解决的任务。",
   "再看信息是否有具体事实、是否改变必要行动。",
   "处理遗漏、风险与相关责任；没有事实的标签可以放下。"
  ],
  "shift": "如果一句笼统评价后来补出了具体证据，应重新核对，而不是继续把它当杂音。"
 },
 {
  "id": "Q30",
  "topic": "focus",
  "kind": "boolean",
  "prompt": "只要完成眼前主要目标，就可以一律屏蔽有关安全和他人实际损失的反馈。",
  "scene": "",
  "options": [
   {
    "text": "是。",
    "why": "目标仍受规则、实际影响和相关责任约束。"
   },
   {
    "text": "否。",
    "why": "具体安全和损失信息可能改变必要行动，仍需核对。"
   }
  ],
  "correct": [
   1
  ],
  "steps": [
   "眼前结果只是判断的一部分。",
   "安全、实际影响和相关责任会改变做法。",
   "抓主线，同时处理会影响决定的必要反馈。"
  ],
  "shift": "如果反馈只有无根据的人格标签，没有新增事实，可以设界并回到任务。"
 },
 {
  "id": "Q31",
  "topic": "choice",
  "kind": "single",
  "prompt": "没有承诺参加聚会，合理拒绝后朋友失望，你有些内疚。怎样看待更合适？",
  "scene": "",
  "options": [
   {
    "text": "可以理解朋友失望，同时保留这次合理安排。",
    "why": "失望和内疚是感受，尚不足以证明拒绝有错。"
   },
   {
    "text": "感到内疚就证明自己必须撤回拒绝。",
    "why": "感受需要结合承诺与实际影响核对，不能单独定责。"
   },
   {
    "text": "为了守住边界，否认对方有任何感受。",
    "why": "保留选择与理解对方感受可以同时做到。"
   }
  ],
  "correct": [
   0
  ],
  "steps": [
   "你有自己的安排，也没有答应参加。",
   "朋友失望不等于你违反了承诺。",
   "可以礼貌表达理解，保留合理拒绝，不必强迫自己立即不内疚。"
  ],
  "shift": "如果此前已作承诺并影响了对方安排，就需要核对责任并商量补救。"
 },
 {
  "id": "Q32",
  "topic": "choice",
  "kind": "multi",
  "prompt": "准备公开他人的私人聊天时，哪些方面要先核对？（可多选）",
  "scene": "你想把同事的私人聊天截图公开，尚未征得同意，也未核对相关约定。",
  "options": [
   {
    "text": "当事人的同意和允许分享的范围。",
    "why": "聊天里有他人信息，收到不等于获准公开。"
   },
   {
    "text": "只确认没看到法律明确禁止就直接发布。",
    "why": "未见禁止不能代替授权、约定和后果核对。"
   },
   {
    "text": "岗位、合同、平台或其他适用约定与权限。",
    "why": "具体情境可能有相关限制，需要核实。"
   },
   {
    "text": "隐私、实际影响和有没有更少披露的办法。",
    "why": "实现说明目的时，也要考虑对他人的影响。"
   }
  ],
  "correct": [
   0,
   2,
   3
  ],
  "steps": [
   "私人聊天包含他人的信息。",
   "能否做、是否获准、后果怎样，需要分别看。",
   "先核对同意与规则，必要时暂缓或用更少披露的方式。"
  ],
  "shift": "具体法律判断随事实和地区而异；拿不准时寻求适当专业意见，不靠口号保证合法。"
 },
 {
  "id": "Q33",
  "topic": "choice",
  "kind": "boolean",
  "prompt": "核实自己确实失约并影响了别人时，可以承认具体问题、补救，同时不把自己整个人否定掉。",
  "scene": "",
  "options": [
   {
    "text": "是。",
    "why": "具体承担责任和保留对自己的基本尊重可以同时做到。"
   },
   {
    "text": "否。",
    "why": "修复不需要靠整个人的自责或否定来证明。"
   }
  ],
  "correct": [
   0
  ],
  "steps": [
   "先看明确承诺、实际失约和影响。",
   "有具体责任，就对这件事说明并补救。",
   "确认补救效果，不把一次问题扩成整个人的结论。"
  ],
  "shift": "如果没有承诺或实际不当影响，只是对方失望，则先核对事实，不自动认错。"
 }
];
const QUICK_KEY='response-autonomy-quick-v1';
const QUICK_KINDS={single:'单选题',multi:'多选题',boolean:'判断题'};
let quickStorageOK=true,quickState=quickRead();
function quickQuestion(id){return QUICK_BANK.find(q=>q.id===id)}
function quickValidPicks(q,picks,allowEmpty=false){
 return Array.isArray(picks)&&picks.length<=q.options.length&&new Set(picks).size===picks.length&&picks.every(n=>Number.isInteger(n)&&n>=0&&n<q.options.length)&&(allowEmpty&&picks.length===0||q.kind==='multi'&&picks.length>0||picks.length===1);
}
function quickRead(){
 try{
  const raw=sessionStorage.getItem(QUICK_KEY);if(!raw)return null;
  if(raw.length>32000)return null;const s=JSON.parse(raw);
  if(!s||s.version!==1||!Array.isArray(s.ids)||!s.ids.length||s.ids.length>6||new Set(s.ids).size!==s.ids.length||!s.ids.every(id=>quickQuestion(id)))return null;
  if(!Number.isInteger(s.step)||s.step<0||s.step>s.ids.length||!Array.isArray(s.answers)||![s.step,Math.min(s.step+1,s.ids.length)].includes(s.answers.length))return null;
  if(!s.answers.every((a,i)=>a&&a.id===s.ids[i]&&quickValidPicks(quickQuestion(a.id),a.picks)))return null;
  const q=quickQuestion(s.ids[s.step]);
  if(s.step===s.ids.length){if(!Array.isArray(s.selected)||s.selected.length)return null}
  else if(!quickValidPicks(q,s.selected,true)||s.answers[s.step]&&JSON.stringify(s.selected.slice().sort())!==JSON.stringify(s.answers[s.step].picks.slice().sort()))return null;
  if(!['all',...COMMUNICATION_LESSONS.map(l=>l.id)].includes(s.topic)||!['all',...Object.keys(QUICK_KINDS)].includes(s.kind))return null;
  return s;
 }catch(e){return null}
}
function quickSave(){try{sessionStorage.setItem(QUICK_KEY,JSON.stringify(quickState));quickStorageOK=true}catch(e){quickStorageOK=false}const status=document.getElementById('quickStatus');if(status)status.textContent=quickStorageMessage()}
function quickStorageMessage(){return quickStorageOK?'本轮只在本标签页暂存，刷新后可从“快速刷题”继续；不进入学习备份或云同步。':'本轮暂存失败，请先自行保留需要的要点；刷新或关闭页面可能丢失进度。'}
function quickClear(){quickState=null;try{sessionStorage.removeItem(QUICK_KEY)}catch(e){}}
function quickCorrect(q,picks){return picks.length===q.correct.length&&q.correct.every(n=>picks.includes(n))}
function quickShuffle(list){const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function quickStart(ids){
 const topic=document.getElementById('quickTopic')?.value||'all',kind=document.getElementById('quickKind')?.value||'all';
 let chosen;
 if(ids)chosen=ids.filter(id=>quickQuestion(id));
 else{
  const pool=QUICK_BANK.filter(q=>(topic==='all'||q.topic===topic)&&(kind==='all'||q.kind===kind));
  chosen=kind==='all'?Object.keys(QUICK_KINDS).flatMap(k=>quickShuffle(pool.filter(q=>q.kind===k)).slice(0,2)).map(q=>q.id):quickShuffle(pool).slice(0,6).map(q=>q.id);
 }
 if(!chosen.length)return;
 quickState={version:1,topic,kind,ids:quickShuffle([...new Set(chosen)]).slice(0,6),step:0,selected:[],answers:[]};quickSave();renderQuickPractice();
}
function quickSubmit(){
 const s=quickState,q=s&&quickQuestion(s.ids[s.step]);if(!q||s.answers[s.step]||!quickValidPicks(q,s.selected))return;
 s.answers.push({id:q.id,picks:s.selected.slice()});quickSave();renderQuickPractice();
}
function quickNext(){const s=quickState;if(!s||!s.answers[s.step])return;s.step++;s.selected=[];quickSave();renderQuickPractice()}
function quickExplanation(q){
 return `<section id="quickFeedback" aria-label="本题解析"><div class="learning-keynote"><span class="learning-label">参考答案</span><p><strong>${q.correct.map(n=>safe(String.fromCharCode(65+n)+'. '+q.options[n].text)).join('；')}</strong></p></div><h3>三步看懂这题</h3><ol class="quick-reasoning">${q.steps.map(text=>`<li>${mdBold(text)}</li>`).join('')}</ol><details><summary>每个选项为什么选或不选？</summary>${q.options.map((o,n)=>`<p><b>${String.fromCharCode(65+n)} · ${q.correct.includes(n)?'本题应选':'本题不选'}</b> ${safe(o.text)}<br>${safe(o.why)}</p>`).join('')}</details><p class="learning-caution"><b>条件变了怎么办？</b> ${safe(q.shift)}</p><p class="learning-memory">${mdBold(COMMUNICATION_GUIDES[q.topic].memory)}</p><button class="ghost" id="quickLearn">去看这个主题的例子与表达练习</button></section>`;
}
function renderQuickPractice(){
 const s=quickState,done=s&&s.step===s.ids.length;
 const setup=`<label for="quickTopic">想练哪一类？</label><select id="quickTopic"><option value="all">全部主题混合</option>${COMMUNICATION_LESSONS.map(l=>`<option value="${l.id}" ${s?.topic===l.id?'selected':''}>${safe(l.title)}</option>`).join('')}</select><label for="quickKind">题型</label><select id="quickKind"><option value="all">单选、多选、判断混合</option>${Object.entries(QUICK_KINDS).map(([key,label])=>`<option value="${key}" ${s?.kind===key?'selected':''}>${label}</option>`).join('')}</select><p class="small muted">${QUICK_BANK.length}道本地题，无需生成。每轮最多6题，所选范围不足6题时全部练；多选需选全且不多选。</p><button class="primary" id="quickStart">${done?'再开一轮':'开始快速刷题'}</button>`;
 let body;
 if(!s)body=setup;
 else if(done){
  const wrong=s.answers.filter(a=>!quickCorrect(quickQuestion(a.id),a.picks)),correct=s.ids.length-wrong.length;
  body=`<h3 data-practice-focus>本轮完成 · ${correct}/${s.ids.length} 题与参考答案一致</h3><p>这里统计的是选项判断，不代表你在真实交流中已经熟练。挑一个要点记住就好。</p><details><summary>回看本轮首次选择</summary>${s.answers.map(a=>{const q=quickQuestion(a.id);return `<p><b>${safe(q.prompt)}</b><br>你的选择：${a.picks.map(n=>safe(q.options[n].text)).join('；')}<br>参考答案：${q.correct.map(n=>safe(q.options[n].text)).join('；')}</p>`}).join('')}</details>${wrong.length?'<button class="secondary" id="quickRetry">把本轮错题再练一次</button>':'<p class="learning-memory">这一轮已对照完成。愿意时，用自己的话试着回应一个情境。</p>'}<details><summary>选择主题或题型，再开一轮</summary>${setup}</details>`;
 }else{
  const q=quickQuestion(s.ids[s.step]),lesson=COMMUNICATION_LESSONS.find(l=>l.id===q.topic),answer=s.answers[s.step],ok=answer&&quickCorrect(q,answer.picks);
  body=`<div class="split"><span class="pill">${QUICK_KINDS[q.kind]}</span><span>第 ${s.step+1}/${s.ids.length} 题</span></div><p class="scene">${safe(q.scene||lesson.scene)}</p><h3 id="quickPrompt" data-practice-focus>${safe(q.prompt)}</h3><p class="small muted">${q.kind==='multi'?'可选多个；选全且不多选。':'只选一个。'} 选好后点“提交答案”，再看解释。</p><div class="quick-options" role="group" aria-labelledby="quickPrompt">${q.options.map((o,n)=>`<button class="option quick-choice ${s.selected.includes(n)?'quick-selected':''}" data-quick-choice="${n}" aria-pressed="${s.selected.includes(n)}" ${answer?'disabled':''}>${String.fromCharCode(65+n)}. ${safe(o.text)}${answer?`<span class="quick-choice-note">${s.selected.includes(n)?'你的选择 · ':''}${q.correct.includes(n)?'本题应选':'本题不选'}</span>`:''}</button>`).join('')}</div>${answer?`<h3 role="status">${ok?'这次选择与本题条件一致':'这题有个地方值得再看看'}</h3>${quickExplanation(q)}`:''}<div class="actions"><button class="primary" id="${answer?'quickNext':'quickSubmit'}" ${!answer&&!s.selected.length?'disabled':''}>${answer?(s.step===s.ids.length-1?'看本轮小结':'下一题'):'提交答案 · 看解释'}</button></div>`;
 }
 root.innerHTML=`<section class="panel quick-panel"><h2>快速刷题 · 选完马上看懂</h2><p class="small muted">先看情境，再作选择。每题都有答案、简明理由和条件变化提醒；不计时、不扣学习分。</p>${body}<p class="small muted" id="quickStatus" role="status">${quickStorageMessage()}</p>${s?'<button class="ghost" id="quickClearRound">清除本轮暂存</button>':''}</section>`;
 const clear=document.getElementById('quickClearRound');if(clear)clear.onclick=()=>{quickClear();renderQuickPractice()};
 const start=document.getElementById('quickStart');if(start)firstTap(start,()=>quickStart());
 root.querySelectorAll('[data-quick-choice]').forEach(button=>button.onclick=()=>{
  if(!quickState||quickState!==s||s.answers[s.step])return;
  const q=quickQuestion(s.ids[s.step]),n=Number(button.dataset.quickChoice);
  s.selected=q.kind==='multi'?(s.selected.includes(n)?s.selected.filter(i=>i!==n):[...s.selected,n]):[n];
  root.querySelectorAll('[data-quick-choice]').forEach(b=>{const chosen=s.selected.includes(Number(b.dataset.quickChoice));b.classList.toggle('quick-selected',chosen);b.setAttribute('aria-pressed',String(chosen))});
  document.getElementById('quickSubmit').disabled=!s.selected.length;quickSave();
 });
 firstTap(document.getElementById('quickSubmit'),quickSubmit);firstTap(document.getElementById('quickNext'),quickNext);
 const retry=document.getElementById('quickRetry');if(retry)firstTap(retry,()=>quickStart(s.answers.filter(a=>!quickCorrect(quickQuestion(a.id),a.picks)).map(a=>a.id)));
 const learn=document.getElementById('quickLearn');if(learn)learn.onclick=()=>{communicationLesson=quickQuestion(s.ids[s.step]).topic;communicationSave();setPage('communication')};
}
