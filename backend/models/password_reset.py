from extensions import db
import datetime

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=False)
    otp_hash = db.Column(db.String(255), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    attempts = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    admin = db.relationship('Admin', backref=db.backref('reset_tokens', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'admin_id': self.admin_id,
            'expires_at': self.expires_at.isoformat(),
            'used': self.used,
            'attempts': self.attempts,
            'created_at': self.created_at.isoformat()
        }
