import{useRef,useState}from'react';
import{Download,FileArchive,LoaderCircle,CheckCircle2}from'lucide-react';
import type{Song}from'../models/types';import{DROPBOX_AUDIO_PACK_URL}from'../config';import{installAudioPack}from'../services/audioLibrary';
export default function AudioPackInstaller({songs,onInstalled,compact=false}:{songs:Song[];onInstalled:()=>Promise<void>|void;compact?:boolean}){
 const input=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[stage,setStage]=useState(1);
 const downloadUrl=songs.find(s=>s.audioDownloadUrl)?.audioDownloadUrl||DROPBOX_AUDIO_PACK_URL;
 async function choose(file?:File){if(!file)return;setBusy(true);setStage(2);try{const expected=Object.fromEntries(songs.map(s=>[s.songId,s.requiredAudio]));await installAudioPack(file,expected,setMessage);await onInstalled();setStage(3);setMessage('설치가 완료되었습니다. 이제 연습을 시작하실 수 있습니다.');}catch(e){setMessage(e instanceof Error?e.message:'음원팩을 설치하지 못했습니다. ZIP 파일을 확인해 주세요.')}finally{setBusy(false);if(input.current)input.current.value=''}}
 return <section className={'audio-installer '+(compact?'compact':'')} aria-label="음원팩 준비">
 {!compact&&<><div className="installer-icon"><FileArchive/></div><h3>연습 전에 음원팩을 준비해 주세요</h3><p>음원팩을 다운로드한 뒤, 받은 ZIP 파일을 이 웹앱에 설치해 주세요. 압축은 풀지 않으셔도 됩니다.</p></>}
 <ol className="install-steps"><li className={stage===1?'step-active':''}><span>1</span><div><b>음원팩 다운로드</b><a className="secondary-button" href={downloadUrl} target="_blank" rel="noreferrer" onClick={()=>setStage(2)}><Download size={17}/>음원팩 다운로드</a></div></li><li className={stage===2?'step-active':''}><span>2</span><div><b>다운로드한 ZIP 설치하기</b><p>다운로드가 완료되면 ZIP 파일을 그대로 선택해 주세요.</p><button className="primary-action" disabled={busy} onClick={()=>input.current?.click()}>{busy&&<LoaderCircle className="spin" size={18}/>}ZIP 설치하기</button></div></li><li className={stage===3?'step-active':''}><span>{stage===3?<CheckCircle2 size={18}/>:3}</span><b>연습 준비 완료</b></li></ol>
 <small>iPhone에서도 다운로드 폴더의 ZIP 파일을 선택해 주세요.<br/>설치된 음원은 이 브라우저에 보관됩니다.</small>
 <input ref={input} hidden type="file" aria-label="음원팩 ZIP 파일 선택" onChange={e=>choose(e.target.files?.[0])}/>
 {message&&<p role="status" className={'installer-message '+(stage===3?'ok':'')}>{message}</p>}
 </section>
}
