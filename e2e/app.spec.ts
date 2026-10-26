import{test,expect}from'@playwright/test';import JSZip from'jszip';import{createHash}from'node:crypto';
test('visit counts once after 30 seconds without playback; exit cancels timer',async({page})=>{
 await page.clock.install();await page.goto('');await page.getByRole('button',{name:'나중에 준비하기'}).click();await page.getByRole('link',{name:'곡 목록',exact:true}).click();await page.locator('.song-row').first().click();
 const count=()=>page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('rechant.progress.v1')||'{}')).reduce((n:number,p:any)=>n+p.sessions,0));
 await page.clock.fastForward(29999);expect(await count()).toBe(0);await page.clock.fastForward(1);expect(await count()).toBe(1);await page.clock.fastForward(90000);expect(await count()).toBe(1);
 await page.getByRole('link',{name:'곡 목록',exact:true}).last().click();await page.locator('.song-row').first().click();await page.clock.fastForward(10000);await page.getByRole('link',{name:'곡 목록',exact:true}).last().click();await page.clock.fastForward(30000);expect(await count()).toBe(1);
 await page.locator('.song-row').first().click();await page.clock.fastForward(30000);expect(await count()).toBe(2);
});
test('responsive layout, install, playback, 30s counting and refresh',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 // Synthetic silent WAV, explicitly test-only, never included in public content.
 const wav=Buffer.alloc(44+8000*40*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
 const required={audioVersion:'1.0.0',durationMs:40000,byteLength:wav.length,sha256:createHash('sha256').update(wav).digest('hex')};
 await page.route('**/audio-catalog.json',r=>r.fulfill({json:{tracks:[{songId:'test-song',title:'테스트 곡',artist:'RESCENE',...required}]}}));
 await page.route('**/content/manifest.json',r=>r.fulfill({json:{songs:[{songId:'test-song',title:'테스트 곡',dataFile:'test.json',requiredAudio:required}]}}));
 await page.route('**/content/test.json',r=>r.fulfill({json:{songId:'test-song',durationMs:40000,lines:Array.from({length:8},(_,i)=>({id:'line-'+i,startMs:i*5000,endMs:(i+1)*5000,lyric:'테스트용 일반 가사 '+i,chants:[{id:'chant-'+i,text:'테스트 응원'}]}))}}));
 await page.goto('');await page.getByRole('button',{name:'나중에 준비하기'}).click();
 for(const [width,height]of[[320,568],[375,812],[390,844],[430,932]]){await page.setViewportSize({width,height});await expect(page.locator('.feature-card')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'/tmp/rechant-home-'+width+'.png'});}
 await page.getByRole('link',{name:'곡 목록',exact:true}).click();await page.locator('.song-row').click();
 const z=new JSZip();z.file('test.wav',wav);z.file('manifest.json',JSON.stringify({schemaVersion:'rechant-audio-pack-1',tracks:[{songId:'test-song',fileName:'test.wav',...required}]}));await page.locator('input[type=file]').setInputFiles({name:'test.zip',mimeType:'application/zip',buffer:await z.generateAsync({type:'nodebuffer'})});
 await expect(page.getByRole('button',{name:'재생',exact:true})).toBeVisible();
 for(const [width,height]of[[320,568],[375,812],[390,844],[430,932]]){await page.setViewportSize({width,height});const row=page.locator('.lyric-line').first();expect(await row.evaluate(e=>getComputedStyle(e).display)).toBe('grid');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const b=await page.locator('.play-main').boundingBox();expect(b!.y+b!.height).toBeLessThan(height-65);await page.screenshot({path:'/tmp/rechant-practice-'+width+'.png'});}
 await page.getByRole('button',{name:'실전 연습',exact:true}).click();await page.getByRole('button',{name:'재생',exact:true}).click();await page.waitForTimeout(25000);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('rechant.progress.v1')!)['test-song'].sessions)).toBe(0);await page.waitForTimeout(6000);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('rechant.progress.v1')!)['test-song'].sessions)).toBe(1);
 await page.reload();await expect(page.getByRole('button',{name:'재생',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'실전 연습',exact:true})).toHaveClass('selected');expect(errors).toEqual([]);
});
