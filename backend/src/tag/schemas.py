from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TagBase(BaseModel):
    name: str
    color: str


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class Tag(TagBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }
