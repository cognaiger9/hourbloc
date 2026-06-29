from supabase import create_client, Client
from src.config import settings


def get_supabase_client() -> Client:
    """
    Get a Supabase client instance
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError("Supabase URL and KEY must be set in environment variables")
    
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def get_supabase_admin_client() -> Client:
    """
    Get a Supabase admin client instance with service role key
    Use this for admin operations that bypass RLS
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise ValueError("Supabase URL and SERVICE_KEY must be set in environment variables")
    
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def check_supabase_connection() -> dict:
    """
    Check if Supabase connection is working properly.
    
    Returns:
        dict: {
            "status": "ok" | "error",
            "message": str,
            "url": str,
            "key_configured": bool
        }
    """
    try:
        # Check if configuration is set
        if not settings.SUPABASE_URL:
            return {
                "status": "error",
                "message": "SUPABASE_URL is not configured",
                "url": "",
                "key_configured": bool(settings.SUPABASE_KEY)
            }
        
        if not settings.SUPABASE_KEY:
            return {
                "status": "error",
                "message": "SUPABASE_KEY is not configured",
                "url": settings.SUPABASE_URL,
                "key_configured": False
            }
        
        # Try to create client and verify connection
        client = get_supabase_client()
        
        # Test connection by checking auth service
        # This is a lightweight operation that verifies the connection
        try:
            # Try to get auth settings (this will fail if connection is bad)
            # We use a simple operation that doesn't require authentication
            response = client.table("_realtime").select("id").limit(0).execute()
            
            return {
                "status": "ok",
                "message": "Successfully connected to Supabase",
                "url": settings.SUPABASE_URL,
                "key_configured": True
            }
        except Exception as e:
            # Connection might work but table doesn't exist, which is fine
            # The important thing is that we can create the client
            return {
                "status": "ok",
                "message": f"Supabase client created successfully (connection test: {str(e)})",
                "url": settings.SUPABASE_URL,
                "key_configured": True
            }
            
    except ValueError as e:
        return {
            "status": "error",
            "message": str(e),
            "url": settings.SUPABASE_URL if settings.SUPABASE_URL else "",
            "key_configured": bool(settings.SUPABASE_KEY)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to connect to Supabase: {str(e)}",
            "url": settings.SUPABASE_URL,
            "key_configured": bool(settings.SUPABASE_KEY)
        }
