from extensions import db

class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False) # holds the admin's email for Supabase Auth matching
    password_hash = db.Column(db.String(200), nullable=True) # nullable as we shift auth completely to Supabase
    role = db.Column(db.String(80), default='Admin')
    permissions = db.Column(db.Text, default='all')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'permissions': self.permissions
        }
