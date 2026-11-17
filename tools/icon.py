import sys
from playwright.sync_api import sync_playwright
out = sys.argv[1]
def svg(pad):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#dcecf6"/>
<g transform="translate(256 {400 - pad*0.4}) scale({3.1 - pad/60})">
<g transform="translate(0 -46) rotate(-30)"><path d="M0 0 L0 -16" stroke="#3f6b3a" stroke-width="3.5" stroke-linecap="round"/><path transform="translate(0 -16)" d="M0 0 C-11 -6 -14 -26 -7 -40 C-3 -47 3 -47 7 -40 C14 -26 11 -6 0 0 Z" fill="#6fa05c"/></g>
<g transform="translate(0 -46) rotate(30)"><path d="M0 0 L0 -16" stroke="#3f6b3a" stroke-width="3.5" stroke-linecap="round"/><path transform="translate(0 -16)" d="M0 0 C-11 -6 -14 -26 -7 -40 C-3 -47 3 -47 7 -40 C14 -26 11 -6 0 0 Z" fill="#87b46e"/></g>
<g transform="translate(0 -46)"><path d="M0 0 L0 -20" stroke="#3f6b3a" stroke-width="3.5" stroke-linecap="round"/><path transform="translate(0 -20)" d="M0 0 C-11 -6 -14 -26 -7 -40 C-3 -47 3 -47 7 -40 C14 -26 11 -6 0 0 Z" fill="#558b4a"/></g>
<path d="M-32 -40 L32 -40 L26 -6 Q25 0 18 0 L-18 0 Q-25 0 -26 -6 Z" fill="#c97b5d"/><rect x="-36" y="-54" width="72" height="15" rx="7" fill="#ad6a50"/>
<path d="M-13 -24 Q-10 -27 -7 -24 M7 -24 Q10 -27 13 -24 M-5 -18 Q0 -13 5 -18" stroke="#603b2d" stroke-width="2.2" stroke-linecap="round" fill="none"/>
<g transform="translate(34 -104) scale(1.5)"><path d="M0 0 C2.8 3.5 4.5 6 4.5 8.5 A4.5 4.5 0 1 1 -4.5 8.5 C-4.5 6 -2.8 3.5 0 0 Z" fill="#6fb1d6"/></g>
</g></svg>'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for name, size, pad in [("icon-192.png", 192, 0), ("icon-512.png", 512, 0), ("icon-maskable.png", 512, 48)]:
        pg = b.new_page(viewport={"width": size, "height": size})
        pg.set_content(f'<body style="margin:0">{svg(pad).replace("<svg ", f"<svg width={size} height={size} ")}</body>')
        pg.screenshot(path=f"{out}/{name}")
    b.close()
