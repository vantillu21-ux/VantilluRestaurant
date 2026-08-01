import re
from utils.exceptions import ValidationException

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def validate_login_payload(data):
    """Validates parameters for the login payload."""
    if not data:
        raise ValidationException("Request payload is empty.")
    if 'username' not in data or not data['username']:
        raise ValidationException("Username is required.")
    if 'password' not in data or not data['password']:
        raise ValidationException("Password is required.")
    return data

def validate_staff_payload(data, is_update=False):
    """Validates parameters for staff creation/updating."""
    if not data:
        raise ValidationException("Request payload is empty.")
        
    if 'username' not in data or not data['username']:
        raise ValidationException("Username is required.")
        
    if 'email' not in data or not data['email']:
        raise ValidationException("Email is required.")
    elif not EMAIL_REGEX.match(data['email']):
        raise ValidationException("Invalid email format.")
        
    if not is_update:
        if 'password' not in data or not data['password']:
            raise ValidationException("Password is required.")
        elif len(data['password']) < 8:
            raise ValidationException("Password must be at least 8 characters.")
    else:
        if 'password' in data and data['password'] and len(data['password']) < 8:
            raise ValidationException("Password must be at least 8 characters.")
            
    if 'role' not in data or not data['role']:
        raise ValidationException("Role is required.")
        
    if 'permissions' not in data or not data['permissions']:
        raise ValidationException("Permissions are required.")
        
    return data
