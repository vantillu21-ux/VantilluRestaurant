import json
from flask import request
from extensions import db
from models.audit_log import AuditLog

def safe_json_dumps(data):
    try:
        return json.dumps(data)
    except Exception:
        return str(data)

def log_audit_action(action, target_table, target_id=None, old_value=None, new_value=None):
    """Logs an action to the audit_logs table."""
    try:
        user_id = None
        if hasattr(request, 'current_user') and request.current_user:
            user_id = request.current_user.id
            
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')[:255]
        
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            target_table=target_table,
            target_id=str(target_id) if target_id else None,
            old_value_json=safe_json_dumps(old_value) if old_value else None,
            new_value_json=safe_json_dumps(new_value) if new_value else None,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(audit_log)
        # We don't commit here, we let the route's commit handle it so it's part of the same transaction
    except Exception as e:
        import traceback
        print(f"Error logging audit action: {e}\n{traceback.format_exc()}")
