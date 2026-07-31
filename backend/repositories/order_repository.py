from models.order import Order
from repositories.base import BaseRepository

class OrderRepository(BaseRepository):
    """Repository handling database access for Order models."""
    model = Order

    @classmethod
    def all_desc(cls):
        """Retrieves all orders sorted by creation time descending (KDS display)."""
        return cls.model.query.order_by(cls.model.created_at.desc()).all()
