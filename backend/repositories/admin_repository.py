from models.admin import Admin
from repositories.base import BaseRepository

class AdminRepository(BaseRepository):
    """Repository handling database access for Admin models."""
    model = Admin

    @classmethod
    def get_by_username(cls, username):
        """Retrieves an admin staff member by their unique username/email."""
        if not username:
            return None
        admin = cls.model.query.filter_by(username=username).first()
        if not admin and '@' in username:
            prefix = username.split('@')[0]
            admin = cls.model.query.filter_by(username=prefix).first()
        return admin

    @classmethod
    def get_by_email(cls, email):
        """Retrieves an admin staff member by their exact email, falling back to username prefix."""
        if not email:
            return None
        admin = cls.model.query.filter_by(email=email).first()
        
        # Fallback for legacy records that might not have the email column populated correctly
        if not admin and '@' in email:
            prefix = email.split('@')[0]
            admin = cls.model.query.filter_by(username=prefix).first()
            
        return admin
