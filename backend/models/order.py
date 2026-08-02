from datetime import datetime, timezone
import json
from extensions import db

def get_utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=True, index=True)
    customer_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False, index=True)
    address = db.Column(db.String(255), nullable=True) 
    items = db.Column(db.Text, nullable=False) # JSON-serialized list of items
    subtotal = db.Column(db.Float, nullable=False)
    packaging = db.Column(db.Float, default=0.0)
    delivery_fee = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Float, default=0.0)
    grand_total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Pending') # Pending, Accepted, Preparing, Ready, Served, Completed, Cancelled
    order_type = db.Column(db.String(50), default='Delivery') # Delivery, Pickup, Dine-in
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    table_no = db.Column(db.String(20), nullable=True)
    payment_method = db.Column(db.String(50), default='COD') # COD, PhonePe
    transaction_id = db.Column(db.String(100), nullable=True)
    idempotency_key = db.Column(db.String(100), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=get_utc_now, index=True)
    updated_at = db.Column(db.DateTime, default=get_utc_now, onupdate=get_utc_now, index=True)
    version = db.Column(db.Integer, default=1, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # Relationship to payments (one-to-many relationship)
    payments = db.relationship('Payment', backref='order', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        try:
            parsed_items = json.loads(self.items)
        except Exception:
            parsed_items = []
        return {
            'id': self.id,
            'order_number': self.order_number,
            'customer_name': self.customer_name,
            'phone': self.phone,
            'address': self.address,
            'items': parsed_items,
            'subtotal': self.subtotal,
            'packaging': self.packaging,
            'delivery_fee': self.delivery_fee,
            'discount': self.discount,
            'grand_total': self.grand_total,
            'status': self.status,
            'order_type': self.order_type,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'notes': self.notes,
            'table_no': self.table_no,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'idempotency_key': self.idempotency_key,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else self.created_at.isoformat(),
            'version': self.version
        }
