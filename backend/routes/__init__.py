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
    # Register v1 routes
    app.register_blueprint(auth_bp, url_prefix='/api/v1')
    app.register_blueprint(orders_bp, url_prefix='/api/v1/orders')
    app.register_blueprint(reservations_bp, url_prefix='/api/v1/reservations')
    app.register_blueprint(party_orders_bp, url_prefix='/api/v1/party-orders')
    app.register_blueprint(payments_bp, url_prefix='/api/v1/payments')
    app.register_blueprint(analytics_bp, url_prefix='/api/v1/analytics')
    app.register_blueprint(menu_bp, url_prefix='/api/v1')
    app.register_blueprint(settings_bp, url_prefix='/api/v1/settings')
    
    # Register legacy routes (for backwards compatibility during frontend migration)
    app.register_blueprint(auth_bp, url_prefix='/api', name='auth_legacy')
    app.register_blueprint(orders_bp, url_prefix='/api/orders', name='orders_legacy')
    app.register_blueprint(reservations_bp, url_prefix='/api/reservations', name='reservations_legacy')
    app.register_blueprint(party_orders_bp, url_prefix='/api/party-orders', name='party_orders_legacy')
    app.register_blueprint(payments_bp, url_prefix='/api/payments', name='payments_legacy')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics', name='analytics_legacy')
    app.register_blueprint(menu_bp, url_prefix='/api', name='menu_legacy')
    app.register_blueprint(settings_bp, url_prefix='/api/settings', name='settings_legacy')
    
    # Customer verification
    app.register_blueprint(customer_verification_bp)
