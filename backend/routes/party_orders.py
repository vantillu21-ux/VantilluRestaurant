from flask import Blueprint, request, jsonify
from extensions import limiter
from repositories.party_order_repository import PartyOrderRepository
from middleware.auth import admin_required
from schemas.party_order import validate_party_payload
from utils.logger import logger, audit_logger

party_orders_bp = Blueprint('party_orders', __name__)

@party_orders_bp.route('', methods=['POST'])
@limiter.limit("5/hour")
def request_party():
    """Submits a large party/catering booking inquiry."""
    data = validate_party_payload(request.get_json())
    
    try:
        new_party = PartyOrderRepository.create(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            event_type=data['event_type'],
            guest_count=int(data['guest_count']),
            date=data['date'],
            description=data.get('description'),
            status='Pending'
        )
        logger.info(f"Party inquiry request {new_party.id} created successfully for {new_party.name}.")
        return jsonify({
            'message': 'Party inquiry submitted successfully!',
            'party_order': new_party.to_dict()
        }), 201
    except Exception as e:
        logger.exception(f"Error submitting party inquiry: {e}")
        return jsonify({"message": f"Failed to submit party inquiry: {e}"}), 500

@party_orders_bp.route('', methods=['GET'])
@admin_required
def get_party_orders():
    """Retrieves all catering inquiries."""
    party_orders = PartyOrderRepository.all_desc()
    return jsonify([p.to_dict() for p in party_orders]), 200

@party_orders_bp.route('/<int:party_id>/status', methods=['PUT'])
@admin_required
def update_party_status(party_id):
    """Updates status on a catering inquiry request (Pending, Approved, Cancelled)."""
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"message": "Field 'status' is required."}), 400
        
    new_status = data['status']
    valid_statuses = ['Pending', 'Approved', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify({"message": f"Invalid status value. Must be one of: {valid_statuses}"}), 400
        
    party = PartyOrderRepository.get_by_id(party_id)
    if not party:
        return jsonify({"message": "Party inquiry not found"}), 404
        
    try:
        updated = PartyOrderRepository.update(party_id, status=new_status)
        audit_logger.info(f"Party inquiry {party_id} status updated to '{new_status}' by {request.current_user.username}.")
        return jsonify({
            'message': f'Party status updated to {new_status}!',
            'party_order': updated.to_dict()
        }), 200
    except Exception as e:
        return jsonify({"message": f"Failed to update party status: {e}"}), 500
