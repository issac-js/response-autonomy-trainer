let offlineRegistration=null,offlineWaiting=false,offlineMessage='检查更新不会清除学习记录；请先保存未完成练习。';
function renderOfflineStatus(){const el=document.getElementById('appUpdateStatus');if(el)el.textContent=offlineWaiting?'新版本已缓存。完成并保存练习后，关闭所有本应用标签页和主屏窗口，再重新打开；不要清除网站数据。':offlineMessage}
async function checkAppUpdate(){
 if(location.protocol==='file:'){offlineMessage='这是离线文件版，请换用发布后的新文件；学习记录请先导出备份。';renderOfflineStatus();return}
 const button=document.getElementById('checkAppUpdate');if(button)button.disabled=true;
 try{const reg=offlineRegistration||await navigator.serviceWorker?.getRegistration();if(!reg)throw Error('尚未注册离线更新，请联网后重开再试');await reg.update();offlineWaiting=!!reg.waiting;offlineMessage='已发起更新检查。当前运行v'+APP_VERSION+'；若更新正在下载，请稍候。没有待激活更新不代表已独立核实服务器最新版本。'}catch(e){offlineMessage='更新检查未完成：'+e.message+'。本机记录保持不变。'}finally{if(button)button.disabled=false;renderOfflineStatus()}
}
// Online installation is separate from the self-contained file:// build.
if('serviceWorker' in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register('sw.js').then(reg=>{
   offlineRegistration=reg;offlineWaiting=!!reg.waiting;renderOfflineStatus();
   reg.addEventListener('updatefound',()=>{
    const worker=reg.installing;
    worker?.addEventListener('statechange',()=>{
     if(worker.state==='installed'&&navigator.serviceWorker.controller){
      offlineWaiting=true;renderOfflineStatus();
      const status=document.getElementById('practiceStatus');
      status.textContent='新版本已缓存。请先保存当前练习，再关闭所有本应用标签页后重新打开。';
     }
    });
   });
  }).catch(()=>{/* A failed offline cache must never block local practice. */});
 });
}
