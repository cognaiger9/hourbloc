from fastapi import HTTPException, status
from supabase import Client

from src.config import settings


def redeem_invite(user_email: str, invite_code: str, supabase_admin: Client) -> None:
    """
    Validates the invite code and adds the user's email to the allowed_users table.
    Raises 503 if no code is configured, 403 on wrong code.
    """
    if not settings.INVITE_CODE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Invite codes are not configured on this server.",
        )

    if invite_code != settings.INVITE_CODE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid invite code.",
        )

    supabase_admin.table("allowed_users").upsert(
        {"email": user_email},
        on_conflict="email",
    ).execute()
