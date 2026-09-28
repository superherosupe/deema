# Post-process layer list: trim transparent margins of box PNGs, fit <img> to object-fit box,
# bake CSS drop-shadow into .shadow images so the shadow travels with the picture.
import json,sys
from PIL import Image, ImageFilter
OUT=sys.argv[1] if len(sys.argv)>1 else 'layers'
items=json.load(open(f'{OUT}/items.json'))
for it in items:
  if it['k']=='boximg':
    im=Image.open(f"{OUT}/{it['id']}.png").convert('RGBA'); bb=im.split()[3].point(lambda v:255 if v>3 else 0).getbbox()
    if not bb: it['k']='skip'; continue
    im.crop(bb).save(f"{OUT}/{it['id']}.png"); s=im.width/it['cw']
    it['px'],it['py'],it['pw'],it['ph']=it['cx']+bb[0]/s,it['cy']+bb[1]/s,(bb[2]-bb[0])/s,(bb[3]-bb[1])/s
  elif it['k']=='img':
    im=Image.open(it['src']).convert('RGBA'); W,H=im.size
    s=min(it['w']/W,it['h']/H); w,h=W*s,H*s
    it['x']+=(it['w']-w)/2; it['y']+=(it['h']-h)/2; it['w'],it['h']=w,h
    if it.get('shadow'):
      k=1/s; blur=max(1,int(9*k)); off=int(14*k); pad=3*blur+off
      c=Image.new('RGBA',(W+2*pad,H+2*pad),(0,0,0,0)); a=im.split()[3].point(lambda v:int(v*.45))
      sh=Image.new('RGBA',im.size,(0,0,0,255)); sh.putalpha(a); c.paste(sh,(pad,pad+off),sh); c=c.filter(ImageFilter.GaussianBlur(blur)); c.alpha_composite(im,(pad,pad))
      out=f"{OUT}/sh_{it['src'].split('/')[-1]}"; c.save(out); it['src']=out; p=pad*s; it['x']-=p; it['y']-=p; it['w']+=2*p; it['h']+=2*p
json.dump(items,open(f'{OUT}/items2.json','w'))
