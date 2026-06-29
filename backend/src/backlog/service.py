from supabase import Client
from typing import List, Optional
from datetime import datetime, timezone

from src.backlog.schemas import BacklogTask, BacklogTaskCreate, BacklogTaskUpdate


class BacklogTaskService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_by_id(
        self,
        task_id: str,
        user_id: str,
        include_deleted: bool = False
    ) -> Optional[BacklogTask]:
        """
        Get a single backlog task by ID.
        """
        query = self.supabase.table("backlog_tasks").select("*").eq("id", task_id).eq("user_id", user_id)

        if not include_deleted:
            query = query.is_("deleted_at", "null")

        response = query.execute()
        
        if not response.data:
            return None
        
        return BacklogTask(**self._parse_datetime_fields(response.data[0]))

    async def get_user_backlog_tasks(
        self,
        user_id: str,
        completed: Optional[bool] = None,
        include_deleted: bool = False
    ) -> List[BacklogTask]:
        """
        Get backlog tasks for a specific user with optional completion status filtering.
        """
        query = self.supabase.table("backlog_tasks").select("*").eq("user_id", user_id)

        if completed is not None:
            query = query.eq("completed", completed)

        if not include_deleted:
            query = query.is_("deleted_at", "null")

        # Order by order field ascending, then by created_at
        query = query.order("order", desc=False).order("created_at", desc=False)

        response = query.execute()
        data = response.data if response.data else []

        return [BacklogTask(**self._parse_datetime_fields(task_dict)) for task_dict in data]

    async def create(
        self,
        user_id: str,
        data: BacklogTaskCreate
    ) -> BacklogTask:
        """
        Create a new backlog task for a user.
        """
        task_data = data.model_dump()
        task_data["user_id"] = user_id

        response = self.supabase.table("backlog_tasks").insert(task_data).execute()

        if not response.data:
            raise Exception("Failed to create backlog task")

        return BacklogTask(**self._parse_datetime_fields(response.data[0]))

    async def update(
        self,
        task_id: str,
        user_id: str,
        data: BacklogTaskUpdate
    ) -> Optional[BacklogTask]:
        """
        Update an existing backlog task.
        """
        update_data = data.model_dump(exclude_unset=True)

        response = self.supabase.table("backlog_tasks") \
            .update(update_data) \
            .eq("id", task_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return BacklogTask(**self._parse_datetime_fields(response.data[0])) if response.data else None

    async def soft_delete(
        self,
        task_id: str,
        user_id: str
    ) -> Optional[BacklogTask]:
        """
        Soft delete a backlog task by setting deleted_at timestamp.
        """
        deleted_at = datetime.now(timezone.utc).isoformat()

        response = self.supabase.table("backlog_tasks") \
            .update({"deleted_at": deleted_at}) \
            .eq("id", task_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return BacklogTask(**self._parse_datetime_fields(response.data[0])) if response.data else None

    async def batch_update_order(
        self,
        user_id: str,
        task_orders: List[dict]
    ) -> List[BacklogTask]:
        """
        Batch update the order field for multiple backlog tasks.
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
            response = self.supabase.table("backlog_tasks") \
                .update({"order": new_order}) \
                .eq("id", task_id) \
                .eq("user_id", user_id) \
                .is_("deleted_at", "null") \
                .execute()
            
            if response.data:
                updated_tasks.append(BacklogTask(**self._parse_datetime_fields(response.data[0])))
        
        return updated_tasks

    def _parse_datetime_fields(self, data: dict) -> dict:
        """
        Parse datetime string fields to datetime objects.
        """
        datetime_fields = ["created_at", "updated_at", "deleted_at"]
        result = data.copy()

        # Parse datetime fields
        for field in datetime_fields:
            if field in result and result[field] and isinstance(result[field], str):
                result[field] = datetime.fromisoformat(result[field].replace("Z", "+00:00"))

        return result
