// Transient, per-tab protection for text that has been typed but not yet saved.
// Uses a separate sessionStorage key, never response-autonomy-v01, never a JSON
// backup, and never a network request. Closing the tab discards the buffer.
//
// Each entry is {g:group, o:owner, n:node, f:field, v:value}. Owner and node are
// matched exactly, so records whose ids are prefixes of one another ("a" and
// "a:b") never clear each other's draft.
const UNSAVED_KEY='response-autonomy-v01-unsaved-v2';
try{sessionStorage.removeItem('response-autonomy-v01-unsaved-v1')}catch(e){/* older tab-local format */}
let unsavedBuffer=unsavedRead(),unsavedRestoring=false;
function unsavedRead(){
 try{
  const raw=sessionStorage.getItem(UNSAVED_KEY),arr=raw?JSON.parse(raw):[];
  if(!Array.isArray(arr))return [];
  return arr.filter(e=>e&&typeof e.g==='string'&&typeof e.o==='string'&&typeof e.n==='string'&&typeof e.f==='string'&&typeof e.v==='string'&&e.v.length<=4000);
 }catch(e){return []}
}
function unsavedDirty(){return unsavedBuffer.some(e=>typeof e.v==='string'&&e.v.trim().length>0)}
function unsavedNotice(){
 const box=document.getElementById('unsavedNotice');if(box)box.hidden=!unsavedDirty();
}
function unsavedWrite(){
 try{
  if(unsavedBuffer.length)sessionStorage.setItem(UNSAVED_KEY,JSON.stringify(unsavedBuffer));
  else sessionStorage.removeItem(UNSAVED_KEY);
 }catch(e){/* sessionStorage unavailable: beforeunload still warns */}
 unsavedNotice();
}
function unsavedKeyOf(el){
 const g=el.getAttribute('data-unsaved-group');
 if(!g)return null;
 return {g,o:el.getAttribute('data-unsaved-owner')||'',n:el.getAttribute('data-unsaved-node')||'',f:el.getAttribute('data-unsaved-field')||''};
}
function unsavedAttrs(group,owner='',node='',field=''){
 return ` data-unsaved-group="${safe(group)}" data-unsaved-owner="${safe(owner)}" data-unsaved-node="${safe(node)}" data-unsaved-field="${safe(field)}"`;
}
function unsavedFor(k){return unsavedBuffer.find(e=>e.g===k.g&&e.o===k.o&&e.n===k.n&&e.f===k.f)||null}
function unsavedHas(group,owner){return unsavedBuffer.some(e=>e.g===group&&e.o===owner&&e.v&&e.v.trim())}
function unsavedSet(k,v){
 unsavedBuffer=unsavedBuffer.filter(e=>!(e.g===k.g&&e.o===k.o&&e.n===k.n&&e.f===k.f));
 if(v&&v.trim())unsavedBuffer.push({g:k.g,o:k.o,n:k.n,f:k.f,v});
 unsavedWrite();
}
// Clear a whole group, or every entry whose owner matches exactly.
function unsavedClear(group,owner){
 if(group===undefined)unsavedBuffer=[];
 else unsavedBuffer=unsavedBuffer.filter(e=>e.g!==group||(owner!==undefined&&e.o!==owner));
 unsavedWrite();
}
function unsavedRestore(){
 const box=document.getElementById('root');if(!box)return;
 let restored=0;unsavedRestoring=true;
 try{
  box.querySelectorAll('[data-unsaved-group]').forEach(el=>{
   const k=unsavedKeyOf(el),hit=unsavedFor(k);
   if(!hit||!hit.v||el.value===hit.v)return;
   if(document.activeElement===el)return; // never fight with live typing
   el.value=hit.v;el.dispatchEvent(new Event('input',{bubbles:true}));restored++;
  });
 }finally{unsavedRestoring=false}
 const status=document.getElementById('unsavedStatus');
 if(status&&restored)status.textContent='已恢复 '+restored+' 处上次未保存的输入（仅本标签页临时保留，未写入学习记录或备份）。';
 unsavedNotice();
}
document.addEventListener('input',e=>{
 const el=e.target;
 if(unsavedRestoring||!el||!el.getAttribute)return;
 const k=unsavedKeyOf(el);
 if(k)unsavedSet(k,String(el.value||''));
},true);
// Only direct children of #root are watched: every renderer replaces root's
// children, while voice playback and timer text change deeper nodes.
if(typeof MutationObserver==='function'){
 const target=document.getElementById('root');
 if(target)new MutationObserver(unsavedRestore).observe(target,{childList:true});
}
window.addEventListener('beforeunload',e=>{
 const dialogueOpen=typeof dialogueState!=='undefined'&&dialogueState&&!dialogueState.finished;
 if(unsavedDirty()||dialogueOpen){e.preventDefault();e.returnValue=''}
});
(function(){
 const button=document.getElementById('unsavedClear');
 if(button)button.onclick=()=>{
  const status=document.getElementById('unsavedStatus'),box=document.getElementById('unsavedNotice');
  unsavedClear();if(typeof practiceClear==='function')practiceClear();
  if(status)status.textContent='临时草稿已清除；页面中已输入的内容不会被改写。';
  if(box){box.hidden=false;setTimeout(unsavedNotice,3000)}
 };
 unsavedNotice();
})();
