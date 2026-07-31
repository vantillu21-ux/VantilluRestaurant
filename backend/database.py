import sys
import socket
import psycopg2
from urllib.parse import unquote
from extensions import db

def init_db(app):
    """Initializes the database connection and runs pre-flight connectivity checks."""
    db.init_app(app)
    
    db_uri = app.config.get('SQLALCHEMY_DATABASE_URI')
    if not db_uri:
        print("[!] Error: SQLALCHEMY_DATABASE_URI is not set in Flask configuration.")
        sys.exit(1)
        
    print("\n" + "=" * 60)
    print("DATABASE INITIALIZATION & CONNECTIVITY TEST")
    print("=" * 60)
    
    is_sqlite = 'sqlite' in db_uri
    
    if not is_sqlite:
        # Extract connection details for psycopg2 testing
        try:
            base_part = db_uri.split("?")[0]
            scheme_creds, host_part = base_part.split("@", 1)
            scheme, creds = scheme_creds.split("://", 1)
            if ":" in creds:
                user, pwd = creds.split(":", 1)
            else:
                user, pwd = creds, ""
            
            if "/" in host_part:
                host_port, dbname = host_part.split("/", 1)
            else:
                host_port, dbname = host_part, "postgres"
                
            if ":" in host_port:
                host, port = host_port.split(":")
            else:
                host = host_port
                port = "5432"
                
            user = unquote(user)
            pwd = unquote(pwd)
            dbname = unquote(dbname)
            
            print(f"[*] Checking connection to host: {host}")
            print(f"[*] Port: {port}")
            print(f"[*] Username: {user}")
            print(f"[*] Database: {dbname}")
            
        except Exception as parse_err:
            print(f"[!] Critical Error: Failed to parse SQLALCHEMY_DATABASE_URI: {parse_err}")
            sys.exit(1)
            
        # 1. Test DNS Resolution
        print("[*] Performing DNS lookup...")
        try:
            addr_info = socket.getaddrinfo(host, int(port))
            print(f"[+] DNS Resolution Succeeded! Host resolves to: {[a[4][0] for a in addr_info]}")
        except Exception as dns_err:
            print(f"\n[!] DNS Resolution Failed for host '{host}': {dns_err}")
            print("\n" + "=" * 60)
            print("DIAGNOSTIC RECOMMENDATION:")
            print("Your local network/ISP might not support IPv6 DNS resolution or routing.")
            print("Please ensure your DATABASE_URL in .env points to the Supabase connection pooler:")
            print("e.g. aws-0-ap-south-1.pooler.supabase.com (port 6543) instead of direct connection.")
            print("Also verify that Connection Pooling is enabled in your Supabase dashboard settings.")
            print("=" * 60)
            sys.exit(1)
            
        # 2. Test database socket connection via psycopg2
        print("[*] Testing database socket connection via psycopg2...")
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=pwd,
                database=dbname,
                sslmode="require",
                connect_timeout=5
            )
            conn.close()
            print("[+] Connection test succeeded!")
            print("=" * 60)
        except Exception as conn_err:
            print(f"\n[!] Database connection failed: {conn_err}")
            print("\n" + "=" * 60)
            print("DIAGNOSTIC RECOMMENDATION:")
            err_str = str(conn_err)
            if "tenant/user" in err_str:
                print("- The pooler did not recognize your project reference.")
                print("- Make sure that Connection Pooling is turned ON in your Supabase project settings.")
                print("- Ensure your project reference in the username (postgres.PROJECT_REF) is correct.")
            elif "password authentication failed" in err_str:
                print("- Incorrect database password. Double check the password in your DATABASE_URL.")
            elif "timeout" in err_str or "connection refused" in err_str:
                print("- The connection timed out. Check if port 6543/5432 is blocked by your firewall/network.")
            else:
                print("- Check your Supabase database status, credentials, and network configuration.")
            print("=" * 60)
            sys.exit(1)
