from utils.exceptions import ValidationException

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
        raise ValidationException("Username/email is required.")
    return data
