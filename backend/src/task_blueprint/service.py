from supabase import Client
from typing import List, Optional
from datetime import date, datetime, timezone

from src.task_blueprint.schemas import (
    TaskBlueprint,
    TaskBlueprintCreate,
    TaskBlueprintUpdate,
    TaskBlueprintWithRelations,
    TagInfo,
    WeeklyGoalInfo
)


class TaskBlueprintService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_by_id(
        self,
        task_id: str,
        user_id: str,
        include_deleted: bool = False
    ) -> Optional[TaskBlueprint]:
        """
        Get a single task blueprint by ID.
        """
        query = self.supabase.table("task_blueprints").select("*").eq("id", task_id).eq("user_id", user_id)

        if not include_deleted:
            query = query.is_("deleted_at", "null")

        response = query.execute()
        
        if not response.data:
            return None
        
        return TaskBlueprint(**self._parse_datetime_fields(response.data[0]))

    async def get_user_task_blueprints(
        self,
        user_id: str,
        date_filter: Optional[date] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        include_deleted: bool = False
    ) -> List[TaskBlueprint]:
        """
        Get task blueprints for a specific user with optional date filtering.
        """
        query = self.supabase.table("task_blueprints").select("*").eq("user_id", user_id)

        if date_filter:
            # Filter by single date
            query = query.eq("date", date_filter.isoformat())
        elif start_date and end_date:
            # Filter by date range
            query = query.gte("date", start_date.isoformat()).lte("date", end_date.isoformat())
        elif start_date:
            # Only start date provided
            query = query.gte("date", start_date.isoformat())
        elif end_date:
            # Only end date provided
            query = query.lte("date", end_date.isoformat())

        if not include_deleted:
            query = query.is_("deleted_at", "null")

        # Order by order field ascending, then by created_at
        query = query.order("order", desc=False).order("created_at", desc=False)

        response = query.execute()
        data = response.data if response.data else []

        return [TaskBlueprint(**self._parse_datetime_fields(task_dict)) for task_dict in data]

    async def get_user_task_blueprints_with_relations(
        self,
        user_id: str,
        date_filter: Optional[date] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        include_deleted: bool = False
    ) -> List[TaskBlueprintWithRelations]:
        """
        Get task blueprints for a specific user with embedded tag and weekly goal information.
        Uses Supabase implicit relationship to join tags and weekly_goals tables.
        """
        # Use Supabase's implicit relationship syntax to include tag and weekly_goal data
        query = self.supabase.table("task_blueprints").select(
            "*, tags(id, name, color), weekly_goals(id, text)"
        ).eq("user_id", user_id)

        if date_filter:
            query = query.eq("date", date_filter.isoformat())
        elif start_date and end_date:
            query = query.gte("date", start_date.isoformat()).lte("date", end_date.isoformat())
        elif start_date:
            query = query.gte("date", start_date.isoformat())
        elif end_date:
            query = query.lte("date", end_date.isoformat())

        if not include_deleted:
            query = query.is_("deleted_at", "null")

        # Order by order field ascending, then by created_at
        query = query.order("order", desc=False).order("created_at", desc=False)

        response = query.execute()
        data = response.data if response.data else []

        # Transform the response to match TaskBlueprintWithRelations schema
        result = []
        for task_dict in data:
            parsed_task = self._parse_datetime_fields(task_dict)

            # Extract and transform the nested tags object to tag
            tags_data = parsed_task.pop("tags", None)
            if tags_data and isinstance(tags_data, dict):
                parsed_task["tag"] = TagInfo(**tags_data)
            else:
                parsed_task["tag"] = None

            # Extract and transform the nested weekly_goals object to weekly_goal
            weekly_goals_data = parsed_task.pop("weekly_goals", None)
            if weekly_goals_data and isinstance(weekly_goals_data, dict):
                parsed_task["weekly_goal"] = WeeklyGoalInfo(**weekly_goals_data)
            else:
                parsed_task["weekly_goal"] = None

            result.append(TaskBlueprintWithRelations(**parsed_task))

        return result

    async def create(
        self,
        user_id: str,
        data: TaskBlueprintCreate
    ) -> TaskBlueprint:
        """
        Create a new task blueprint for a user.
        """
        task_data = data.model_dump()
        # Convert date to ISO string for Supabase
        task_data["date"] = task_data["date"].isoformat()
        task_data["user_id"] = user_id

        response = self.supabase.table("task_blueprints").insert(task_data).execute()

        if not response.data:
            raise Exception("Failed to create task blueprint")

        return TaskBlueprint(**self._parse_datetime_fields(response.data[0]))

    async def update(
        self,
        task_id: str,
        user_id: str,
        data: TaskBlueprintUpdate
    ) -> Optional[TaskBlueprint]:
        """
        Update an existing task blueprint.
        """
        update_data = data.model_dump(exclude_unset=True)

        # Convert date to ISO string if present
        if "date" in update_data and update_data["date"]:
            update_data["date"] = update_data["date"].isoformat()

        response = self.supabase.table("task_blueprints") \
            .update(update_data) \
            .eq("id", task_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return TaskBlueprint(**self._parse_datetime_fields(response.data[0])) if response.data else None

    async def soft_delete(
        self,
        task_id: str,
        user_id: str
    ) -> Optional[TaskBlueprint]:
        """
        Soft delete a task blueprint by setting deleted_at timestamp.
        """
        deleted_at = datetime.now(timezone.utc).isoformat()

        response = self.supabase.table("task_blueprints") \
            .update({"deleted_at": deleted_at}) \
            .eq("id", task_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return TaskBlueprint(**self._parse_datetime_fields(response.data[0])) if response.data else None

    async def batch_update_order(
        self,
        user_id: str,
        task_orders: List[dict]
    ) -> List[TaskBlueprint]:
        """
        Batch update the order field for multiple task blueprints.
        task_orders should be a list of dicts with 'id' and 'order' keys.
        Example: [{"id": "uuid1", "order": 0}, {"id": "uuid2", "order": 1}]
        """
        updated_tasks = []
        
        for task_order in task_orders:
            task_id = task_order.get("id")
            new_order = task_order.get("order")
            
            if task_id is None or new_order is None:
                continue
            
            # Update each task individually
            response = self.supabase.table("task_blueprints") \
                .update({"order": new_order}) \
                .eq("id", task_id) \
                .eq("user_id", user_id) \
                .is_("deleted_at", "null") \
                .execute()
            
            if response.data:
                updated_tasks.append(TaskBlueprint(**self._parse_datetime_fields(response.data[0])))
        
        return updated_tasks

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

        # Parse date field
        if "date" in result and result["date"] and isinstance(result["date"], str):
            result["date"] = date.fromisoformat(result["date"])

        return result
