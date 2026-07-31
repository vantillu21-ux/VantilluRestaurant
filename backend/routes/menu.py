import os
import json
from flask import Blueprint, request, jsonify
from middleware.auth import admin_required, permission_required
from utils.logger import audit_logger, logger

menu_bp = Blueprint('menu', __name__)

# Resolve path to menu.json inside frontend folder
BACKEND_ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
MENU_JSON_PATH = os.path.join(os.path.dirname(BACKEND_ROOT), 'frontend', 'data', 'menu.json')

def load_menu():
    """Reads the menu.json file."""
    try:
        if not os.path.exists(MENU_JSON_PATH):
            return []
        with open(MENU_JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read menu.json: {e}")
        return []

def save_menu(menu_list):
    """Writes the updated menu list back to menu.json."""
    try:
        with open(MENU_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(menu_list, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Failed to write menu.json: {e}")
        return False

@menu_bp.route('/menu', methods=['GET'])
def get_menu():
    """Retrieves all menu items."""
    return jsonify(load_menu()), 200

@menu_bp.route('/admin/menu', methods=['POST'])
@admin_required
def add_menu_item():
    """Adds a new item to the restaurant menu."""
    data = request.get_json()
    if not data or 'name' not in data or 'price' not in data:
        return jsonify({"message": "Item name and price are required."}), 400
        
    menu = load_menu()
    
    # Auto-generate a new unique ID
    existing_ids = [item.get('id', 0) for item in menu]
    new_id = max(existing_ids) + 1 if existing_ids else 1001
    
    new_item = {
        "id": new_id,
        "name": data['name'],
        "isVeg": data.get('isVeg', True),
        "category": data.get('category', 'Biryani'),
        "cuisine": data.get('cuisine', 'Indian'),
        "description": data.get('description', ''),
        "image": data.get('image', '/elaneer_payasam.png'),
        "spiceLevel": data.get('spiceLevel', 'Medium'),
        "rating": float(data.get('rating', 4.5)),
        "prepTime": data.get('prepTime', '15 mins'),
        "portionType": data.get('portionType', 'standard'),
        "price": float(data['price'])
    }
    
    # Handle optional sub-prices if portionType is different
    if 'halfPrice' in data:
        new_item['halfPrice'] = float(data['halfPrice'])
    if 'fullPrice' in data:
        new_item['fullPrice'] = float(data['fullPrice'])
    if 'singlePrice' in data:
        new_item['singlePrice'] = float(data['singlePrice'])
        
    menu.append(new_item)
    if save_menu(menu):
        audit_logger.info(f"Menu item '{new_item['name']}' (ID: {new_id}) created by {request.current_user.username}.")
        return jsonify({"message": "Menu item created successfully!", "item": new_item}), 201
    else:
        return jsonify({"message": "Failed to save menu item changes."}), 500

@menu_bp.route('/admin/menu/<int:item_id>', methods=['PUT'])
@admin_required
def edit_menu_item(item_id):
    """Edits details of an existing menu item."""
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided."}), 400
        
    menu = load_menu()
    
    item_index = -1
    for idx, item in enumerate(menu):
        if item.get('id') == item_id:
            item_index = idx
            break
            
    if item_index == -1:
        return jsonify({"message": "Menu item not found."}), 404
        
    target_item = menu[item_index]
    
    # Update properties
    fields = ['name', 'isVeg', 'category', 'cuisine', 'description', 'image', 'spiceLevel', 'rating', 'prepTime', 'portionType', 'price', 'halfPrice', 'fullPrice', 'singlePrice']
    for field in fields:
        if field in data:
            if field in ['price', 'halfPrice', 'fullPrice', 'singlePrice', 'rating']:
                target_item[field] = float(data[field]) if data[field] is not None else None
            else:
                target_item[field] = data[field]
                
    menu[item_index] = target_item
    if save_menu(menu):
        audit_logger.info(f"Menu item ID {item_id} updated by {request.current_user.username}.")
        return jsonify({"message": "Menu item updated successfully!", "item": target_item}), 200
    else:
        return jsonify({"message": "Failed to save menu item updates."}), 500

@menu_bp.route('/admin/menu/<int:item_id>', methods=['DELETE'])
@admin_required
def delete_menu_item(item_id):
    """Deletes a menu item from the catalog."""
    menu = load_menu()
    
    item_index = -1
    for idx, item in enumerate(menu):
        if item.get('id') == item_id:
            item_index = idx
            break
            
    if item_index == -1:
        return jsonify({"message": "Menu item not found."}), 404
        
    item_name = menu[item_index].get('name', 'Unknown')
    menu.pop(item_index)
    
    if save_menu(menu):
        audit_logger.info(f"Menu item '{item_name}' (ID: {item_id}) deleted by {request.current_user.username}.")
        return jsonify({"message": f"Menu item '{item_name}' deleted successfully!"}), 200
    else:
        return jsonify({"message": "Failed to save delete changes."}), 500
