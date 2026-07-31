import os
import json
from flask import Blueprint, request, jsonify
from middleware.auth import admin_required
from utils.logger import audit_logger, logger

settings_bp = Blueprint('settings', __name__)

# Resolve path to settings.json inside frontend folder
BACKEND_ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
SETTINGS_JSON_PATH = os.path.join(os.path.dirname(BACKEND_ROOT), 'frontend', 'data', 'settings.json')

def load_settings():
    """Reads the settings.json file."""
    try:
        if not os.path.exists(SETTINGS_JSON_PATH):
            return {}
        with open(SETTINGS_JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read settings.json: {e}")
        return {}

def save_settings(settings_dict):
    """Writes settings back to settings.json."""
    try:
        with open(SETTINGS_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(settings_dict, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Failed to write settings.json: {e}")
        return False

@settings_bp.route('', methods=['GET'])
def get_settings():
    """Retrieves all website text settings."""
    return jsonify(load_settings()), 200

@settings_bp.route('/admin/settings', methods=['POST'])
@admin_required
def update_settings():
    """Updates global website text configurations."""
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided."}), 400
        
    settings = load_settings()
    
    # Update allowed fields
    fields = ['restaurantName', 'tagline', 'headline', 'subheadline', 'prideTitle', 'prideDescription', 'pridePrice']
    for field in fields:
        if field in data:
            settings[field] = data[field]
            
    if save_settings(settings):
        audit_logger.info(f"Website settings updated by {request.current_user.username}.")
        return jsonify({"message": "Website settings updated successfully!", "settings": settings}), 200
    else:
        return jsonify({"message": "Failed to save settings updates."}), 500
