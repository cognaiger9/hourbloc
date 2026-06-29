from supabase import Client
from typing import List, Optional
from datetime import datetime, timezone

from src.tag.schemas import Tag, TagCreate, TagUpdate


class TagService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_user_tags(
        self,
        user_id: str,
        include_deleted: bool = False
    ) -> List[Tag]:
        """
        Get all tags for a specific user.
        """
        query = self.supabase.table("tags").select("*").eq("user_id", user_id)

        if not include_deleted:
            query = query.is_("deleted_at", "null")

        response = query.execute()
        data = response.data if response.data else []

        return [Tag(**tag_dict) for tag_dict in data]

    async def create(
        self,
        user_id: str,
        data: TagCreate
    ) -> Tag:
        """
        Create a new tag for a user.
        """
        tag_data = data.model_dump()
        tag_data["user_id"] = user_id

        response = self.supabase.table("tags").insert(tag_data).execute()

        if not response.data:
            raise Exception("Failed to create tag")

        return Tag(**response.data[0])

    async def update(
        self,
        tag_id: str,
        user_id: str,
        data: TagUpdate
    ) -> Optional[Tag]:
        """
        Update an existing tag.
        """
        update_data = data.model_dump(exclude_unset=True)

        response = self.supabase.table("tags") \
            .update(update_data) \
            .eq("id", tag_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return Tag(**response.data[0]) if response.data else None

    async def soft_delete(
        self,
        tag_id: str,
        user_id: str
    ) -> Optional[Tag]:
        """
        Soft delete a tag by setting deleted_at timestamp.
        """
        deleted_at = datetime.now(timezone.utc).isoformat()

        response = self.supabase.table("tags") \
            .update({"deleted_at": deleted_at}) \
            .eq("id", tag_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return Tag(**response.data[0]) if response.data else None
