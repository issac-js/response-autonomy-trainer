// Versioned offline shell. Never cache account, model or sync responses.
const CACHE='response-autonomy-shell-v0.12.0';
const SHELL=['./','./index.html','./manifest.webmanifest','./assets/icon-180.png','./assets/icon-512.png','./vendor/workbuddy-cloud-sdk.js'];
const STATIC=new Set(SHELL.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
 // No skipWaiting: an update must not replace a running practice session.
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('response-autonomy-shell-')&&key!==CACHE).map(key=>caches.delete(key)))));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const scope=new URL(self.registration.scope),entry=url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html';
 if(request.mode==='navigate'&&entry){
  event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match(new URL('./index.html',scope).href))));return;
 }
 if(!STATIC.has(url.href))return;
 event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request))||fetch(request)));
});
