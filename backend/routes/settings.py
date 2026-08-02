import os
from flask import Blueprint, request, jsonify
from middleware.auth import admin_required
from utils.logger import audit_logger, logger
from models.setting import AppSetting
from extensions import db

settings_bp = Blueprint('settings', __name__)

def load_settings():
    """Reads settings from database."""
    try:
        settings_objs = AppSetting.query.all()
        return {s.key: s.value for s in settings_objs}
    except Exception as e:
        logger.error(f"Failed to read settings from db: {e}")
        return {}

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
        
    # Update allowed fields
    fields = [
        'restaurantName', 'tagline', 'headline', 'subheadline', 
        'prideTitle', 'prideDescription', 'pridePrice',
        'openingTime', 'closingTime', 'timezone'
    ]
    
    try:
        for field in fields:
            if field in data:
                setting = db.session.get(AppSetting, field)
                if not setting:
                    setting = AppSetting(key=field, value=str(data[field]))
                    db.session.add(setting)
                else:
                    setting.value = str(data[field])
        
        db.session.commit()
        audit_logger.info(f"Website settings updated by {request.current_user.username}.")
        
        return jsonify({
            "success": True,
            "message": "Website settings updated successfully!", 
            "data": load_settings()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving settings: {e}")
        return jsonify({"success": False, "message": "Failed to save settings updates."}), 500
