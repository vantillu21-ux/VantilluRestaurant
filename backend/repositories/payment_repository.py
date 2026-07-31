from models.payment import Payment
from repositories.base import BaseRepository

class PaymentRepository(BaseRepository):
    """Repository handling database access for Payment models."""
    model = Payment

    @classmethod
    def get_by_merchant_txn_id(cls, merchant_txn_id):
        """Retrieves a payment transaction by its merchant-facing transaction ID (idempotency checks)."""
        return cls.model.query.filter_by(merchant_txn_id=merchant_txn_id).first()
