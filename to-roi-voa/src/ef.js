// extract editable layout of flyer.html (2 A4 pages) for PowerPoint
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:794,height:1123},deviceScaleFactor:3});
await p.goto('file://'+__dirname+'/flyer.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
const data=await p.evaluate(()=>['p1','p2'].map(pid=>{
 const P=document.getElementById(pid).getBoundingClientRect();
 const r=e=>{const b=e.getBoundingClientRect();return {x:b.x-P.x,y:b.y-P.y,w:b.width,h:b.height}};
 const pg=document.getElementById(pid);
 const imgs=[...pg.querySelectorAll('img')].map(e=>({src:e.getAttribute('src'),alt:e.alt,shadow:e.classList.contains('shadow'),...r(e)}));
 const texts=[...pg.querySelectorAll('.t')].map(e=>{const cs=getComputedStyle(e);const runs=[];
   e.childNodes.forEach(n=>{ if(n.nodeType===3){ if(n.textContent) runs.push({text:n.textContent,color:cs.color}); }
     else if(n.tagName==='BR') runs.push({text:'\n',color:cs.color}); else runs.push({text:n.innerText,color:getComputedStyle(n).color}); });
   return {text:e.innerText,runs,cls:e.className,...r(e),fs:parseFloat(cs.fontSize),fw:cs.fontWeight,color:cs.color,ls:parseFloat(cs.letterSpacing)||0,italic:cs.fontStyle==='italic',align:cs.textAlign}});
 return {imgs,texts};}));
require('fs').writeFileSync('flayout.json',JSON.stringify(data));
await p.addStyleTag({content:`.t{visibility:hidden!important} .tag.t,.ic.t{visibility:visible!important;color:transparent!important} img{opacity:0} #lines{visibility:hidden!important}`});
await p.waitForTimeout(300);
for(const id of ['p1','p2']) await (await p.$('#'+id)).screenshot({path:`fbg_${id}.png`});
await p.addStyleTag({content:`html,body{background:transparent!important} .page{background:none!important} .page::before{display:none} body *{visibility:hidden!important} #lines,#lines *{visibility:visible!important}`});
await p.waitForTimeout(200);
const bb=await p.evaluate(()=>{const r=document.getElementById('p2').getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}});
await p.screenshot({path:'flines_p2.png',omitBackground:true,fullPage:true,clip:bb});
await b.close()})();
