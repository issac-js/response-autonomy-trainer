// Optional cloud sync. The SDK is loaded lazily so the single-file app keeps
// working offline with zero external requests until the user asks for sync.
const CLOUD_CFG={
 endpoint:'https://response-autonomy-trainer.app.workbuddy.host',
 oauthRelayBaseUrl:'https://www.workbuddy.cn/v2/as/genie-baas/oauth',
 publishableKey:'wbpk_35wMLSRqdNoN6GR7pEvjpB_X2HDOb1uuFSSMU2O0KV1wRqqtzTHtbB6'
};
const CLOUD_META_KEY='response-autonomy-v01-cloud';
const CLOUD_SDK_URL='https://cdn.jsdelivr.net/npm/@tencent-ai/workbuddy-cloud-sdk@dev/lib/index.global.js';
let cloudClient=null,cloudLoading=null,cloudSession=null,cloudMeta=cloudMetaRead(),cloudSyncTimer=null,cloudBusy=false,cloudFlash='';
let cloudOtp=null;

function cloudMetaRead(){
 try{const raw=localStorage.getItem(CLOUD_META_KEY),o=raw?JSON.parse(raw):{};return o&&typeof o==='object'?{base:Number(o.base)||0,auto:o.auto!==false,enabled:!!o.enabled,lastSync:o.lastSync||'',email:typeof o.email==='string'?o.email:''}:{base:0,auto:true,enabled:false,lastSync:'',email:''}}catch(e){return {base:0,auto:true,enabled:false,lastSync:'',email:''}}
}
function cloudMetaWrite(){try{localStorage.setItem(CLOUD_META_KEY,JSON.stringify(cloudMeta))}catch(e){}}
function cloudLabel(){return cloudSession&&cloudSession.user?(cloudSession.user.email||cloudSession.user.name||'已登录'):'未登录'}
function cloudTime(iso){if(!iso)return '尚未同步';const d=new Date(iso);return Number.isNaN(d.getTime())?'尚未同步':d.toLocaleString('zh-CN',{hour12:false})}
function cloudErr(e){const m=e&&e.message?e.message:String(e||'');if(/Failed to fetch|NetworkError|Load failed/i.test(m))return '网络不可用，稍后再试；本地记录不受影响。';return m||'操作未完成'}

function loadCloudSdk(){
 if(cloudClient)return Promise.resolve(cloudClient);
 if(cloudLoading)return cloudLoading;
 cloudLoading=new Promise((resolve,reject)=>{
  if(typeof WorkBuddyCloud!=='undefined')return resolve(initCloud());
  const s=document.createElement('script');
  s.src=CLOUD_SDK_URL;s.async=true;
  s.onload=()=>{try{resolve(initCloud())}catch(e){reject(e)}};
  s.onerror=()=>{cloudLoading=null;reject(Error('云端组件加载失败，请检查网络后重试'))};
  document.head.appendChild(s);
 });
 return cloudLoading;
}
function initCloud(){
 if(cloudClient)return cloudClient;
 if(typeof WorkBuddyCloud==='undefined'||!WorkBuddyCloud.createWorkBuddyCloud)throw Error('云端组件不可用');
 cloudClient=WorkBuddyCloud.createWorkBuddyCloud({
  endpoint:CLOUD_CFG.endpoint,
  oauthRelayBaseUrl:CLOUD_CFG.oauthRelayBaseUrl,
  publishableKey:CLOUD_CFG.publishableKey
 });
 return cloudClient;
}
async function cloudEnsureSession(){
 const c=await loadCloudSdk();
 const {data,error}=await c.auth.getSession();
 if(error){cloudSession=null;return null}
 cloudSession=data||null;
 return cloudSession;
}

