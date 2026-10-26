import type{Song,LyricLine,Chant,RequiredAudio,InstalledAudioMeta,AudioCatalogTrack}from'../models/types';
import{audioMatches,createAudioObjectUrl,listInstalledAudio}from'./audioLibrary';
import{AUDIO_CATALOG_URL,CONTENT_ROOT,DROPBOX_AUDIO_PACK_URL}from'../config';
async function json(url:string){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error(`${r.status}: ${url}`);return r.json()}
function safeFile(v:string){return!!v&&!v.startsWith('/')&&!v.includes('..')&&!v.includes('://')}
function num(v:any,fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback}
function normalizeLine(row:any,index:number):LyricLine{return{id:String(row.id??row.lineId??`line-${String(index+1).padStart(3,'0')}`),index:Number.isFinite(row.index)?row.index:index,startMs:num(row.startMs??row.sourceStartMs),endMs:num(row.endMs??row.sourceEndMs),lyric:String(row.lyric??row.text??''),chants:Array.isArray(row.chants)?row.chants.map((ch:any,i:number):Chant=>({id:String(ch.id??`chant-${index}-${i}`),text:String(ch.text??''),startMs:Number.isFinite(ch.startMs)?ch.startMs:undefined,endMs:Number.isFinite(ch.endMs)?ch.endMs:undefined,lineStartMs:Number.isFinite(ch.lineStartMs)?ch.lineStartMs:undefined,lineEndMs:Number.isFinite(ch.lineEndMs)?ch.lineEndMs:undefined,chantLeadMs:Number.isFinite(ch.chantLeadMs)?ch.chantLeadMs:undefined})):[],segments:Array.isArray(row.segments)?row.segments:undefined}}
function fallbackTitle(songId:string){return songId.split('-').map(s=>s?s[0].toUpperCase()+s.slice(1):s).join(' ')}
export async function loadSongs():Promise<Song[]>{
  let contentManifest:any={songs:[]},catalog:any={tracks:[]};
  try{contentManifest=await json(`${CONTENT_ROOT}manifest.json`)}catch{}
  try{catalog=await json(AUDIO_CATALOG_URL)}catch{}
  const contentEntries=Array.isArray(contentManifest.songs)?contentManifest.songs:[];
  const tracks:AudioCatalogTrack[]=Array.isArray(catalog.tracks)?catalog.tracks:[];
  const contentById=new Map<string,any>(contentEntries.map((x:any):[string,any]=>[String(x.songId||''),x]));
  const trackById=new Map<string,AudioCatalogTrack>(tracks.map((x):[string,AudioCatalogTrack]=>[String(x.songId||''),x]));
  const ids:string[]=[...new Set<string>([...contentById.keys(),...trackById.keys()].filter((id):id is string=>Boolean(id)))];
  const installed=await listInstalledAudio(),byId=new Map<string,InstalledAudioMeta>(installed.map(x=>[x.songId,x]));
  const result:Song[]=[];
  for(const songId of ids){
    const e:any=contentById.get(songId)||{},track=trackById.get(songId);let data:any={};
    if(e.dataFile&&safeFile(String(e.dataFile))){try{data=await json(`${CONTENT_ROOT}${e.dataFile}`)}catch{}}
    const required=(e.requiredAudio??data.requiredAudio??(track?{audioVersion:track.audioVersion,durationMs:track.durationMs,sha256:track.sha256,byteLength:track.byteLength}:undefined)) as RequiredAudio|undefined;
    const meta=byId.get(songId),ready=audioMatches(meta,required),coverFile=String(e.coverFile??e.cover??data.coverFile??data.cover??'');
    const rawLines=Array.isArray(data.lines)?data.lines:Array.isArray(data.lyrics)?data.lyrics:[];
    result.push({songId,title:String(data.title??e.title??track?.title??fallbackTitle(songId)),artist:String(data.artist??e.artist??track?.artist??'RESCENE'),album:String(data.album??e.album??''),version:String(data.version??e.version??''),durationMs:num(data.durationMs??e.durationMs??required?.durationMs??track?.durationMs),coverUrl:coverFile&&safeFile(coverFile)?`${CONTENT_ROOT}${coverFile}`:undefined,audioUrl:ready?await createAudioObjectUrl(songId):undefined,audioVersion:meta?.audioVersion,audioDownloadUrl:track?.downloadUrl??catalog.defaultDownloadUrl??DROPBOX_AUDIO_PACK_URL,lyrics:rawLines.map(normalizeLine).sort((a:LyricLine,b:LyricLine)=>a.startMs-b.startMs),contentReady:rawLines.length>0,audioReady:ready,requiredAudio:required});
  }
  return result;
}
export function revokeSongAudioUrls(songs:Song[]){for(const s of songs)if(s.audioUrl?.startsWith('blob:'))URL.revokeObjectURL(s.audioUrl)}
