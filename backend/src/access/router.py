from fastapi import APIRouter, Depends
from supabase import Client

from src.dependencies import get_authenticated_user
from src.supabase import get_supabase_admin_client
from src.access.schemas import RedeemInviteRequest, RedeemInviteResponse
from src.access import service as access_service

router = APIRouter()


@router.post("/redeem", response_model=RedeemInviteResponse)
async def redeem_invite(
    body: RedeemInviteRequest,
    user: dict = Depends(get_authenticated_user),
    supabase_admin: Client = Depends(get_supabase_admin_client),
) -> RedeemInviteResponse:
    """
    Allows an authenticated (but not yet allowed) user to redeem an invite code
    and add their email to the access allowlist.
    Uses get_authenticated_user (not get_current_user) so non-allowed users can reach it.
    """
    access_service.redeem_invite(user["email"], body.invite_code, supabase_admin)
    return RedeemInviteResponse(message="Access granted")
