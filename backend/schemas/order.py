from utils.exceptions import ValidationException

def validate_order_payload(data):
    """Validates parameters for the customer order payload."""
    if not data:
        raise ValidationException("Request payload is empty.")
        
    required_fields = ['customer_name', 'customer_email', 'phone', 'items', 'subtotal', 'grand_total']
    for field in required_fields:
        if field not in data or data[field] is None:
            raise ValidationException(f"Field '{field}' is required.")
            
    # Ensure items is a list of dicts with quantity/price
    items = data.get('items')
    if not isinstance(items, list) or len(items) == 0:
        raise ValidationException("Field 'items' must be a non-empty list of ordered dishes.")
        
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            raise ValidationException(f"Item at index {idx} must be a JSON object.")
        if 'name' not in item or not item['name']:
            raise ValidationException(f"Item at index {idx} is missing a 'name' field.")
        if 'price' not in item or item['price'] is None:
            raise ValidationException(f"Item '{item.get('name', idx)}' is missing a 'price' field.")
        if 'quantity' not in item or item['quantity'] is None:
            raise ValidationException(f"Item '{item.get('name', idx)}' is missing a 'quantity' field.")
            
    # Validate order type
    order_type = data.get('order_type', 'Delivery')
    if order_type not in ['Delivery', 'Pickup', 'Dine-in']:
        raise ValidationException("Order type must be one of: 'Delivery', 'Pickup', 'Dine-in'.")
        
    # Validate payment method
    payment_method = data.get('payment_method', 'COD')
    if payment_method not in ['COD', 'UPI']:
        raise ValidationException("Payment method must be one of: 'COD', 'UPI'.")
        
    return data
