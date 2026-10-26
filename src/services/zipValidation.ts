export function validateZipPaths(bytes:Uint8Array){
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(v.getUint32(i,true)===0x06054b50&&i+22+v.getUint16(i+20,true)===bytes.length){end=i;break}}
 if(end<0)throw Error('손상된 ZIP 파일입니다.');
 const count=v.getUint16(end+10,true);let p=v.getUint32(end+16,true);const names=new Set<string>();
 for(let i=0;i<count;i++){if(p+46>bytes.length||v.getUint32(p,true)!==0x02014b50)throw Error('ZIP 파일 목록이 올바르지 않습니다.');const n=v.getUint16(p+28,true),extra=v.getUint16(p+30,true),comment=v.getUint16(p+32,true);const name=new TextDecoder().decode(bytes.subarray(p+46,p+46+n));if(names.has(name)||name.startsWith('/')||name.includes('..')||name.includes('\\'))throw Error('중복되거나 올바르지 않은 ZIP 파일 경로입니다.');names.add(name);p+=46+n+extra+comment;if(p>end)throw Error('손상된 ZIP 파일입니다.');}
}
