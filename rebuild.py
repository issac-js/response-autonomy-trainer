"""Build a self-contained offline HTML from maintained sources. No npm required."""
from pathlib import Path
import base64,json,re
root=Path(__file__).parent
html=root.joinpath('template.html').read_text('utf-8')

# Inline the app icon so the single file keeps its identity offline and when
# hosted. Sources live in assets/ and are rendered by tools/render-icon.cjs.
icons=['<meta name="theme-color" content="#2A1A4F">']
for size in (32,64):
    png=base64.b64encode(root.joinpath(f'assets/icon-{size}.png').read_bytes()).decode()
    icons.append(f'<link rel="icon" type="image/png" sizes="{size}x{size}" href="data:image/png;base64,{png}">')
html,n=re.subn(r'<!--ICON_LINKS-->',''.join(icons),html,count=1)
if n!=1:raise ValueError('Missing icon placeholder')

for name,filename in [('bank','cards.json'),('dialogue-bank','dialogues.json')]:
    content=json.loads(root.joinpath(filename).read_text('utf-8'))
    escaped=json.dumps(content,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
    html,n=re.subn(rf'(<script id="{name}" type="application/json">).*?(</script>)',lambda m:m[1]+escaped+m[2],html,count=1,flags=re.S)
    if n!=1:raise ValueError('Missing data block '+name)
engine=root.joinpath('vendor/ts-fsrs-5.4.2.umd.js').read_text('utf-8')
engine=re.sub(r'//# sourceMappingURL=.*','',engine)
engine='/* ts-fsrs 5.4.2 — MIT License\n'+root.joinpath('vendor/LICENSE-ts-fsrs.txt').read_text('utf-8')+'\n*/\n'+engine
app='\n'.join(root.joinpath(n).read_text('utf-8') for n in ['coach-data.js','data.js','form-guard.js','voice.js','single.js','settings.js','coach.js','app.js'])
html=html.replace('/*FSRS_ENGINE*/',engine.replace('</script','<\\/script')).replace('/*APP_SOURCE*/',app.replace('</script','<\\/script'))
root.joinpath('index.html').write_text(html,'utf-8',newline='\n')  # stable LF output across OSes
print('Built self-contained index.html')
