import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = {
        r'bg-\[\#131313\]': 'bg-canvas-black',
        r'text-\[\#131313\]': 'text-canvas-black',
        r'border-\[\#131313\]': 'border-canvas-black',
        
        r'bg-\[\#2d2d2d\]': 'bg-surface-slate',
        r'text-\[\#2d2d2d\]': 'text-surface-slate',
        r'border-\[\#2d2d2d\]': 'border-surface-slate',
        
        r'text-white': 'text-hazard-white',
        r'bg-white': 'bg-hazard-white',
        r'border-white': 'border-hazard-white',
        
        r'text-\[\#949494\]': 'text-secondary-text',
        r'bg-\[\#949494\]': 'bg-secondary-text',
        r'border-\[\#949494\]': 'border-secondary-text',

        r'text-\[\#e9e9e9\]': 'text-muted-text',
        r'bg-\[\#e9e9e9\]': 'bg-muted-text',
        r'border-\[\#e9e9e9\]': 'border-muted-text',

        r'text-\[\#3cffd0\]': 'text-jelly-mint',
        r'bg-\[\#3cffd0\]': 'bg-jelly-mint',
        r'border-\[\#3cffd0\]': 'border-jelly-mint',
        
        r'text-\[\#5200ff\]': 'text-verge-ultraviolet',
        r'bg-\[\#5200ff\]': 'bg-verge-ultraviolet',
        r'border-\[\#5200ff\]': 'border-verge-ultraviolet',

        r'text-\[\#3860be\]': 'text-deep-link-blue',
        r'bg-\[\#3860be\]': 'bg-deep-link-blue',
        r'border-\[\#3860be\]': 'border-deep-link-blue',
        
        r'text-\[\#313131\]': 'text-image-frame',
        r'bg-\[\#313131\]': 'bg-image-frame',
        r'border-\[\#313131\]': 'border-image-frame',
        
        r'bg-black': 'bg-absolute-black',
        r'text-black': 'text-absolute-black',
        r'border-black': 'border-absolute-black',
    }

    new_content = content
    for pattern, repl in replacements.items():
        new_content = re.sub(pattern, repl, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

count = 0
for root, _, files in os.walk(r'd:\APP\scouting-app\src'):
    for file in files:
        if file.endswith(('.jsx', '.js', '.tsx', '.ts')):
            if process_file(os.path.join(root, file)):
                count += 1

print(f'Updated {count} files.')
