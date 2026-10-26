import {spawn,spawnSync} from 'node:child_process';import {existsSync} from 'node:fs';
const win=process.platform==='win32';const cmd=win?(process.env.ComSpec||'cmd.exe'):'npm';
function npm(args){return win?spawnSync(cmd,['/d','/s','/c',`npm ${args.join(' ')}`],{stdio:'inherit'}):spawnSync(cmd,args,{stdio:'inherit'});}
if(!existsSync('node_modules/vite')){console.log('Installing dependencies...');const result=npm(['install']);if(result.status!==0)process.exit(result.status||1);}
console.log('Starting Re:chant...');const child=win?spawn(cmd,['/d','/s','/c','npm run dev -- --open'],{stdio:'inherit'}):spawn('npm',['run','dev','--','--open'],{stdio:'inherit'});child.on('error',e=>{console.error(e);process.exit(1)});
