// Online installation is separate from the self-contained file:// build.
if('serviceWorker' in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register('sw.js').then(reg=>{
   reg.addEventListener('updatefound',()=>{
    const worker=reg.installing;
    worker?.addEventListener('statechange',()=>{
     if(worker.state==='installed'&&navigator.serviceWorker.controller){
      const status=document.getElementById('practiceStatus');
      status.textContent='新版本已缓存。请先保存当前练习，再关闭所有本应用标签页后重新打开。';
     }
    });
   });
  }).catch(()=>{/* A failed offline cache must never block local practice. */});
 });
}
