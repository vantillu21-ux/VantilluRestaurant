import logging
from extensions import db

logger = logging.getLogger(__name__)

def init_db(app):
    """Initializes the database connection."""
    db.init_app(app)
    
    db_uri = app.config.get('SQLALCHEMY_DATABASE_URI')
    if not db_uri:
        logger.error("SQLALCHEMY_DATABASE_URI is not set in Flask configuration.")
        raise ValueError("SQLALCHEMY_DATABASE_URI is not set.")
