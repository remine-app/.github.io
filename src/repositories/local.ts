import type {Settings,SongProgress,PracticeMode} from '../models/types';
const SKEY='rechant.settings.v1',PKEY='rechant.progress.v1';export const defaults:Settings={seekLeadMs:700,defaultPracticeMode:'follow',practiceHintMode:'hint'};
function read<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
export function getSettings():Settings{return {...defaults,...read<Partial<Settings>>(SKEY,{})}}
export function saveSettings(p:Settings){localStorage.setItem(SKEY,JSON.stringify(p))}
export function getProgress():Record<string,SongProgress>{return read(PKEY,{})}
export function updateProgress(songId:string,positionMs:number,mode:PracticeMode,deltaMs=0,enter=false){const all=getProgress(),prev=all[songId];all[songId]={songId,positionMs,mode,lastPracticedAt:new Date().toISOString(),practiceMs:(prev?.practiceMs||0)+Math.max(0,deltaMs),sessions:(prev?.sessions||0)+(enter?1:0)};localStorage.setItem(PKEY,JSON.stringify(all))}
