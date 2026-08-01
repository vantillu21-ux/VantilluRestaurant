import re
from utils.exceptions import ValidationException

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def validate_login_payload(data):
    """Validates parameters for the login payload."""
    if not data:
        raise ValidationException("Request payload is empty.")
    if 'username' not in data or not data['username']:
        raise ValidationException("Username/email is required.")
    if 'password' not in data or not data['password']:
        raise ValidationException("Password is required.")
    return data

def validate_staff_payload(data):
    """Validates parameters for staff creation/updating."""
    if not data:
        raise ValidationException("Request payload is empty.")
    if 'username' not in data or not data['username']:
        raise ValidationException("Username is required.")
    if 'password' not in data or not data['password']:
        raise ValidationException("Password is required.")
        
    if 'email' in data and data['email']:
        if not EMAIL_REGEX.match(data['email']):
            raise ValidationException("Invalid email format.")
            
    return data
