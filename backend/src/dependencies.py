from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from src.supabase import get_supabase_client, get_supabase_admin_client

security = HTTPBearer()


async def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_client)
) -> dict:
    """
    Validates the Supabase JWT and returns the user dict.
    Does NOT check the access allowlist - use get_current_user for protected endpoints.
    """
    token = credentials.credentials

    try:
        response = supabase.auth.get_user(token)

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "id": response.user.id,
            "email": response.user.email,
            "user_metadata": response.user.user_metadata,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    user: dict = Depends(get_authenticated_user),
    supabase_admin: Client = Depends(get_supabase_admin_client)
) -> dict:
    """
    Validates the JWT and then checks that the user's email is in the allowed_users table.
    Raises 403 with detail="access_denied" if not allowed.
    Use this on all regular protected endpoints.
    """
    email = user.get("email")

    resp = (
        supabase_admin
        .table("allowed_users")
        .select("email")
        .eq("email", email)
        .maybe_single()
        .execute()
    )

    if not resp or not resp.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="access_denied",
        )

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
    supabase: Client = Depends(get_supabase_client)
) -> dict | None:
    """
    Dependency to optionally get the current user (doesn't require authentication)

    Usage:
        @router.get("/public")
        async def public_route(user: dict | None = Depends(get_optional_user)):
            if user:
                # User is authenticated
                ...
            else:
                # Public access
                ...
    """
    if not credentials:
        return None

    token = credentials.credentials

    try:
        response = supabase.auth.get_user(token)
        if response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata,
            }
    except Exception:
        pass

    return None
