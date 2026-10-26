import type{LyricLine}from '../models/types';export function activeLyricIndex(lines:LyricLine[],timeMs:number){let lo=0,hi=lines.length-1,answer=-1;while(lo<=hi){const mid=(lo+hi)>>1;if(lines[mid].startMs<=timeMs){answer=mid;lo=mid+1}else hi=mid-1}return answer}
export function seekForLine(startMs:number,leadMs:number){return Math.max(0,startMs-leadMs)}
