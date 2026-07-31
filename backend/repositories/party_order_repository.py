from models.party_order import PartyOrder
from repositories.base import BaseRepository

class PartyOrderRepository(BaseRepository):
    """Repository handling database access for PartyOrder models."""
    model = PartyOrder

    @classmethod
    def all_desc(cls):
        """Retrieves all catering inquiries sorted by creation time descending."""
        return cls.model.query.order_by(cls.model.created_at.desc()).all()
