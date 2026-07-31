import os
import base64
import hashlib
import hmac
import json
import requests
from utils.logger import payment_logger

class PhonePeService:
    """Service to handle transactions and signature verification with PhonePe Payment Gateway."""

    @classmethod
    def _get_config(cls):
        """Retrieves and checks PhonePe credentials."""
        merchant_id = os.environ.get("PHONEPE_MERCHANT_ID")
        salt_key = os.environ.get("PHONEPE_SALT_KEY")
        salt_index = os.environ.get("PHONEPE_SALT_INDEX", "1")
        env = os.environ.get("PHONEPE_ENV", "sandbox").lower()
        
        if not merchant_id or not salt_key:
            payment_logger.error("PhonePe Merchant ID or Salt Key is missing in environment variables.")
            
        base_url = (
            "https://api.phonepe.com/apis/hermes" 
            if env == "production" 
            else "https://api-preprod.phonepe.com/apis/pg-sandbox"
        )
        return merchant_id, salt_key, salt_index, base_url

    @classmethod
    def _calculate_checksum(cls, payload, endpoint, salt_key, salt_index):
        """Calculates X-VERIFY checksum: SHA256(payload + endpoint + salt_key) + '###' + salt_index."""
        raw_string = f"{payload}{endpoint}{salt_key}"
        sha256_hash = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()
        return f"{sha256_hash}###{salt_index}"

    @classmethod
    def initiate_payment(cls, merchant_txn_id, amount_in_paise, user_id, redirect_url, callback_url, phone_number=None):
        """Initiates a payment request (creates payment session).
        
        Returns redirect URL to the payment page, or None on failure.
        """
        merchant_id, salt_key, salt_index, base_url = cls._get_config()
        if not merchant_id or not salt_key:
            payment_logger.error("PhonePe misconfigured: cannot initiate payment.")
            return None

        # Build payload dictionary
        payload = {
            "merchantId": merchant_id,
            "merchantTransactionId": merchant_txn_id,
            "merchantUserId": str(user_id),
            "amount": int(amount_in_paise),
            "redirectUrl": redirect_url,
            "redirectMode": "POST", # PhonePe redirects customer via POST back to frontend
            "callbackUrl": callback_url,
            "paymentInstrument": {
                "type": "PAY_PAGE"
            }
        }
        if phone_number:
            payload["mobileNumber"] = str(phone_number)

        # Base64 encode the payload
        json_payload = json.dumps(payload)
        base64_payload = base64.b64encode(json_payload.encode('utf-8')).decode('utf-8')

        endpoint = "/pg/v1/pay"
        x_verify = cls._calculate_checksum(base64_payload, endpoint, salt_key, salt_index)

        headers = {
            "Content-Type": "application/json",
            "X-VERIFY": x_verify
        }
        
        api_url = f"{base_url}{endpoint}"
        payment_logger.info(f"Initiating PhonePe payment for MerchantTxnId: {merchant_txn_id}, Amount: {amount_in_paise} paise")

        try:
            response = requests.post(api_url, json={"request": base64_payload}, headers=headers, timeout=10)
            response_json = response.json()
            
            if response.status_code == 200 and response_json.get("success"):
                instrument_url = response_json["data"]["instrumentResponse"]["redirectInfo"]["url"]
                payment_logger.info(f"PhonePe payment session created successfully for {merchant_txn_id}.")
                return instrument_url
            else:
                payment_logger.error(f"PhonePe Payment initiation failed: {response_json.get('message', 'Unknown Error')}")
                return None
        except Exception as e:
            payment_logger.exception(f"Error during PhonePe payment connection: {e}")
            return None

    @classmethod
    def verify_webhook_signature(cls, response_base64, received_x_verify):
        """Verifies that the callback webhook signature matches PhonePe checksum."""
        merchant_id, salt_key, salt_index, _ = cls._get_config()
        if not salt_key:
            return False

        # Webhook signature format: SHA256(base64_response + salt_key) + '###' + salt_index
        raw_string = f"{response_base64}{salt_key}"
        sha256_hash = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()
        calculated_x_verify = f"{sha256_hash}###{salt_index}"
        
        # Use constant-time comparison to prevent timing oracle attacks
        return hmac.compare_digest(calculated_x_verify, received_x_verify)

    @classmethod
    def check_transaction_status(cls, merchant_txn_id):
        """Queries PhonePe's transaction status API directly.
        
        Returns the parsed response dictionary or None.
        """
        merchant_id, salt_key, salt_index, base_url = cls._get_config()
        if not merchant_id or not salt_key:
            payment_logger.error("PhonePe misconfigured: cannot check status.")
            return None

        endpoint = f"/pg/v1/status/{merchant_id}/{merchant_txn_id}"
        x_verify = cls._calculate_checksum("", endpoint, salt_key, salt_index)

        headers = {
            "Content-Type": "application/json",
            "X-VERIFY": x_verify,
            "X-MERCHANT-ID": merchant_id
        }

        api_url = f"{base_url}{endpoint}"
        payment_logger.info(f"Querying PhonePe Status API for Txn: {merchant_txn_id}")

        try:
            response = requests.get(api_url, headers=headers, timeout=10)
            response_json = response.json()
            
            if response.status_code == 200:
                payment_logger.info(f"PhonePe Status query returned success status for {merchant_txn_id}.")
                return response_json
            else:
                payment_logger.error(f"PhonePe Status query returned HTTP {response.status_code}: {response_json}")
                return response_json
        except Exception as e:
            payment_logger.exception(f"Error querying PhonePe transaction status: {e}")
            return None
