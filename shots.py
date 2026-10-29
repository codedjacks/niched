import shutil
from playwright.sync_api import sync_playwright
routes=["","mystery","top-10","head-to-head","stadium-guesser","huddle","emoji-playbook","radio-call","sellout","standings-shuffle"]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=shutil.which('chromium'))
    pg=b.new_page(viewport={'width':430,'height':932},device_scale_factor=2)
    for r in routes:
        try:
            pg.goto(f"http://localhost:8080/{r}",wait_until="networkidle",timeout=20000)
        except Exception as e: print(r,e)
        pg.wait_for_timeout(1500)
        pg.screenshot(path=f"/tmp/vid/s_{r or 'home'}.png")
        print("ok",r)
    b.close()
