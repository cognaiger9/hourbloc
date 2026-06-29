from supabase import Client
from typing import List, Optional
from datetime import date, datetime, timezone

from src.weekly_goals.schemas import WeeklyGoal, WeeklyGoalCreate, WeeklyGoalUpdate


class WeeklyGoalService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_user_goals(
        self,
        user_id: str,
        week_start: Optional[date] = None,
        include_deleted: bool = False
    ) -> List[WeeklyGoal]:
        """
        Get weekly goals for a specific user.
        Optionally filtered by week_start date.
        """
        query = self.supabase.table("weekly_goals").select("*").eq("user_id", user_id)

        if week_start:
            # Convert date to ISO string for Supabase query
            query = query.eq("week_start", week_start.isoformat())

        if not include_deleted:
            query = query.is_("deleted_at", "null")

        # Order by order field (ascending)
        query = query.order("order", desc=False)

        response = query.execute()
        data = response.data if response.data else []

        return [WeeklyGoal(**self._parse_datetime_fields(goal_dict)) for goal_dict in data]

    async def create(
        self,
        user_id: str,
        data: WeeklyGoalCreate
    ) -> WeeklyGoal:
        """
        Create a new weekly goal for a user.
        """
        goal_data = data.model_dump()
        # Convert date to ISO string for Supabase
        goal_data["week_start"] = goal_data["week_start"].isoformat()
        goal_data["user_id"] = user_id

        response = self.supabase.table("weekly_goals").insert(goal_data).execute()

        if not response.data:
            raise Exception("Failed to create weekly goal")

        return WeeklyGoal(**self._parse_datetime_fields(response.data[0]))

    async def update(
        self,
        goal_id: str,
        user_id: str,
        data: WeeklyGoalUpdate
    ) -> Optional[WeeklyGoal]:
        """
        Update an existing weekly goal.
        """
        update_data = data.model_dump(exclude_unset=True)
        
        # Convert date to ISO string if present
        if "week_start" in update_data and update_data["week_start"]:
            update_data["week_start"] = update_data["week_start"].isoformat()

        response = self.supabase.table("weekly_goals") \
            .update(update_data) \
            .eq("id", goal_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return WeeklyGoal(**self._parse_datetime_fields(response.data[0])) if response.data else None

    async def soft_delete(
        self,
        goal_id: str,
        user_id: str
    ) -> Optional[WeeklyGoal]:
        """
        Soft delete a weekly goal by setting deleted_at timestamp.
        """
        deleted_at = datetime.now(timezone.utc).isoformat()

        response = self.supabase.table("weekly_goals") \
            .update({"deleted_at": deleted_at}) \
            .eq("id", goal_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return WeeklyGoal(**self._parse_datetime_fields(response.data[0])) if response.data else None

    def _parse_datetime_fields(self, data: dict) -> dict:
        """
        Parse datetime string fields to datetime objects and date strings to date objects.
        """
        datetime_fields = ["created_at", "updated_at", "deleted_at"]
        result = data.copy()

        # Parse datetime fields
        for field in datetime_fields:
            if field in result and result[field] and isinstance(result[field], str):
                result[field] = datetime.fromisoformat(result[field].replace("Z", "+00:00"))

        # Parse date field (week_start)
        if "week_start" in result and result["week_start"] and isinstance(result["week_start"], str):
            result["week_start"] = date.fromisoformat(result["week_start"])

        return result
