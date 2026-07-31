from flask import Blueprint, request, jsonify
from extensions import limiter
from repositories.reservation_repository import ReservationRepository
from middleware.auth import admin_required
from schemas.reservation import validate_reservation_payload
from utils.logger import logger, audit_logger

reservations_bp = Blueprint('reservations', __name__)

@reservations_bp.route('', methods=['POST'])
@limiter.limit("10/minute")
def book_table():
    """Registers a table reservation request."""
    data = validate_reservation_payload(request.get_json())
    
    try:
        new_res = ReservationRepository.create(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            date=data['date'],
            time=data['time'],
            guests=int(data['guests']),
            special_requests=data.get('special_requests'),
            status='Pending'
        )
        logger.info(f"Table reservation request {new_res.id} booked successfully for {new_res.name}.")
        return jsonify({
            'message': 'Table reserved successfully!',
            'reservation': new_res.to_dict()
        }), 201
    except Exception as e:
        logger.exception(f"Error booking table: {e}")
        return jsonify({"message": f"Failed to reserve table: {e}"}), 500

@reservations_bp.route('', methods=['GET'])
@admin_required
def get_reservations():
    """Retrieves all reservations."""
    reservations = ReservationRepository.all_desc()
    return jsonify([res.to_dict() for res in reservations]), 200

@reservations_bp.route('/<int:res_id>/status', methods=['PUT'])
@admin_required
def update_reservation_status(res_id):
    """Updates status on a reservation request (Pending, Confirmed, Cancelled)."""
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"message": "Field 'status' is required."}), 400
        
    new_status = data['status']
    valid_statuses = ['Pending', 'Confirmed', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify({"message": f"Invalid status value. Must be one of: {valid_statuses}"}), 400
        
    res = ReservationRepository.get_by_id(res_id)
    if not res:
        return jsonify({"message": "Reservation not found"}), 404
        
    try:
        updated = ReservationRepository.update(res_id, status=new_status)
        audit_logger.info(f"Reservation {res_id} status updated to '{new_status}' by {request.current_user.username}.")
        return jsonify({
            'message': f'Reservation status updated to {new_status}!',
            'reservation': updated.to_dict()
        }), 200
    except Exception as e:
        return jsonify({"message": f"Failed to update reservation status: {e}"}), 500