// ---- sync -----------------------------------------------------------------
async function cloudPull(){
 const c=await loadCloudSdk();
 const {data,error}=await c.database.from('rat_state').select('payload,revision,updated_at').maybeSingle();
 if(error)throw error;
 return data||null;
}
async function cloudPush(force=false){
 const c=await loadCloudSdk();
 const localRev=data.revision||0;
 const remote=await cloudPull();
 if(!remote){
  if(cloudMeta.base!==0&&!force)throw Error('云端记录已不存在，请选择“用本机覆盖云端”。');
  const {error}=await c.database.from('rat_state').insert({payload:data,revision:localRev,client:'web'});
  if(error)throw error;
  cloudMeta.base=localRev;cloudMeta.lastSync=new Date().toISOString();cloudMeta.enabled=true;cloudMetaWrite();
  return {status:'uploaded',revision:localRev};
 }
 if(!force&&remote.revision!==cloudMeta.base){
  return {status:'conflict',local:localRev,remote:remote.revision,remotePayload:remote.payload};
 }
 if(remote.revision===localRev){cloudMeta.base=localRev;cloudMeta.lastSync=new Date().toISOString();cloudMetaWrite();return {status:'same',revision:localRev}}
 const {data:rows,error}=await c.database.from('rat_state')
  .update({payload:data,revision:localRev,client:'web',updated_at:new Date().toISOString()})
  .eq('revision',remote.revision).select('revision');
 if(error)throw error;
 if(!Array.isArray(rows)||!rows.length)return {status:'conflict',local:localRev,remote:remote.revision,remotePayload:remote.payload};
 cloudMeta.base=localRev;cloudMeta.lastSync=new Date().toISOString();cloudMeta.enabled=true;cloudMetaWrite();
 return {status:'uploaded',revision:localRev};
}
async function cloudAdopt(remote){
 const payload=remote&&remote.payload;
 if(!payload)throw Error('云端记录为空');
 const rev=Number(remote.revision)||0;
 adoptRemote(payload,rev);           // validates before replacing anything
 cloudMeta.base=rev;cloudMeta.lastSync=new Date().toISOString();cloudMeta.enabled=true;cloudMetaWrite();
 render();
}
async function cloudSync(manual=false){
 if(cloudBusy)return;
 cloudBusy=true;
 try{
  const session=await cloudEnsureSession();
  if(!session){if(manual)cloudFlash='请先登录再同步。';renderCloudPanel();return}
  const remote=await cloudPull();
  const localRev=data.revision||0;
  if(!remote){
   const r=await cloudPush();
   cloudFlash=r.status==='uploaded'?'已把本机记录上传到云端。':'同步完成。';
  }else if(remote.revision===localRev){
   cloudMeta.base=localRev;cloudMeta.lastSync=new Date().toISOString();cloudMetaWrite();
   cloudFlash='本机与云端一致，无需上传。';
  }else if(remote.revision===cloudMeta.base){
   const r=await cloudPush();
   cloudFlash=r.status==='uploaded'?'已上传本机的新记录。':'同步完成。';
  }else if(localRev===cloudMeta.base){
   await cloudAdopt(remote);
   cloudFlash='已用云端较新的记录更新本机。';
  }else{
   cloudFlash='云端与本机都有新记录，请选择保留哪一份。';
  }
 }catch(e){cloudFlash='同步未完成：'+cloudErr(e)}
 finally{cloudBusy=false;renderCloudPanel()}
}
function cloudScheduleSync(){
 if(!cloudMeta.enabled||!cloudMeta.auto||!cloudClient||!cloudSession)return;
 clearTimeout(cloudSyncTimer);
 cloudSyncTimer=setTimeout(()=>{cloudSync(false)},1800);
}
function cloudAfterSave(){cloudScheduleSync()}

