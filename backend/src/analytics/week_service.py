"""
Week analytics service.

Provides weekly analytics with daily breakdown and week-over-week comparison.
"""

from supabase import Client
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta, date
from collections import defaultdict

from src.analytics.database import get_user_blocks
from src.analytics.utils import format_time_duration
from src.analytics.schemas import BlockWithTag, WeekAnalytics, WeekDailyData, WeekDayTag
from src.analytics.helpers import (
    build_tag_map_from_blocks,
    calculate_work_time_by_tag,
    calculate_period_work_minutes
)


class WeekAnalyticsService:
    """Service for week-level analytics with daily breakdown."""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_week_analytics(
        self,
        user_id: str,
        start_date: date,
        timezone_offset: int
    ) -> WeekAnalytics:
        """
        Get analytics for a specific week for the authenticated user.
        Week is 7 days starting from start_date (Monday).

        Includes total work time, previous week comparison, daily breakdown
        with tag information for each day.

        Args:
            user_id: User ID
            start_date: Week start date in user's local timezone (Monday)
            timezone_offset: Timezone offset in minutes from UTC (e.g., -480 for PST)

        Returns:
            WeekAnalytics with weekly totals, comparison, and daily breakdown
        """
        # Calculate week boundaries in user's local timezone, then convert to UTC
        local_week_start = datetime.combine(start_date, datetime.min.time())
        local_week_end = datetime.combine(start_date + timedelta(days=6), datetime.max.time())

        week_start = (local_week_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
        week_end = (local_week_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

        # Calculate previous week boundaries
        prev_week_start = week_start - timedelta(days=7)
        prev_week_end = prev_week_start + timedelta(days=6, hours=23, minutes=59, seconds=59)

        # Query blocks for current week (with buffer for overlapping blocks) with tags joined
        current_week_blocks = get_user_blocks(
            self.supabase,
            user_id,
            block_type="actual",
            start_date=week_start - timedelta(days=1),
            end_date=week_end + timedelta(days=1),
            include_deleted=False,
            include_tags=True
        )

        # Query blocks for previous week
        prev_week_blocks = get_user_blocks(
            self.supabase,
            user_id,
            block_type="actual",
            start_date=prev_week_start - timedelta(days=1),
            end_date=prev_week_end + timedelta(days=1),
            include_deleted=False
        )

        # Filter blocks that overlap with current week
        week_blocks = []
        for block in current_week_blocks:
            block_start = block.start_time
            block_end = block.end_time
            if block_start < week_end and block_end > week_start:
                week_blocks.append(block)

        # Filter blocks that overlap with previous week
        prev_week_blocks_filtered = []
        for block in prev_week_blocks:
            block_start = block.start_time
            block_end = block.end_time
            if block_start < prev_week_end and block_end > prev_week_start:
                prev_week_blocks_filtered.append(block)

        # Build tag map from joined tag data in current week blocks
        tag_map = build_tag_map_from_blocks(week_blocks)

        # Calculate total work time for current week
        total_work_minutes = calculate_period_work_minutes(week_blocks, week_start, week_end)
        total_work_time = format_time_duration(total_work_minutes)

        # Calculate previous week work time
        prev_week_minutes = calculate_period_work_minutes(prev_week_blocks_filtered, prev_week_start, prev_week_end)
        previous_week_work_time = format_time_duration(prev_week_minutes)

        # Total blocks
        total_blocks = len(week_blocks)

        # Calculate work time by tag for the week
        work_time_by_tag = calculate_work_time_by_tag(
            week_blocks,
            tag_map,
            total_work_minutes,
            week_start,
            week_end
        )

        # Generate daily breakdown
        daily_data = self._generate_week_daily_data(
            week_blocks,
            tag_map,
            start_date,
            timezone_offset
        )

        return WeekAnalytics(
            weekStart=start_date.isoformat(),
            weekEnd=(start_date + timedelta(days=6)).isoformat(),
            totalWorkTime=total_work_time,
            previousWeekWorkTime=previous_week_work_time,
            totalBlocks=total_blocks,
            workTimeByTag=work_time_by_tag,
            dailyData=daily_data
        )

    def _generate_week_daily_data(
        self,
        week_blocks: List[BlockWithTag],
        tag_map: Dict[str, Dict[str, Any]],
        start_date: date,
        timezone_offset: int
    ) -> List[WeekDailyData]:
        """
        Generate daily breakdown for a week with tag information.

        Creates a 7-day breakdown showing work time and tag distribution
        for each day of the week.

        Args:
            week_blocks: List of blocks in the week
            tag_map: Map of tag IDs to tag info
            start_date: Week start date (Monday, in user's local timezone)
            timezone_offset: Timezone offset in minutes from UTC

        Returns:
            List of WeekDailyData with daily breakdown
        """
        daily_data = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        for day_offset in range(7):
            current_date = start_date + timedelta(days=day_offset)

            # Convert local day boundaries to UTC
            local_day_start = datetime.combine(current_date, datetime.min.time())
            local_day_end = datetime.combine(current_date, datetime.max.time())

            day_start = (local_day_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
            day_end = (local_day_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

            # Filter blocks for this day
            day_blocks = []
            for block in week_blocks:
                block_start = block.start_time
                block_end = block.end_time
                if block_start < day_end and block_end > day_start:
                    day_blocks.append(block)

            # Calculate total work minutes for this day
            day_work_minutes = calculate_period_work_minutes(day_blocks, day_start, day_end)

            # Calculate tag breakdown for this day
            tag_minutes_map = defaultdict(float)
            for block in day_blocks:
                tag_id = block.tag_id
                if tag_id:
                    start_time = block.start_time
                    end_time = block.end_time
                    clipped_start = max(start_time, day_start)
                    clipped_end = min(end_time, day_end)
                    if clipped_end > clipped_start:
                        # Use duration_seconds with proportional allocation for clipped boundaries
                        if block.duration_seconds is not None:
                            full_duration_seconds = block.duration_seconds
                            full_span_seconds = (block.end_time - block.start_time).total_seconds()
                            clipped_span_seconds = (clipped_end - clipped_start).total_seconds()
                            # Proportionally allocate duration to clipped time window
                            duration_minutes = (full_duration_seconds * clipped_span_seconds / full_span_seconds) / 60 if full_span_seconds > 0 else 0
                        else:
                            # Fallback for legacy data
                            duration_minutes = (clipped_end - clipped_start).total_seconds() / 60
                        tag_minutes_map[tag_id] += duration_minutes

            # Format tags list
            tags_list = []
            for tag_id, minutes in tag_minutes_map.items():
                if tag_id in tag_map:
                    tags_list.append(
                        WeekDayTag(
                            tag=tag_map[tag_id].get("name", "Untagged"),
                            minutes=round(minutes),
                            color=tag_map[tag_id].get("color", "#A8A8A8")
                        )
                    )

            # Sort tags by minutes descending
            tags_list.sort(key=lambda x: x.minutes, reverse=True)

            # Format the daily data entry
            daily_entry = WeekDailyData(
                dayName=day_names[day_offset],
                date=f"{month_names[current_date.month - 1]} {current_date.day}",
                fullDate=current_date.isoformat(),
                workTime=format_time_duration(day_work_minutes),
                workTimeMinutes=round(day_work_minutes),
                tags=tags_list
            )

            daily_data.append(daily_entry)

        return daily_data
