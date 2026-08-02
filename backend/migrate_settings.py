import json
import os
from app import create_app
from extensions import db
from models.setting import AppSetting
from sqlalchemy import inspect

def migrate_settings():
    app = create_app()
    with app.app_context():
        # Check if app_settings table exists
        inspector = inspect(db.engine)
        if not inspector.has_table('app_settings'):
            print("Creating app_settings table...")
            AppSetting.__table__.create(db.engine)
        
        settings_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'data', 'settings.json')
        if os.path.exists(settings_path):
            with open(settings_path, 'r', encoding='utf-8') as f:
                settings = json.load(f)
            
            for key, value in settings.items():
                setting = AppSetting.query.get(key)
                if not setting:
                    setting = AppSetting(key=key, value=str(value))
                    db.session.add(setting)
                else:
                    setting.value = str(value)
            
            # Ensure timing config exists
            if not AppSetting.query.get('openingTime'):
                db.session.add(AppSetting(key='openingTime', value='11:00'))
            if not AppSetting.query.get('closingTime'):
                db.session.add(AppSetting(key='closingTime', value='23:00'))
            if not AppSetting.query.get('timezone'):
                db.session.add(AppSetting(key='timezone', value='Asia/Kolkata'))
                
            db.session.commit()
            print("Settings migrated to DB successfully!")
        else:
            print("settings.json not found, skipping import.")

if __name__ == '__main__':
    migrate_settings()
