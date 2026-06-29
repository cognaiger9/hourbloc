from fastapi import APIRouter, HTTPException, Depends, Query, status
from supabase import Client
from typing import List, Optional
from datetime import date as DateClass

from src.supabase import get_supabase_admin_client
from src.dependencies import get_current_user
from src.task_blueprint.schemas import (
    TaskBlueprint,
    TaskBlueprintCreate,
    TaskBlueprintUpdate,
    TaskBlueprintWithRelations
)
from src.task_blueprint.service import TaskBlueprintService
from src.backlog.service import BacklogTaskService
from src.backlog.schemas import BacklogTaskCreate, BacklogTask

router = APIRouter()


@router.get("/", response_model=List[TaskBlueprintWithRelations])
async def get_task_blueprints(
    date: Optional[str] = Query(None, description="Filter by single date (ISO format: YYYY-MM-DD)"),
    start_date: Optional[str] = Query(None, description="Filter by start date (ISO format: YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (ISO format: YYYY-MM-DD)"),
    include_relations: bool = Query(True, description="Include tag and weekly goal information"),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Get all task blueprints for the authenticated user.
    Optionally filtered by date (single date) or date range (start_date and end_date).
    """
    user_id = user["id"]
    date_filter = None
    start_date_obj = None
    end_date_obj = None

    # Parse date filters if provided
    if date:
        try:
            date_filter = DateClass.fromisoformat(date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use ISO date format (YYYY-MM-DD)."
            )

    if start_date:
        try:
            start_date_obj = DateClass.fromisoformat(start_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use ISO date format (YYYY-MM-DD)."
            )

    if end_date:
        try:
            end_date_obj = DateClass.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use ISO date format (YYYY-MM-DD)."
            )

    # Validate date range
    if start_date_obj and end_date_obj and start_date_obj > end_date_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be before or equal to end_date"
        )

    try:
        service = TaskBlueprintService(supabase)
        # Always use with_relations since response model requires TaskBlueprintWithRelations
        # If relations aren't needed, they'll be None in the response
        task_blueprints = await service.get_user_task_blueprints_with_relations(
            user_id,
            date_filter=date_filter,
            start_date=start_date_obj,
            end_date=end_date_obj,
            include_deleted=False
        )
        return task_blueprints
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error getting task blueprints: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task blueprints: {str(e)}"
        )


@router.post("/", response_model=TaskBlueprint, status_code=status.HTTP_201_CREATED)
async def create_task_blueprint(
    task_blueprint: TaskBlueprintCreate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Create a new task blueprint for the authenticated user
    """
    user_id = user["id"]

    try:
        created_task = await TaskBlueprintService(supabase).create(user_id, task_blueprint)
        return created_task
    except Exception as e:
        import traceback
        print(f"Error creating task blueprint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task blueprint: {str(e)}"
        )


@router.put("/{task_id}", response_model=TaskBlueprint)
async def update_task_blueprint(
    task_id: str,
    task_blueprint: TaskBlueprintUpdate,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Update an existing task blueprint (only if owned by the authenticated user)
    """
    user_id = user["id"]

    try:
        updated_task = await TaskBlueprintService(supabase).update(task_id, user_id, task_blueprint)

        if not updated_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task blueprint not found"
            )

        return updated_task
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error updating task blueprint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task blueprint: {str(e)}"
        )


@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
async def delete_task_blueprint(
    task_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Delete a task blueprint (only if owned by the authenticated user)
    """
    user_id = user["id"]

    try:
        deleted_task = await TaskBlueprintService(supabase).soft_delete(task_id, user_id)

        if not deleted_task:
            # Check if task exists but belongs to different user or is already deleted
            check_response = supabase.table("task_blueprints").select("id, user_id, deleted_at").eq("id", task_id).execute()
            if not check_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task blueprint not found"
                )
            elif check_response.data[0].get("user_id") != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Task blueprint does not belong to this user"
                )
            elif check_response.data[0].get("deleted_at"):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task blueprint already deleted"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task blueprint not found"
                )

        return {"message": "Task blueprint deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error deleting task blueprint: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task blueprint: {str(e)}"
        )


@router.patch("/reorder", response_model=List[TaskBlueprint])
async def reorder_task_blueprints(
    task_orders: List[dict],
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Batch update the order field for multiple task blueprints.
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
        updated_tasks = await TaskBlueprintService(supabase).batch_update_order(user_id, task_orders)
        return updated_tasks
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error reordering task blueprints: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reorder task blueprints: {str(e)}"
        )


@router.post("/{task_id}/move-to-backlog", response_model=BacklogTask, status_code=status.HTTP_201_CREATED)
async def move_task_blueprint_to_backlog(
    task_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin_client)
):
    """
    Move a task blueprint to the backlog.
    This will create a backlog task and soft-delete the task blueprint atomically.
    """
    user_id = user["id"]

    try:
        # Get the task blueprint
        task_blueprint = await TaskBlueprintService(supabase).get_by_id(task_id, user_id)
        if not task_blueprint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task blueprint not found"
            )

        # Create backlog task from task blueprint
        backlog_task_data = BacklogTaskCreate(
            text=task_blueprint.title,  # title → text
            description=task_blueprint.description,
            completed=task_blueprint.completed,
            order=0  # Reset order
        )

        # Atomic operation: create backlog task first, then soft-delete task blueprint
        backlog_task = await BacklogTaskService(supabase).create(user_id, backlog_task_data)
        await TaskBlueprintService(supabase).soft_delete(task_id, user_id)

        return backlog_task
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error moving task blueprint to backlog: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to move task blueprint to backlog: {str(e)}"
        )
