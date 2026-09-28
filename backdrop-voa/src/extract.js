const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:960},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/backdrop.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
const data=await p.evaluate(()=>{
 const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}};
 const imgs=[...document.querySelectorAll('img')].map(e=>({src:e.getAttribute('src'),alt:e.alt,shadow:e.classList.contains('shadow'),...r(e)}));
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
 .t{visibility:hidden!important} #lines{visibility:hidden!important}
 .tag.t,.ic.t,.mis.t{visibility:visible!important;color:transparent!important}
 img{opacity:0}
`});
await p.waitForTimeout(600);
await p.screenshot({path:'ppt_bg.png'});
// callout lines as a separate transparent layer (sits above the robot photo in PowerPoint)
await p.addStyleTag({content:`html,body{background:transparent!important} body *{visibility:hidden!important} #rz,#lines,#lines *{visibility:visible!important} #rz>*:not(#lines){visibility:hidden!important} .bg{display:none!important} body .tag.t,body .ic.t,body .mis.t{visibility:hidden!important}`});
await p.waitForTimeout(200);
await p.screenshot({path:'ppt_lines.png',omitBackground:true});
await b.close()})();
