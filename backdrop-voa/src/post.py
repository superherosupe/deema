# fit images to object-fit box, and bake CSS drop-shadow into .shadow images so shadow moves with the image
import json
from PIL import Image, ImageFilter
d=json.load(open('layout.json'))
for i in d['imgs']:
  im=Image.open(i['src']).convert('RGBA'); W,H=im.size
  s=min(i['w']/W,i['h']/H); w,h=W*s,H*s
  i['x']+= (i['w']-w)/2; i['y']+=(i['h']-h)/2; i['w'],i['h']=w,h
  if i.get('shadow'):
    k=1/s  # source px per display px ; CSS: drop-shadow(0 14px 18px rgba(0,0,0,.45))
    blur=int(9*k); off=int(14*k); pad=3*blur+off
    canvas=Image.new('RGBA',(W+2*pad,H+2*pad),(0,0,0,0))
    a=im.split()[3].point(lambda v:int(v*.45))
    sh=Image.new('RGBA',im.size,(0,0,0,255)); sh.putalpha(a)
    canvas.paste(sh,(pad,pad+off),sh); canvas=canvas.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(im,(pad,pad))
    out=i['src'].replace('img/','img/sh_'); canvas.save(out)
    i['src']=out; p=pad*s; i['x']-=p; i['y']-=p; i['w']+=2*p; i['h']+=2*p
json.dump(d,open('layout2.json','w'))
