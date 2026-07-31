import os
from datetime import timedelta

class BaseConfig:
    """Base Configuration class with shared default settings."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default_secret_key_change_me')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET', 'jwt_secret_key_change_me')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # SQLAlchemy Configuration
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Pool pre-ping and recycle prevent stale connections to Supabase (300s idle timeout)
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 180,
        "pool_size": 5,
        "max_overflow": 5,
    }
    
    # Supabase Configuration
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    # PhonePe Configuration
    PHONEPE_MERCHANT_ID = os.environ.get('PHONEPE_MERCHANT_ID')
    PHONEPE_SALT_KEY = os.environ.get('PHONEPE_SALT_KEY')
    PHONEPE_SALT_INDEX = os.environ.get('PHONEPE_SALT_INDEX', '1')
    PHONEPE_ENV = os.environ.get('PHONEPE_ENV', 'sandbox') # sandbox or production
    
    # CORS frontend client origin fallback
    CLIENT_URL = os.environ.get('CLIENT_URL', 'http://localhost:3000')

class DevelopmentConfig(BaseConfig):
    """Development Environment Configuration."""
    DEBUG = True
    ENV = 'development'
    # SQLALCHEMY_DATABASE_URI will be loaded dynamically in app.py

class TestingConfig(BaseConfig):
    """Testing Environment Configuration."""
    DEBUG = True
    TESTING = True
    ENV = 'testing'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

class ProductionConfig(BaseConfig):
    """Production Environment Configuration."""
    DEBUG = False
    TESTING = False
    ENV = 'production'

config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig
}
