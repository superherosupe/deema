// Layered extraction: walks the DOM in paint order and emits one PowerPoint layer per element.
// Solid boxes -> native shapes; gradient/pseudo-element boxes -> their own transparent PNG;
// images -> images; .t -> text boxes; callout SVG -> native lines + ovals; page background -> one PNG.
const {chromium}=require('playwright');const fs=require('fs');
const SRC=process.argv[2]||'backdrop.html', OUT=process.argv[3]||'layers', W=+process.argv[4]||1920, H=+process.argv[5]||960, SEL=process.argv[6]||'body';
(async()=>{fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/'+SRC,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
const items=await p.evaluate((SEL)=>{
  const root=document.querySelector(SEL), R0=root.getBoundingClientRect();
  const rect=e=>{const b=e.getBoundingClientRect();return {x:b.x-R0.x,y:b.y-R0.y,w:b.width,h:b.height}};
  const alpha=c=>{const m=c.match(/[\d.]+/g);return !m?0:(m.length>3?+m[3]:1)};
  const hasPseudo=e=>['::before','::after'].some(ps=>{const c=getComputedStyle(e,ps).content;return c&&c!=='none'&&c!=='normal'});
  const isBox=(e,cs)=>alpha(cs.backgroundColor)>0||cs.backgroundImage!=='none'||cs.boxShadow!=='none'||
     ['Top','Right','Bottom','Left'].some(s=>parseFloat(cs['border'+s+'Width'])>0&&cs['border'+s+'Style']!=='none')||hasPseudo(e);
  const clippedCorner=e=>{const r=e.getBoundingClientRect();let a=e.parentElement;
    while(a&&a!==document.body){const cs=getComputedStyle(a),rad=parseFloat(cs.borderTopLeftRadius)||0;
      if(cs.overflow!=='visible'&&rad>0){const A=a.getBoundingClientRect();
        const nearX=r.left<A.left+rad||r.right>A.right-rad, nearY=r.top<A.top+rad||r.bottom>A.bottom-rad; if(nearX&&nearY) return true;}
      a=a.parentElement;}return false};
  const out=[];let n=0;
  const walk=e=>{
    if(e.classList&&e.classList.contains('bg')) return;
    const tag=e.tagName, cs=getComputedStyle(e);
    if(cs.display==='none'||cs.visibility==='hidden') return;
    if(tag==='SCRIPT'||tag==='STYLE') return;
    if(tag==='svg'){ // callout lines
      const S=e.getBoundingClientRect();
      e.querySelectorAll('polyline').forEach(pl=>{const pts=pl.getAttribute('points').trim().split(/\s+/).map(s=>s.split(',').map(Number));
        for(let i=0;i<pts.length-1;i++) out.push({k:'line',x1:pts[i][0]+S.x-R0.x,y1:pts[i][1]+S.y-R0.y,x2:pts[i+1][0]+S.x-R0.x,y2:pts[i+1][1]+S.y-R0.y,color:pl.getAttribute('stroke'),w:+pl.getAttribute('stroke-width')});});
      e.querySelectorAll('circle').forEach(c=>{const cx=+c.getAttribute('cx')+S.x-R0.x,cy=+c.getAttribute('cy')+S.y-R0.y,r=+c.getAttribute('r');
        out.push({k:'oval',x:cx-r,y:cy-r,w:2*r,h:2*r,fill:c.getAttribute('fill'),stroke:c.getAttribute('stroke'),sw:+(c.getAttribute('stroke-width')||0)});});
      return;}
    if(e!==root&&tag!=='BODY'&&tag!=='IMG'&&isBox(e,cs)){
      const r=rect(e);
      const bw=['Top','Right','Bottom','Left'].map(s=>cs['border'+s+'Style']==='none'?0:parseFloat(cs['border'+s+'Width']));
      const uniform=bw.every(v=>v===bw[0]);
      const rads=['TopLeft','TopRight','BottomRight','BottomLeft'].map(s=>{const v=cs['border'+s+'Radius'];const f=parseFloat(v)||0;return v.includes('%')?f/100*Math.min(r.width??0,0)+f/100*Math.min(e.offsetWidth,e.offsetHeight):f});
      const native=cs.backgroundImage==='none'&&!hasPseudo(e)&&uniform&&rads.every(v=>v===rads[0])&&!clippedCorner(e)&&cs.transform==='none';
      const id='bx'+(n++); e.dataset.bx=id;
      out.push({k:native?'shape':'boximg',id,name:(e.className||tag).toString().split(' ')[0],...r,fill:cs.backgroundColor,fa:alpha(cs.backgroundColor),
        bw:bw[0],bc:cs.borderTopColor,rad:rads[0],shadow:cs.boxShadow});
    }
    if(tag==='IMG'){ out.push({k:'img',src:e.getAttribute('src'),alt:e.alt,shadow:e.classList.contains('shadow'),...rect(e)}); return; }
    if(e.classList&&e.classList.contains('t')){
      const runs=[];e.childNodes.forEach(nd=>{ if(nd.nodeType===3){ if(nd.textContent) runs.push({text:nd.textContent,color:cs.color}); }
        else if(nd.tagName==='BR') runs.push({text:'\n',color:cs.color}); else runs.push({text:nd.innerText,color:getComputedStyle(nd).color}); });
      out.push({k:'text',text:e.innerText,runs,cls:e.className,...rect(e),fs:parseFloat(cs.fontSize),fw:cs.fontWeight,color:cs.color,ls:parseFloat(cs.letterSpacing)||0,italic:cs.fontStyle==='italic',align:cs.textAlign});
      return; // text leaves are not boxes-with-children except inline <b>
    }
    for(const c of e.children) walk(c);
  };
  walk(root);
  return out;},SEL);
// page background layer (only .bg + body/page background)
const rootBox=await p.evaluate(s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}},SEL);
const st=await p.addStyleTag({content:`${SEL} *{visibility:hidden!important} ${SEL} .bg,${SEL} .bg *{visibility:visible!important}`});
await p.waitForTimeout(150);
await p.screenshot({path:`${OUT}/bg.png`,clip:rootBox,fullPage:true});
await st.evaluate(e=>e.remove());
// each non-native box -> own transparent PNG (children hidden, ancestors' paint hidden, clip kept)
const tag=await p.addStyleTag({content:'/* layer */'});
for(const it of items.filter(i=>i.k==='boximg')){
  await tag.evaluate((e,id)=>{e.textContent=`html,body{background:transparent!important} body *{visibility:hidden!important} [data-bx="${id}"]{visibility:visible!important} [data-bx="${id}"] *{visibility:hidden!important}`},it.id);
  const m=60; const c={x:Math.max(0,rootBox.x+it.x-m),y:Math.max(0,rootBox.y+it.y-m)}; c.width=Math.min(rootBox.x+W,rootBox.x+it.x+it.w+m)-c.x; c.height=Math.min(rootBox.y+H,rootBox.y+it.y+it.h+m)-c.y;
  await p.screenshot({path:`${OUT}/${it.id}.png`,clip:c,omitBackground:true,fullPage:true});
  it.cx=c.x-rootBox.x; it.cy=c.y-rootBox.y; it.cw=c.width; it.ch=c.height;
}
fs.writeFileSync(`${OUT}/items.json`,JSON.stringify(items));
console.log(items.length,'layers:',Object.entries(items.reduce((a,i)=>(a[i.k]=(a[i.k]||0)+1,a),{})).map(e=>e.join('=')).join(' '));
await b.close()})();
