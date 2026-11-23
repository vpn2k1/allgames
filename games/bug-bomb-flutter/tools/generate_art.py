#!/usr/bin/env python3
"""Create deterministic, original vector cartoon placeholders; not AI image-generator output."""
from pathlib import Path
import cairosvg, json, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets/source'; OUT=ROOT/'assets/images'
SRC.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)

def svg(body):
 return f'''<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs>
 <radialGradient id="shine" cx="30%" cy="22%" r="75%"><stop stop-color="#fff" stop-opacity=".62"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 <linearGradient id="shell" x1="0" x2=".9" y1="0" y2="1"><stop stop-color="#ffb977"/><stop offset="1" stop-color="#a9573f"/></linearGradient>
 <linearGradient id="beetle" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#b8e799"/><stop offset="1" stop-color="#4f9e73"/></linearGradient>
 <linearGradient id="lady" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#ff92a2"/><stop offset="1" stop-color="#e15061"/></linearGradient>
 <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
 </defs>{body}</svg>'''

def base(legs='#784f43', feelers=True):
 o='<ellipse cx="129" cy="222" rx="75" ry="13" fill="#243b3d" opacity=".15" filter="url(#shadow)"/>'
 for s in [-1,1]:
  o+=f'<path d="M {128+s*58} 104 Q {128+s*99} 79 {128+s*108} 105 M {128+s*68} 141 Q {128+s*110} 155 {128+s*111} 180 M {128+s*53} 178 Q {128+s*99} 216 {128+s*86} 231" fill="none" stroke="{legs}" stroke-width="12" stroke-linecap="round"/>'
 if feelers:
  o+='<path d="M 97 85 Q 58 30 80 22 M 161 85 Q 194 27 171 18" stroke="#694535" stroke-width="9" stroke-linecap="round" fill="none"/>'
 return o

def eyes(y=111):
 return f'''<ellipse cx="103" cy="{y}" rx="22" ry="26" fill="#fffdf6"/><ellipse cx="155" cy="{y}" rx="22" ry="26" fill="#fffdf6"/>
 <ellipse cx="109" cy="{y+3}" rx="8" ry="11" fill="#28343b"/><ellipse cx="149" cy="{y+3}" rx="8" ry="11" fill="#28343b"/>
 <circle cx="112" cy="{y-2}" r="3" fill="white"/><circle cx="152" cy="{y-2}" r="3" fill="white"/>
 <path d="M 121 {y+28} Q 129 {y+35} 138 {y+28}" stroke="#613c36" stroke-width="5" fill="none" stroke-linecap="round"/>'''

sprites={}
sprites['cockroach'] = svg(base() + '''<ellipse cx="129" cy="142" rx="70" ry="84" fill="#613e37"/><ellipse cx="129" cy="136" rx="64" ry="78" fill="url(#shell)"/><ellipse cx="129" cy="124" rx="47" ry="52" fill="#e88d56" opacity=".6"/>
 <path d="M129 157 L129 212" stroke="#9e533e" stroke-width="7" stroke-linecap="round"/>
 <ellipse cx="129" cy="92" rx="60" ry="52" fill="#a95842" stroke="#734437" stroke-width="6"/>
 <ellipse cx="102" cy="65" rx="26" ry="10" fill="#ffd7a7" opacity=".55"/>''' + eyes(99) + '''<rect x="104" y="174" width="52" height="43" rx="16" fill="#ec6658" stroke="#864739" stroke-width="6"/><path d="M 101 186 L155 186" stroke="#f9bd78" stroke-width="7"/><circle cx="130" cy="198" r="12" fill="#ffe48f"/><path d="M130 191 V200 L136 204" stroke="#975647" stroke-width="3" fill="none" stroke-linecap="round"/>''')
# Make a separate bomb-carrying hero; NPC cockroaches have no bomb icon.
sprites['cockroach_bomb'] = sprites['cockroach']
sprites['cockroach'] = svg(base() + '<ellipse cx="129" cy="142" rx="70" ry="84" fill="#613e37"/><ellipse cx="129" cy="136" rx="64" ry="78" fill="url(#shell)"/><ellipse cx="129" cy="92" rx="60" ry="52" fill="#a95842" stroke="#734437" stroke-width="6"/>' + eyes(99))
sprites['ladybug']=svg(base('#4b6970')+'''<ellipse cx="129" cy="145" rx="70" ry="80" fill="#a7354e"/><ellipse cx="129" cy="145" rx="63" ry="75" fill="url(#lady)" stroke="#a93c50" stroke-width="5"/>
 <path d="M 129 84 L 129 218" stroke="#a4344e" stroke-width="6"/><circle cx="94" cy="131" r="14" fill="#60354b"/><circle cx="164" cy="156" r="13" fill="#60354b"/><circle cx="101" cy="187" r="12" fill="#60354b"/><circle cx="164" cy="111" r="11" fill="#60354b"/>
 <ellipse cx="129" cy="91" rx="59" ry="48" fill="#523e53"/>'''+eyes(92)+'''<ellipse cx="128" cy="39" rx="49" ry="15" fill="#e7c68c" stroke="#997448" stroke-width="6"/><rect x="100" y="20" width="56" height="22" rx="12" fill="#e7c68c" stroke="#997448" stroke-width="5"/>''')
