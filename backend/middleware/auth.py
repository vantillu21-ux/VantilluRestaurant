from functools import wraps
from flask import request, jsonify
from services.auth_service import SupabaseAuthService
from repositories.admin_repository import AdminRepository

def admin_required(f):
    """Decorator to verify standard administrator login status using Supabase Auth."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Authorization token is missing'}), 401
        
        # Verify the access token via Supabase Auth client SDK
        user_data = SupabaseAuthService.verify_token(token)
        if not user_data:
            return jsonify({'message': 'Token is invalid or expired'}), 401
            
        # Match email from Supabase Auth token payload with local database record
        email = user_data.get('email')
        admin = AdminRepository.get_by_email(email)
        if not admin:
            return jsonify({
                'success': False,
                'message': 'Forbidden',
                'details': f'Access denied: {email} is not registered as an administrator'
            }), 403
            
        # Set the logged in admin user object in the request context for endpoint access
        request.current_user = admin
        return f(*args, **kwargs)
    return decorated

def permission_required(permission_name):
    """Decorator to check specific granular permissions for staff accounts."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
            
            if not token:
                return jsonify({'message': 'Authorization token is missing'}), 401
                
            # Verify token via Supabase Auth
            user_data = SupabaseAuthService.verify_token(token)
            if not user_data:
                return jsonify({'message': 'Token is invalid or expired'}), 401
                
            email = user_data.get('email')
            admin = AdminRepository.get_by_email(email)
            if not admin:
                return jsonify({
                    'success': False,
                    'message': 'Forbidden',
                    'details': f'Access denied: {email} is not registered as an administrator'
                }), 403
                
            # Check permissions
            if admin.permissions != 'all':
                user_perms = admin.permissions.split(',')
                if permission_name not in user_perms:
                    return jsonify({'message': f'Access denied: requires {permission_name} permission'}), 403
                    
            request.current_user = admin
            return f(*args, **kwargs)
        return decorated
    return decorator
