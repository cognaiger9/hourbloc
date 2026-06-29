from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class WeeklyGoalBase(BaseModel):
    text: str
    description: Optional[str] = None
    completed: bool = False
    order: int = 0
    week_start: date


class WeeklyGoalCreate(WeeklyGoalBase):
    pass


class WeeklyGoalUpdate(BaseModel):
    text: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    order: Optional[int] = None
    week_start: Optional[date] = None


class WeeklyGoal(WeeklyGoalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }
