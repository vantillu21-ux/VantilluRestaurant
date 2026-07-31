from datetime import datetime, timezone
from extensions import db

def get_utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(50), nullable=False)
    guests = db.Column(db.Integer, nullable=False)
    special_requests = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='Pending') # Pending, Confirmed, Cancelled
    created_at = db.Column(db.DateTime, default=get_utc_now)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'date': self.date,
            'time': self.time,
            'guests': self.guests,
            'special_requests': self.special_requests,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
