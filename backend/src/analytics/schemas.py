from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, List, Set
from datetime import datetime, date
from src.tag.schemas import Tag as TagSchema


# Shared models
class WorkTimeByTag(BaseModel):
    tag: str
    time: str
    percentage: float
    color: str


class TimelineBar(BaseModel):
    start: float
    width: float
    color: str
    opacity: float
    borderColor: Optional[str] = None
    borderOpacity: Optional[float] = None
    hasDots: Optional[bool] = None
    title: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    startDateTime: Optional[str] = None  # ISO 8601 datetime string
    endDateTime: Optional[str] = None  # ISO 8601 datetime string


# Day Analytics models
class DayAnalytics(BaseModel):
    date: str
    totalWorkTime: str
    totalBlocks: int
    workTimeByTag: List[WorkTimeByTag]
    plannedBars: List[TimelineBar]
    actualBars: List[TimelineBar]


# Week Analytics models
class WeekDayTag(BaseModel):
    tag: str
    minutes: int
    color: str


class WeekDailyData(BaseModel):
    dayName: str
    date: str
    fullDate: str
    workTime: str
    workTimeMinutes: int
    tags: List[WeekDayTag]


class WeekAnalytics(BaseModel):
    weekStart: str
    weekEnd: str
    totalWorkTime: str
    previousWeekWorkTime: str
    totalBlocks: int
    workTimeByTag: List[WorkTimeByTag]
    dailyData: List[WeekDailyData]


# Year Analytics models
class SummaryStat(BaseModel):
    label: str
    value: str


class DailyActivity(BaseModel):
    hasActivity: bool
    workTime: Optional[str] = None
    blocks: Optional[int] = None


class MonthlyActivity(BaseModel):
    month: str
    hours: str
    monthIndex: int
    dailyActivity: Dict[str, DailyActivity]


class YearAnalytics(BaseModel):
    year: int
    summaryStats: List[SummaryStat]
    workTimeByTag: List[WorkTimeByTag]
    monthlyActivityBase: List[MonthlyActivity]


# Overview Analytics models
class TodayData(BaseModel):
    date: str
    workTime: str
    blocks: int


class LifetimeData(BaseModel):
    totalWorkTime: str
    totalBlocks: int
    workDays: int


class StreaksData(BaseModel):
    currentStreak: int
    bestStreak: int
    message: str


class CalendarData(BaseModel):
    month: int
    year: int
    daysWorked: int
    totalDays: int
    avgWorkDay: str
    totalWork: str


class HeatmapDay(BaseModel):
    day: int
    opacity: float
    hasWork: bool
    workTime: Optional[str] = None
    blocks: Optional[int] = None


class OverviewAnalytics(BaseModel):
    today: TodayData
    lifetime: LifetimeData
    streaks: StreaksData
    calendar: CalendarData
    heatmap: List[HeatmapDay]


# Database-specific models for analytics queries

class BlockWithTag(BaseModel):
    """
    Block model with optional joined tag data.
    Used when include_tags=True in get_user_blocks.
    """
    id: str
    user_id: str
    block_type: str
    title: str
    start_time: datetime
    end_time: datetime
    tag_id: Optional[str] = None
    tags: Optional[TagSchema] = None
    notes: Optional[str] = None
    duration_seconds: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    @field_validator('start_time', 'end_time', 'created_at', 'updated_at', 'deleted_at', mode='before')
    @classmethod
    def parse_datetime(cls, value):
        """Parse datetime strings from Supabase"""
        if isinstance(value, str):
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        return value


class BlocksAggregate(BaseModel):
    """Aggregated statistics for user blocks"""
    total_work_minutes: float
    total_blocks: int
    work_days: int


class StreakData(BaseModel):
    """Streak information for user work days"""
    current_streak: int
    best_streak: int
    work_days: Set[date]