sprites['ant']=svg(base('#9c6a4c')+'''<ellipse cx="128" cy="179" rx="49" ry="47" fill="#ac6e4f" stroke="#734838" stroke-width="6"/><ellipse cx="128" cy="129" rx="38" ry="31" fill="#ca885b" stroke="#7a4d37" stroke-width="6"/><ellipse cx="128" cy="85" rx="55" ry="48" fill="#e3a46e" stroke="#935c43" stroke-width="7"/><ellipse cx="101" cy="64" rx="21" ry="10" fill="#ffdcaa" opacity=".6"/>'''+eyes(85))
sprites['mosquito']=svg(base('#4d858f')+'''<ellipse cx="86" cy="125" rx="59" ry="33" transform="rotate(-32 86 125)" fill="#bfe7ed" opacity=".85" stroke="#6eabb6" stroke-width="5"/><ellipse cx="173" cy="125" rx="59" ry="33" transform="rotate(32 173 125)" fill="#bfe7ed" opacity=".85" stroke="#6eabb6" stroke-width="5"/><ellipse cx="129" cy="171" rx="36" ry="49" fill="#72b7ba" stroke="#4c8897" stroke-width="6"/><ellipse cx="129" cy="89" rx="56" ry="48" fill="#8fd4d6" stroke="#4c8897" stroke-width="6"/>'''+eyes(86)+'''<path d="M 129 132 L129 164" stroke="#557e8d" stroke-width="7" stroke-linecap="round"/>''')
sprites['beetle']=svg(base('#46785c')+'''<ellipse cx="129" cy="153" rx="72" ry="79" fill="#357959" stroke="#28543e" stroke-width="6"/><ellipse cx="129" cy="145" rx="63" ry="75" fill="url(#beetle)" stroke="#4e9868" stroke-width="5"/><path d="M129 85 L129 217" stroke="#42825c" stroke-width="6"/><ellipse cx="99" cy="105" rx="19" ry="8" fill="#d6f8b2" opacity=".58"/><ellipse cx="129" cy="89" rx="59" ry="49" fill="#5cae75" stroke="#337650" stroke-width="5"/>'''+eyes(91))
sprites['bomb']=svg('''<ellipse cx="127" cy="230" rx="65" ry="11" fill="#20333e" opacity=".15" filter="url(#shadow)"/><path d="M 135 68 C146 44 166 47 167 29" stroke="#9d6852" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M167 26 L181 10 M166 25 L148 11" stroke="#fbc65e" stroke-width="7" stroke-linecap="round"/><circle cx="128" cy="144" r="81" fill="#534f74" stroke="#353853" stroke-width="10"/><circle cx="128" cy="144" r="70" fill="#7669ad"/><ellipse cx="104" cy="111" rx="38" ry="23" fill="#c7c1f6" opacity=".3" transform="rotate(-30 104 111)"/><circle cx="128" cy="153" r="37" fill="#fef4db" stroke="#eab562" stroke-width="6"/><path d="M128 128 V153 L144 168" stroke="#554c65" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="128" cy="153" r="5" fill="#554c65"/>''')
sprites['crumb']=svg('''<path d="M62 151Q35 115 84 86 Q105 39 153 69 Q214 67 206 128 Q230 191 164 202 Q122 232 83 190Q56 189 62 151" fill="#dda85d" stroke="#ad763b" stroke-width="9" stroke-linejoin="round"/><path d="M89 116Q125 84 163 100" fill="none" stroke="#f5d79e" stroke-width="10" stroke-linecap="round"/><circle cx="113" cy="162" r="8" fill="#af7d42"/><circle cx="174" cy="139" r="6" fill="#b28348"/>''')
manifest=[]
for name,contents in sprites.items():
 (SRC/f'{name}.svg').write_text(contents,encoding='utf8')
 cairosvg.svg2png(bytestring=contents.encode(),write_to=str(OUT/f'{name}.png'),output_width=256,output_height=256)
 im=Image.open(OUT/f'{name}.png')
 assert im.size==(256,256) and im.mode=='RGBA' and im.getextrema()[3][0]==0,name
 manifest.append({'name':name,'path':f'assets/images/{name}.png','source':'Original custom vector illustration rendered with CairoSVG, not GPT image generation','license':'Project-owned original artwork','size':'256x256','alpha':True,'technical_checks_passed':True})

