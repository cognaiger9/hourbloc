from fastapi import APIRouter, HTTPException, Depends, status
from supabase import Client
from typing import List

from src.supabase import get_supabase_admin_client
from src.dependencies import get_current_user
from src.tag.schemas import Tag, TagCreate, TagUpdate
from src.tag.service import TagService

router = APIRouter()


@router.get("/", response_model=List[Tag])
async def get_tags(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Get all tags for the authenticated user
    """
    try:
        tags = await TagService(supabase).get_user_tags(user["id"])
        return tags
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tags: {str(e)}"
        )


@router.post("/", response_model=Tag, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag: TagCreate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Create a new tag for the authenticated user
    Free tier: Limited to 2 tags
    Premium tier: Unlimited tags
    """
    try:
        created_tag = await TagService(supabase).create(user["id"], tag)
        return created_tag
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create tag: {str(e)}"
        )


@router.put("/{tag_id}", response_model=Tag)
async def update_tag(
    tag_id: str,
    tag: TagUpdate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Update an existing tag (only if owned by the authenticated user)
    """
    try:
        updated_tag = await TagService(supabase).update(tag_id, user["id"], tag)

        if not updated_tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found"
            )

        return updated_tag
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update tag: {str(e)}"
        )


@router.delete("/{tag_id}", status_code=status.HTTP_200_OK)
async def delete_tag(
    tag_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Delete a tag (only if owned by the authenticated user)
    """
    try:
        deleted_tag = await TagService(supabase).soft_delete(tag_id, user["id"])

        if not deleted_tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found"
            )

        return {"message": "Tag deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete tag: {str(e)}"
        )
