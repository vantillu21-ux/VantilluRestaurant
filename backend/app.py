import os
import sys
import time
import socket
from urllib.parse import quote, unquote
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
if os.path.exists(".env"):
    load_dotenv()

from config import config_by_name
from extensions import db, migrate, limiter, talisman
from database import init_db
from routes import register_blueprints
from utils.exceptions import register_error_handlers
from utils.logger import logger

APP_START_TIME = time.time()

def sanitize_and_route_db_url(url):
    """Sanitizes connection URL, percent-encodes password, and routes to connection pooler."""
    if not url:
        return url
        
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        
    try:
        base_url = url
        query_part = ""
        if "?" in url:
            base_url, query_part = url.split("?", 1)
            
        from urllib.parse import parse_qsl, urlencode
        qsl = parse_qsl(query_part)
        qsl_filtered = [(k, v) for k, v in qsl if k.lower() != 'schema']
        
        if not any(k.lower() == 'sslmode' for k, _ in qsl_filtered):
            qsl_filtered.append(('sslmode', 'require'))
            
        new_query = urlencode(qsl_filtered)
        scheme, rest = base_url.split("://", 1)
        
        if "@" in rest:
            userinfo, host_port_db = rest.rsplit("@", 1)
            
            if ":" in userinfo:
                username, password = userinfo.split(":", 1)
            else:
                username = userinfo
                password = ""
                
            if "/" in host_port_db:
                host_port, dbname = host_port_db.split("/", 1)
            else:
                host_port = host_port_db
                dbname = "postgres"
                
            if ":" in host_port:
                host, port = host_port.split(":")
            else:
                host = host_port
                port = "5432"
                
            # Auto-routing for Supabase Direct IPv6-only connections
            if host.endswith(".supabase.co") and host.startswith("db."):
                parts = host.split(".")
                if len(parts) >= 3:
                    project_ref = parts[1]
                    logger.info(f"Detected direct Supabase host connection: {host}")
                    
                    region = "ap-south-1"  # Mumbai (default)
                    try:
                        addr_info = socket.getaddrinfo(host, None)
                        for addr in addr_info:
                            ip = addr[4][0]
                            if ip.startswith("2406:da1a"):
                                region = "ap-south-1"
                                break
                            elif ip.startswith("2600:1f18") or ip.startswith("2600:1f1c"):
                                region = "us-east-1"
                                break
                            elif ip.startswith("2a05:d014"):
                                region = "eu-central-1"
                                break
                    except Exception as dns_err:
                        logger.warning(f"DNS lookup failed during region detection: {dns_err}. Using default: {region}")
                    
                    host = f"aws-1-{region}.pooler.supabase.com"
                    port = "5432"
                    
                    if not username.endswith(f".{project_ref}"):
                        username = f"{username}.{project_ref}"
            
            # Percent-encode password
            unquoted_password = unquote(password)
            quoted_password = quote(unquoted_password, safe="")
            
            rebuilt_userinfo = f"{username}:{quoted_password}" if quoted_password else username
            base_url = f"{scheme}://{rebuilt_userinfo}@{host}:{port}/{dbname}"
            
        if new_query:
            url = f"{base_url}?{new_query}"
        else:
            url = base_url
            
        return url
    except Exception as err:
        logger.error(f"Error during URL sanitization: {err}")
        return url

def create_app(config_name=None):
    """Application factory for setting up the Flask context."""
    app = Flask(__name__)
    
    # Load configuration classes
    if not config_name:
        config_name = os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config_by_name[config_name])
    
    # Sanitize and mount database URL
    raw_db_url = os.environ.get('DATABASE_URL')
    if not raw_db_url:
        logger.error("DATABASE_URL is missing from environment. Application cannot start.")
        raise ValueError("DATABASE_URL is missing from environment.")
        
    database_url = sanitize_and_route_db_url(raw_db_url)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    
    # Initialize CORS (allow both localhost and Vercel)
    allowed_origins = [
        "http://localhost:3000",
        "https://vantillu-restaurant.vercel.app"
    ]
    env_client_url = app.config.get('CLIENT_URL')
    if env_client_url and env_client_url not in allowed_origins:
        allowed_origins.append(env_client_url)
        
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})
    
    # Initialize pre-flight checks and Database
    init_db(app)
    
    # Initialize Migrate and Rate Limiter
    migrate.init_app(app, db)
    limiter.init_app(app)
    
    # Initialize Security Headers (Flask-Talisman)
    # Set force_https=False in development to prevent local browser SSL complaints
    is_prod = config_name == 'production'
    talisman.init_app(app, force_https=is_prod, content_security_policy=None)
    
    # Register blueprints and error handlers
    register_blueprints(app)
    register_error_handlers(app)
    
    # ------------------ HEALTH ENDPOINTS ------------------
    @app.route('/health', methods=['GET'])
    def health_check():
        """Shallow check for load-balancers."""
        return jsonify({
            "status": "healthy",
            "environment": config_name,
            "version": "1.0.0"
        }), 200

    @app.route('/health/ready', methods=['GET'])
    def deep_health_check():
        """Deep check for database connectivity and latency."""
        db_status = "ok"
        db_error = None
        latency_ms = None
        
        start_time = time.time()
        try:
            # Query db directly to verify connection latency
            db.session.execute(db.text("SELECT 1"))
            latency_ms = round((time.time() - start_time) * 1000, 2)
        except Exception as e:
            db_status = "error"
            db_error = str(e)
            
        uptime_seconds = round(time.time() - APP_START_TIME, 2)
        
        status_code = 200 if db_status == "ok" else 503
        response = {
            "status": "healthy" if db_status == "ok" else "unhealthy",
            "environment": config_name,
            "version": "1.0.0",
            "uptime_seconds": uptime_seconds,
            "database": {
                "status": db_status,
                "latency_ms": latency_ms
            }
        }
        if db_error:
            response["database"]["error"] = db_error
            
        return jsonify(response), status_code

    return app

# Instantiate the app instance (used by Gunicorn)
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('DEBUG', False))
