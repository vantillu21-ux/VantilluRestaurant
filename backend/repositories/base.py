from extensions import db

class BaseRepository:
    """Base repository class providing generic SQLAlchemy CRUD operations."""
    model = None

    @classmethod
    def get_by_id(cls, id):
        """Retrieves a single record by its primary key ID."""
        instance = cls.model.query.get(id)
        if instance and hasattr(instance, 'is_deleted') and getattr(instance, 'is_deleted'):
            return None
        return instance

    @classmethod
    def all(cls):
        """Retrieves all records for the model."""
        query = cls.model.query
        if hasattr(cls.model, 'is_deleted'):
            query = query.filter(cls.model.is_deleted == False)
        return query.all()

    @classmethod
    def create(cls, **kwargs):
        """Creates a new record and adds it to the session."""
        instance = cls.model(**kwargs)
        db.session.add(instance)
        return instance

    @classmethod
    def update(cls, id, **kwargs):
        """Updates fields of an existing record by ID."""
        instance = cls.get_by_id(id)
        if not instance:
            return None
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        return instance

    @classmethod
    def delete(cls, id):
        """Deletes a record by ID (soft delete if supported)."""
        instance = cls.get_by_id(id)
        if not instance:
            return False
        
        from datetime import datetime, timezone
        
        if hasattr(instance, 'is_deleted'):
            instance.is_deleted = True
            if hasattr(instance, 'deleted_at'):
                instance.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
        else:
            db.session.delete(instance)
        return True

    @classmethod
    def commit(cls):
        """Commits the active session transaction."""
        db.session.commit()

    @classmethod
    def rollback(cls):
        """Rolls back the active session transaction."""
        db.session.rollback()
