const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/backdrop.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
const data=await p.evaluate(()=>{
 const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}};
 const imgs=[...document.querySelectorAll('img')].map(e=>({src:e.getAttribute('src'),alt:e.alt,...r(e),shadow:!!e.closest('.shadow')||e.classList.contains('shadow')||!!e.closest('.cell .imgs')}));
 const sel='.welcome .k, .welcome h1, .lbl, .cap, .tag, .st b, .st span, .mcap, .mi b, .mi span, .cell .txt, .foot .l, .foot .p';
 const texts=[...document.querySelectorAll(sel)].map(e=>{const cs=getComputedStyle(e);
   return {text:e.innerText,cls:e.className||e.tagName,...r(e),fs:parseFloat(cs.fontSize),fw:cs.fontWeight,color:cs.color,ls:parseFloat(cs.letterSpacing)||0,italic:cs.fontStyle==='italic',align:cs.textAlign}});
 return {imgs,texts}});
require('fs').writeFileSync('layout.json',JSON.stringify(data,null,1));
await p.addStyleTag({content:`
 .welcome .k,.welcome h1,.lbl,.cap,.tag,.st b,.st span,.mcap,.mi b,.mi span,.cell .txt,.foot .l,.foot .p{visibility:hidden}
 img{opacity:0}
 img.shadow,.cell .imgs img{opacity:1!important;filter:brightness(0) blur(7px) opacity(.32)!important;transform:translateY(12px)}
 .cell .imgs img{filter:brightness(0) blur(6px) opacity(.22)!important;transform:translateY(9px)}`});
await p.waitForTimeout(300);
await p.screenshot({path:'ppt_bg.png'});
await b.close()})();
