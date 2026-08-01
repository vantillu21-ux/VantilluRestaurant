from extensions import db
from datetime import datetime

class MenuItem(db.Model):
    __tablename__ = 'menu_items'

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    price_small = db.Column(db.Float, nullable=True)
    price_full = db.Column(db.Float, nullable=True)
    is_available = db.Column(db.Boolean, default=True)
    spice_level = db.Column(db.String(50), nullable=True)
    display_order = db.Column(db.Integer, default=0)
    
    # Audit & Optimistic Locking
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = db.Column(db.Integer, default=1, nullable=False)
    
    # Soft Delete
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'name': self.name,
            'description': self.description,
            'image_url': self.image_url,
            'price_small': self.price_small,
            'price_full': self.price_full,
            'is_available': self.is_available,
            'spice_level': self.spice_level,
            'display_order': self.display_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'version': self.version
        }
