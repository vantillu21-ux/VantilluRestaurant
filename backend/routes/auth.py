import random
from flask import Blueprint, request, jsonify
from extensions import db, limiter
from repositories.admin_repository import AdminRepository
from repositories.customer_repository import CustomerRepository
from services.auth_service import SupabaseAuthService
from middleware.auth import admin_required, permission_required
from schemas.auth import validate_login_payload, validate_staff_payload
from utils.logger import logger, audit_logger
import bcrypt
import datetime
from models.password_reset import PasswordResetToken
from services.email_service import EmailService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/admin/login', methods=['POST', 'OPTIONS'])
@limiter.limit("50/minute")
def login():
    """Handles admin staff sign-in by authenticating against Supabase Auth service."""
    if request.method == 'OPTIONS':
        return '', 204
        
    data = validate_login_payload(request.get_json())
    username = data['username'] # treats username as email for Supabase Auth
    password = data['password']
    
    try:
        supabase_client = SupabaseAuthService.get_client()
        auth_res = supabase_client.auth.sign_in_with_password({
            "email": username,
            "password": password
        })
        
        if auth_res and auth_res.user:
            access_token = auth_res.session.access_token
        else:
            raise Exception("Supabase returned empty user")
            
    except Exception as e:
        # Fallback master validation check for local offline tests/debugging/resets
        admin = AdminRepository.get_by_username(username)
        
        is_valid_fallback = False
        if admin:
            if admin.password_hash:
                try:
                    # Check if it's a valid bcrypt hash before comparing
                    if admin.password_hash.startswith('$2'):
                        is_valid_fallback = bcrypt.checkpw(password.encode('utf-8'), admin.password_hash.encode('utf-8'))
                    else:
                        # Handle case where database has plaintext password (legacy)
                        is_valid_fallback = (password == admin.password_hash)
                except ValueError as err:
                    audit_logger.error(f"Bcrypt validation error for user {username}: {err}")
                    is_valid_fallback = False
            elif password == 'vantillu123' and username == 'admin':
                is_valid_fallback = True

        if is_valid_fallback:
            audit_logger.info("Local authentication bypass successful.")
            return jsonify({
                'token': 'vantillu-master-session-token',
                'username': username,
                'role': admin.role,
                'permissions': admin.permissions,
                'message': 'Login successful'
            }), 200
            
        return jsonify({"message": f"Login failed: Invalid credentials"}), 401

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

@auth_bp.route('/admin/forgot-password', methods=['POST', 'OPTIONS'])
@limiter.limit("20/minute")
def forgot_password():
    """Initiates password reset by sending an OTP."""
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.get_json()
    username = data.get('username')
    
    if not username:
        return jsonify({"message": "Username is required"}), 400
        
    admin = AdminRepository.get_by_username(username)
    if not admin:
        # Return success to prevent user enumeration
        return jsonify({"message": "If the user exists, an OTP has been sent."}), 200
        
    otp = str(random.randint(100000, 999999))
    otp_hash = bcrypt.hashpw(otp.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    token = PasswordResetToken(
        admin_id=admin.id,
        otp_hash=otp_hash,
        expires_at=expires_at
    )
    db.session.add(token)
    db.session.commit()
    
    # Send email
    recipient = username if '@' in username else 'vantillu21@gmail.com'
    if recipient == 'admin':
        recipient = 'vantillu21@gmail.com'

    EmailService.send_otp_email(recipient, otp)
    
    audit_logger.info(f"Password reset OTP generated for: {username}")
    return jsonify({"message": "If the user exists, an OTP has been sent."}), 200

@auth_bp.route('/admin/verify-otp', methods=['POST', 'OPTIONS'])
@limiter.limit("10/minute")
def verify_otp():
    """Verifies the provided OTP."""
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.get_json()
    username = data.get('username')
    otp = data.get('otp')
    
    if not username or not otp:
        return jsonify({"message": "Username and OTP are required"}), 400
        
    admin = AdminRepository.get_by_username(username)
    if not admin:
        return jsonify({"message": "Invalid OTP"}), 400
        
    token = PasswordResetToken.query.filter_by(admin_id=admin.id, used=False).order_by(PasswordResetToken.created_at.desc()).first()
    
    if not token or token.attempts >= 5:
        return jsonify({"message": "Invalid or expired OTP"}), 400
        
    if token.expires_at < datetime.datetime.utcnow():
        return jsonify({"message": "OTP expired"}), 400
        
    if bcrypt.checkpw(otp.encode('utf-8'), token.otp_hash.encode('utf-8')):
        return jsonify({"message": "OTP verified successfully"}), 200
    else:
        token.attempts += 1
        db.session.commit()
        return jsonify({"message": "Invalid OTP"}), 400

@auth_bp.route('/admin/reset-password', methods=['POST', 'OPTIONS'])
@limiter.limit("20/minute")
def reset_password():
    """Resets an admin's password."""
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.get_json()
    username = data.get('username')
    otp = data.get('otp')
    new_password = data.get('newPassword')
    
    if not username or not otp or not new_password:
        return jsonify({"message": "Username, OTP, and newPassword are required"}), 400
        
    admin = AdminRepository.get_by_username(username)
    if not admin:
        return jsonify({"message": "User not found"}), 404
        
    token = PasswordResetToken.query.filter_by(admin_id=admin.id, used=False).order_by(PasswordResetToken.created_at.desc()).first()
    
    if not token or token.attempts >= 5 or token.expires_at < datetime.datetime.utcnow():
        return jsonify({"message": "Invalid or expired OTP"}), 400
        
    if not bcrypt.checkpw(otp.encode('utf-8'), token.otp_hash.encode('utf-8')):
        token.attempts += 1
        db.session.commit()
        return jsonify({"message": "Invalid OTP"}), 400
        
    try:
        # Hash new password
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        AdminRepository.update(admin.id, password_hash=password_hash)
        
        token.used = True
        db.session.commit()
        
        audit_logger.info(f"Password reset successful for user: {username}")
        return jsonify({"message": "Password updated successfully."}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to reset password: {str(e)}"}), 500
