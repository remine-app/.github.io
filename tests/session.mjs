import test from 'node:test';import assert from 'node:assert/strict';
import {tickSession} from '../src/services/session.ts';
function run(ms){let state={playedMs:0,counted:false,last:0},counts=0;for(let t=100;t<=ms;t+=100){const r=tickSession(state,t,true);state=r.state;counts+=Number(r.count)}return{state,counts}}
test('playback duration does not increment visit count',()=>{assert.equal(run(29900).counts,0);assert.equal(run(30000).counts,0);assert.equal(run(60000).counts,0)});
test('pause preserves accumulated time; background gaps are excluded',()=>{let s=run(15000).state;let r=tickSession(s,20000,false);assert.equal(r.delta,0);r=tickSession(r.state,80000,true);assert.equal(r.delta,0);for(let t=80100;t<=95000;t+=100)r=tickSession(r.state,t,true);assert.equal(r.state.playedMs,30000);assert.equal(r.state.counted,false)});
test('seek and mode do not alter wall-clock accumulation; new session resets',()=>{const s=run(10000).state;assert.equal(tickSession(s,10100,true).state.playedMs,10100);assert.equal(tickSession({playedMs:0,counted:false,last:0},100,true).count,false)});
