from fastapi import APIRouter, HTTPException, Depends, Query, status
from supabase import Client
from typing import List, Optional
from datetime import date

from src.supabase import get_supabase_admin_client
from src.dependencies import get_current_user
from src.weekly_goals.schemas import WeeklyGoal, WeeklyGoalCreate, WeeklyGoalUpdate
from src.weekly_goals.service import WeeklyGoalService

router = APIRouter()


@router.get("/", response_model=List[WeeklyGoal])
async def get_weekly_goals(
    week_start: Optional[str] = Query(None, description="Filter by week start date (ISO format: YYYY-MM-DD)"),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Get all weekly goals for the authenticated user.
    Optionally filtered by week_start date.
    """
    user_id = user["id"]
    week_start_date = None

    # Parse week_start if provided
    if week_start:
        try:
            week_start_date = date.fromisoformat(week_start)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid week_start format. Use ISO date format (YYYY-MM-DD)."
            )

    try:
        goals = await WeeklyGoalService(supabase).get_user_goals(
            user_id,
            week_start=week_start_date,
            include_deleted=False
        )
        return goals
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get weekly goals: {str(e)}"
        )


@router.post("/", response_model=WeeklyGoal, status_code=status.HTTP_201_CREATED)
async def create_weekly_goal(
    goal: WeeklyGoalCreate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Create a new weekly goal for the authenticated user
    """
    user_id = user["id"]

    try:
        created_goal = await WeeklyGoalService(supabase).create(user_id, goal)
        return created_goal
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create weekly goal: {str(e)}"
        )


@router.put("/{goal_id}", response_model=WeeklyGoal)
async def update_weekly_goal(
    goal_id: str,
    goal: WeeklyGoalUpdate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Update an existing weekly goal (only if owned by the authenticated user)
    """
    user_id = user["id"]

    try:
        updated_goal = await WeeklyGoalService(supabase).update(goal_id, user_id, goal)

        if not updated_goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Weekly goal not found"
            )

        return updated_goal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update weekly goal: {str(e)}"
        )


@router.delete("/{goal_id}", status_code=status.HTTP_200_OK)
async def delete_weekly_goal(
    goal_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Delete a weekly goal (only if owned by the authenticated user)
    """
    user_id = user["id"]

    try:
        deleted_goal = await WeeklyGoalService(supabase).soft_delete(goal_id, user_id)

        if not deleted_goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Weekly goal not found"
            )

        return {"message": "Weekly goal deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete weekly goal: {str(e)}"
        )
