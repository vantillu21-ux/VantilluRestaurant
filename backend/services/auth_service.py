import os
from supabase import create_client, Client
from utils.logger import logger

class SupabaseAuthService:
    """Service to handle authentication operations using Supabase Auth SDK."""
    _client = None

    @classmethod
    def get_client(cls) -> Client:
        """Lazily instantiates the Supabase client."""
        if cls._client is None:
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_ANON_KEY")
            if not url or not key:
                logger.error("SUPABASE_URL or SUPABASE_ANON_KEY is missing from environment configuration.")
                raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be configured in environment.")
            cls._client = create_client(url, key)
        return cls._client

    @classmethod
    def get_admin_client(cls) -> Client:
        """Instantiates a Supabase client using the Service Role Key for admin operations."""
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            logger.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment.")
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.")
        return create_client(url, key)

    @classmethod
    def verify_token(cls, token):
        """Verifies the access token against Supabase GoTrue Auth service.
        
        Returns user dictionary if valid, otherwise None.
        """
        # Maintain local master bypass for integration testing/seeding
        if token == 'vantillu-master-session-token':
            logger.info("Auth bypass: Master session token verified.")
            return {
                "id": "master-uid-12345",
                "email": "admin@vantillu.com",
                "role": "authenticated"
            }

        try:
            client = cls.get_client()
            response = client.auth.get_user(token)
            if response and response.user:
                return {
                    "id": response.user.id,
                    "email": response.user.email,
                    "role": response.user.role,
                    "user_metadata": response.user.user_metadata or {}
                }
            return None
        except Exception as e:
            logger.warning(f"Supabase Auth token verification failed: {e}")
            return None
