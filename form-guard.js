// Transient, per-tab protection for text that has been typed but not yet saved.
// Uses a separate sessionStorage key, never response-autonomy-v01, never a JSON
// backup, and never a network request. Closing the tab discards the buffer.
// On engines without reliable beforeunload (notably iOS Safari) the buffer is
// the safety net: reopening the same form restores the unsaved text.
const UNSAVED_KEY='response-autonomy-v01-unsaved-v1';
let unsavedBuffer=unsavedRead(),unsavedRestoring=false;
function unsavedRead(){
 try{
  const raw=sessionStorage.getItem(UNSAVED_KEY),obj=raw?JSON.parse(raw):{};
  if(!obj||typeof obj!=='object'||Array.isArray(obj))return {};
  const clean={};for(const k of Object.keys(obj))if(typeof obj[k]==='string'&&obj[k].length<=4000)clean[k]=obj[k];
  return clean;
 }catch(e){return {}}
}
function unsavedDirty(){return Object.values(unsavedBuffer).some(v=>typeof v==='string'&&v.trim().length>0)}
function unsavedNotice(){
 const box=document.getElementById('unsavedNotice');if(box)box.hidden=!unsavedDirty();
}
function unsavedWrite(){
 try{
  if(Object.keys(unsavedBuffer).length)sessionStorage.setItem(UNSAVED_KEY,JSON.stringify(unsavedBuffer));
  else sessionStorage.removeItem(UNSAVED_KEY);
 }catch(e){/* sessionStorage unavailable: beforeunload still warns */}
 unsavedNotice();
}
function unsavedClear(prefix){
 if(prefix===undefined)unsavedBuffer={};
 else{const p=String(prefix);for(const k of Object.keys(unsavedBuffer))if(k.indexOf(p)===0)delete unsavedBuffer[k]}
 unsavedWrite();
}
function unsavedRestore(){
 const box=document.getElementById('root');if(!box)return;
 let restored=0;unsavedRestoring=true;
 try{
  box.querySelectorAll('[data-unsaved]').forEach(el=>{
   const key=el.getAttribute('data-unsaved'),value=unsavedBuffer[key];
   if(typeof value!=='string'||!value||el.value===value)return;
   if(document.activeElement===el)return; // never fight with live typing
   el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));restored++;
  });
 }finally{unsavedRestoring=false}
 const status=document.getElementById('unsavedStatus');
 if(status&&restored)status.textContent='已恢复 '+restored+' 处上次未保存的输入（仅本标签页临时保留，未写入学习记录或备份）。';
 unsavedNotice();
}
document.addEventListener('input',e=>{
 const el=e.target;
 if(unsavedRestoring||!el||!el.getAttribute||!el.hasAttribute('data-unsaved'))return;
 const key=el.getAttribute('data-unsaved'),v=String(el.value||'');
 if(!key)return;
 if(v.trim())unsavedBuffer[key]=v;else delete unsavedBuffer[key];
 unsavedWrite();
},true);
// Only direct children of #root are watched: every renderer replaces root's
// children, while voice playback and timer text change deeper nodes.
if(typeof MutationObserver==='function'){
 const target=document.getElementById('root');
 if(target)new MutationObserver(unsavedRestore).observe(target,{childList:true});
}
window.addEventListener('beforeunload',e=>{if(unsavedDirty()){e.preventDefault();e.returnValue=''}});
(function(){
 const button=document.getElementById('unsavedClear');
 if(button)button.onclick=()=>{
  const status=document.getElementById('unsavedStatus'),box=document.getElementById('unsavedNotice');
  unsavedClear();
  if(status)status.textContent='临时草稿已清除；页面中已输入的内容不会被改写。';
  if(box){box.hidden=false;setTimeout(unsavedNotice,3000)}
 };
 unsavedNotice();
})();
