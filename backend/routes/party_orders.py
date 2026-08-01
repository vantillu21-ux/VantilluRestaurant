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
    from extensions import db
    
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
        db.session.commit()
        
        logger.info(f"Party inquiry request {new_party.id} created successfully for {new_party.name}.")
        return jsonify({
            'success': True,
            'message': 'Party inquiry submitted successfully!',
            'data': new_party.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.exception(f"Error submitting party inquiry: {e}")
        return jsonify({"success": False, "message": f"Failed to submit party inquiry: {e}"}), 500

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
        
    from extensions import db
    from models.party_order import PartyOrder
    
    try:
        party = db.session.query(PartyOrder).with_for_update().get(party_id)
        if not party:
            db.session.rollback()
            return jsonify({"success": False, "message": "Party inquiry not found"}), 404

        client_updated_at = data.get('updated_at')
        if client_updated_at and party.updated_at:
            if client_updated_at != party.updated_at.isoformat():
                db.session.rollback()
                return jsonify({
                    "success": False,
                    "message": "Record has been modified by another user.",
                    "action": "refresh_required"
                }), 409
                
        old_status = party.status
        party.status = new_status
        db.session.commit()
        
        audit_logger.info(f"[UPDATE] Endpoint: /api/party-orders/{party_id}/status, Record ID: {party_id}, Old Status: {old_status}, New Status: {new_status}, DB commit success: True")
        return jsonify({
            'success': True,
            'message': f'Party status updated to {new_status}!',
            'data': party.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        audit_logger.error(f"[UPDATE] Endpoint: /api/party-orders/{party_id}/status, Record ID: {party_id}, DB commit success: False")
        return jsonify({"success": False, "message": f"Failed to update party status: {e}"}), 500
