// Optional local recording. No speech-recognition service or audio upload.
let voiceRecorder=null,voiceStream=null,voiceURL=null,voiceGeneration=0,voiceTimer=null,voiceStartedAt=0;
function stopVoice(){
 voiceGeneration++;clearTimeout(voiceTimer);
 if(voiceRecorder&&voiceRecorder.state!=='inactive')voiceRecorder.stop();
 if(voiceStream)voiceStream.getTracks().forEach(t=>t.stop());
 voiceRecorder=null;voiceStream=null;
 if(voiceURL){URL.revokeObjectURL(voiceURL);voiceURL=null}
}
function mountVoice(id){
 const slot=document.getElementById(id);if(!slot)return;
 slot.innerHTML=`<details><summary>可选：先出声练习并回听</summary><p class="small muted">只有点击录音才申请麦克风。录音仅在本页临时保存，不上传、不自动识别或评分，离开本题即清除。每次最长2分钟。听完仍需输入原话。</p><button type="button" class="secondary" id="recordVoice">开始录音</button> <span id="voiceStatus" class="small" role="status"></span><div id="voicePlayback"></div></details>`;
 const button=document.getElementById('recordVoice'),status=document.getElementById('voiceStatus'),playback=document.getElementById('voicePlayback');
 button.onclick=async()=>{
  if(voiceRecorder&&voiceRecorder.state==='recording'){voiceRecorder.stop();return}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status.textContent='此浏览器或打开方式不支持录音，可以直接出声练习后输入。';return}
  stopVoice();playback.innerHTML='';const generation=voiceGeneration;
  button.disabled=true;status.textContent='正在申请麦克风…';
  try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:true});
   if(generation!==voiceGeneration||!slot.isConnected){stream.getTracks().forEach(t=>t.stop());return}
   voiceStream=stream;const recorder=new MediaRecorder(stream),chunks=[];voiceRecorder=recorder;
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   recorder.onstop=()=>{clearTimeout(voiceTimer);stream.getTracks().forEach(t=>t.stop());if(voiceStream===stream)voiceStream=null;
    if(generation!==voiceGeneration||!slot.isConnected)return;
    voiceRecorder=null;voiceURL=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType||'audio/mp4'}));
    const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=voiceURL;audio.setAttribute('aria-label','我的回应录音');
    // iOS/Safari reports duration 0 for MediaRecorder blobs until the metadata is
    // seeked; force one seek so the native player shows the real length.
    audio.addEventListener('loadedmetadata',()=>{
     if(audio.duration===Infinity||Number.isNaN(audio.duration)){
      audio.currentTime=1e101;
      const reset=()=>{audio.currentTime=0;audio.removeEventListener('timeupdate',reset)};
      audio.addEventListener('timeupdate',reset);
     }
    });
    playback.replaceChildren(audio);
    const secs=Math.max(1,Math.round((Date.now()-voiceStartedAt)/1000));
    button.textContent='重新录音';status.textContent='已录 '+secs+' 秒，可回听。';
   };
   recorder.onerror=()=>{status.textContent='录音中断，可以继续文字训练。';stopVoice();button.textContent='开始录音'};
   recorder.start();voiceStartedAt=Date.now();button.textContent='停止并回听';status.textContent='正在录音（最长2分钟）';
   voiceTimer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},120000);
  }catch(e){status.textContent=e.name==='NotAllowedError'?'未获得麦克风权限，可以继续文字训练。':'录音暂不可用，可以继续文字训练。';stopVoice()}
  finally{button.disabled=false}
 };
}
window.addEventListener('pagehide',stopVoice);
