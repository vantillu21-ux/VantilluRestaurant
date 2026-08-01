from models.order import Order
from repositories.base import BaseRepository

class OrderRepository(BaseRepository):
    """Repository handling database access for Order models."""
    model = Order

    @classmethod
    def all_desc(cls):
        """Retrieves all orders sorted by creation time descending (KDS display)."""
        query = cls.model.query
        if hasattr(cls.model, 'is_deleted'):
            query = query.filter(cls.model.is_deleted == False)
        return query.order_by(cls.model.created_at.desc()).all()

    @classmethod
    def create(cls, **kwargs):
        """Creates an order, automatically generating an order_number if missing."""
        import uuid
        import time
        if 'order_number' not in kwargs:
            kwargs['order_number'] = f"ORD-{int(time.time())}-{str(uuid.uuid4())[:4].upper()}"
        return super().create(**kwargs)
