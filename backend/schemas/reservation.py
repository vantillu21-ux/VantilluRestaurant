from utils.exceptions import ValidationException

def validate_reservation_payload(data):
    """Validates parameters for the table reservation payload."""
    if not data:
        raise ValidationException("Request payload is empty.")
        
    required_fields = ['name', 'email', 'phone', 'date', 'time', 'guests']
    for field in required_fields:
        if field not in data or data[field] is None or str(data[field]).strip() == "":
            raise ValidationException(f"Field '{field}' is required.")
            
    try:
        guests = int(data['guests'])
        if guests <= 0:
            raise ValueError()
    except ValueError:
        raise ValidationException("Field 'guests' must be a positive integer.")
        
    return data
