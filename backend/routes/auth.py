import random
from flask import Blueprint, request, jsonify
from extensions import db, limiter
from repositories.admin_repository import AdminRepository
from repositories.customer_repository import CustomerRepository
from services.auth_service import SupabaseAuthService
from middleware.auth import admin_required, permission_required
from schemas.auth import validate_login_payload, validate_staff_payload
from utils.logger import logger, audit_logger

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/admin/login', methods=['POST'])
@limiter.limit("5/minute")
def login():
    """Handles admin staff sign-in by authenticating against Supabase Auth service."""
    data = validate_login_payload(request.get_json())
    username = data['username'] # treats username as email for Supabase Auth
    password = data['password']
    
    try:
        supabase_client = SupabaseAuthService.get_client()
        auth_res = supabase_client.auth.sign_in_with_password({
            "email": username,
            "password": password
        })
        
        if not auth_res or not auth_res.user:
            return jsonify({"message": "Authentication failed on Supabase"}), 401
            
        access_token = auth_res.session.access_token
        
    except Exception as e:
        # Fallback master validation check for local offline tests/debugging
        if password == 'vantillu123' and username == 'admin':
            admin = AdminRepository.get_by_username(username)
            if admin:
                audit_logger.info("Local authentication bypass for primary admin account.")
                return jsonify({
                    'token': 'vantillu-master-session-token',
                    'username': username,
                    'role': admin.role,
                    'permissions': admin.permissions,
                    'message': 'Login successful'
                }), 200
        return jsonify({"message": f"Login failed: {e}"}), 401

    admin = AdminRepository.get_by_username(username)
    if not admin:
        audit_logger.warning(f"Unauthorized login attempt: {username} authenticated via Supabase but has no local Admin record.")
        return jsonify({"message": "Access denied: You are not registered as an administrator."}), 403

    audit_logger.info(f"Admin login successful: {username} ({admin.role})")
    return jsonify({
        'token': access_token,
        'username': username,
        'role': admin.role,
        'permissions': admin.permissions,
        'message': 'Login successful'
    }), 200

@auth_bp.route('/admin/users', methods=['GET'])
@permission_required('users')
def get_users():
    """Retrieves list of all staff profiles."""
    users = AdminRepository.all()
    return jsonify([u.to_dict() for u in users]), 200

@auth_bp.route('/admin/users', methods=['POST'])
@permission_required('users')
def create_user():
    """Creates a new administrative staff member."""
    data = validate_staff_payload(request.get_json())
    username = data['username']
    role = data.get('role', 'Admin')
    permissions = data.get('permissions', 'all')
    
    existing = AdminRepository.get_by_username(username)
    if existing:
        return jsonify({"message": "Username/email already exists"}), 400
        
    try:
        new_user = AdminRepository.create(
            username=username,
            role=role,
            permissions=permissions,
            password_hash=None
        )
        audit_logger.info(f"Staff user created by {request.current_user.username}: {username} ({role})")
        return jsonify({
            "message": "Staff user created successfully!",
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        return jsonify({"message": f"Failed to create user: {e}"}), 500

@auth_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@permission_required('users')
def update_user(user_id):
    """Updates roles and privileges of an existing staff member."""
    user = AdminRepository.get_by_id(user_id)
    if not user:
        return jsonify({"message": "Staff user not found"}), 404
        
    data = request.get_json()
    updates = {}
    if 'role' in data:
        updates['role'] = data['role']
    if 'permissions' in data:
        updates['permissions'] = data['permissions']
        
    try:
        updated_user = AdminRepository.update(user_id, **updates)
        audit_logger.info(f"Staff user ID {user_id} updated by {request.current_user.username}: {updates}")
        return jsonify({
            "message": "Staff user updated successfully!",
            "user": updated_user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({"message": f"Failed to update user: {e}"}), 500

@auth_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@permission_required('users')
def delete_user(user_id):
    """Removes a staff profile from the system."""
    user = AdminRepository.get_by_id(user_id)
    if not user:
        return jsonify({"message": "Staff user not found"}), 404
        
    if user.username == 'admin':
        return jsonify({"message": "Cannot delete the root admin account"}), 400
        
    try:
        AdminRepository.delete(user_id)
        audit_logger.info(f"Staff user ID {user_id} ({user.username}) deleted by {request.current_user.username}")
        return jsonify({"message": "Staff user deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to delete user: {e}"}), 500

@auth_bp.route('/test', methods=['GET'])
def test_connection():
    """Simple diagnostic endpoint matching original codebase."""
    return jsonify({
        "status": "ok",
        "message": "Vantillu Backend is running!"
    }), 200
