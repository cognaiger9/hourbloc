"""
Year analytics service.

Provides yearly analytics with summary statistics, monthly breakdown, and tag distribution.
"""

from supabase import Client
from typing import Dict, List
from datetime import datetime, timezone, timedelta, date
from collections import defaultdict

from src.analytics.database import get_user_blocks, get_user_streak_data
from src.analytics.utils import format_time_duration
from src.analytics.schemas import (
    BlockWithTag,
    YearAnalytics,
    SummaryStat,
    MonthlyActivity,
    DailyActivity
)
from src.analytics.helpers import (
    build_tag_map_from_blocks,
    calculate_work_time_by_tag,
    calculate_daily_work_minutes_map,
    calculate_best_week,
    calculate_best_month
)


class YearAnalyticsService:
    """Service for year-level analytics with monthly heatmap."""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_year_analytics(
        self,
        user_id: str,
        year: int,
        timezone_offset: int
    ) -> YearAnalytics:
        """
        Get analytics for a specific year for the authenticated user.
        Returns yearly summary stats, monthly breakdown, and tag distribution.

        Optimized for full year of data (potentially 1000+ blocks).

        Args:
            user_id: User ID to filter by
            year: Year to analyze (e.g., 2025, in user's local timezone)
            timezone_offset: Timezone offset in minutes from UTC (e.g., -480 for PST)

        Returns:
            YearAnalytics with summary statistics, monthly activity, and tag breakdown
        """
        # Calculate year boundaries in user's local timezone, then convert to UTC
        local_year_start = datetime(year, 1, 1, 0, 0, 0)
        local_year_end = datetime(year, 12, 31, 23, 59, 59)

        year_start = (local_year_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
        year_end = (local_year_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

        # Query all actual blocks for the year (with buffer for overlapping blocks) with tags joined
        year_blocks = get_user_blocks(
            self.supabase,
            user_id,
            block_type="actual",
            start_date=year_start - timedelta(days=1),
            end_date=year_end + timedelta(days=1),
            include_deleted=False,
            include_tags=True
        )

        # Filter blocks that actually overlap with the year
        filtered_blocks = []
        for block in year_blocks:
            block_start = block.start_time
            block_end = block.end_time
            if block_start < year_end and block_end > year_start:
                filtered_blocks.append(block)

        # Handle case with no data
        if not filtered_blocks:
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            return YearAnalytics(
                year=year,
                summaryStats=[
                    SummaryStat(label="Focus Time", value="0h"),
                    SummaryStat(label="Sessions", value="0"),
                    SummaryStat(label="Focus Days", value="0"),
                    SummaryStat(label="Avg Session", value="0.0h"),
                    SummaryStat(label="Best Day", value="0h"),
                    SummaryStat(label="Best Week", value="0h"),
                    SummaryStat(label="Best Month", value="0h"),
                    SummaryStat(label="Best Streak", value="0 days")
                ],
                workTimeByTag=[],
                monthlyActivityBase=[
                    MonthlyActivity(month=name, hours="0h", monthIndex=i, dailyActivity={})
                    for i, name in enumerate(month_names)
                ]
            )

        # Calculate daily work minutes map (reusable for multiple stats)
        daily_minutes = calculate_daily_work_minutes_map(
            filtered_blocks, year_start, year_end, timezone_offset
        )

        # Calculate summary statistics
        total_work_minutes = sum(daily_minutes.values())
        focus_time_hours = total_work_minutes / 60
        sessions = len(filtered_blocks)
        focus_days = len([d for d in daily_minutes.keys()
                         if year_start.date() <= d <= year_end.date()])
        avg_session_hours = (focus_time_hours / sessions) if sessions > 0 else 0

        best_day_minutes = max(daily_minutes.values()) if daily_minutes else 0
        best_day_hours = best_day_minutes / 60

        best_week = calculate_best_week(daily_minutes, year)
        best_month = calculate_best_month(daily_minutes, year)

        # Get best streak (look back 2 years)
        streak_data = get_user_streak_data(
            self.supabase,
            user_id,
            lookback_days=730
        )

        summary_stats = [
            SummaryStat(label="Focus Time", value=f"{focus_time_hours:.0f}h"),
            SummaryStat(label="Sessions", value=str(sessions)),
            SummaryStat(label="Focus Days", value=str(focus_days)),
            SummaryStat(label="Avg Session", value=f"{avg_session_hours:.1f}h"),
            SummaryStat(label="Best Day", value=f"{best_day_hours:.0f}h"),
            SummaryStat(label="Best Week", value=best_week),
            SummaryStat(label="Best Month", value=best_month),
            SummaryStat(label="Best Streak", value=f"{streak_data.best_streak} days")
        ]

        # Build tag map from joined tag data and calculate tag breakdown
        tag_map = build_tag_map_from_blocks(filtered_blocks)
        work_time_by_tag = calculate_work_time_by_tag(
            filtered_blocks,
            tag_map,
            total_work_minutes,
            year_start,
            year_end
        )

        # Calculate monthly activity
        monthly_activity_base = self._calculate_monthly_activity(daily_minutes, year, filtered_blocks, year_start, year_end, timezone_offset)

        return YearAnalytics(
            year=year,
            summaryStats=summary_stats,
            workTimeByTag=work_time_by_tag,
            monthlyActivityBase=monthly_activity_base
        )

    def _calculate_monthly_activity(
        self,
        daily_minutes: Dict[date, float],
        year: int,
        filtered_blocks: List[BlockWithTag],
        year_start: datetime,
        year_end: datetime,
        timezone_offset: int
    ) -> List[MonthlyActivity]:
        """
        Calculate monthly breakdown with month names, hours, and daily activity.

        Includes which days in each month had work for the heatmap
        with work time and block counts.

        Args:
            daily_minutes: Map of local dates to work minutes
            year: Year being analyzed
            filtered_blocks: Blocks for the year
            year_start: Year start datetime (UTC representing start of local year)
            year_end: Year end datetime (UTC representing end of local year)
            timezone_offset: Timezone offset in minutes from UTC

        Returns:
            List of MonthlyActivity with monthly totals and daily heatmap data
        """
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        # Aggregate by month
        monthly_minutes: Dict[int, float] = defaultdict(float)
        for day, minutes in daily_minutes.items():
            if day.year == year:
                monthly_minutes[day.month] += minutes

        # Count blocks per day (using local dates)
        daily_block_counts: Dict[date, int] = defaultdict(int)

        # Convert UTC period boundaries to local dates
        local_year_start = (year_start + timedelta(minutes=timezone_offset)).date()
        local_year_end = (year_end + timedelta(minutes=timezone_offset)).date()

        # Iterate through each local date in the year
        current_local_date = local_year_start
        while current_local_date <= local_year_end:
            # Convert local date to UTC boundaries
            local_day_start = datetime.combine(current_local_date, datetime.min.time())
            local_day_end = datetime.combine(current_local_date, datetime.max.time())

            day_start_utc = (local_day_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
            day_end_utc = (local_day_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

            # Count blocks that overlap with this day
            for block in filtered_blocks:
                block_start = block.start_time
                block_end = block.end_time

                # Check if block overlaps with this day
                if block_start < day_end_utc and block_end > day_start_utc:
                    daily_block_counts[current_local_date] += 1

            current_local_date += timedelta(days=1)

        # Build monthly activity array with daily activity data
        monthly_activity = []
        for month_index in range(12):
            month_1_indexed = month_index + 1
            month_minutes = monthly_minutes.get(month_1_indexed, 0.0)
            month_hours = month_minutes / 60

            # Get daily activity for this month (which days had work, with time and block count)
            daily_activity = {}
            for day, minutes in daily_minutes.items():
                if day.year == year and day.month == month_1_indexed:
                    # Format as YYYY-MM-DD
                    date_key = day.isoformat()
                    has_work = minutes > 0
                    block_count = daily_block_counts.get(day, 0)

                    daily_activity[date_key] = DailyActivity(
                        hasActivity=has_work,
                        workTime=format_time_duration(minutes) if has_work else None,
                        blocks=block_count if has_work else None
                    )

            monthly_activity.append(
                MonthlyActivity(
                    month=month_names[month_index],
                    hours=f"{month_hours:.0f}h",
                    monthIndex=month_index,
                    dailyActivity=daily_activity
                )
            )

        return monthly_activity
