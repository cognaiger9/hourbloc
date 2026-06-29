"""
Shared calculation helpers for analytics services.

This module contains pure calculation functions used by multiple analytics services.
Functions here should be stateless and reusable across different analytics endpoints.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta, date
from collections import defaultdict

from src.analytics.utils import format_time_duration
from src.analytics.schemas import BlockWithTag, WorkTimeByTag


def parse_datetime(dt_value: Any) -> datetime:
    """
    Parse datetime from string or return as-is.

    Args:
        dt_value: Datetime string or datetime object

    Returns:
        datetime object with timezone info
    """
    if isinstance(dt_value, str):
        return datetime.fromisoformat(dt_value.replace("Z", "+00:00"))
    return dt_value


def format_time_12hour(dt: datetime) -> str:
    """
    Format datetime to 12-hour time string (e.g., "9:00 AM", "2:30 PM").

    Args:
        dt: datetime to format

    Returns:
        Formatted time string in 12-hour format
    """
    hour = dt.hour
    minute = dt.minute

    # Convert to 12-hour format
    if hour == 0:
        formatted_hour = 12
        period = "AM"
    elif hour < 12:
        formatted_hour = hour
        period = "AM"
    elif hour == 12:
        formatted_hour = 12
        period = "PM"
    else:
        formatted_hour = hour - 12
        period = "PM"

    return f"{formatted_hour}:{minute:02d} {period}"


def build_tag_map_from_blocks(blocks: List[BlockWithTag]) -> Dict[str, Dict[str, Any]]:
    """
    Build a tag map from blocks that have joined tag data.
    Extracts unique tags from blocks to avoid duplicate tag queries.

    Args:
        blocks: List of blocks with joined tag data

    Returns:
        Dictionary mapping tag IDs to tag information (id, name, color)
    """
    tag_map = {}
    for block in blocks:
        # Tag data is now a Pydantic model (or None if no tag)
        if block.tags and block.tags.id:
            tag_id = block.tags.id
            if tag_id not in tag_map:
                # Convert Tag model to dict for backward compatibility with existing code
                tag_map[tag_id] = {
                    "id": block.tags.id,
                    "name": block.tags.name,
                    "color": block.tags.color
                }
    return tag_map


def calculate_work_time_by_tag(
    blocks: List[BlockWithTag],
    tag_map: Dict[str, Dict[str, Any]],
    total_work_minutes: float,
    period_start: datetime,
    period_end: datetime
) -> List[WorkTimeByTag]:
    """
    Calculate work time broken down by tag with percentages.

    Uses proportional duration allocation for blocks that span period boundaries.
    Blocks without tags or with unknown tags are excluded from results.

    Args:
        blocks: List of blocks to analyze
        tag_map: Dictionary mapping tag IDs to tag information
        total_work_minutes: Total work minutes for percentage calculation
        period_start: Start of period (for clipping blocks)
        period_end: End of period (for clipping blocks)

    Returns:
        List of WorkTimeByTag objects sorted by time descending
    """
    tag_time_map = defaultdict(float)
    tag_color_map = {}

    for block in blocks:
        tag_id = block.tag_id
        if tag_id and tag_id in tag_map:
            start_time = block.start_time
            end_time = block.end_time

            clipped_start = max(start_time, period_start)
            clipped_end = min(end_time, period_end)

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
                tag_time_map[tag_id] += duration_minutes
                tag_color_map[tag_id] = tag_map[tag_id].get("color", "#A8A8A8")

    # Convert to list format with percentages
    work_time_by_tag = []
    for tag_id, minutes in tag_time_map.items():
        percentage = (minutes / total_work_minutes * 100) if total_work_minutes > 0 else 0
        tag_name = tag_map[tag_id].get("name", "Untagged")
        color = tag_color_map.get(tag_id, "#A8A8A8")

        work_time_by_tag.append({
            "tag": tag_name,
            "time": format_time_duration(minutes),
            "percentage": round(percentage, 1),
            "color": color,
            "_minutes": minutes
        })

    # Sort by minutes descending
    work_time_by_tag.sort(key=lambda x: x["_minutes"], reverse=True)

    # Convert to Pydantic models
    return [
        WorkTimeByTag(
            tag=item["tag"],
            time=item["time"],
            percentage=item["percentage"],
            color=item["color"]
        )
        for item in work_time_by_tag
    ]


def calculate_period_work_minutes(
    blocks: List[BlockWithTag],
    period_start: datetime,
    period_end: datetime
) -> float:
    """
    Calculate total work minutes for a period with proportional duration allocation.

    Blocks are clipped to period boundaries and time is allocated proportionally
    based on the duration_seconds field if available.

    Args:
        blocks: List of blocks to sum
        period_start: Start of period (UTC)
        period_end: End of period (UTC)

    Returns:
        Total work minutes as float
    """
    total_minutes = 0.0
    for block in blocks:
        start_time = block.start_time
        end_time = block.end_time

        # Clip to period boundaries
        clipped_start = max(start_time, period_start)
        clipped_end = min(end_time, period_end)

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


def calculate_daily_work_minutes_map(
    blocks: List[BlockWithTag],
    period_start: datetime,
    period_end: datetime,
    timezone_offset: int
) -> Dict[date, float]:
    """
    Build a map of date -> work minutes for all days in period.
    Handles blocks spanning multiple days by distributing time correctly.

    This is used for calculating yearly statistics like best week/month
    and generating monthly activity heatmaps.

    Args:
        blocks: List of blocks to aggregate
        period_start: Start of period (UTC representing start of local period)
        period_end: End of period (UTC representing end of local period)
        timezone_offset: Timezone offset in minutes from UTC (e.g., -480 for PST)

    Returns:
        Dictionary mapping local dates to work minutes
    """
    daily_minutes: Dict[date, float] = defaultdict(float)

    # Convert UTC period boundaries to local dates
    local_period_start = (period_start + timedelta(minutes=timezone_offset)).date()
    local_period_end = (period_end + timedelta(minutes=timezone_offset)).date()

    # Iterate through each local date in the period
    current_local_date = local_period_start
    while current_local_date <= local_period_end:
        # Convert local date to UTC boundaries
        local_day_start = datetime.combine(current_local_date, datetime.min.time())
        local_day_end = datetime.combine(current_local_date, datetime.max.time())

        day_start_utc = (local_day_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
        day_end_utc = (local_day_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

        # Calculate work time for this day from all overlapping blocks
        for block in blocks:
            block_start = block.start_time
            block_end = block.end_time

            # Check if block overlaps with this day
            if block_start < day_end_utc and block_end > day_start_utc:
                # Clip block to day boundaries
                clipped_start = max(block_start, day_start_utc)
                clipped_end = min(block_end, day_end_utc)

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
                    daily_minutes[current_local_date] += duration_minutes

        current_local_date += timedelta(days=1)

    return daily_minutes


def calculate_best_week(
    daily_minutes: Dict[date, float],
    year: int
) -> str:
    """
    Calculate best week (max hours in any calendar week).
    Uses ISO week grouping for efficiency.

    Args:
        daily_minutes: Map of dates to work minutes
        year: Year to filter by

    Returns:
        Formatted string like "42h"
    """
    # Build weekly totals using ISO calendar weeks
    weekly_minutes: Dict[tuple[int, int], float] = defaultdict(float)

    for day, minutes in daily_minutes.items():
        iso_year, iso_week, _ = day.isocalendar()
        # Only count weeks that belong to this year
        if iso_year == year:
            weekly_minutes[(iso_year, iso_week)] += minutes

    # Find max week
    best_week_minutes = max(weekly_minutes.values()) if weekly_minutes else 0
    best_week_hours = best_week_minutes / 60
    return f"{best_week_hours:.0f}h"


def calculate_best_month(
    daily_minutes: Dict[date, float],
    year: int
) -> str:
    """
    Calculate best month (max hours in any single month).

    Args:
        daily_minutes: Map of dates to work minutes
        year: Year to filter by

    Returns:
        Formatted string like "125h"
    """
    monthly_minutes: Dict[int, float] = defaultdict(float)

    for day, minutes in daily_minutes.items():
        if day.year == year:
            monthly_minutes[day.month] += minutes

    best_month_minutes = max(monthly_minutes.values()) if monthly_minutes else 0
    best_month_hours = best_month_minutes / 60
    return f"{best_month_hours:.0f}h"
