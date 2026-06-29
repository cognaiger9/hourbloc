from fastapi import APIRouter, HTTPException, Depends, Query, status
from supabase import Client
from typing import List, Literal
from datetime import datetime

from src.supabase import get_supabase_admin_client
from src.dependencies import get_current_user
from src.block.schemas import Block, BlockCreate, BlockUpdate, BlockWithTag
from src.block.service import BlockService

router = APIRouter()


@router.get("/", response_model=List[BlockWithTag])
async def get_blocks(
    start_date: str | None = None,
    end_date: str | None = None,
    block_type: Literal["planned", "actual"] | None = Query(None, description="Filter by block type: 'planned' or 'actual'"),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Get all time blocks for the authenticated user with embedded tag information.
    Optionally filtered by date range and block type.
    """
    user_id = user["id"]

    # Parse date strings to datetime objects if provided
    start_date_obj = None
    end_date_obj = None
    if start_date:
        try:
            start_date_obj = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            # Ensure timezone is present
            if start_date_obj.tzinfo is None:
                raise HTTPException(
                    status_code=400,
                    detail="start_date must include timezone information (ISO 8601 with Z or timezone offset)"
                )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use ISO 8601 format.")
    if end_date:
        try:
            end_date_obj = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            # Ensure timezone is present
            if end_date_obj.tzinfo is None:
                raise HTTPException(
                    status_code=400,
                    detail="end_date must include timezone information (ISO 8601 with Z or timezone offset)"
                )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO 8601 format.")

    try:
        # Get blocks with tag information from service
        blocks = await BlockService(supabase).get_user_blocks_with_tags(
            user_id,
            block_type=block_type,
            start_date=start_date_obj,
            end_date=end_date_obj,
            include_deleted=False
        )
        return blocks
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting blocks: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get blocks: {str(e)}")


@router.post("/", response_model=Block, status_code=status.HTTP_201_CREATED)
async def create_block(
    block: BlockCreate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Create a new time block for the authenticated user
    """
    user_id = user["id"]

    try:
        created_block = await BlockService(supabase).create(user_id, block)
        return created_block
    except Exception as e:
        import traceback
        print(f"Error creating block: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create block: {str(e)}")


@router.put("/{block_id}", response_model=Block)
async def update_block(
    block_id: str,
    block: BlockUpdate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Update an existing time block (only if owned by the authenticated user)
    """
    user_id = user["id"]

    try:
        updated_block = await BlockService(supabase).update(block_id, user_id, block)
        if not updated_block:
            raise HTTPException(status_code=404, detail="Block not found")
        return updated_block
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error updating block: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to update block: {str(e)}")


@router.delete("/{block_id}", status_code=status.HTTP_200_OK)
async def delete_block(
    block_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Delete a time block (only if owned by the authenticated user)
    """
    user_id = user["id"]

    try:
        deleted_block = await BlockService(supabase).soft_delete(block_id, user_id)
        if not deleted_block:
            # Check if block exists but belongs to different user or is already deleted
            # First check if block exists at all
            check_response = supabase.table("blocks").select("id, user_id, deleted_at").eq("id", block_id).execute()
            if not check_response.data:
                raise HTTPException(status_code=404, detail="Block not found")
            elif check_response.data[0].get("user_id") != user_id:
                raise HTTPException(status_code=403, detail="Block does not belong to this user")
            elif check_response.data[0].get("deleted_at"):
                raise HTTPException(status_code=404, detail="Block already deleted")
            else:
                raise HTTPException(status_code=404, detail="Block not found")
        return {"message": "Block deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error deleting block: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to delete block: {str(e)}")
