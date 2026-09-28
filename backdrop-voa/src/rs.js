const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const k of ['bongold','skulheal','cuvis','panther','petra','quattro','gadget']){
 await p.goto('file://'+__dirname+'/sheet.html?p='+k,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);
 await p.screenshot({path:`sheets/${k}.jpg`,type:'jpeg',quality:88});}
await b.close()})();
