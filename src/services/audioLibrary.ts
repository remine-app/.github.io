import JSZip from 'jszip';
import type {InstalledAudioMeta,RequiredAudio} from '../models/types';

const DB_NAME='rechant.audio.v1';
const STORE='audio';
const DB_VERSION=1;
interface AudioRow extends InstalledAudioMeta{blob:Blob}

function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'songId'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function request<T>(mode:IDBTransactionMode,run:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{const db=await openDb();try{return await new Promise<T>((resolve,reject)=>{const tx=db.transaction(STORE,mode),req=run(tx.objectStore(STORE));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}}

export async function listInstalledAudio():Promise<InstalledAudioMeta[]>{const rows=await request<AudioRow[]>('readonly',s=>s.getAll());return(rows||[]).map(({blob:_blob,...meta})=>meta)}
export async function getInstalledAudio(songId:string):Promise<AudioRow|undefined>{return request<AudioRow|undefined>('readonly',s=>s.get(songId))}
export async function removeInstalledAudio(songId:string):Promise<void>{await request<IDBValidKey>('readwrite',s=>s.delete(songId))}
export async function clearInstalledAudio():Promise<void>{await request<undefined>('readwrite',s=>s.clear() as IDBRequest<undefined>)}

async function sha256Hex(blob:Blob):Promise<string>{const hash=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')}
function safePath(v:string){return!!v&&!v.startsWith('/')&&!v.includes('..')&&!v.includes('://')}
export function audioMatches(meta:InstalledAudioMeta|undefined,required?:RequiredAudio):boolean{if(!meta)return false;if(!required)return true;return(!required.audioVersion||meta.audioVersion===required.audioVersion)&&(!required.sha256||meta.sha256.toLowerCase()===required.sha256.toLowerCase())&&(!required.byteLength||meta.byteLength===required.byteLength)}

export async function installAudioPack(file:File,expectedBySong:Record<string,RequiredAudio|undefined>={}):Promise<InstalledAudioMeta[]>{
  const zip=await JSZip.loadAsync(file),manifestEntry=zip.file('manifest.json');
  if(!manifestEntry)throw Error('manifest.json이 없는 음원팩입니다.');
  const manifest=JSON.parse(await manifestEntry.async('text'));
  if(manifest.schemaVersion!=='rechant-audio-pack-1')throw Error('지원하지 않는 Re:chant 음원팩입니다.');
  if(!Array.isArray(manifest.tracks)||!manifest.tracks.length)throw Error('음원팩에 곡이 없습니다.');
  const prepared:{meta:InstalledAudioMeta;blob:Blob}[]=[];
  for(const track of manifest.tracks){
    const songId=String(track.songId||''),fileName=String(track.fileName||'');
    if(!songId||!safePath(fileName))throw Error('음원팩의 파일 경로가 올바르지 않습니다.');
    const entry=zip.file(fileName);if(!entry)throw Error(`${songId}: 음원 파일을 찾을 수 없습니다.`);
    const blob=await entry.async('blob'),hash=await sha256Hex(blob),declaredHash=String(track.sha256||'').toLowerCase();
    if(declaredHash&&hash!==declaredHash)throw Error(`${songId}: SHA-256 검증에 실패했습니다.`);
    if(Number(track.byteLength)>0&&blob.size!==Number(track.byteLength))throw Error(`${songId}: 파일 크기가 manifest와 다릅니다.`);
    const meta:InstalledAudioMeta={songId,audioVersion:String(track.audioVersion||manifest.packVersion||'1.0.0'),durationMs:Number(track.durationMs||0),byteLength:blob.size,sha256:hash,installedAt:new Date().toISOString(),fileName};
    const expected=expectedBySong[songId];
    if(expected&&!audioMatches(meta,expected))throw Error(`${songId}: 현재 웹 콘텐츠가 요구하는 음원 버전과 일치하지 않습니다.`);
    prepared.push({meta,blob});
  }
  const db=await openDb();
  try{for(const row of prepared)await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite'),req=tx.objectStore(STORE).put({...row.meta,blob:row.blob});req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error)})}finally{db.close()}
  return prepared.map(x=>x.meta);
}
export async function createAudioObjectUrl(songId:string):Promise<string|undefined>{const row=await getInstalledAudio(songId);return row?URL.createObjectURL(row.blob):undefined}
