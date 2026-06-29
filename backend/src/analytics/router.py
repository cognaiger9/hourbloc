from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from datetime import datetime

from src.dependencies import get_current_user
from src.supabase import get_supabase_admin_client
from src.analytics.day_service import DayAnalyticsService
from src.analytics.week_service import WeekAnalyticsService
from src.analytics.year_service import YearAnalyticsService
from src.analytics.overview_service import OverviewAnalyticsService
from src.analytics.schemas import (
    DayAnalytics,
    WeekAnalytics,
    YearAnalytics,
    OverviewAnalytics
)

router = APIRouter()


@router.get("/day", response_model=DayAnalytics)
async def get_day_analytics(
    date: str,
    timezone_offset: int,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Get analytics for a specific day for the authenticated user

    Args:
        date: Date in YYYY-MM-DD format (in user's local timezone)
        timezone_offset: User's timezone offset in minutes from UTC (e.g., -480 for PST)
    """
    user_id = user["id"]

    # Parse date string (expecting YYYY-MM-DD format)
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD format.")

    try:
        return await DayAnalyticsService(supabase).get_day_analytics(user_id, target_date, timezone_offset)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting day analytics: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get day analytics: {str(e)}")


@router.get("/week", response_model=WeekAnalytics)
async def get_week_analytics(
    start_date: str,
    timezone_offset: int,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Get analytics for a specific week for the authenticated user.
    Week is 7 days starting from start_date (should be a Monday).

    Args:
        start_date: Week start date in YYYY-MM-DD format (Monday, in user's local timezone)
        timezone_offset: User's timezone offset in minutes from UTC (e.g., -480 for PST)
    """
    user_id = user["id"]

    # Parse date string (expecting YYYY-MM-DD format)
    try:
        week_start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD format.")

    try:
        return await WeekAnalyticsService(supabase).get_week_analytics(user_id, week_start_date, timezone_offset)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting week analytics: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get week analytics: {str(e)}")


@router.get("/year", response_model=YearAnalytics)
async def get_year_analytics(
    year: int,
    timezone_offset: int,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Get analytics for a specific year for the authenticated user.
    Returns yearly summary stats, monthly breakdown, and tag distribution.

    Args:
        year: Year to analyze (e.g., 2025, in user's local timezone)
        timezone_offset: User's timezone offset in minutes from UTC (e.g., -480 for PST)
    """
    user_id = user["id"]

    # Validate year (reasonable range)
    current_year = datetime.now().year
    if year < 2020 or year > current_year + 1:
        raise HTTPException(
            status_code=400,
            detail=f"Year must be between 2020 and {current_year + 1}"
        )

    try:
        return await YearAnalyticsService(supabase).get_year_analytics(user_id, year, timezone_offset)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting year analytics: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get year analytics: {str(e)}")


@router.get("/overview", response_model=OverviewAnalytics)
async def get_analytics_overview(
    month: int,
    year: int,
    timezone_offset: int,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Get analytics overview for the main analytics page.
    Returns today's work, lifetime stats, streaks, calendar data, and heatmap for the specified month.

    Uses optimized queries:
    - Date-filtered queries for today and month data
    - SQL aggregation for lifetime stats
    - Optimized streak calculation

    Args:
        month: 0-indexed month (0-11, in user's local timezone)
        year: Year (e.g., 2025, in user's local timezone)
        timezone_offset: User's timezone offset in minutes from UTC (e.g., -480 for PST)
    """
    user_id = user["id"]

    # Validate month
    if month < 0 or month > 11:
        raise HTTPException(status_code=400, detail="Month must be between 0 and 11")

    try:
        return await OverviewAnalyticsService(supabase).get_overview_analytics(user_id, month, year, timezone_offset)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting analytics overview: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get analytics overview: {str(e)}")
