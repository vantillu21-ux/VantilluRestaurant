import json
import os
import re

menu_path = r'c:\Users\menen\Desktop\Vantillu Resto\frontend\data\menu.json'
public_dir = r'c:\Users\menen\Desktop\Vantillu Resto\frontend\public'

with open(menu_path, 'r', encoding='utf-8') as f:
    menu = json.load(f)

public_files = [f for f in os.listdir(public_dir) if f.endswith(('.png', '.jpg', '.jpeg', '.webp'))]

def get_words(name):
    name = re.sub(r'\.(png|jpg|jpeg|webp)$', '', name)
    name = re.sub(r'[^a-zA-Z0-9]', ' ', name)
    return set(name.lower().split())

file_words = {f: get_words(f) for f in public_files}

updated_count = 0

for item in menu:
    current_img = item.get('image', '')
    if current_img.startswith('/'):
        current_img = current_img[1:]
        
    if current_img in public_files:
        continue
        
    item_words = get_words(item['name'])
    
    best_match = None
    best_score = 0
    
    for f, f_words in file_words.items():
        score = len(item_words.intersection(f_words))
        if score > best_score:
            best_score = score
            best_match = f
            
    if best_match and best_score > 0:
        item['image'] = '/' + best_match
        updated_count += 1

with open(menu_path, 'w', encoding='utf-8') as f:
    json.dump(menu, f, indent=2)

print('Updated ' + str(updated_count) + ' items using partial word matching.')
