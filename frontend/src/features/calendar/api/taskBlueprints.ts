/**
 * API methods for task blueprints
 * Pure HTTP API calls only - no localStorage or state management
 */

import { apiRequest } from '@/utils/api/client';
import { TaskBlueprint } from '@/features/calendar/types/taskBlueprint';

/**
 * API Response Types (matching backend schemas)
 */
interface ApiTaskBlueprint {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  date: string; // ISO date format: YYYY-MM-DD
  tag_id: string | null;
  weekly_goal_id: string | null;
  completed: boolean;
  order: number;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  deleted_at: string | null;
}

interface ApiTaskBlueprintWithRelations extends ApiTaskBlueprint {
  tag: { id: string; name: string; color: string } | null;
  weekly_goal: { id: string; text: string } | null;
}

/**
 * API methods for task blueprints
 */
export const taskBlueprintsApi = {
  /**
   * Get all task blueprints with optional date filtering
   */
  async getAll(params?: {
    date?: string; // Single date filter (YYYY-MM-DD)
    start_date?: string; // Range filter (YYYY-MM-DD)
    end_date?: string; // Range filter (YYYY-MM-DD)
  }): Promise<ApiTaskBlueprintWithRelations[]> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    return apiRequest(`/api/v1/task-blueprints/${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new task blueprint
   */
  async create(data: {
    title: string;
    description?: string | null;
    date: string; // YYYY-MM-DD
    tag_id?: string | null;
    weekly_goal_id?: string | null;
    completed?: boolean;
    order?: number;
  }): Promise<ApiTaskBlueprint> {
    return apiRequest('/api/v1/task-blueprints/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing task blueprint
   */
  async update(
    taskId: string,
    data: {
      title?: string;
      description?: string | null;
      date?: string;
      tag_id?: string | null;
      weekly_goal_id?: string | null;
      completed?: boolean;
      order?: number;
    }
  ): Promise<ApiTaskBlueprint> {
    return apiRequest(`/api/v1/task-blueprints/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a task blueprint (soft delete)
   */
  async delete(taskId: string): Promise<{ message: string }> {
    return apiRequest(`/api/v1/task-blueprints/${taskId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Batch reorder task blueprints
   */
  async reorder(taskOrders: Array<{ id: string; order: number }>): Promise<ApiTaskBlueprint[]> {
    return apiRequest('/api/v1/task-blueprints/reorder', {
      method: 'PATCH',
      body: JSON.stringify(taskOrders),
    });
  },

  /**
   * Move task blueprint to backlog
   */
  async moveToBacklog(taskId: string): Promise<{
    id: string;
    text: string;
    description: string | null;
    completed: boolean;
    order: number;
  }> {
    return apiRequest(`/api/v1/task-blueprints/${taskId}/move-to-backlog`, {
      method: 'POST',
    });
  },

  /**
   * Helper: Convert API format to TaskBlueprint
   */
  apiToTaskBlueprint(apiTask: ApiTaskBlueprintWithRelations): TaskBlueprint {
    // Parse date string to local Date object (not UTC)
    // Using new Date(dateString) would parse as UTC midnight, causing timezone shifts
    const [year, month, day] = apiTask.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed

    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description || undefined,
      date: localDate,
      tag: apiTask.tag?.name || undefined,
      weeklyGoalId: apiTask.weekly_goal_id || undefined,
      completed: apiTask.completed,
      order: apiTask.order,
      createdAt: new Date(apiTask.created_at),
      updatedAt: new Date(apiTask.updated_at),
    };
  },

  /**
   * Helper: Convert TaskBlueprint to API format
   */
  taskBlueprintToApiData(
    task: Partial<TaskBlueprint>,
    tagId: string | null
  ): {
    title: string;
    description: string | null;
    date: string;
    tag_id: string | null;
    weekly_goal_id: string | null;
    completed: boolean;
    order: number;
  } {
    // Convert Date to YYYY-MM-DD
    const dateStr = task.date ? task.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    return {
      title: task.title || 'Untitled Task',
      description: task.description || null,
      date: dateStr,
      tag_id: tagId,
      weekly_goal_id: task.weeklyGoalId || null,
      completed: task.completed ?? false,
      order: task.order ?? 0,
    };
  },
};
