import{useRef,useState}from'react';
import{Download,FileArchive,ShieldCheck,LoaderCircle,CheckCircle2}from'lucide-react';
import type{Song}from'../models/types';
import{DROPBOX_AUDIO_PACK_URL}from'../config';
import{installAudioPack}from'../services/audioLibrary';
export default function AudioPackInstaller({songs,onInstalled,compact=false}:{songs:Song[];onInstalled:()=>Promise<void>|void;compact?:boolean}){
  const input=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const downloadUrl=songs.find(s=>s.audioDownloadUrl)?.audioDownloadUrl||DROPBOX_AUDIO_PACK_URL;
  async function choose(file?:File){if(!file)return;setBusy(true);setMessage('음원팩을 확인하고 있어요…');try{const expected=Object.fromEntries(songs.map(s=>[s.songId,s.requiredAudio]));const installed=await installAudioPack(file,expected);setMessage(`${installed.map(x=>x.songId).join(', ')} 음원 설치 완료`);await onInstalled()}catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false);if(input.current)input.current.value=''}}
  return <div className={'audio-installer '+(compact?'compact':'')}>
    {!compact&&<><div className="installer-icon"><FileArchive/></div><h3>음원팩이 필요해요</h3><p>음원팩은 Dropbox에서 직접 내려받고, 설치한 MP3는 서버로 업로드하지 않고 이 브라우저에만 저장돼요.</p></>}
    <div className="installer-actions"><a className="secondary-button" href={downloadUrl} target="_blank" rel="noreferrer"><Download size={17}/>음원팩 다운로드</a><button className="primary-action" disabled={busy} onClick={()=>input.current?.click()}>{busy?<LoaderCircle className="spin" size={18}/>:<ShieldCheck size={18}/>}다운로드한 ZIP 설치</button></div>
    <input ref={input} hidden type="file" accept=".zip,application/zip" onChange={e=>choose(e.target.files?.[0])}/>
    {message&&<p className={'installer-message '+(message.includes('완료')?'ok':'')}>{message.includes('완료')&&<CheckCircle2 size={15}/>} {message}</p>}
  </div>
}
