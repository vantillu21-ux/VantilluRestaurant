from routes.auth import auth_bp
from routes.orders import orders_bp
from routes.reservations import reservations_bp
from routes.party_orders import party_orders_bp
from routes.payments import payments_bp
from routes.analytics import analytics_bp
from routes.menu import menu_bp
from routes.settings import settings_bp
from routes.customer_verification import customer_verification_bp

def register_blueprints(app):
    """Registers all Blueprint packages with standard compatibility routes matching your frontend."""
    # Mount auth blueprint (handles /api/otp/send, /api/otp/verify, /api/admin/login, /api/admin/users)
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    # Mount other blueprints under their respective paths
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(reservations_bp, url_prefix='/api/reservations')
    app.register_blueprint(party_orders_bp, url_prefix='/api/party-orders')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(menu_bp, url_prefix='/api')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    app.register_blueprint(customer_verification_bp)
