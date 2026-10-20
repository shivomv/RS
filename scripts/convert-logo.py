import os
import base64

with open('UI/src/assets/logo.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 745 368" width="745" height="368">
  <image href="data:image/png;base64,{b64}" width="745" height="368" />
</svg>
'''

for target in ['UI/src/assets/logo.svg', 'ADMIN_APP/src/assets/logo.svg']:
    with open(target, 'w') as f:
        f.write(svg_content)
    print(f'Generated {target}')
