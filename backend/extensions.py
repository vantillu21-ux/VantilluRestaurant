from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask import request

# Instantiate SQLAlchemy and Migrate extensions
db = SQLAlchemy()
migrate = Migrate()

# Instantiate rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[]
)

@limiter.request_filter
def exempt_options():
    return request.method == 'OPTIONS'

talisman = Talisman()
