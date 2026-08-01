from flask import Blueprint, request, jsonify
from extensions import db
from middleware.auth import admin_required, permission_required
from repositories.menu_repository import MenuRepository
from models.menu_item import MenuItem
from utils.logger import audit_logger, logger

menu_bp = Blueprint('menu', __name__)

# Very simple global cache for the menu GET request
# Ideally, this would be Redis, but we're starting with in-memory per requirement
menu_cache = {
    "data": None,
    "timestamp": 0
}
CACHE_TTL = 60  # seconds

def clear_menu_cache():
    menu_cache["data"] = None
    menu_cache["timestamp"] = 0

@menu_bp.route('/menu', methods=['GET'])
def get_menu():
    """Retrieves all menu items (with 60s in-memory caching)."""
    import time
    now = time.time()
    
    if menu_cache["data"] is not None and (now - menu_cache["timestamp"] < CACHE_TTL):
        return jsonify(menu_cache["data"]), 200

    items = MenuRepository.all_desc()
    data = [item.to_dict() for item in items]
    
    menu_cache["data"] = data
    menu_cache["timestamp"] = now
    
    return jsonify(data), 200

@menu_bp.route('/admin/menu', methods=['POST'])
@admin_required
def add_menu_item():
    """Adds a new item to the restaurant menu."""
    data = request.get_json()
    if not data or 'name' not in data or 'price' not in data:
        return jsonify({"message": "Item name and price are required."}), 400
        
    try:
        new_item = MenuRepository.create(
            name=data['name'],
            category=data.get('category', 'Biryani'),
            description=data.get('description', ''),
            image_url=data.get('image', '/elaneer_payasam.png'),
            price_small=float(data.get('halfPrice')) if data.get('halfPrice') else None,
            price_full=float(data['price']),
            is_available=data.get('isVeg', True), # Just a fallback if needed, but is_available makes more sense
            spice_level=data.get('spiceLevel', 'Medium'),
            display_order=int(data.get('display_order', 0))
        )
        db.session.commit()
        
        clear_menu_cache()
        
        audit_logger.info(f"Menu item '{new_item.name}' (ID: {new_item.id}) created by {request.current_user.username}.")
        return jsonify({
            "success": True,
            "message": "Menu item created successfully!", 
            "data": new_item.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to add menu item: {e}")
        return jsonify({"success": False, "message": f"Failed to save menu item changes: {e}"}), 500

@menu_bp.route('/admin/menu/<int:item_id>', methods=['PUT'])
@admin_required
def edit_menu_item(item_id):
    """Edits details of an existing menu item."""
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided."}), 400
        
    try:
        item = db.session.query(MenuItem).with_for_update().get(item_id)
        if not item or item.is_deleted:
            db.session.rollback()
            return jsonify({"success": False, "message": "Menu item not found."}), 404
            
        # Optimistic Locking Check
        client_version = data.get('version')
        if client_version is not None:
            if int(client_version) != item.version:
                db.session.rollback()
                return jsonify({
                    "success": False,
                    "message": "Record has been modified by another user.",
                    "action": "refresh_required"
                }), 409
            item.version = item.version + 1
            
        # Update properties
        if 'name' in data: item.name = data['name']
        if 'category' in data: item.category = data['category']
        if 'description' in data: item.description = data['description']
        if 'image' in data: item.image_url = data['image']
        if 'price' in data: item.price_full = float(data['price'])
        if 'halfPrice' in data: item.price_small = float(data['halfPrice']) if data['halfPrice'] is not None else None
        if 'spiceLevel' in data: item.spice_level = data['spiceLevel']
        if 'isVeg' in data: item.is_available = data['isVeg'] # Mapping isVeg to is_available for now based on legacy logic
            
        db.session.commit()
        
        clear_menu_cache()
        
        audit_logger.info(f"[UPDATE] Endpoint: /api/admin/menu/{item_id}, Record ID: {item_id}, DB commit success: True")
        return jsonify({
            "success": True,
            "message": "Menu item updated successfully!", 
            "data": item.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        audit_logger.error(f"[UPDATE] Endpoint: /api/admin/menu/{item_id}, Record ID: {item_id}, DB commit success: False. Err: {e}")
        return jsonify({"success": False, "message": f"Failed to save menu item updates: {e}"}), 500

@menu_bp.route('/admin/menu/<int:item_id>', methods=['DELETE'])
@admin_required
def delete_menu_item(item_id):
    """Soft deletes a menu item from the catalog."""
    try:
        success = MenuRepository.delete(item_id)
        if not success:
            return jsonify({"message": "Menu item not found."}), 404
            
        db.session.commit()
        
        clear_menu_cache()
        
        audit_logger.info(f"Menu item (ID: {item_id}) deleted by {request.current_user.username}.")
        return jsonify({
            "success": True,
            "message": f"Menu item deleted successfully!"
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to delete menu item {item_id}: {e}")
        return jsonify({"success": False, "message": "Failed to save delete changes."}), 500
