from extensions import db
from datetime import datetime

class MenuItem(db.Model):
    __tablename__ = 'menu_items'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    cuisine = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    is_veg = db.Column(db.Boolean, default=True)
    spice_level = db.Column(db.String(50), nullable=True)
    rating = db.Column(db.Float, nullable=True)
    prep_time = db.Column(db.String(50), nullable=True)
    portion_type = db.Column(db.String(50), nullable=True)
    
    # Prices
    price = db.Column(db.Float, nullable=True)
    half_price = db.Column(db.Float, nullable=True)
    full_price = db.Column(db.Float, nullable=True)
    single_price = db.Column(db.Float, nullable=True)
    family_price = db.Column(db.Float, nullable=True)
    jumbo_price = db.Column(db.Float, nullable=True)
    
    # Old model prices (keeping for backwards compatibility if needed)
    price_small = db.Column(db.Float, nullable=True)
    price_full = db.Column(db.Float, nullable=True)

    is_available = db.Column(db.Boolean, default=True)
    is_best_seller = db.Column(db.Boolean, default=False)
    is_chef_special = db.Column(db.Boolean, default=False)
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
            'name': self.name,
            'category': self.category,
            'cuisine': self.cuisine,
            'description': self.description,
            'image': self.image_url,
            'isVeg': self.is_veg,
            'spiceLevel': self.spice_level,
            'rating': self.rating,
            'prepTime': self.prep_time,
            'portionType': self.portion_type,
            'price': self.price,
            'halfPrice': self.half_price,
            'fullPrice': self.full_price,
            'singlePrice': self.single_price,
            'familyPrice': self.family_price,
            'jumboPrice': self.jumbo_price,
            'isBestSeller': self.is_best_seller,
            'isChefSpecial': self.is_chef_special,
            'is_available': self.is_available,
            'display_order': self.display_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'version': self.version
        }
