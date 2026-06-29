from fastapi import APIRouter, HTTPException, Depends, Query, status
from supabase import Client
from typing import List, Optional

from src.supabase import get_supabase_admin_client
from src.dependencies import get_current_user
from src.backlog.schemas import BacklogTask, BacklogTaskCreate, BacklogTaskUpdate
from src.backlog.service import BacklogTaskService
from src.task_blueprint.service import TaskBlueprintService
from src.task_blueprint.schemas import TaskBlueprintCreate, TaskBlueprint
from datetime import date

router = APIRouter()


@router.get("/", response_model=List[BacklogTask])
async def get_backlog_tasks(
    completed: Optional[bool] = Query(None, description="Filter by completion status (true for completed, false for active)"),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Get all backlog tasks for the authenticated user.
    Optionally filtered by completion status.
    """
    user_id = user["id"]

    try:
        tasks = await BacklogTaskService(supabase).get_user_backlog_tasks(
            user_id,
            completed=completed,
            include_deleted=False
        )
        return tasks
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting backlog tasks: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get backlog tasks: {str(e)}"
        )


@router.post("/", response_model=BacklogTask, status_code=status.HTTP_201_CREATED)
async def create_backlog_task(
    task: BacklogTaskCreate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Create a new backlog task for the authenticated user
    """
    user_id = user["id"]

    try:
        created_task = await BacklogTaskService(supabase).create(user_id, task)
        return created_task
    except Exception as e:
        import traceback
        print(f"Error creating backlog task: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create backlog task: {str(e)}"
        )


@router.put("/{task_id}", response_model=BacklogTask)
async def update_backlog_task(
    task_id: str,
    task: BacklogTaskUpdate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Update an existing backlog task (only if owned by the authenticated user)
    """
    user_id = user["id"]

    try:
        updated_task = await BacklogTaskService(supabase).update(task_id, user_id, task)

        if not updated_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Backlog task not found"
            )

        return updated_task
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error updating backlog task: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update backlog task: {str(e)}"
        )


@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
async def delete_backlog_task(
    task_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Delete a backlog task (only if owned by the authenticated user)
    """
    user_id = user["id"]

    try:
        deleted_task = await BacklogTaskService(supabase).soft_delete(task_id, user_id)

        if not deleted_task:
            # Check if task exists but belongs to different user or is already deleted
            check_response = supabase.table("backlog_tasks").select("id, user_id, deleted_at").eq("id", task_id).execute()
            if not check_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Backlog task not found"
                )
            elif check_response.data[0].get("user_id") != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Backlog task does not belong to this user"
                )
            elif check_response.data[0].get("deleted_at"):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Backlog task already deleted"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Backlog task not found"
                )

        return {"message": "Backlog task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error deleting backlog task: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete backlog task: {str(e)}"
        )


@router.patch("/reorder", response_model=List[BacklogTask])
async def reorder_backlog_tasks(
    task_orders: List[dict],
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Batch update the order field for multiple backlog tasks.
    Body should be a list of objects with 'id' and 'order' fields.
    Example: [{"id": "uuid1", "order": 0}, {"id": "uuid2", "order": 1}]
    """
    user_id = user["id"]

    # Validate request body
    if not isinstance(task_orders, list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request body must be a list of objects with 'id' and 'order' fields"
        )

    for task_order in task_orders:
        if not isinstance(task_order, dict) or "id" not in task_order or "order" not in task_order:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Each item in the list must have 'id' and 'order' fields"
            )

    try:
        updated_tasks = await BacklogTaskService(supabase).batch_update_order(user_id, task_orders)
        return updated_tasks
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error reordering backlog tasks: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reorder backlog tasks: {str(e)}"
        )


@router.post("/{task_id}/move-to-task-blueprint", response_model=TaskBlueprint, status_code=status.HTTP_201_CREATED)
async def move_backlog_to_task_blueprint(
    task_id: str,
    target_date: str = Query(..., description="Target date for the task blueprint (ISO format: YYYY-MM-DD)"),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Move a backlog task to task blueprints for a specific date.
    This will create a task blueprint and soft-delete the backlog task atomically.
    """
    user_id = user["id"]

    # Parse target_date
    try:
        target_date_obj = date.fromisoformat(target_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target_date format. Use ISO date format (YYYY-MM-DD)."
        )

    try:
        # Get the backlog task
        backlog_task = await BacklogTaskService(supabase).get_by_id(task_id, user_id)
        if not backlog_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Backlog task not found"
            )

        # Create task blueprint from backlog task
        task_blueprint_data = TaskBlueprintCreate(
            title=backlog_task.text,  # text → title
            description=backlog_task.description,
            date=target_date_obj,
            completed=backlog_task.completed,
            order=0,  # Reset order
            tag_id=None,  # Backlog tasks don't have tags
            weekly_goal_id=None  # Backlog tasks don't have weekly goals
        )

        # Atomic operation: create task blueprint first, then soft-delete backlog task
        task_blueprint = await TaskBlueprintService(supabase).create(user_id, task_blueprint_data)
        await BacklogTaskService(supabase).soft_delete(task_id, user_id)

        return task_blueprint
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error moving backlog task to task blueprint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to move backlog task to task blueprint: {str(e)}"
        )
