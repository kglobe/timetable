# -*- coding: utf-8 -*-
"""從實際 HTML 解析 :root 色票，驗證文字對比達 WCAG AA。"""
import re,io,sys,os
sys.stdout.reconfigure(encoding='utf-8')          # Windows 終端預設 cp950，中文會變亂碼
os.chdir(os.path.dirname(os.path.abspath(__file__)))   # 以腳本所在目錄為基準
def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4 for x in c]
    return .2126*c[0]+.7152*c[1]+.0722*c[2]
def cr(a,b):
    l1,l2=sorted([lum(a),lum(b)],reverse=True); return (l1+.05)/(l2+.05)

def tokens(path):
    s=io.open(path,encoding='utf-8').read()
    css=s[s.index('<style>'):s.index('</style>')]
    di=css.index(':root[data-theme="dark"]{')
    grab=lambda t:dict(re.findall(r'(--[\w-]+):\s*(#[0-9a-fA-F]{6})',t))
    return grab(css[:di]), grab(css[di:])

# (fg, bg, 需求, 說明)
CHECKS={
 'index.html':[('--ink','--paper',4.5,'body text'),('--ink','--card',4.5,'card text'),
   ('--muted','--paper',4.5,'legend/datebar'),('--muted','--card',4.5,'card sub-text'),
   ('--accent','--paper',4.5,'eyebrow/link'),('--accent','--card',4.5,'current class'),
   ('--accent','--accent-weak',4.5,'next-lbl chip'),('--holiday','--paper',4.5,'holiday'),
   ('--c-lang-t','--c-lang-w',4.5,'lang chip'),('--c-lang-t','--paper',4.5,'lang table cell'),
   ('--c-math-t','--c-math-w',4.5,'math chip'),('--c-math-t','--paper',4.5,'math table cell'),
   ('--c-nat-t','--c-nat-w',4.5,'nat chip'),('--c-nat-t','--paper',4.5,'nat table cell'),
   ('--c-art-t','--c-art-w',4.5,'art chip'),('--c-art-t','--paper',4.5,'art table cell')],
 'firstday.html':[('--ink','--paper',4.5,'body text'),('--muted','--paper',4.5,'sub-text'),
   ('--muted','--card',4.5,'card sub-text'),('--accent','--accent-weak',4.5,'pin default'),
   ('--kid-t','--kid-w',4.5,'pin kid'),('--par-t','--par-w',4.5,'pin par'),
   ('--holiday','--holiday-weak',3.0,'alert icon (graphic)')],
 'school.html':[('--muted','--paper',4.5,'sub-text'),('--muted','--card',4.5,'card sub-text'),
   ('--accent','--card',4.5,'accent text')],
 'calendar.html':[('--muted','--paper',4.5,'sub-text'),('--muted','--card',4.5,'card sub-text'),
   ('--holiday','--holiday-weak',4.5,'holiday tag'),('--accent','--accent-weak',4.5,'tag')],
 'snack.html':[('--muted','--paper',4.5,'sub-text'),('--muted','--card',4.5,'card sub-text'),
   ('--accent','--accent-weak',4.5,'tag')],
}
bad=0
for f,checks in CHECKS.items():
    light,dark=tokens(f)
    for mode,T in (('light',light),('dark',dark)):
        for fg,bg,need,use in checks:
            if fg not in T or bg not in T:
                print(f'  SKIP  {f} {mode} {fg}/{bg} (未定義)'); continue
            r=cr(T[fg],T[bg])
            if r < need:
                bad+=1
                print(f'  FAIL  {f:14} {mode:5} {r:4.2f} < {need}  {fg} on {bg}  ({use})')
print(f'\n{"FAILED: "+str(bad)+" 組未達標" if bad else "PASS: 全部文字對比達 WCAG AA"}')
sys.exit(1 if bad else 0)
