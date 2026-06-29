from datetime import datetime
from typing import Dict, Any


def format_time_duration(minutes: float) -> str:
    """Format minutes as 'Xh Ym' string"""
    hours = int(minutes // 60)
    mins = int(minutes % 60)
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    elif hours > 0:
        return f"{hours}h"
    elif mins > 0:
        return f"{mins}m"
    else:
        return "0m"


def time_to_percentage(hour: int, minute: int) -> float:
    """Convert hour:minute to percentage (0-100) for 24-hour timeline"""
    total_minutes = hour * 60 + minute
    return (total_minutes / (24 * 60)) * 100


def calculate_timeline_bar(
    start_time: datetime,
    end_time: datetime,
    day_start: datetime,
    day_end: datetime
) -> Dict[str, Any]:
    """Calculate timeline bar position and width from start/end times, clipped to day boundaries"""
    # Clip times to day boundaries
    clipped_start = max(start_time, day_start)
    clipped_end = min(end_time, day_end)

    # If clipped end is before clipped start, the block doesn't overlap with the day
    if clipped_end <= clipped_start:
        return {"start": 0, "width": 0}

    # Calculate start position based on clipped start time
    start_hour = clipped_start.hour
    start_minute = clipped_start.minute
    start_pos = time_to_percentage(start_hour, start_minute)

    # Calculate width based on clipped duration
    duration_minutes = (clipped_end - clipped_start).total_seconds() / 60
    width = (duration_minutes / (24 * 60)) * 100

    return {
        "start": round(start_pos, 2),
        "width": round(width, 2)
    }
