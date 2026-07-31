from extensions import db

class BaseRepository:
    """Base repository class providing generic SQLAlchemy CRUD operations."""
    model = None

    @classmethod
    def get_by_id(cls, id):
        """Retrieves a single record by its primary key ID."""
        return cls.model.query.get(id)

    @classmethod
    def all(cls):
        """Retrieves all records for the model."""
        return cls.model.query.all()

    @classmethod
    def create(cls, **kwargs):
        """Creates a new record and commits the session. Rolls back on failure."""
        instance = cls.model(**kwargs)
        try:
            db.session.add(instance)
            db.session.commit()
            return instance
        except Exception:
            db.session.rollback()
            raise

    @classmethod
    def update(cls, id, **kwargs):
        """Updates fields of an existing record by ID and commits. Rolls back on failure."""
        instance = cls.get_by_id(id)
        if not instance:
            return None
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        try:
            db.session.commit()
            return instance
        except Exception:
            db.session.rollback()
            raise

    @classmethod
    def delete(cls, id):
        """Deletes a record by ID and commits. Rolls back on failure."""
        instance = cls.get_by_id(id)
        if not instance:
            return False
        try:
            db.session.delete(instance)
            db.session.commit()
            return True
        except Exception:
            db.session.rollback()
            raise

    @classmethod
    def commit(cls):
        """Commits the active session transaction."""
        db.session.commit()

    @classmethod
    def rollback(cls):
        """Rolls back the active session transaction."""
        db.session.rollback()
