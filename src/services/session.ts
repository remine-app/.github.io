export interface SessionState { playedMs:number; counted:boolean; last:number; }
export function tickSession(state:SessionState,now:number,playing:boolean){
 const elapsed=now-state.last;
 const delta=playing&&elapsed>=0&&elapsed<=2000?elapsed:0;
 const playedMs=state.playedMs+delta,count=false;
 return {state:{playedMs,counted:state.counted||count,last:now},delta,count};
}
