from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class TagInfo(BaseModel):
    """Embedded tag information in task blueprint responses"""
    id: str
    name: str
    color: str


class WeeklyGoalInfo(BaseModel):
    """Embedded weekly goal information in task blueprint responses"""
    id: str
    text: str


class TaskBlueprintBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: date
    tag_id: Optional[str] = None
    weekly_goal_id: Optional[str] = None
    completed: bool = False
    order: int = 0


class TaskBlueprintCreate(TaskBlueprintBase):
    pass


class TaskBlueprintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    tag_id: Optional[str] = None
    weekly_goal_id: Optional[str] = None
    completed: Optional[bool] = None
    order: Optional[int] = None


class TaskBlueprint(TaskBlueprintBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class TaskBlueprintWithRelations(TaskBlueprint):
    """Task blueprint response with embedded tag and weekly goal information"""
    tag: Optional[TagInfo] = Field(None, description="Tag details if tag_id is set")
    weekly_goal: Optional[WeeklyGoalInfo] = Field(None, description="Weekly goal details if weekly_goal_id is set")
