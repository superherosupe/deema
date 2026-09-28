// Build a fully layered PowerPoint from layers/items2.json (one object per design element).
const pptxgen=require('pptxgenjs');const fs=require('fs');const path=require('path');
const OUT=process.argv[2]||'layers', FILE=process.argv[3]||'backdrop-VOA.pptx', PXW=+process.argv[4]||1920, INW=+process.argv[5]||13.333, INH=+process.argv[6]||6.667;
const items=JSON.parse(fs.readFileSync(`${OUT}/items2.json`));
const P=v=>v*INW/PXW, PT=v=>v*INW/PXW*72; // px -> in, px -> pt
const pres=new pptxgen();pres.defineLayout({name:'L',width:INW,height:INH});pres.layout='L';pres.title='Backdrop VOA - Thăng Long Quốc Tế';
const s=pres.addSlide();
s.addImage({path:`${OUT}/bg.png`,x:0,y:0,w:INW,h:INH,altText:'Nền'});
const rgb=c=>{const m=(c||'').match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0]};
const hex=c=>rgb(c).slice(0,3).map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();
const tr=c=>{const m=rgb(c);return m.length>3?Math.round((1-m[3])*100):0};
const shadowOf=sh=>{ if(!sh||sh==='none') return undefined;
  const first=sh.split(/,(?![^(]*\))/)[0]; const col=(first.match(/rgba?\([^)]*\)/)||['rgb(0,0,0)'])[0]; const nums=first.replace(col,'').trim().split(/\s+/).map(parseFloat);
  const [ox=0,oy=0,bl=0]=nums; const a=rgb(col); if(first.includes('inset')) return undefined;
  return {type:'outer',color:hex(col),opacity:Math.min(1,a.length>3?a[3]:1),blur:Math.max(0,PT(bl)/2),offset:Math.max(0,PT(Math.hypot(ox,oy))),angle:ox||oy?Math.round((Math.atan2(oy,ox)*180/Math.PI+360)%360):90};};
const H6=c=>{c=c.replace('#','');return (c.length===3?c.split('').map(x=>x+x).join(''):c).toUpperCase()};
let n=0;
for(const it of items){
  if(it.k==='shape'){
    const r=it.rad||0, min=Math.min(it.w,it.h);
    const type=r>=min/2-0.5&&Math.abs(it.w-it.h)<1?pres.shapes.OVAL:(r>0?pres.shapes.ROUNDED_RECTANGLE:pres.shapes.RECTANGLE);
    const o={x:P(it.x),y:P(it.y),w:P(it.w),h:P(it.h),objectName:`${it.name}-${++n}`,
      fill:it.fa>0?{color:hex(it.fill),transparency:tr(it.fill)}:{type:'none'},
      line:it.bw>0?{color:hex(it.bc),width:PT(it.bw),transparency:tr(it.bc)}:{type:'none'}};
    if(type===pres.shapes.ROUNDED_RECTANGLE) o.rectRadius=P(Math.min(r,min/2));
    const sh=shadowOf(it.shadow); if(sh) o.shadow=sh;
    s.addShape(type,o);
  } else if(it.k==='boximg'){
    s.addImage({path:`${OUT}/${it.id}.png`,x:P(it.px),y:P(it.py),w:P(it.pw),h:P(it.ph),altText:`Khung ${it.name}`});
  } else if(it.k==='img'){
    s.addImage({path:it.src,x:P(it.x),y:P(it.y),w:P(it.w),h:P(it.h),altText:it.alt||path.basename(it.src)});
  } else if(it.k==='line'){
    const x=Math.min(it.x1,it.x2),y=Math.min(it.y1,it.y2),w=Math.abs(it.x2-it.x1),h=Math.abs(it.y2-it.y1);
    s.addShape(pres.shapes.LINE,{x:P(x),y:P(y),w:P(w),h:P(h),flipV:(it.x2-it.x1)*(it.y2-it.y1)<0,line:{color:it.color.startsWith('#')?H6(it.color):hex(it.color),width:PT(it.w)},objectName:`callout-line-${++n}`});
  } else if(it.k==='oval'){
    const f=it.fill.startsWith('#')?{color:H6(it.fill)}:{color:hex(it.fill),transparency:tr(it.fill)};
    s.addShape(pres.shapes.OVAL,{x:P(it.x),y:P(it.y),w:P(it.w),h:P(it.h),fill:f,line:it.stroke?{color:H6(it.stroke),width:PT(it.sw)}:{type:'none'},objectName:`callout-dot-${++n}`});
  } else if(it.k==='text'){
    const t=it; const slack=t.w*0.14; let x=t.x,w=t.w+slack;
    if(t.align==='center') x=t.x-slack/2;
    const o={x:P(x),y:P(t.y-t.h*0.08),w:P(w),h:P(t.h*1.16),fontFace:'Arial',fontSize:PT(t.fs),bold:+t.fw>=700,italic:!!t.italic,
      align:t.align==='center'?'center':'left',valign:'middle',margin:0,charSpacing:PT(t.ls),isTextBox:true,fit:'none'};
    if(/\b(tag|ic|mis)\b/.test(t.cls)){o.x=P(t.x);o.w=P(t.w);o.align='center';}
    const runs=t.runs.filter(r=>r.text!=='');
    if(runs.length>1){const arr=[];runs.forEach(r=>{ if(r.text==='\n'){ if(arr.length) arr[arr.length-1].options.breakLine=true; return;} arr.push({text:r.text,options:{color:hex(r.color)}}); }); s.addText(arr,o);}
    else s.addText(t.text,{...o,color:hex(t.color)});
  }
}
pres.writeFile({fileName:FILE}).then(()=>console.log('written',FILE,items.length+1,'objects'));
