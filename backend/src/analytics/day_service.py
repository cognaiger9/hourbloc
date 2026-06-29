"""
Day analytics service.

Provides detailed analytics for a single day including timeline visualization.
"""

from supabase import Client
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta, date

from src.analytics.database import get_user_blocks
from src.analytics.utils import format_time_duration, calculate_timeline_bar
from src.analytics.schemas import BlockWithTag, DayAnalytics, TimelineBar
from src.analytics.helpers import (
    build_tag_map_from_blocks,
    calculate_work_time_by_tag,
    format_time_12hour
)


class DayAnalyticsService:
    """Service for day-level analytics with timeline visualization."""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_day_analytics(
        self,
        user_id: str,
        target_date: date,
        timezone_offset: int
    ) -> DayAnalytics:
        """
        Get analytics for a specific day for the authenticated user.

        Includes total work time, block count, work time by tag, and timeline
        visualization bars for both planned and actual blocks.

        Args:
            user_id: User ID
            target_date: Date in user's local timezone
            timezone_offset: Timezone offset in minutes from UTC (e.g., -480 for PST)

        Returns:
            DayAnalytics with work time, blocks, tags, and timeline visualization
        """
        # Calculate start and end of day in user's local timezone, then convert to UTC
        # Local midnight -> UTC conversion: subtract the offset
        # Example: PST (offset=-480) Jan 15 00:00 -> UTC Jan 15 08:00
        local_start = datetime.combine(target_date, datetime.min.time())
        local_end = datetime.combine(target_date, datetime.max.time())

        # Convert local time to UTC by subtracting the offset
        start_of_day = (local_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
        end_of_day = (local_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

        # Query blocks that might overlap with this day
        # We need blocks that start before end_of_day and end after start_of_day
        # Query a wider range and filter in Python for accuracy
        query_start = start_of_day - timedelta(days=1)
        query_end = end_of_day + timedelta(days=1)

        # Get all blocks in the wider range with tags joined
        candidate_blocks = get_user_blocks(
            self.supabase,
            user_id,
            block_type=None,
            start_date=query_start,
            end_date=query_end,
            include_deleted=False,
            include_tags=True
        )

        # Filter blocks that actually overlap with the target day
        all_blocks = []
        for block in candidate_blocks:
            block_start = block.start_time
            block_end = block.end_time

            # Block overlaps with day if it starts before end_of_day and ends after start_of_day
            if block_start < end_of_day and block_end > start_of_day:
                all_blocks.append(block)

        # Build tag map from joined tag data in blocks
        tag_map = build_tag_map_from_blocks(all_blocks)

        # Separate planned and actual blocks
        planned_blocks = [b for b in all_blocks if b.block_type == "planned"]
        actual_blocks = [b for b in all_blocks if b.block_type == "actual"]

        # Calculate total work time from actual blocks (in minutes)
        total_work_minutes = self._calculate_day_work_minutes(actual_blocks, start_of_day, end_of_day)
        total_work_time = format_time_duration(total_work_minutes)
        total_blocks = len(actual_blocks)

        # Calculate work time by tag
        work_time_by_tag = calculate_work_time_by_tag(
            actual_blocks,
            tag_map,
            total_work_minutes,
            start_of_day,
            end_of_day
        )

        # Generate timeline bars
        planned_bars = self._generate_timeline_bars(
            planned_blocks,
            tag_map,
            start_of_day,
            end_of_day,
            is_planned=True
        )
        actual_bars = self._generate_timeline_bars(
            actual_blocks,
            tag_map,
            start_of_day,
            end_of_day,
            is_planned=False
        )

        return DayAnalytics(
            date=target_date.isoformat(),
            totalWorkTime=total_work_time,
            totalBlocks=total_blocks,
            workTimeByTag=work_time_by_tag,
            plannedBars=planned_bars,
            actualBars=actual_bars
        )

    def _calculate_day_work_minutes(
        self,
        blocks: List[BlockWithTag],
        start_of_day: datetime,
        end_of_day: datetime
    ) -> float:
        """
        Calculate total work minutes for a day.

        Uses proportional duration allocation for blocks that span day boundaries.

        Args:
            blocks: List of actual blocks
            start_of_day: Start of day in UTC
            end_of_day: End of day in UTC

        Returns:
            Total work minutes as float
        """
        total_minutes = 0.0
        for block in blocks:
            start_time = block.start_time
            end_time = block.end_time

            # Clip to day boundaries
            clipped_start = max(start_time, start_of_day)
            clipped_end = min(end_time, end_of_day)

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
                total_minutes += duration_minutes

        return total_minutes

    def _generate_timeline_bars(
        self,
        blocks: List[BlockWithTag],
        tag_map: Dict[str, Dict[str, Any]],
        start_of_day: datetime,
        end_of_day: datetime,
        is_planned: bool
    ) -> List[TimelineBar]:
        """
        Generate timeline bars for visualization.

        Creates timeline bar data with position, width, color, and metadata
        for rendering blocks on a 24-hour timeline.

        Args:
            blocks: List of blocks to visualize
            tag_map: Map of tag IDs to tag info (name, color)
            start_of_day: Start of day in UTC
            end_of_day: End of day in UTC
            is_planned: Whether these are planned or actual blocks

        Returns:
            List of TimelineBar objects with visualization data
        """
        bars = []
        now = datetime.now(timezone.utc)

        for block in blocks:
            start_time = block.start_time
            end_time = block.end_time

            bar_data = calculate_timeline_bar(start_time, end_time, start_of_day, end_of_day)
            tag_id = block.tag_id

            if tag_id and tag_id in tag_map:
                color = tag_map[tag_id].get("color", "#F7F6F3" if is_planned else "#A8A8A8")
            else:
                color = "#F7F6F3" if is_planned else "#A8A8A8"

            # Format times for tooltip display (e.g., "9:00 AM", "2:30 PM")
            start_time_str = format_time_12hour(start_time)
            end_time_str = format_time_12hour(end_time)

            if is_planned:
                border_color = tag_map[tag_id].get("color", "#E4E2DD") if (tag_id and tag_id in tag_map) else "#E4E2DD"
                bar = TimelineBar(
                    start=bar_data["start"],
                    width=bar_data["width"],
                    color=color,
                    opacity=0.4,
                    borderColor=border_color,
                    borderOpacity=0.2,
                    title=block.title,
                    startTime=start_time_str,
                    endTime=end_time_str,
                    startDateTime=start_time.isoformat(),
                    endDateTime=end_time.isoformat()
                )
            else:
                # Check if block is currently active
                is_active = end_time > now
                bar = TimelineBar(
                    start=bar_data["start"],
                    width=bar_data["width"],
                    color=color,
                    opacity=0.8,
                    hasDots=is_active,
                    title=block.title,
                    startTime=start_time_str,
                    endTime=end_time_str,
                    startDateTime=start_time.isoformat(),
                    endDateTime=end_time.isoformat()
                )

            bars.append(bar)

        return bars
