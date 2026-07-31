import base64
import json
from flask import Blueprint, request, jsonify
from extensions import limiter
from repositories.payment_repository import PaymentRepository
from repositories.order_repository import OrderRepository
from services.phonepe import PhonePeService
from utils.logger import payment_logger, audit_logger

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/phonepe/callback', methods=['POST'])
@limiter.limit("60/minute")
def phonepe_callback():
    """Secure webhook callback endpoint for PhonePe payment events."""
    x_verify = request.headers.get("X-VERIFY")
    if not x_verify:
        payment_logger.warning("PhonePe callback rejected: Missing X-VERIFY header.")
        return jsonify({"message": "Missing verification header"}), 400
        
    req_json = request.get_json()
    if not req_json or 'response' not in req_json:
        payment_logger.warning("PhonePe callback rejected: Missing response string in payload.")
        return jsonify({"message": "Missing response payload"}), 400
        
    response_base64 = req_json['response']
    
    # 1. Verify Webhook Signature Checksum
    is_valid = PhonePeService.verify_webhook_signature(response_base64, x_verify)
    if not is_valid:
        payment_logger.error("PhonePe callback rejected: Checksum signature mismatch.")
        return jsonify({"message": "Invalid signature verification"}), 401
        
    # 2. Decode Payload
    try:
        decoded_bytes = base64.b64decode(response_base64)
        response_data = json.loads(decoded_bytes.decode('utf-8'))
    except Exception as parse_err:
        payment_logger.exception(f"PhonePe callback: Failed to decode response JSON: {parse_err}")
        return jsonify({"message": "Decoding failed"}), 400
        
    success = response_data.get("success")
    code = response_data.get("code")
    data_block = response_data.get("data", {})
    merchant_txn_id = data_block.get("merchantTransactionId")
    phonepe_txn_id = data_block.get("transactionId")
    amount = data_block.get("amount")
    
    payment_logger.info(f"PhonePe callback received for {merchant_txn_id}. Success: {success}, Code: {code}")
    
    # 3. Retrieve payment record from DB
    payment_rec = PaymentRepository.get_by_merchant_txn_id(merchant_txn_id)
    if not payment_rec:
        payment_logger.error(f"PhonePe callback: Payment record not found for MerchantTxnId: {merchant_txn_id}")
        return jsonify({"message": "Payment transaction record not found"}), 404
        
    # Idempotency Check: Ignore duplicates if transaction is already finalized
    if payment_rec.status in ['Success', 'Failed']:
        payment_logger.info(f"PhonePe callback: Payment {merchant_txn_id} is already finalized ({payment_rec.status}). Ignoring duplicate callback.")
        return jsonify({"message": "Callback processed (duplicate ignored)"}), 200

    # 4. Anti-Fraud Double Check: Verify status directly from PhonePe's server API
    status_response = PhonePeService.check_transaction_status(merchant_txn_id)
    if not status_response or not status_response.get("success"):
        payment_logger.error(f"PhonePe status verification API failed or returned failure for {merchant_txn_id}.")
        PaymentRepository.update(payment_rec.id, status='Failed', phonepe_txn_id=phonepe_txn_id, response_json=json.dumps(response_data))
        OrderRepository.update(payment_rec.order_id, status='Cancelled')
        # Return 200 to PhonePe so it does not retry — DB is already updated
        return jsonify({"message": "Transaction status verification failed. Order cancelled."}), 200

    # Double check transaction code from Status check response
    status_code = status_response.get("code")
    if status_code == "PAYMENT_SUCCESS":
        # Update payment to Success
        PaymentRepository.update(
            payment_rec.id, 
            status='Success', 
            phonepe_txn_id=phonepe_txn_id, 
            response_json=json.dumps(response_data)
        )
        # Update corresponding Order status to Accepted (KDS start)
        OrderRepository.update(payment_rec.order_id, status='Accepted', transaction_id=phonepe_txn_id)
        payment_logger.info(f"Payment success verified for {merchant_txn_id}. Order {payment_rec.order_id} status updated to 'Accepted'.")
        audit_logger.info(f"Payment success for Order {payment_rec.order_id} via PhonePe Transaction: {phonepe_txn_id}")
    else:
        # Transaction failed
        PaymentRepository.update(
            payment_rec.id, 
            status='Failed', 
            phonepe_txn_id=phonepe_txn_id, 
            response_json=json.dumps(response_data)
        )
        OrderRepository.update(payment_rec.order_id, status='Cancelled')
        payment_logger.warning(f"Payment failed verified for {merchant_txn_id}. Order {payment_rec.order_id} marked as 'Cancelled'.")
        
    return jsonify({"message": "Webhook processed successfully"}), 200

@payments_bp.route('/phonepe/status/<string:merchant_txn_id>', methods=['GET'])
@limiter.limit("10/minute")
def check_payment_status(merchant_txn_id):
    """Enables frontend to query transaction payment status."""
    payment_rec = PaymentRepository.get_by_merchant_txn_id(merchant_txn_id)
    if not payment_rec:
        return jsonify({"message": "Payment transaction record not found"}), 404
        
    # If pending locally, execute status api check directly
    if payment_rec.status == 'Pending':
        status_res = PhonePeService.check_transaction_status(merchant_txn_id)
        if status_res and status_res.get("success"):
            code = status_res.get("code")
            if code == "PAYMENT_SUCCESS":
                PaymentRepository.update(payment_rec.id, status='Success')
                OrderRepository.update(payment_rec.order_id, status='Accepted', transaction_id=payment_rec.phonepe_txn_id)
            elif code in ["PAYMENT_ERROR", "PAYMENT_DECLINED", "TIMED_OUT"]:
                PaymentRepository.update(payment_rec.id, status='Failed')
                OrderRepository.update(payment_rec.order_id, status='Cancelled')
                
    # Re-retrieve updated status
    payment_rec = PaymentRepository.get_by_merchant_txn_id(merchant_txn_id)
    return jsonify(payment_rec.to_dict()), 200
