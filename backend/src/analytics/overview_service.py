"""
Overview analytics service.

Provides dashboard overview with today's work, lifetime stats, streaks, and calendar.
"""

from supabase import Client
from typing import Dict, List, Tuple
from datetime import datetime, timezone, timedelta, date
from calendar import monthrange
from collections import defaultdict

from src.analytics.database import get_user_blocks, get_user_blocks_aggregate, get_user_streak_data
from src.analytics.utils import format_time_duration
from src.analytics.schemas import (
    OverviewAnalytics,
    TodayData,
    LifetimeData,
    StreaksData,
    CalendarData,
    HeatmapDay
)


class OverviewAnalyticsService:
    """Service for overview analytics dashboard."""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_overview_analytics(
        self,
        user_id: str,
        month: int,
        year: int,
        timezone_offset: int
    ) -> OverviewAnalytics:
        """
        Get analytics overview for the main analytics page.
        Returns today's work, lifetime stats, streaks, calendar data, and heatmap.

        Uses optimized queries:
        - Date-filtered queries for today and month data
        - SQL aggregation for lifetime stats
        - Optimized streak calculation

        Args:
            user_id: User ID
            month: 0-indexed month (0-11, in user's local timezone)
            year: Year (e.g., 2025, in user's local timezone)
            timezone_offset: Timezone offset in minutes from UTC (e.g., -480 for PST)

        Returns:
            OverviewAnalytics with today, lifetime, streaks, calendar, and heatmap data
        """
        # Get current time in user's local timezone
        now_utc = datetime.now(timezone.utc)
        now_local = now_utc + timedelta(minutes=timezone_offset)
        today_local = now_local.date()

        # Today's blocks
        today_data = await self._get_today_data(user_id, today_local, now_utc, timezone_offset)

        # Month data
        calendar_data, heatmap_data = await self._get_month_data(user_id, month, year, timezone_offset)

        # Lifetime aggregates
        lifetime_data = self._get_lifetime_data(user_id)

        # Streaks
        streaks_data = self._get_streaks_data(user_id, today_local)

        return OverviewAnalytics(
            today=today_data,
            lifetime=lifetime_data,
            streaks=streaks_data,
            calendar=calendar_data,
            heatmap=heatmap_data
        )

    async def _get_today_data(
        self,
        user_id: str,
        today: date,
        now: datetime,
        timezone_offset: int
    ) -> TodayData:
        """
        Get today's analytics data.

        Args:
            user_id: User ID
            today: Today's date in user's local timezone
            now: Current datetime in UTC
            timezone_offset: Timezone offset in minutes from UTC

        Returns:
            TodayData with today's work time and block count
        """
        # Convert local date to UTC boundaries
        local_today_start = datetime.combine(today, datetime.min.time())
        local_today_end = datetime.combine(today, datetime.max.time())

        today_start = (local_today_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
        today_end = (local_today_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

        today_candidate_blocks = get_user_blocks(
            self.supabase,
            user_id,
            block_type="actual",
            start_date=today_start - timedelta(days=1),
            end_date=today_end + timedelta(days=1),
            include_deleted=False,
            include_tags=True
        )

        today_blocks = []
        today_work_minutes = 0.0

        for block in today_candidate_blocks:
            block_start = block.start_time
            block_end = block.end_time

            if block_start < today_end and block_end > today_start:
                today_blocks.append(block)
                clipped_start = max(block_start, today_start)
                clipped_end = min(block_end, today_end)
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
                    today_work_minutes += duration_minutes

        return TodayData(
            date=today.isoformat(),
            workTime=format_time_duration(today_work_minutes),
            blocks=len(today_blocks)
        )

    async def _get_month_data(
        self,
        user_id: str,
        month: int,
        year: int,
        timezone_offset: int
    ) -> Tuple[CalendarData, List[HeatmapDay]]:
        """
        Get month analytics data and heatmap.

        Args:
            user_id: User ID
            month: 0-indexed month (0-11, in user's local timezone)
            year: Year in user's local timezone
            timezone_offset: Timezone offset in minutes from UTC

        Returns:
            Tuple of (CalendarData, List[HeatmapDay])
        """
        month_1_indexed = month + 1
        days_in_month = monthrange(year, month_1_indexed)[1]

        # Convert local month boundaries to UTC
        local_month_start = datetime(year, month_1_indexed, 1, 0, 0, 0)
        local_month_end = datetime(year, month_1_indexed, days_in_month, 23, 59, 59)

        month_start = (local_month_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
        month_end = (local_month_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

        month_candidate_blocks = get_user_blocks(
            self.supabase,
            user_id,
            block_type="actual",
            start_date=month_start - timedelta(days=1),
            end_date=month_end + timedelta(days=1),
            include_deleted=False,
            include_tags=True
        )

        daily_work_minutes: Dict[date, float] = defaultdict(float)

        # Iterate through each day in the month (in local timezone)
        for day_num in range(1, days_in_month + 1):
            local_day_date = date(year, month_1_indexed, day_num)

            # Convert local day boundaries to UTC
            local_day_start = datetime.combine(local_day_date, datetime.min.time())
            local_day_end = datetime.combine(local_day_date, datetime.max.time())

            day_start_utc = (local_day_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
            day_end_utc = (local_day_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

            # Calculate work time for this day from all overlapping blocks
            for block in month_candidate_blocks:
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
                        daily_work_minutes[local_day_date] += duration_minutes

        month_total_minutes = sum(daily_work_minutes.values())
        days_worked = len([d for d in daily_work_minutes.keys() if month_start.date() <= d <= month_end.date()])

        calendar_data = CalendarData(
            month=month,
            year=year,
            daysWorked=days_worked,
            totalDays=days_in_month,
            avgWorkDay=format_time_duration(month_total_minutes / days_worked if days_worked > 0 else 0),
            totalWork=format_time_duration(month_total_minutes)
        )

        # Calculate blocks per day for heatmap
        daily_block_counts: Dict[date, int] = defaultdict(int)
        for day_num in range(1, days_in_month + 1):
            local_day_date = date(year, month_1_indexed, day_num)

            # Convert local day boundaries to UTC
            local_day_start = datetime.combine(local_day_date, datetime.min.time())
            local_day_end = datetime.combine(local_day_date, datetime.max.time())

            day_start_utc = (local_day_start - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)
            day_end_utc = (local_day_end - timedelta(minutes=timezone_offset)).replace(tzinfo=timezone.utc)

            # Count blocks that overlap with this day
            for block in month_candidate_blocks:
                block_start = block.start_time
                block_end = block.end_time

                # Check if block overlaps with this day
                if block_start < day_end_utc and block_end > day_start_utc:
                    daily_block_counts[local_day_date] += 1

        # Generate heatmap
        heatmap_data = []
        max_daily_minutes = max(daily_work_minutes.values()) if daily_work_minutes else 0

        for day in range(1, days_in_month + 1):
            check_date = date(year, month_1_indexed, day)
            day_minutes = daily_work_minutes.get(check_date, 0.0)
            day_blocks = daily_block_counts.get(check_date, 0)
            has_work = day_minutes > 0

            opacity = (day_minutes / max_daily_minutes) if max_daily_minutes > 0 else 0.0
            if has_work and opacity < 0.1:
                opacity = 0.1

            heatmap_data.append(
                HeatmapDay(
                    day=day,
                    opacity=round(opacity, 2),
                    hasWork=has_work,
                    workTime=format_time_duration(day_minutes) if has_work else None,
                    blocks=day_blocks if has_work else None
                )
            )

        return calendar_data, heatmap_data

    def _get_lifetime_data(self, user_id: str) -> LifetimeData:
        """
        Get lifetime analytics data using SQL aggregation.

        Args:
            user_id: User ID

        Returns:
            LifetimeData with total work time, blocks, and work days
        """
        lifetime_stats = get_user_blocks_aggregate(
            self.supabase,
            user_id,
            block_type="actual"
        )

        return LifetimeData(
            totalWorkTime=format_time_duration(lifetime_stats.total_work_minutes),
            totalBlocks=lifetime_stats.total_blocks,
            workDays=lifetime_stats.work_days
        )

    def _get_streaks_data(self, user_id: str, today: date) -> StreaksData:
        """
        Get streaks analytics data.

        Args:
            user_id: User ID
            today: Today's date in user's local timezone

        Returns:
            StreaksData with current streak, best streak, and motivational message
        """
        streak_data = get_user_streak_data(
            self.supabase,
            user_id,
            lookback_days=365
        )

        # Generate streak message
        if today in streak_data.work_days:
            streak_message = "Today's work goal complete! Streak is secure."
        elif streak_data.current_streak > 0:
            streak_message = f"Continue your {streak_data.current_streak} day streak!"
        else:
            streak_message = "Start a new streak today!"

        return StreaksData(
            currentStreak=streak_data.current_streak,
            bestStreak=streak_data.best_streak,
            message=streak_message
        )
