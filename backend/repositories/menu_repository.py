from models.menu_item import MenuItem
from repositories.base import BaseRepository

class MenuRepository(BaseRepository):
    """Repository handling database access for MenuItem models."""
    model = MenuItem

    @classmethod
    def all_available(cls):
        """Retrieves all available, non-deleted menu items ordered by display_order."""
        return cls.model.query.filter_by(is_deleted=False, is_available=True).order_by(cls.model.display_order.asc()).all()

    @classmethod
    def all_desc(cls):
        """Retrieves all non-deleted menu items."""
        return cls.model.query.filter_by(is_deleted=False).order_by(cls.model.display_order.asc()).all()
