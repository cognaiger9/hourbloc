"""
Database helper functions for analytics queries.
Specialized database functions for analytics-specific operations including
blocks retrieval, aggregation, and streak calculations.
"""
from datetime import datetime, date, timezone, timedelta
from typing import Optional, List, Set
from supabase import Client

from src.analytics.schemas import BlockWithTag, BlocksAggregate, StreakData


def get_user_blocks(
    supabase: Client,
    user_id: str,
    block_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    include_deleted: bool = False,
    include_tags: bool = False
) -> List[BlockWithTag]:
    """
    Get blocks for a specific user with optional filtering.

    Args:
        supabase: Supabase client instance
        user_id: User ID to filter by
        block_type: Optional filter by 'planned' or 'actual'
        start_date: Optional filter blocks starting from this date
        end_date: Optional filter blocks ending before this date
        include_deleted: If True, include soft-deleted blocks
        include_tags: If True, join and include tag data (id, name, color) for each block

    Returns:
        List of BlockWithTag models. If include_tags=True, each block will have a 'tags' field
        with the associated tag data (or None if no tag).
    """
    # Use relational query to join tags if requested
    select_query = "*, tags(id, name, color, user_id, created_at, updated_at, deleted_at)" if include_tags else "*"
    query = supabase.table("blocks").select(select_query).eq("user_id", user_id)

    if block_type:
        query = query.eq("block_type", block_type)

    if start_date:
        query = query.gte("start_time", start_date.isoformat())

    if end_date:
        query = query.lte("end_time", end_date.isoformat())

    if not include_deleted:
        query = query.is_("deleted_at", "null")

    response = query.execute()
    blocks_data = response.data if response.data else []

    # Convert to Pydantic models
    return [BlockWithTag(**block) for block in blocks_data]


def get_user_blocks_aggregate(
    supabase: Client,
    user_id: str,
    block_type: Optional[str] = None
) -> BlocksAggregate:
    """
    Get aggregated statistics for user blocks using efficient queries.
    This avoids fetching all blocks and instead uses targeted queries.

    Args:
        supabase: Supabase client instance
        user_id: User ID to filter by
        block_type: Optional filter by 'planned' or 'actual'

    Returns:
        BlocksAggregate model with total_work_minutes, total_blocks, and work_days
    """
    # Build base query
    query = supabase.table("blocks").select("start_time,end_time", count="exact").eq("user_id", user_id)

    if block_type:
        query = query.eq("block_type", block_type)

    query = query.is_("deleted_at", "null")

    # Fetch only the fields we need for calculation
    response = query.execute()
    blocks = response.data if response.data else []

    # Calculate aggregates in Python
    total_work_minutes = 0.0
    work_days_set: Set[date] = set()

    for block in blocks:
        start_time_str = block.get("start_time")
        end_time_str = block.get("end_time")

        if isinstance(start_time_str, str):
            start_time = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
        else:
            start_time = start_time_str

        if isinstance(end_time_str, str):
            end_time = datetime.fromisoformat(end_time_str.replace("Z", "+00:00"))
        else:
            end_time = end_time_str

        # Use duration_seconds if available, otherwise calculate from timestamps
        if block.get("duration_seconds") is not None:
            duration_minutes = block["duration_seconds"] / 60.0
        else:
            # Fallback for legacy data or planned blocks
            duration_minutes = (end_time - start_time).total_seconds() / 60
        total_work_minutes += duration_minutes

        # Track distinct work days
        # A block might span multiple days, so we need to track all days it covers
        current_date = start_time.date()
        end_date = end_time.date()

        while current_date <= end_date:
            work_days_set.add(current_date)
            current_date += timedelta(days=1)

    return BlocksAggregate(
        total_work_minutes=total_work_minutes,
        total_blocks=len(blocks),
        work_days=len(work_days_set)
    )


def get_user_streak_data(
    supabase: Client,
    user_id: str,
    lookback_days: int = 365
) -> StreakData:
    """
    Get streak data efficiently by querying only recent blocks.

    Args:
        supabase: Supabase client instance
        user_id: User ID to filter by
        lookback_days: Number of days to look back for current streak calculation

    Returns:
        StreakData model with current_streak, best_streak, and work_days
    """
    now = datetime.now(timezone.utc)
    today = now.date()

    # For current streak, query blocks from lookback_days ago to today
    lookback_start = datetime.combine(today - timedelta(days=lookback_days), datetime.min.time()).replace(tzinfo=timezone.utc)

    # Query blocks for streak calculation
    query = supabase.table("blocks").select("start_time,end_time").eq("user_id", user_id).eq("block_type", "actual").is_("deleted_at", "null").gte("start_time", lookback_start.isoformat())

    response = query.execute()
    recent_blocks = response.data if response.data else []

    # Build set of work days from recent blocks
    recent_work_days: Set[date] = set()
    for block in recent_blocks:
        start_time_str = block.get("start_time")
        end_time_str = block.get("end_time")

        if isinstance(start_time_str, str):
            start_time = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
        else:
            start_time = start_time_str

        if isinstance(end_time_str, str):
            end_time = datetime.fromisoformat(end_time_str.replace("Z", "+00:00"))
        else:
            end_time = end_time_str

        # Track all days this block covers
        current_date = start_time.date()
        end_date = end_time.date()

        while current_date <= end_date:
            recent_work_days.add(current_date)
            current_date += timedelta(days=1)

    # Calculate current streak (from today backwards)
    current_streak = 0
    check_date = today

    # If today has work, start counting from today
    # Otherwise, start from yesterday
    if today not in recent_work_days:
        check_date = today - timedelta(days=1)

    while check_date >= (today - timedelta(days=lookback_days)):
        if check_date in recent_work_days:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    # For best streak, we need all work days (not just recent)
    # Query all blocks to get complete work days set
    all_blocks_query = supabase.table("blocks").select("start_time,end_time").eq("user_id", user_id).eq("block_type", "actual").is_("deleted_at", "null")

    all_response = all_blocks_query.execute()
    all_blocks = all_response.data if all_response.data else []

    all_work_days: Set[date] = set()
    for block in all_blocks:
        start_time_str = block.get("start_time")
        end_time_str = block.get("end_time")

        if isinstance(start_time_str, str):
            start_time = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
        else:
            start_time = start_time_str

        if isinstance(end_time_str, str):
            end_time = datetime.fromisoformat(end_time_str.replace("Z", "+00:00"))
        else:
            end_time = end_time_str

        current_date = start_time.date()
        end_date = end_time.date()

        while current_date <= end_date:
            all_work_days.add(current_date)
            current_date += timedelta(days=1)

    # Calculate best streak from all work days
    best_streak = 0
    if all_work_days:
        sorted_dates = sorted(all_work_days)
        current_run = 1

        for i in range(1, len(sorted_dates)):
            if sorted_dates[i] - sorted_dates[i-1] == timedelta(days=1):
                current_run += 1
            else:
                best_streak = max(best_streak, current_run)
                current_run = 1
        best_streak = max(best_streak, current_run)

    return StreakData(
        current_streak=current_streak,
        best_streak=best_streak,
        work_days=all_work_days
    )
