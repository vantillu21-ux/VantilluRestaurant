from utils.exceptions import ValidationException

def validate_party_payload(data):
    """Validates parameters for the party catering payload."""
    if not data:
        raise ValidationException("Request payload is empty.")
        
    required_fields = ['name', 'email', 'phone', 'event_type', 'guest_count', 'date']
    for field in required_fields:
        if field not in data or data[field] is None or str(data[field]).strip() == "":
            raise ValidationException(f"Field '{field}' is required.")
            
    try:
        guests = int(data['guest_count'])
        if guests <= 0:
            raise ValueError()
    except ValueError:
        raise ValidationException("Field 'guest_count' must be a positive integer.")
        
    return data
