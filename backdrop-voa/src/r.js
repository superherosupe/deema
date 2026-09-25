const {chromium}=require('playwright');
(async()=>{const s=+process.argv[2]||1;const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:s});
await p.goto('file://'+__dirname+'/backdrop.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:process.argv[3]||'prev.png'});
if(process.argv[4]) await p.pdf({path:process.argv[4],width:'1920px',height:'1080px',printBackground:true});
await b.close()})();
