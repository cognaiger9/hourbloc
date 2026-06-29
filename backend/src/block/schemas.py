from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal


class TagInfo(BaseModel):
    """Embedded tag information in block responses"""
    id: str
    name: str
    color: str


class BlockBase(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    block_type: Literal["planned", "actual"] = Field(..., description="Type of block: 'planned' for calendar display, 'actual' for tracked time")
    tag_id: Optional[str] = None
    notes: Optional[str] = None
    duration_seconds: Optional[int] = Field(None, description="Actual elapsed time in seconds (for 'actual' blocks from timer)")


class BlockCreate(BlockBase):
    pass


class BlockUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    block_type: Optional[Literal["planned", "actual"]] = None
    tag_id: Optional[str] = None
    notes: Optional[str] = None
    duration_seconds: Optional[int] = None


class Block(BlockBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class BlockWithTag(Block):
    """Block response with embedded tag information"""
    tag: Optional[TagInfo] = Field(None, description="Tag details if tag_id is set")
