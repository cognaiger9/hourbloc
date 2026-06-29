from pydantic import BaseModel


class RedeemInviteRequest(BaseModel):
    invite_code: str


class RedeemInviteResponse(BaseModel):
    message: str
