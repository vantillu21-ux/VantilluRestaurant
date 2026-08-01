import datetime
from extensions import db

class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False) # holds the admin's email for Supabase Auth matching
    password_hash = db.Column(db.String(200), nullable=True) # nullable as we shift auth completely to Supabase
    supabase_user_id = db.Column(db.String(255), unique=True, nullable=True)
    role = db.Column(db.String(80), default='Admin')
    permissions = db.Column(db.Text, default='all')
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'supabase_user_id': self.supabase_user_id,
            'role': self.role,
            'permissions': self.permissions,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
