from datetime import datetime
import json
from flask import Blueprint, request, jsonify
from extensions import limiter
from repositories.order_repository import OrderRepository
from middleware.auth import admin_required
from schemas.order import validate_order_payload
from utils.logger import logger, audit_logger

orders_bp = Blueprint('orders', __name__)

WORKING_HOURS_START = "11:00"
WORKING_HOURS_END = "23:00"

def is_within_working_hours():
    """Validates if the restaurant is within operational hours."""
    now = datetime.now()
    try:
        start_t = datetime.strptime(WORKING_HOURS_START, "%H:%M").time()
        end_t = datetime.strptime(WORKING_HOURS_END, "%H:%M").time()
        current_time = now.time()
        
        if start_t <= end_t:
            return start_t <= current_time <= end_t
        else: # operational hours cross midnight
            return current_time >= start_t or current_time <= end_t
    except Exception:
        return True

def format_time_str(time_str):
    try:
        t = datetime.strptime(time_str, "%H:%M")
        return t.strftime("%I:%M %p").lstrip('0')
    except Exception:
        return time_str

@orders_bp.route('', methods=['POST'])
@limiter.limit("20/minute")
def place_order():
    """Registers a customer order. Supports COD and UPI QR scan-and-pay."""
    # 1. Enforce working hours
    if not is_within_working_hours():
        start_str = format_time_str(WORKING_HOURS_START)
        end_str = format_time_str(WORKING_HOURS_END)
        return jsonify({"message": f"Restaurant is closed. Operational hours: {start_str} to {end_str}."}), 400
        
    data = validate_order_payload(request.get_json())
    payment_method = data.get('payment_method', 'COD')
    
    # For UPI orders, capture the UTR reference number submitted by the customer
    transaction_id = data.get('transaction_id') if payment_method == 'UPI' else None

    try:
        # 2. Save order to database
        new_order = OrderRepository.create(
            customer_name=data['customer_name'],
            phone=data['phone'],
            address=data.get('address'),
            items=json.dumps(data['items']),
            subtotal=float(data['subtotal']),
            packaging=float(data.get('packaging', 0.0)),
            delivery_fee=float(data.get('delivery_fee', 0.0)),
            discount=float(data.get('discount', 0.0)),
            grand_total=float(data['grand_total']),
            order_type=data.get('order_type', 'Delivery'),
            notes=data.get('notes'),
            table_no=data.get('table_no'),
            payment_method=payment_method,
            transaction_id=transaction_id,
            status='Pending'
        )
        
        if payment_method == 'UPI':
            logger.info(f"UPI Order {new_order.id} placed. UTR: {transaction_id}. Pending manual staff verification.")
            audit_logger.info(f"New UPI order #{new_order.id} from {data['phone']}. UTR submitted: {transaction_id}")
        else:
            logger.info(f"COD Order {new_order.id} placed successfully.")

        return jsonify({
            'message': 'Order placed successfully!',
            'order': new_order.to_dict(),
            'payment_required': False
        }), 201
        
    except Exception as e:
        logger.exception(f"Error during order registration: {e}")
        return jsonify({"message": f"Failed to place order: {e}"}), 500


@orders_bp.route('', methods=['GET'])
@admin_required
def get_orders():
    """Retrieves all orders (used by admin portal and KDS dashboard)."""
    orders = OrderRepository.all_desc()
    return jsonify([order.to_dict() for order in orders]), 200

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    """Updates order progression status (KDS controls)."""
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"message": "Field 'status' is required."}), 400
        
    new_status = data['status']
    valid_statuses = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify({"message": f"Invalid status value. Must be one of: {valid_statuses}"}), 400
        
    order = OrderRepository.get_by_id(order_id)
    if not order:
        return jsonify({"success": False, "message": "Order not found"}), 404
        
    try:
        updated = OrderRepository.update(order_id, status=new_status)
        audit_logger.info(f"[UPDATE] Endpoint: /api/orders/{order_id}/status, Record ID: {order_id}, Old Status: {order.status}, New Status: {new_status}, DB commit success: True")
        return jsonify({
            "success": True,
            "message": f"Order status updated to {new_status} successfully!",
            "data": updated.to_dict()
        }), 200
    except Exception as e:
        audit_logger.error(f"[UPDATE] Endpoint: /api/orders/{order_id}/status, Record ID: {order_id}, DB commit success: False")
        return jsonify({"success": False, "message": f"Failed to update order status: {e}"}), 500
