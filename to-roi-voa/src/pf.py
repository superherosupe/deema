import json
from PIL import Image, ImageFilter
pages=json.load(open('flayout.json'))
for d in pages:
  for i in d['imgs']:
    im=Image.open(i['src']).convert('RGBA'); W,H=im.size
    s=min(i['w']/W,i['h']/H); w,h=W*s,H*s
    i['x']+=(i['w']-w)/2; i['y']+=(i['h']-h)/2; i['w'],i['h']=w,h
    if i.get('shadow'):
      k=1/s; blur=int(5*k); off=int(10*k); pad=3*blur+off
      c=Image.new('RGBA',(W+2*pad,H+2*pad),(0,0,0,0)); a=im.split()[3].point(lambda v:int(v*.45))
      sh=Image.new('RGBA',im.size,(0,0,0,255)); sh.putalpha(a); c.paste(sh,(pad,pad+off),sh); c=c.filter(ImageFilter.GaussianBlur(blur)); c.alpha_composite(im,(pad,pad))
      out=i['src'].replace('img/','img/fsh_'); c.save(out); i['src']=out; p=pad*s; i['x']-=p; i['y']-=p; i['w']+=2*p; i['h']+=2*p
json.dump(pages,open('flayout2.json','w'))
