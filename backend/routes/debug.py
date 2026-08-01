import os
from flask import Blueprint, jsonify

debug_bp = Blueprint('debug', __name__)

@debug_bp.route('/env', methods=['GET'])
def get_env_vars():
    """Returns masked environment variables for debugging."""
    keys = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SECRET_KEY', 'CLIENT_URL']
    
    masked_env = {}
    for key in keys:
        val = os.environ.get(key)
        if not val:
            masked_env[key] = "NOT_SET"
        else:
            # Mask the secret parts
            if "postgres" in val or "http" in val:
                # Basic masking for URLs (hide passwords and keys)
                if "@" in val:
                    parts = val.split("@")
                    masked_env[key] = f"***@{parts[1]}"
                else:
                    masked_env[key] = f"{val[:15]}***"
            else:
                masked_env[key] = f"{val[:5]}***"
                
    return jsonify(masked_env)

@debug_bp.route('/db', methods=['GET'])
def check_db():
    from extensions import db
    try:
        orders = db.session.execute(db.text("SELECT COUNT(*) FROM orders")).scalar()
        res = db.session.execute(db.text("SELECT COUNT(*) FROM reservations")).scalar()
        return jsonify({"status": "connected", "orders": orders, "reservations": res})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)})
