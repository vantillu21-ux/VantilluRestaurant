from models.reservation import Reservation
from repositories.base import BaseRepository

class ReservationRepository(BaseRepository):
    """Repository handling database access for Reservation models."""
    model = Reservation

    @classmethod
    def all_desc(cls):
        """Retrieves all table reservations sorted by creation time descending."""
        return cls.model.query.order_by(cls.model.created_at.desc()).all()
