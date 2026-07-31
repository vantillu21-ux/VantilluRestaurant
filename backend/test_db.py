import os
import sys
import socket
from urllib.parse import quote, unquote

# Import dotenv to load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("[*] python-dotenv loaded successfully.")
except ImportError:
    print("[!] python-dotenv not installed. Using raw environment variables.")

def sanitize_and_route_db_url(url):
    if not url:
        return url
    
    # Normalize schemes for SQLAlchemy and psycopg2
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        
    try:
        # Separate query params
        base_url = url
        query_part = ""
        if "?" in url:
            base_url, query_part = url.split("?", 1)
            
        from urllib.parse import parse_qsl, urlencode
        qsl = parse_qsl(query_part)
        qsl_filtered = [(k, v) for k, v in qsl if k.lower() != 'schema']
        
        # Ensure sslmode=require is set
        if not any(k.lower() == 'sslmode' for k, _ in qsl_filtered):
            qsl_filtered.append(('sslmode', 'require'))
            
        new_query = urlencode(qsl_filtered)
        
        # Parse scheme and credentials
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
                    print(f"[*] Detected direct connection to Supabase host: {host}")
                    print("[*] Automatically routing to Supabase Session Pooler (IPv4 compatible)...")
                    
                    region = "ap-south-1"  # Mumbai (default region)
                    try:
                        # Attempt to resolve the direct address to detect region from IP
                        addr_info = socket.getaddrinfo(host, None)
                        for addr in addr_info:
                            ip = addr[4][0]
                            if ip.startswith("2406:da1a"): # Mumbai prefix
                                region = "ap-south-1"
                                break
                            elif ip.startswith("2600:1f18") or ip.startswith("2600:1f1c"): # US-East
                                region = "us-east-1"
                                break
                            elif ip.startswith("2a05:d014"): # EU-Central
                                region = "eu-central-1"
                                break
                    except Exception as dns_err:
                        print(f"[!] Direct host DNS resolution failed during region detection: {dns_err}")
                        print(f"[*] Defaulting to region: {region}")
                    
                    # Update parameters for Supavisor Pooler
                    host = f"aws-0-{region}.pooler.supabase.com"
                    port = "6543"
                    
                    # Session pooler username is: postgres.PROJECT_REF
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
        print(f"[!] Error during URL sanitization: {err}")
        return url

def test_connection():
    print("=" * 60)
    print("DATABASE CONNECTION DIAGNOSTICS")
    print("=" * 60)
    
    # 1. Load DATABASE_URL
    raw_url = os.environ.get("DATABASE_URL")
    if not raw_url:
        print("[!] Error: DATABASE_URL environment variable is not defined.")
        sys.exit(1)
        
    print(f"[*] Raw DATABASE_URL: {raw_url.split('@')[-1] if '@' in raw_url else raw_url} (Password masked)")
    
    # 2. Sanitize and route database URL
    sanitized_url = sanitize_and_route_db_url(raw_url)
    print(f"[*] Sanitized / Routed URI: {sanitized_url.split('@')[-1]} (Password masked)")
    
    # 3. Extract parts for psycopg2 test connection
    try:
        # Quick parsing for test connection parameters
        base_part = sanitized_url.split("?")[0]
        scheme, rest = base_part.split("://")
        userinfo, host_port_db = rest.rsplit("@", 1)
        user, pwd = userinfo.split(":", 1)
        host_port, dbname = host_port_db.split("/", 1)
        if ":" in host_port:
            host, port = host_port.split(":")
        else:
            host, port = host_port, "5432"
            
        # Unescape values for direct psycopg2 connect call
        user = unquote(user)
        pwd = unquote(pwd)
        dbname = unquote(dbname)
        
        print(f"[*] Parsed Host: {host}")
        print(f"[*] Parsed Port: {port}")
        print(f"[*] Parsed Username: {user}")
        print(f"[*] Parsed Database: {dbname}")
    except Exception as parse_err:
        print(f"[!] Failed to parse sanitized URL for connection testing: {parse_err}")
        sys.exit(1)

    # 4. Test DNS Resolution
    print("\n--- Testing Socket DNS Resolution ---")
    try:
        addr_info = socket.getaddrinfo(host, port)
        print(f"[+] DNS Resolution Success for {host}!")
        for idx, addr in enumerate(addr_info):
            print(f"    Address {idx + 1}: {addr[4][0]} (Family: {addr[0]}, SocketType: {addr[1]})")
    except Exception as dns_err:
        print(f"[!] DNS Resolution Failed for {host}: {dns_err}")
        print("    This usually means the hostname is incorrect or your network cannot resolve this host.")
        sys.exit(1)

    # 5. Test connection with psycopg2
    print("\n--- Testing psycopg2 Direct Connection ---")
    try:
        import psycopg2
        print(f"[*] Attempting to connect to {host}:{port} via psycopg2...")
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=pwd,
            database=dbname,
            sslmode="require"
        )
        print("[+] SUCCESS: Connected to Supabase PostgreSQL database directly using psycopg2!")
        
        # Test query
        cur = conn.cursor()
        cur.execute("SELECT version();")
        ver = cur.fetchone()
        print(f"    Database Version: {ver[0]}")
        cur.close()
        conn.close()
        print("[+] Diagnostic check complete. Connection is healthy.")
    except ImportError:
        print("[!] psycopg2 is not installed in the virtual environment. Please run: pip install psycopg2-binary")
        sys.exit(1)
    except Exception as conn_err:
        print(f"[!] psycopg2 Connection Failed: {conn_err}")
        print("    Please double-check your credentials, password, and security group settings on Supabase.")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