// ---- UI -------------------------------------------------------------------
function renderCloudPanel(){
 const box=document.getElementById('cloudPanel');if(!box)return;
 const signed=!!cloudSession;
 box.innerHTML=`
  <p class="small muted">开启后可在手机与电脑间同步同一份记录。数据存放在本应用专属的云端空间，只有登录后的你能读写；不登录时应用仍完全离线可用。</p>
  ${cloudFlash?`<p class="notice small" role="status">${safe(cloudFlash)}</p>`:''}
  ${signed?`
   <p><b>已登录：</b>${safe(cloudLabel())}</p>
   <p class="small muted">上次同步：${safe(cloudTime(cloudMeta.lastSync))} · 本机版本 ${data.revision||0} · 云端基准 ${cloudMeta.base}</p>
   <label class="coach-trigger"><input type="checkbox" id="cloudAuto" ${cloudMeta.auto?'checked':''}> 保存后自动同步</label>
   <div class="actions"><button class="primary" id="cloudSyncNow">立即同步</button><button class="secondary" id="cloudPullNow">用云端覆盖本机</button><button class="ghost" id="cloudSignOut">退出登录</button></div>
   <div class="actions"><button class="ghost danger" id="cloudDelete">删除云端记录</button></div>
   <p class="small muted">“用云端覆盖本机”会替换本机记录，执行前请先导出备份。“删除云端记录”只删云端，本机保留。</p>
  `:`
   <label for="cloudEmail">邮箱（用于接收登录验证码）</label>
   <input type="email" id="cloudEmail" inputmode="email" autocomplete="email" value="${safe(cloudMeta.email)}" placeholder="name@example.com">
   <div class="actions"><button class="secondary" id="cloudSendCode" type="button">获取验证码</button></div>
   <label for="cloudCode">验证码</label>
   <input id="cloudCode" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="6 位数字">
   <div class="actions"><button class="primary" id="cloudLogin" type="button">登录 / 注册</button></div>
   <p class="small muted" id="cloudLoginStatus" role="status"></p>
  `}`;
 if(!signed){
  document.getElementById('cloudSendCode').onclick=cloudSendCode;
  document.getElementById('cloudLogin').onclick=cloudVerifyCode;
  const email=document.getElementById('cloudEmail');
  email.onchange=()=>{cloudMeta.email=email.value.trim();cloudMetaWrite()};
 }
 if(signed){
  document.getElementById('cloudAuto').onchange=e=>{cloudMeta.auto=e.target.checked;cloudMetaWrite()};
  document.getElementById('cloudSyncNow').onclick=()=>cloudSync(true);
  document.getElementById('cloudPullNow').onclick=cloudPullNow;
  document.getElementById('cloudSignOut').onclick=cloudSignOut;
  document.getElementById('cloudDelete').onclick=cloudDelete;
 }
}
async function cloudSendCode(){
 const email=(document.getElementById('cloudEmail').value||'').trim();
 const status=document.getElementById('cloudLoginStatus');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent='请输入有效的邮箱地址。';return}
 const btn=document.getElementById('cloudSendCode');btn.disabled=true;status.textContent='正在发送…';
 try{
  const c=await loadCloudSdk();
  const {data,error}=await c.auth.sendOtp({email});
  if(error)throw error;
  cloudOtp={email,verificationId:data.verificationId,isExistingUser:data.isExistingUser};
  cloudMeta.email=email;cloudMetaWrite();
  status.textContent='验证码已发送，请查收邮箱（含垃圾箱）。';
  btn.textContent='重新发送';
 }catch(e){status.textContent='发送未完成：'+cloudErr(e)}
 finally{btn.disabled=false}
}
async function cloudVerifyCode(){
 const email=(document.getElementById('cloudEmail').value||'').trim();
 const code=(document.getElementById('cloudCode').value||'').trim();
 const status=document.getElementById('cloudLoginStatus');
 if(!cloudOtp||cloudOtp.email!==email){status.textContent='请先获取当前邮箱的验证码。';return}
 if(!/^\d{4,8}$/.test(code)){status.textContent='请输入收到的验证码。';return}
 const btn=document.getElementById('cloudLogin');btn.disabled=true;status.textContent='正在登录…';
 try{
  const c=await loadCloudSdk();
  const {data,error}=await c.auth.verifyOtp({email:cloudOtp.email,verificationId:cloudOtp.verificationId,isExistingUser:cloudOtp.isExistingUser,token:code});
  if(error)throw error;
  cloudOtp=null;cloudSession=await cloudEnsureSession();
  cloudMeta.enabled=true;cloudMetaWrite();
  cloudFlash='已登录，正在核对云端记录…';
  renderCloudPanel();
  await cloudSync(false);
 }catch(e){status.textContent='登录未完成：'+cloudErr(e)}
 finally{btn.disabled=false}
}
async function cloudPullNow(){
 if(!confirm('用云端记录覆盖本机？本机未同步的改动会丢失，建议先导出备份。'))return;
 cloudBusy=true;
 try{
  const session=await cloudEnsureSession();
  if(!session){cloudFlash='请先登录。';return}
  const remote=await cloudPull();
  if(!remote){cloudFlash='云端还没有记录，可先点“立即同步”上传本机。';return}
  await cloudAdopt(remote);
  cloudFlash='已用云端记录覆盖本机。';
 }catch(e){cloudFlash='恢复未完成：'+cloudErr(e)}
 finally{cloudBusy=false;renderCloudPanel()}
}
async function cloudDelete(){
 if(!confirm('删除云端记录？本机记录会保留，但其他设备将无法再从云端恢复。'))return;
 if(!confirm('确认删除？此操作不可撤销。'))return;
 cloudBusy=true;
 try{
  const c=await loadCloudSdk();
  const remote=await cloudPull();
  if(!remote){cloudFlash='云端没有可删除的记录。';return}
  const {data:rows,error}=await c.database.from('rat_state').delete().eq('revision',remote.revision).select('revision');
  if(error)throw error;
  if(!Array.isArray(rows)||!rows.length)throw Error('删除未生效，请重试');
  cloudMeta.base=0;cloudMeta.lastSync='';cloudMeta.enabled=false;cloudMetaWrite();
  cloudFlash='云端记录已删除；本机记录仍在。';
 }catch(e){cloudFlash='删除未完成：'+cloudErr(e)}
 finally{cloudBusy=false;renderCloudPanel()}
}
async function cloudSignOut(){
 try{const c=await loadCloudSdk();await c.auth.signOut()}catch(e){}
 cloudSession=null;cloudMeta.enabled=false;cloudMetaWrite();
 cloudFlash='已退出登录；本机记录保持不变。';
 renderCloudPanel();
}
// Background attempt only on the published HTTPS origin, so the offline file
// never requests the SDK.
async function cloudBoot(){
 if(location.protocol!=='https:'||!cloudMeta.enabled)return;
 try{
  const session=await cloudEnsureSession();
  if(session&&cloudMeta.auto)cloudSync(false);
 }catch(e){/* offline or blocked: stay local, no user-facing error */}
}
setTimeout(cloudBoot,1200);
