const pptxgen=require('pptxgenjs');const fs=require('fs');const path=require('path');
const pages=JSON.parse(fs.readFileSync('flayout2.json'));
const P=v=>v/96; // 794px = 8.27in (A4)
const pres=new pptxgen();pres.defineLayout({name:'A4P',width:8.27,height:11.69});pres.layout='A4P';pres.title='Tờ rơi VOA - Thăng Long Quốc Tế';
const hex=c=>c.match(/\d+/g).map(Number).slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
pages.forEach((d,pi)=>{
  const s=pres.addSlide(); s.background={path:`fbg_p${pi+1}.png`};
  for(const i of d.imgs) s.addImage({path:i.src,x:P(i.x),y:P(i.y),w:P(i.w),h:P(i.h),altText:i.alt||path.basename(i.src)});
  if(pi===1) s.addImage({path:'flines_p2.png',x:0,y:0,w:8.27,h:11.69,altText:'Callout lines'});
  for(const t of d.texts){
    const slack=t.w*0.14; let x=t.x,w=t.w+slack;
    if(t.align==='center') x=t.x-slack/2;
    const opts={x:P(x),y:P(t.y-t.h*0.08),w:P(w),h:P(t.h*1.16),fontFace:'Arial',fontSize:t.fs*0.75,bold:+t.fw>=700,italic:!!t.italic,
      align:t.align==='center'?'center':'left',valign:'middle',margin:0,charSpacing:t.ls*0.75,isTextBox:true,fit:'none'};
    if(/\b(tag|ic)\b/.test(t.cls)){opts.x=P(t.x);opts.w=P(t.w);opts.align='center';}
    const runs=t.runs.filter(r=>r.text!=='');
    if(runs.length>1){const arr=[];runs.forEach(r=>{ if(r.text==='\n'){ if(arr.length) arr[arr.length-1].options.breakLine=true; return;} arr.push({text:r.text,options:{color:hex(r.color)}}); }); s.addText(arr,opts);}
    else s.addText(t.text,{...opts,color:hex(t.color)});
  }
});
pres.writeFile({fileName:'to-roi-VOA.pptx'}).then(()=>console.log('done'));
