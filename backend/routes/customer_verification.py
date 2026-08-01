from flask import Blueprint, request, jsonify
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from extensions import db
from models.customer_otp import CustomerEmailOTP
from models.customer import Customer
from services.email_service import EmailService
from utils.logger import logger

customer_verification_bp = Blueprint('customer_verification', __name__)

def get_utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

@customer_verification_bp.route('/send-otp', methods=['POST', 'OPTIONS'])
def send_otp():
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json()
    email = data.get('email')
    phone = data.get('phone')

    if not email or not phone:
        return jsonify({"success": False, "message": "Email and phone are required."}), 400

    # Rate limiting: 60 seconds
    recent_otp = CustomerEmailOTP.query.filter_by(email=email).order_by(CustomerEmailOTP.created_at.desc()).first()
    if recent_otp:
        time_since_created = (get_utc_now() - recent_otp.created_at).total_seconds()
        if time_since_created < 60:
            return jsonify({"success": False, "message": f"Please wait {int(60 - time_since_created)} seconds before requesting a new OTP."}), 429

    # Generate secure 6-digit OTP
    otp = str(secrets.randbelow(1000000)).zfill(6)
    
    # Hash OTP using SHA256
    otp_hash = hashlib.sha256(otp.encode('utf-8')).hexdigest()
    
    # Expire in 10 minutes
    expires_at = get_utc_now() + timedelta(minutes=10)

    new_otp = CustomerEmailOTP(
        email=email,
        phone=phone,
        otp_hash=otp_hash,
        expires_at=expires_at,
        verified=False
    )
    
    db.session.add(new_otp)
    db.session.commit()

    logger.info("[SEND_OTP] Email received")
    logger.info("[SEND_OTP] Phone received")
    logger.info("[SEND_OTP] OTP generated")
    logger.info("[SEND_OTP] OTP hashed")
    logger.info("[SEND_OTP] Saved to database")

    # Send email
    email_sent = EmailService.send_customer_otp_email(email, otp)

    if email_sent:
        logger.info("[SEND_OTP] Brevo email sent")
        return jsonify({
            "success": True,
            "message": "OTP sent successfully"
        }), 200
    else:
        logger.error("[SEND_OTP] Failed to send email via Brevo")
        # In a real app, you might want to rollback the DB transaction here, but for now we'll just return an error
        return jsonify({
            "success": False,
            "message": "Failed to send OTP email."
        }), 500

@customer_verification_bp.route('/verify-otp', methods=['POST', 'OPTIONS'])
def verify_otp():
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({"success": False, "message": "Email and OTP are required."}), 400

    # Find latest OTP
    latest_otp = CustomerEmailOTP.query.filter_by(email=email).order_by(CustomerEmailOTP.created_at.desc()).first()

    if not latest_otp:
        return jsonify({"success": False, "message": "No OTP request found for this email."}), 404

    if latest_otp.verified:
        return jsonify({"success": False, "message": "This OTP has already been verified."}), 400

    if get_utc_now() > latest_otp.expires_at:
        return jsonify({"success": False, "message": "OTP has expired. Please request a new one."}), 400

    # Compare hashes
    provided_hash = hashlib.sha256(str(otp).encode('utf-8')).hexdigest()
    
    if provided_hash != latest_otp.otp_hash:
        return jsonify({"success": False, "message": "Invalid OTP."}), 400

    # Valid OTP
    latest_otp.verified = True
    latest_otp.verified_at = get_utc_now()
    
    logger.info("[VERIFY_OTP] Email found")
    logger.info("[VERIFY_OTP] OTP verified")
    
    # Update or Create Customer
    customer = Customer.query.filter_by(phone=latest_otp.phone).first()
    if customer:
        customer.email = email
        customer.email_verified = True
        customer.phone_verified = True
    else:
        customer = Customer(
            phone=latest_otp.phone,
            email=email,
            email_verified=True,
            phone_verified=True
        )
        db.session.add(customer)

    logger.info("[VERIFY_OTP] Marked verified")

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Email verified"
    }), 200
