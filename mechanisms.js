// Mechanisms behind advanced social pressure. Recognition beats scripts.
const MECHANISMS=[
 {k:'premise',label:'预设前提',why:'把未证实的事当成既定事实，让你在错误前提里回答。'},
 {k:'authority',label:'权威借力',why:'借领导、制度或流程的名义，绕过可核实的授权。'},
 {k:'care',label:'关心包装',why:'以关心、自责或提醒为外壳，降低你的防备。'},
 {k:'reciprocity',label:'互惠自曝',why:'先暴露自己，制造“你也该说”的交换压力。'},
 {k:'escalation',label:'小承诺升级',why:'先要一个无伤大雅的小忙，再逐步升级。'},
 {k:'urgency',label:'时间压力',why:'用截止时间压缩判断空间，逼你当场承诺。'},
 {k:'herd',label:'群体压力',why:'用“大家都这样”替代依据与授权。'},
 {k:'falsechoice',label:'假二选一',why:'把“要不要”偷换成“选 A 还是 B”。'},
 {k:'stitching',label:'信息拼接',why:'多个无害问题拼出完整情报。'},
 {k:'hypothetical',label:'假设套话',why:'用假设句索取可执行细节。'},
 {k:'emotion',label:'情绪施压',why:'用失望、脆弱或人格评价让你接管责任。'},
 {k:'ambiguity',label:'模糊授权',why:'“你看着办”把决策风险转移给你，却不给边界。'}
];
function mechanismByKey(k){return MECHANISMS.find(m=>m.k===k)||null}
function mechanismOptions(card){
 const others=MECHANISMS.filter(m=>m.k!==card.mechanism);
 let seed=0;for(const ch of card.id)seed+=ch.charCodeAt(0);
 const picks=[];
 for(let i=0;i<3;i++)picks.push(others[(seed+i*5)%others.length]);
 const at=seed%4;const out=[];
 for(let i=0;i<4;i++)out.push(i===at?mechanismByKey(card.mechanism):picks.shift());
 return out.filter(Boolean);
}
