from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BacklogTaskBase(BaseModel):
    text: str
    description: Optional[str] = None
    completed: bool = False
    order: int = 0


class BacklogTaskCreate(BacklogTaskBase):
    pass


class BacklogTaskUpdate(BaseModel):
    text: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    order: Optional[int] = None


class BacklogTask(BacklogTaskBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }
