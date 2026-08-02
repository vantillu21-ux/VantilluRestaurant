import os
import difflib
from app import create_app
from extensions import db
from models.menu_item import MenuItem

def normalize_name(name):
    # Strip whitespace before replacing
    return name.strip().lower().replace(" ", "_").replace("-", "_")

def main():
    app = create_app()
    with app.app_context():
        public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'public')
        images = [f for f in os.listdir(public_dir) if f.endswith(('.png', '.jpg', '.webp'))]
        
        image_map = {os.path.splitext(f)[0].strip(): f for f in images}
        available_bases = list(image_map.keys())
        
        items = MenuItem.query.all()
        updated_count = 0
        
        for item in items:
            normalized = normalize_name(item.name)
            base_name = item.name.split('(')[0].strip()
            norm_base = normalize_name(base_name)
            
            # Exact match
            if normalized in image_map:
                item.image_url = f"/{image_map[normalized]}"
                updated_count += 1
                continue
                
            if norm_base in image_map:
                item.image_url = f"/{image_map[norm_base]}"
                updated_count += 1
                continue
                
            norm_base_compressed = norm_base.replace("_", "")
            found = False
            for img_base, img_filename in image_map.items():
                if img_base.replace("_", "") == norm_base_compressed:
                    item.image_url = f"/{img_filename}"
                    updated_count += 1
                    found = True
                    break
            
            if found:
                continue
            
            # Custom manual mappings based on common typos/variations
            custom_map = {
                "kaddu_ka_kheer": "kadu_ka_kheer",
                "gulab_jamun": "gulab_jamuun",
                "double_ka_meeta": "double_ka_meetha",
                "chilly_egg": "egg_65",
                "andhra_chicken": "andhra_chicken_curry",
                "butter_chicken": "butter_chicken_curry",
                "kadai_chicken": "kadai_chicken_boneless",
                "chicken_dum_biryani": "premium_biryani", # If there's no dum biryani image, just use premium? We'll leave it out for now.
                "tandoori_chicken": "tandoori_chicken_masala",
                "tandoori_chicken_biryani": "tandoori_chicken_masala"
            }
            
            if norm_base in custom_map and custom_map[norm_base] in image_map:
                item.image_url = f"/{image_map[custom_map[norm_base]]}"
                updated_count += 1
                continue
            
            # Fuzzy match
            closest = difflib.get_close_matches(norm_base, available_bases, n=1, cutoff=0.85)
            if closest:
                matched_base = closest[0]
                item.image_url = f"/{image_map[matched_base]}"
                updated_count += 1
                print(f"Fuzzy matched: {item.name} -> {matched_base}")
                continue
                
            print(f"Still no image for: {item.name}")
            
        db.session.commit()
        print(f"Successfully updated additional items. Total items matched in this pass: {updated_count}")

if __name__ == "__main__":
    main()
