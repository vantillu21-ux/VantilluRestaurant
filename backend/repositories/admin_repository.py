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
        """Retrieves an admin staff member by their exact email."""
        if not email:
            return None
        return cls.model.query.filter_by(email=email).first()
