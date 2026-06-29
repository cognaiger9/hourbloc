from supabase import Client
from typing import List, Optional, Literal
from datetime import datetime, timezone

from src.block.schemas import Block, BlockCreate, BlockUpdate, BlockWithTag, TagInfo


class BlockService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_user_blocks(
        self,
        user_id: str,
        block_type: Optional[Literal["planned", "actual"]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        include_deleted: bool = False
    ) -> List[Block]:
        """
        Get blocks for a specific user with optional filtering.
        """
        query = self.supabase.table("blocks").select("*").eq("user_id", user_id)

        if block_type:
            query = query.eq("block_type", block_type)

        if start_date:
            query = query.gte("start_time", start_date.isoformat())

        if end_date:
            # Filter by start_time to ensure blocks appear on the day they started,
            # even if they cross midnight and end on the next day
            query = query.lte("start_time", end_date.isoformat())

        if not include_deleted:
            query = query.is_("deleted_at", "null")

        response = query.execute()
        data = response.data if response.data else []

        return [Block(**self._parse_datetime_fields(block_dict)) for block_dict in data]

    async def get_user_blocks_with_tags(
        self,
        user_id: str,
        block_type: Optional[Literal["planned", "actual"]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        include_deleted: bool = False
    ) -> List[BlockWithTag]:
        """
        Get blocks for a specific user with embedded tag information.
        Uses Supabase implicit relationship to join tags table.
        """
        # Use Supabase's implicit relationship syntax to include tag data
        query = self.supabase.table("blocks").select(
            "*, tags(id, name, color)"
        ).eq("user_id", user_id)

        if block_type:
            query = query.eq("block_type", block_type)

        if start_date:
            query = query.gte("start_time", start_date.isoformat())

        if end_date:
            query = query.lte("start_time", end_date.isoformat())

        if not include_deleted:
            query = query.is_("deleted_at", "null")

        response = query.execute()
        data = response.data if response.data else []

        # Transform the response to match BlockWithTag schema
        result = []
        for block_dict in data:
            parsed_block = self._parse_datetime_fields(block_dict)

            # Extract and transform the nested tags object to tag
            tags_data = parsed_block.pop("tags", None)
            if tags_data and isinstance(tags_data, dict):
                # Supabase returns the relationship as 'tags' (singular in our case)
                parsed_block["tag"] = TagInfo(**tags_data)
            else:
                parsed_block["tag"] = None

            result.append(BlockWithTag(**parsed_block))

        return result

    async def create(
        self,
        user_id: str,
        data: BlockCreate
    ) -> Block:
        """
        Create a new block for a user.
        """
        block_data = data.model_dump()
        # Convert datetime objects to ISO strings
        block_data = self._serialize_datetime(block_data)
        block_data["user_id"] = user_id

        response = self.supabase.table("blocks").insert(block_data).execute()

        if not response.data:
            raise Exception("Failed to create block")

        return Block(**self._parse_datetime_fields(response.data[0]))

    async def update(
        self,
        block_id: str,
        user_id: str,
        data: BlockUpdate
    ) -> Optional[Block]:
        """
        Update an existing block.
        """
        update_data = data.model_dump(exclude_unset=True)
        # Convert datetime objects to ISO strings
        update_data = self._serialize_datetime(update_data)

        response = self.supabase.table("blocks") \
            .update(update_data) \
            .eq("id", block_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return Block(**self._parse_datetime_fields(response.data[0])) if response.data else None

    async def soft_delete(
        self,
        block_id: str,
        user_id: str
    ) -> Optional[Block]:
        """
        Soft delete a block by setting deleted_at timestamp.
        """
        deleted_at = datetime.now(timezone.utc).isoformat()

        response = self.supabase.table("blocks") \
            .update({"deleted_at": deleted_at}) \
            .eq("id", block_id) \
            .eq("user_id", user_id) \
            .is_("deleted_at", "null") \
            .execute()

        return Block(**self._parse_datetime_fields(response.data[0])) if response.data else None

    def _serialize_datetime(self, data: dict) -> dict:
        """
        Convert datetime objects to ISO format strings for database storage.
        """
        result = {}
        for key, value in data.items():
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            else:
                result[key] = value
        return result

    def _parse_datetime_fields(self, data: dict) -> dict:
        """
        Parse datetime string fields to datetime objects for Pydantic validation.
        """
        datetime_fields = ["start_time", "end_time", "created_at", "updated_at", "deleted_at"]
        result = data.copy()

        for field in datetime_fields:
            if field in result and result[field] and isinstance(result[field], str):
                result[field] = datetime.fromisoformat(result[field].replace("Z", "+00:00"))

        return result
