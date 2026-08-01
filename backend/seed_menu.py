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
        # Clean the table
        try:
            db.session.query(MenuItem).delete()
            db.session.commit()
            print("Successfully deleted existing menu items.")
        except Exception as e:
            db.session.rollback()
            print(f"Error clearing menu items: {e}")
            return

        # Load menu.json
        menu_json_path = os.path.join(os.path.dirname(app.root_path), 'frontend', 'data', 'menu.json')
        if not os.path.exists(menu_json_path):
            print(f"Error: {menu_json_path} does not exist.")
            return
            
        with open(menu_json_path, 'r', encoding='utf-8') as f:
            menu_data = json.load(f)
            
        print(f"Found {len(menu_data)} items in menu.json. Starting import...")
        
        items_imported = 0
        for item in menu_data:
            menu_item = MenuItem(
                id=item.get('id'),
                name=item.get('name', 'Unknown'),
                category=item.get('category', 'Uncategorized'),
                cuisine=item.get('cuisine'),
                description=item.get('description', ''),
                image_url=item.get('image', ''),
                is_veg=item.get('isVeg', True),
                spice_level=item.get('spiceLevel', 'Mild'),
                rating=item.get('rating', 4.5),
                prep_time=item.get('prepTime'),
                portion_type=item.get('portionType'),
                price=item.get('price'),
                half_price=item.get('halfPrice'),
                full_price=item.get('fullPrice'),
                single_price=item.get('singlePrice'),
                family_price=item.get('familyPrice'),
                jumbo_price=item.get('jumboPrice'),
                is_best_seller=item.get('isBestSeller', False),
                is_chef_special=item.get('isChefSpecial', False),
                is_available=True,
                display_order=item.get('id', 0)
            )
            
            db.session.add(menu_item)
            items_imported += 1
            
        try:
            db.session.commit()
            print(f"Successfully imported {items_imported} menu items with full schema.")
            final_count = MenuItem.query.count()
            print(f"Final menu_items row count: {final_count}")
        except Exception as e:
            db.session.rollback()
            print(f"Error importing data: {e}")

if __name__ == '__main__':
    seed_menu()
