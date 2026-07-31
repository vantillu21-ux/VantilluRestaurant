from datetime import datetime, timezone
from extensions import db

def get_utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, index=True)
    provider = db.Column(db.String(50), default='PhonePe') # PhonePe
    merchant_txn_id = db.Column(db.String(100), unique=True, nullable=False) # unique generated ID
    phonepe_txn_id = db.Column(db.String(100), nullable=True) # transaction ID from PhonePe
    status = db.Column(db.String(50), default='Pending') # Pending, Success, Failed
    amount = db.Column(db.Integer, nullable=False) # In paise (e.g. 1000 = 10.00 INR)
    response_json = db.Column(db.Text, nullable=True) # Full response JSON dump
    created_at = db.Column(db.DateTime, default=get_utc_now)
    updated_at = db.Column(db.DateTime, default=get_utc_now, onupdate=get_utc_now)

    def to_dict(self):
        import json
        try:
            parsed_response = json.loads(self.response_json) if self.response_json else {}
        except Exception:
            parsed_response = {}
            
        return {
            'id': self.id,
            'order_id': self.order_id,
            'provider': self.provider,
            'merchant_txn_id': self.merchant_txn_id,
            'phonepe_txn_id': self.phonepe_txn_id,
            'status': self.status,
            'amount': self.amount,
            'response_json': parsed_response,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
