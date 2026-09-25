const pptxgen=require('pptxgenjs');const fs=require('fs');const path=require('path');
const d=JSON.parse(fs.readFileSync('layout2.json'));
const P=v=>v/144; // px -> inch (1920px = 13.333in)
const pres=new pptxgen();pres.layout='LAYOUT_WIDE';pres.title='Backdrop Hội nghị VOA';
const s=pres.addSlide();
s.background={path:'ppt_bg.png'};
const names={'img/43.png':'Logo Curexo','img/35.png':'Logo Allgens','img/19.png':'Logo Mantiz','img/tl_emblem.png':'Logo Thăng Long - biểu tượng','img/tl_word.png':'Logo Thăng Long - chữ'};
for(const i of d.imgs){
  s.addImage({path:i.src,x:P(i.x),y:P(i.y),w:P(i.w),h:P(i.h),altText:i.alt||path.basename(i.src)});
}
const hex=c=>{const m=c.match(/\d+/g).map(Number);return m.slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase()};
for(const t of d.texts){
  const slack=t.w*0.14; let x=t.x,w=t.w+slack;
  if(t.align==='center') x=t.x-slack/2;
  if(t.cls==='EM'){t.align='center';x=t.x;w=t.w;}
  const base={x:P(x),y:P(t.y-t.h*0.1),w:P(w),h:P(t.h*1.2),fontFace:'Arial',fontSize:t.fs*0.5,bold:+t.fw>=700,italic:!!t.italic,
    align:t.align==='center'?'center':'left',valign:'middle',margin:0,charSpacing:t.ls*0.5,isTextBox:true,fit:'none'};
  if(t.cls==='H1'){
    s.addText([{text:'HỘI NGHỊ ',options:{color:'FFFFFF'}},{text:'VOA',options:{color:'FFD166'}}],
      {...base,w:P(t.w*1.3),shadow:{type:'outer',color:'000000',opacity:0.35,blur:8,offset:3,angle:90}});
  } else s.addText(t.text,{...base,color:hex(t.color)});
}
pres.writeFile({fileName:'backdrop-VOA.pptx'}).then(()=>console.log('done'));
