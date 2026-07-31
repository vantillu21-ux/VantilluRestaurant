from models.customer import Customer
from repositories.base import BaseRepository

class CustomerRepository(BaseRepository):
    """Repository handling database access for Customer models."""
    model = Customer

    @classmethod
    def get_by_phone(cls, phone):
        """Retrieves a customer profile record by their unique phone number."""
        return cls.model.query.filter_by(phone=phone).first()
