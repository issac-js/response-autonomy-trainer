function renderSettings(){
 root.innerHTML=`<section class="panel"><h2>复习设置</h2><label for="limit">每日新卡数量（完成自评才计数）</label><select id="limit">${[3,5,8,10].map(n=>`<option value="${n}" ${data.settings.newPerDay===n?'selected':''}>${n}张</option>`).join('')}</select><p><label><input type="checkbox" id="timer" ${data.settings.timer?'checked':''}> 15秒可选提示（超时不扣分）</label></p><p class="small muted">FSRS 根据你对自己原话的自评安排复习。旧卡的到期日保留，到下一次实际作答时开始建立 FSRS 状态。尚未到期的复习可稍后回来；自由练习可提前练习并更新排程。</p><button class="primary" id="saveSettings">保存设置</button></section><section class="panel"><h2>隐私与备份</h2><p>文字、模拟草稿、真实交流计划与观察保存在当前浏览器。可选录音只在本题临时保留，不上传、不纳入JSON。换设备或清浏览器数据前，请导出备份。导出包含你写的原话，应先脱敏。页面里尚未提交的输入另有本标签页临时草稿（sessionStorage 独立键，不进入 JSON 备份、不上传、关闭标签页即清除）；顶部提示条可一键清除。</p>${storageFault?`<p class="notice" role="alert">${safe(storageFault)}</p>`:''}<div class="actions"><button class="secondary" id="export" ${storageFault?'disabled':''}>导出学习备份 JSON</button><button class="secondary" id="exportRaw">导出当前存储原文</button>${pendingBackup?'<button class="secondary" id="exportPending">导出未保存记录</button>':''}<button class="secondary" id="import">导入备份</button><input id="importFile" type="file" accept=".json,application/json" hidden><button class="ghost danger" id="reset">清空本地学习记录</button></div><p class="small muted">导入先完整校验，再保留导入前快照，最后替换。若备份格式错误或保存失败，原记录保留。升级时请关闭旧版页面，避免旧页面写回旧格式。新版自主回应记录使用schemaVersion:3；旧版应用无法读取新版备份，应使用本版继续学习。</p><button class="ghost" id="exportSnapshot">导出上一次导入前快照</button><div id="importStatus" role="status" class="small"></div></section><section class="panel"><h2>适用边界</h2><p>正常闲聊自然回答；职责内问题如实、准确、充分回答；遇到错误前提、隐私和权限问题再澄清或设界限。目标是独立判断和适当表达。</p><p class="small muted">自由回应没有智能语义评分；多轮为固定分支。策略选择成绩、自评和现实沟通效果应分开看。</p><details><summary>复习模块版本与证据边界</summary><p>内置 ts-fsrs 5.4.2（FSRS-6），保留率目标90%，默认参数，关闭随机扰动。固定此版本以支持单文件离线运行，并非最新的库版本；没有调用 LexiLoop。间隔复习不能保证现实压力下自动掌握。</p></details></section>`;
 document.getElementById('saveSettings').onclick=()=>{data.settings.newPerDay=+document.getElementById('limit').value;data.settings.timer=document.getElementById('timer').checked;if(save())alert('设置已保存')};
 document.getElementById('export').onclick=()=>download(`回应自主权-备份-${TODAY()}.json`,JSON.stringify(data,null,2),'application/json');
 document.getElementById('exportRaw').onclick=()=>{try{download(`回应自主权-存储原文-${TODAY()}.json`,localStorage.getItem(STORE)??'null','application/json')}catch(e){alert('无法读取：'+e.message)}};
 const pending=document.getElementById('exportPending');if(pending)pending.onclick=()=>download(`回应自主权-未保存-${TODAY()}.json`,pendingBackup,'application/json');
 document.getElementById('exportSnapshot').onclick=()=>{try{const raw=localStorage.getItem(STORE+'-before-import');if(raw===null){alert('尚无导入前快照');return}download(`回应自主权-导入前-${TODAY()}.json`,raw,'application/json')}catch(e){alert(e.message)}};
 document.getElementById('import').onclick=()=>document.getElementById('importFile').click();
 document.getElementById('importFile').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
   if(f.size>20*1024*1024)throw Error('备份超过20MB，未读取或替换记录');
   const obj=validateData(JSON.parse(await f.text()));
   if(!confirm(`备份含 ${Object.keys(obj.cards).length} 张已接触卡、${obj.history.length} 条单轮记录、${obj.dialogueHistory.length} 次多轮模拟、${obj.coach.runs.length} 次自主回应复盘及 ${obj.coach.experiments.length} 条真实练习计划。导入将替换当前记录，并保留导入前快照。继续吗？`))return;
   stopVoice();const snapshot=restoreBackup(obj);unsavedClear();dialogueState=null;current=null;renderSettings();document.getElementById('importStatus').textContent=snapshot?'备份已恢复，导入前快照已保留。':'备份已恢复；本地空间不足，未能保存导入前快照，请立即导出当前备份。';
  }catch(err){document.getElementById('importStatus').textContent='导入失败，原记录未替换：'+err.message}
  finally{e.target.value=''}
 };
 document.getElementById('reset').onclick=()=>{if(storageFault){alert('请先导出原文并导入有效备份恢复。');return}if(confirm('删除当前记录？请先导出备份。')&&confirm('确认已保留需要的备份？')){data=defaultData();if(save()){unsavedClear();dialogueState=null;stopVoice();render()}}};
}