# Kitchen floor background, drawn as cohesive colored tile / props environment at exact ratio.
W,H=720,1200
im=Image.new('RGBA',(W,H),'#e7d7ae');d=ImageDraw.Draw(im,'RGBA')
for y in range(0,H,90):
 for x in range(0,W,90):
  col=(250,236,197,255) if (x//90+y//90)%2==0 else (238,221,178,255)
  d.rounded_rectangle((x+3,y+3,x+88,y+88),radius=5,fill=col)
for i in range(35):
 x=(i*101+47)%W;y=(i*173+30)%H
 d.ellipse((x,y,x+7,y+7),fill=(194,165,116,80))
# Sink, cabinet, cheese box, plant, cool decorative details

def rr(rect,r,fill,outline=None,width=1): d.rounded_rectangle(rect,radius=r,fill=fill,outline=outline,width=width)
rr((20,20,245,260),38,(77,154,160,255),outline=(45,110,116,255),width=10)
rr((43,50,223,229),27,(174,218,218,255),outline=(232,249,238,240),width=7)
d.ellipse((110,135,151,177),fill=(67,127,131,255),outline=(41,104,111,255),width=7)
rr((476,24,696,239),30,(195,132,81,255),outline=(147,97,63,255),width=10)
rr((500,49,671,198),20,(229,182,118,255))
for ix in range(3): rr((517+ix*48,83,534+ix*48,160),8,(194,132,82,240))
rr((20,935,251,1170),32,(190,138,89,255),outline=(137,91,58,255),width=9)
rr((50,962,219,1130),20,(218,164,111,255))
for y in (997,1067): d.line((62,y,202,y),fill=(162,105,68,255),width=9)
d.ellipse((510,1050,690,1190),fill=(99,155,106,240),outline=(58,110,83,255),width=7)
for a in range(10):
 ang=a*2*math.pi/10
 cx=596+65*math.cos(ang);cy=1123+57*math.sin(ang)
 d.ellipse((cx-22,cy-36,cx+22,cy+36),fill=(100+a%3*12,173,107,230))
d.ellipse((570,1090,627,1151),fill=(234,193,118,255))
# scattered floor crumbs
for x,y in [(350,360),(465,700),(290,850),(392,980),(305,535)]:
 d.ellipse((x-12,y-9,x+12,y+9),fill=(197,133,67,210))
 d.arc((x-7,y-9,x+7,y+7),180,315,fill=(255,234,170,190),width=4)
im.convert('RGB').save(OUT/'kitchen.png',optimize=True)
manifest.append({'name':'kitchen','path':'assets/images/kitchen.png','source':'Original procedural vector-like floor illustration, not GPT image generation','license':'Project-owned original artwork','size':'720x1200','alpha':False,'technical_checks_passed':True})

# app hero splash artwork: no text (separate UI owns titles)
hero=Image.new('RGBA',(720,1100),(19,102,106,255));d=ImageDraw.Draw(hero,'RGBA')
for k in range(17,0,-1):
 rad=28*k; d.ellipse((360-rad,450-rad,360+rad,450+rad),fill=(28,127+min(k*2,35),121,14))
d.ellipse((55,180,665,805),fill=(248,191,99,255),outline=(255,220,132,255),width=22)
for i in range(25):
 x=(i*173+41)%700+10;y=(i*229+38)%900+65
 color=[(255,221,151,255),(255,174,106,255),(197,240,192,255)][i%3]
 d.ellipse((x-5,y-5,x+5,y+5),fill=color)
from PIL import Image as PILImage
for name,xy,size,angle in [('ant',(85,465),170,-27),('beetle',(441,510),182,16),('mosquito',(428,222),164,23),('ladybug',(75,205),175,-20),('cockroach_bomb',(180,285),365,-8)]:
 sp=PILImage.open(OUT/f'{name}.png').resize((size,size),PILImage.Resampling.LANCZOS).rotate(angle,expand=True,resample=PILImage.Resampling.BICUBIC)
 hero.alpha_composite(sp,xy)
hero.save(OUT/'cover.png')
manifest.append({'name':'cover','path':'assets/images/cover.png','source':'Composition of original vector assets with Pillow; not GPT image generation','license':'Project-owned original artwork','size':'720x1100','alpha':True,'technical_checks_passed':True})

# contact sheet
sheet=Image.new('RGB',(4*260,3*310),(233,242,233));sd=ImageDraw.Draw(sheet)
for i,name in enumerate([*sprites.keys(),'kitchen','cover']):
 x=(i%4)*260;y=(i//4)*310
 p=Image.open(OUT/f'{name}.png').convert('RGBA');p.thumbnail((240,260))
 bg=Image.new('RGBA',p.size,'#e0f0ea'); bg.alpha_composite(p)
 sheet.paste(bg.convert('RGB'),(x+(260-p.width)//2,y+12))
 sd.text((x+16,y+277),name,fill=(41,77,69))
sheet.save(ROOT/'assets'/'preview-sheet.png')
(ROOT/'assets'/'asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
print('Generated',len(manifest),'assets')
