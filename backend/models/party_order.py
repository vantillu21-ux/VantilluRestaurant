from datetime import datetime, timezone
from extensions import db

def get_utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class PartyOrder(db.Model):
    __tablename__ = 'party_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    event_type = db.Column(db.String(100), nullable=False) # Birthday, Wedding, Corporate, etc.
    guest_count = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='Pending') # Pending, Approved, Cancelled
    created_at = db.Column(db.DateTime, default=get_utc_now)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'event_type': self.event_type,
            'guest_count': self.guest_count,
            'date': self.date,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
