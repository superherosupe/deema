const {chromium}=require('playwright');
(async()=>{const sc=+process.argv[2]||1;const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:794,height:1123},deviceScaleFactor:sc});
await p.goto('file://'+__dirname+'/flyer.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
for(const id of ['p1','p2']) await (await p.$('#'+id)).screenshot({path:`flyer_${id}${process.argv[3]||''}.png`});
if(process.argv[4]) await p.pdf({path:process.argv[4],width:'210mm',height:'297mm',printBackground:true,preferCSSPageSize:true});
await b.close()})();
