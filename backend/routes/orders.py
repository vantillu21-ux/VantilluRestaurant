from datetime import datetime
import json
from flask import Blueprint, request, jsonify
from extensions import limiter
from repositories.order_repository import OrderRepository
from middleware.auth import admin_required
from schemas.order import validate_order_payload
from utils.logger import logger, audit_logger
from models.setting import AppSetting
import zoneinfo
from datetime import timezone
import threading
from services.email_service import EmailService
import os

orders_bp = Blueprint('orders', __name__)

def is_within_working_hours():
    """Validates if the restaurant is within operational hours."""
    # Fetch configured timings and timezone
    try:
        opening_setting = AppSetting.query.get("openingTime")
        closing_setting = AppSetting.query.get("closingTime")
        tz_setting = AppSetting.query.get("timezone")
        
        start_time_str = opening_setting.value if opening_setting else "11:00"
        end_time_str = closing_setting.value if closing_setting else "23:00"
        timezone_str = tz_setting.value if tz_setting else "Asia/Kolkata"
        
        # Get correct localized time
        tz = zoneinfo.ZoneInfo(timezone_str)
        now_utc = datetime.now(timezone.utc)
        now_local = now_utc.astimezone(tz)
        
        start_t = datetime.strptime(start_time_str, "%H:%M").time()
        end_t = datetime.strptime(end_time_str, "%H:%M").time()
        current_time = now_local.time()
        
        # requested audit logging
        logger.info(f"Order Validation | UTC: {now_utc.strftime('%H:%M')} | Local ({timezone_str}): {now_local.strftime('%H:%M')} | Configured: {start_time_str} - {end_time_str}")
        
        is_open = False
        if start_t <= end_t:
            is_open = start_t <= current_time <= end_t
        else: # operational hours cross midnight
            is_open = current_time >= start_t or current_time <= end_t
            
        logger.info(f"Computed status: {'OPEN' if is_open else 'CLOSED'}")
        
        return is_open, start_time_str, end_time_str
    except Exception as e:
        logger.error(f"Error validating working hours: {e}")
        return True, "11:00", "23:00"

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
    is_open, start_str_raw, end_str_raw = is_within_working_hours()
    if not is_open:
        start_str = format_time_str(start_str_raw)
        end_str = format_time_str(end_str_raw)
        return jsonify({
            "success": False,
            "message": "Restaurant is currently closed."
        }), 403
        
    data = validate_order_payload(request.get_json())
    
    # Verify email and phone ownership before accepting order
    from models.customer import Customer
    customer = Customer.query.filter_by(phone=data['phone'], email=data.get('customer_email')).first()
    
    if not customer or not customer.email_verified:
        return jsonify({
            "success": False, 
            "message": "Please verify your email before placing an order."
        }), 403

    payment_method = data.get('payment_method', 'COD')
    
    # For UPI orders, capture the UTR reference number submitted by the customer
    transaction_id = data.get('transaction_id') if payment_method == 'UPI' else None
    # Idempotency check
    idempotency_key = data.get('idempotency_key')
    if idempotency_key:
        from models.order import Order
        existing_order = Order.query.filter_by(idempotency_key=idempotency_key).first()
        if existing_order:
            return jsonify({
                "success": True,
                "message": "Order already placed.",
                "data": existing_order.to_dict(),
                "payment_required": False
            }), 200

    try:
        # 2. Save order to database
        new_order = OrderRepository.create(
            customer_name=data['customer_name'],
            customer_email=data.get('customer_email'),
            phone=data['phone'],
            address=data.get('address'),
            items=json.dumps(data['items']),
            subtotal=float(data['subtotal']),
            packaging=float(data.get('packaging', 0.0)),
            delivery_fee=float(data.get('delivery_fee', 0.0)),
            discount=float(data.get('discount', 0.0)),
            grand_total=float(data['grand_total']),
            order_type=data.get('order_type', 'Delivery'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            notes=data.get('notes'),
            table_no=data.get('table_no'),
            payment_method=payment_method,
            transaction_id=transaction_id,
            idempotency_key=idempotency_key,
            status='Pending'
        )
        
        from extensions import db
        db.session.commit()
        
        if payment_method == 'UPI':
            logger.info(f"UPI Order {new_order.id} placed. UTR: {transaction_id}. Pending manual staff verification.")
            audit_logger.info(f"New UPI order #{new_order.id} from {data['phone']}. UTR submitted: {transaction_id}")
        else:
            logger.info(f"COD Order {new_order.id} placed successfully.")

        # Trigger confirmation email in the background
        admin_email = os.environ.get('EMAIL_FROM', 'vantillu21@gmail.com')
        threading.Thread(
            target=EmailService.send_order_confirmation_email,
            args=(new_order.to_dict(), admin_email),
            daemon=True
        ).start()

        return jsonify({
            'success': True,
            'message': 'Order placed successfully!',
            'data': new_order.to_dict(),
            'payment_required': False
        }), 201
        
    except Exception as e:
        from extensions import db
        db.session.rollback()
        logger.exception(f"Error during order registration: {e}")
        return jsonify({"success": False, "message": f"Failed to place order: {e}"}), 500


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
        return jsonify({"success": False, "message": "Field 'status' is required."}), 400
        
    new_status = data['status']
    valid_statuses = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled']
    if data['status'] not in valid_statuses:
        return jsonify({"success": False, "message": "Invalid status."}), 400
        
    from extensions import db
    from models.order import Order
    
    try:
        # Row locking for safety against concurrent updates
        order = db.session.query(Order).with_for_update().get(order_id)
        if not order:
            db.session.rollback()
            return jsonify({"success": False, "message": "Order not found"}), 404
            
        # Optimistic locking
        client_version = data.get('version')
        if client_version is not None:
            if int(client_version) != order.version:
                db.session.rollback()
                return jsonify({
                    "success": False,
                    "message": "Record has been modified by another user.",
                    "action": "refresh_required"
                }), 409
            order.version = order.version + 1

        allowed_transitions = {
            'Pending': ['Accepted', 'Preparing', 'Cancelled'],
            'Accepted': ['Preparing', 'Ready', 'Cancelled'],
            'Preparing': ['Ready', 'Completed', 'Cancelled'],
            'Ready': ['Served', 'Completed', 'Cancelled'],
            'Served': ['Completed', 'Cancelled'],
            'Completed': [],
            'Cancelled': []
        }
        
        if new_status not in allowed_transitions.get(order.status, []):
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Invalid status transition from {order.status} to {new_status}."
            }), 400

        old_status = order.status
        order.status = new_status
        db.session.commit()
        
        audit_logger.info(f"[UPDATE] Endpoint: /api/orders/{order_id}/status, Record ID: {order_id}, Old Status: {old_status}, New Status: {new_status}, DB commit success: True")
        
        if order.customer_email:
            threading.Thread(
                target=EmailService.send_order_status_email,
                args=(order.to_dict(), new_status),
                daemon=True
            ).start()
            
        return jsonify({
            "success": True,
            "message": f"Order status updated to {new_status} successfully!",
            "data": order.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        audit_logger.error(f"[UPDATE] Endpoint: /api/orders/{order_id}/status, Record ID: {order_id}, DB commit success: False")
        return jsonify({"success": False, "message": f"Failed to update order status: {e}"}), 500
