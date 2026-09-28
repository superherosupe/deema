const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:960},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/backdrop.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
const data=await p.evaluate(()=>{
 const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}};
 const imgs=[...document.querySelectorAll('img')].map(e=>({src:e.getAttribute('src'),alt:e.alt,...r(e)}));
 const texts=[...document.querySelectorAll('.t')].map(e=>{const cs=getComputedStyle(e);
   const runs=[];
   e.childNodes.forEach(n=>{
     if(n.nodeType===3){ if(n.textContent) runs.push({text:n.textContent,color:cs.color}); }
     else if(n.tagName==='BR') runs.push({text:'\n',color:cs.color});
     else runs.push({text:n.innerText,color:getComputedStyle(n).color});
   });
   return {text:e.innerText,runs,cls:e.className,...r(e),fs:parseFloat(cs.fontSize),fw:cs.fontWeight,color:cs.color,
     ls:parseFloat(cs.letterSpacing)||0,italic:cs.fontStyle==='italic',align:cs.textAlign,nowrap:cs.whiteSpace==='nowrap'}});
 return {imgs,texts}});
require('fs').writeFileSync('layout.json',JSON.stringify(data,null,1));
await p.addStyleTag({content:`
 .t{visibility:hidden!important}
 .tag.t,.ic.t,.mis.t{visibility:visible!important;color:transparent!important}
 img{opacity:0}
 img.shadow{opacity:1!important;filter:brightness(0) blur(7px) opacity(.32)!important;transform:translateY(12px)}`});
await p.waitForTimeout(600);
await p.screenshot({path:'ppt_bg.png'});
await b.close()})();
