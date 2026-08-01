import os
import sys
import json

# Add backend dir to python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models.menu_item import MenuItem

def seed_menu():
    app = create_app()
    with app.app_context():
        # Step 2: Check row count
        count = MenuItem.query.count()
        print(f"Current menu_items count: {count}")
        
        if count > 0:
            print("Menu table is not empty. Exiting safely.")
            return

        # Load menu.json
        menu_json_path = os.path.join(os.path.dirname(app.root_path), 'frontend', 'data', 'menu.json')
        if not os.path.exists(menu_json_path):
            print(f"Error: {menu_json_path} does not exist.")
            return
            
        with open(menu_json_path, 'r', encoding='utf-8') as f:
            menu_data = json.load(f)
            
        # Step 4: Import data
        print(f"Found {len(menu_data)} items in menu.json. Starting import...")
        
        items_imported = 0
        for item in menu_data:
            # Map JSON fields to MenuItem model fields
            price_small = float(item.get('price')) if item.get('price') else None
            price_full = None
            
            if item.get('portionType') == 'half-full':
                price_small = float(item.get('halfPrice')) if item.get('halfPrice') else None
                price_full = float(item.get('fullPrice')) if item.get('fullPrice') else None
            elif item.get('portionType') == 'single-full':
                price_small = float(item.get('singlePrice')) if item.get('singlePrice') else None
                price_full = float(item.get('fullPrice')) if item.get('fullPrice') else None
            
            menu_item = MenuItem(
                category=item.get('category', 'Uncategorized'),
                name=item.get('name', 'Unknown'),
                description=item.get('description', ''),
                image_url=item.get('image', ''),
                price_small=price_small,
                price_full=price_full,
                is_available=True,
                spice_level=item.get('spiceLevel', 'Mild'),
                display_order=item.get('id', 0)  # Preserve old sorting
            )
            
            db.session.add(menu_item)
            items_imported += 1
            
        try:
            db.session.commit()
            print(f"Successfully imported {items_imported} menu items.")
            
            # Verify row count afterwards
            final_count = MenuItem.query.count()
            print(f"Final menu_items row count: {final_count}")
        except Exception as e:
            db.session.rollback()
            print(f"Error importing data: {e}")

if __name__ == '__main__':
    seed_menu()
