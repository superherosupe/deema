const pptxgen=require('pptxgenjs');const fs=require('fs');const path=require('path');
const d=JSON.parse(fs.readFileSync('layout2.json'));
const P=v=>v/144; // px -> inch (1920px = 13.333in)
const pres=new pptxgen();pres.defineLayout({name:'BD2x1',width:13.333,height:6.667});pres.layout='BD2x1';pres.title='Backdrop VOA - Thăng Long Quốc Tế';
const s=pres.addSlide();
s.background={path:'ppt_bg.png'};
for(const i of d.imgs) s.addImage({path:i.src,x:P(i.x),y:P(i.y),w:P(i.w),h:P(i.h),altText:i.alt||path.basename(i.src)});
const hex=c=>c.match(/\d+/g).map(Number).slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
for(const t of d.texts){
  const slack=t.w*0.14; let x=t.x,w=t.w+slack;
  const centered=t.align==='center'||/\b(tag|n|k|p|h|lbl)\b/.test(t.cls)&&t.align!=='left';
  if(t.align==='center') x=t.x-slack/2;
  const opts={x:P(x),y:P(t.y-t.h*0.08),w:P(w),h:P(t.h*1.16),fontFace:'Arial',fontSize:t.fs*0.5,bold:+t.fw>=700,italic:!!t.italic,
    align:t.align==='center'?'center':'left',valign:'middle',margin:0,charSpacing:t.ls*0.5,isTextBox:true,fit:'none'};
  if(/\b(tag|ic|mis)\b/.test(t.cls)){opts.x=P(t.x);opts.w=P(t.w);opts.align='center';}
  const runs=t.runs.filter(r=>r.text!=='');
  if(runs.length>1){
    const arr=[];
    runs.forEach((r,i)=>{ if(r.text==='\n'){ if(arr.length) arr[arr.length-1].options.breakLine=true; return;}
      arr.push({text:r.text,options:{color:hex(r.color)}}); });
    s.addText(arr,opts);
  } else s.addText(t.text,{...opts,color:hex(t.color)});
}
pres.writeFile({fileName:'backdrop-VOA.pptx'}).then(()=>console.log('done'));
