import os
from app import create_app
from extensions import db
from models.menu_item import MenuItem

def normalize_name(name):
    # e.g., "Chicken Dum Biryani" -> "chicken_dum_biryani"
    # also handle special chars or variations if needed
    return name.lower().replace(" ", "_").replace("-", "_")

def main():
    app = create_app()
    with app.app_context():
        # Get all images in frontend/public
        public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'public')
        images = [f for f in os.listdir(public_dir) if f.endswith(('.png', '.jpg', '.webp'))]
        
        # Create a mapping of base names (without extension) to full filenames
        image_map = {os.path.splitext(f)[0]: f for f in images}
        
        items = MenuItem.query.all()
        updated_count = 0
        
        for item in items:
            normalized = normalize_name(item.name)
            
            # Direct match
            if normalized in image_map:
                item.image_url = f"/{image_map[normalized]}"
                updated_count += 1
                continue
                
            # If no direct match, try removing variations like " (small)" or " (single)"
            # Example: "Chicken Fry Piece Biryani (Small)" -> "chicken_fry_piece_biryani_(small)"
            # We'll just split by '(' and take the first part
            base_name = item.name.split('(')[0].strip()
            norm_base = normalize_name(base_name)
            
            if norm_base in image_map:
                item.image_url = f"/{image_map[norm_base]}"
                updated_count += 1
                continue
                
            # Let's try handling missing "frypiece" vs "fry_piece" etc.
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
            
            # Some manual heuristics
            if "ragi_sangati" in normalized and "natu_kodi" in normalized:
                if "ragi_sangati_natu_kodi" in image_map:
                    item.image_url = f"/{image_map['ragi_sangati_natu_kodi']}"
                    updated_count += 1
                    continue
            
            # Print items that didn't match
            print(f"No image found for: {item.name} (normalized: {normalized}, base: {norm_base})")
            
        db.session.commit()
        print(f"Successfully updated {updated_count} items with images.")

if __name__ == "__main__":
    main()
