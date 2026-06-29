/**
 * API client for backlog task operations
 */

import { apiRequest } from '@/utils/api/client';
import { BacklogTask } from '../types';

/**
 * API response type matching backend schema
 * Backend returns ISO datetime strings
 */
export interface ApiBacklogTask {
  id: string;
  user_id: string;
  text: string;
  description: string | null;
  completed: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * API response type for task blueprint (for move operation)
 */
export interface ApiTaskBlueprint {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  date: string;
  tag_id: string | null;
  weekly_goal_id: string | null;
  completed: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Convert API response to BacklogTask (with Date objects)
 */
export function apiToBacklogTask(apiTask: ApiBacklogTask): BacklogTask {
  return {
    id: apiTask.id,
    text: apiTask.text,
    description: apiTask.description || undefined,
    completed: apiTask.completed,
    order: apiTask.order,
    created_at: new Date(apiTask.created_at),
    updated_at: new Date(apiTask.updated_at),
  };
}

/**
 * Backlog API methods
 */
export const backlogApi = {
  /**
   * Get all backlog tasks with optional completion filter
   */
  async getAll(params?: { completed?: boolean }): Promise<ApiBacklogTask[]> {
    const queryParams = new URLSearchParams();
    if (params?.completed !== undefined) {
      queryParams.append('completed', params.completed.toString());
    }

    const endpoint = `/api/v1/backlog/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ApiBacklogTask[]>(endpoint);
  },

  /**
   * Create a new backlog task
   */
  async create(data: {
    text: string;
    description?: string | null;
    completed?: boolean;
    order?: number;
  }): Promise<ApiBacklogTask> {
    return apiRequest<ApiBacklogTask>('/api/v1/backlog/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing backlog task
   */
  async update(
    taskId: string,
    data: {
      text?: string;
      description?: string | null;
      completed?: boolean;
      order?: number;
    }
  ): Promise<ApiBacklogTask> {
    return apiRequest<ApiBacklogTask>(`/api/v1/backlog/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a backlog task (soft delete)
   */
  async delete(taskId: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/api/v1/backlog/${taskId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Batch reorder backlog tasks
   */
  async reorder(taskOrders: Array<{ id: string; order: number }>): Promise<ApiBacklogTask[]> {
    return apiRequest<ApiBacklogTask[]>('/api/v1/backlog/reorder', {
      method: 'PATCH',
      body: JSON.stringify(taskOrders),
    });
  },

  /**
   * Move backlog task to task blueprint for a specific date
   */
  async moveToTaskBlueprint(taskId: string, targetDate: string): Promise<ApiTaskBlueprint> {
    return apiRequest<ApiTaskBlueprint>(
      `/api/v1/backlog/${taskId}/move-to-task-blueprint?target_date=${targetDate}`,
      {
        method: 'POST',
      }
    );
  },

  // Export helper for use in hooks
  apiToBacklogTask,
};
