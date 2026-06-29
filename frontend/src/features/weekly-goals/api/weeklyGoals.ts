/**
 * API methods for weekly goals
 * Pure HTTP API calls only - no localStorage or state management
 */

import { apiRequest } from '@/utils/api/client';
import { WeeklyGoal } from '../types';
import { formatDateKey } from '@/utils/dateUtils';

/**
 * API Response Types (matching backend schemas)
 */
interface ApiWeeklyGoal {
  id: string;
  user_id: string;
  text: string;
  description: string | null;
  completed: boolean;
  order: number;
  week_start: string; // ISO date format: YYYY-MM-DD
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  deleted_at: string | null;
}

/**
 * API methods for weekly goals
 */
export const weeklyGoalsApi = {
  /**
   * Get all weekly goals with optional week_start filtering
   */
  async getAll(params?: {
    week_start?: string; // ISO date format: YYYY-MM-DD
  }): Promise<ApiWeeklyGoal[]> {
    const queryParams = new URLSearchParams();
    if (params?.week_start) queryParams.append('week_start', params.week_start);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/v1/weekly-goals/?${queryString}` : '/api/v1/weekly-goals/';
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Create a new weekly goal
   */
  async create(data: {
    text: string;
    description?: string | null;
    completed?: boolean;
    order?: number;
    week_start: string; // YYYY-MM-DD
  }): Promise<ApiWeeklyGoal> {
    return apiRequest('/api/v1/weekly-goals/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing weekly goal
   */
  async update(
    goalId: string,
    data: {
      text?: string;
      description?: string | null;
      completed?: boolean;
      order?: number;
      week_start?: string; // YYYY-MM-DD
    }
  ): Promise<ApiWeeklyGoal> {
    return apiRequest(`/api/v1/weekly-goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a weekly goal (soft delete)
   */
  async delete(goalId: string): Promise<{ message: string }> {
    return apiRequest(`/api/v1/weekly-goals/${goalId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Helper: Convert API format to WeeklyGoal
   */
  apiToWeeklyGoal(apiGoal: ApiWeeklyGoal): WeeklyGoal {
    return {
      id: apiGoal.id,
      text: apiGoal.text,
      description: apiGoal.description || undefined,
      completed: apiGoal.completed,
      order: apiGoal.order,
      weekStart: new Date(apiGoal.week_start), // Parse YYYY-MM-DD to Date
      userId: apiGoal.user_id,
      createdAt: new Date(apiGoal.created_at),
      updatedAt: new Date(apiGoal.updated_at),
      deletedAt: apiGoal.deleted_at ? new Date(apiGoal.deleted_at) : undefined,
    };
  },

  /**
   * Helper: Convert WeeklyGoal to API format
   */
  weeklyGoalToApiData(
    goal: Partial<WeeklyGoal>
  ): {
    text: string;
    description: string | null;
    completed: boolean;
    order: number;
    week_start: string;
  } {
    // Format Date to YYYY-MM-DD string (local date, no timezone conversion)
    const weekStartStr = goal.weekStart
      ? formatDateKey(goal.weekStart)
      : formatDateKey(new Date());

    return {
      text: goal.text || '',
      description: goal.description || null,
      completed: goal.completed ?? false,
      order: goal.order ?? 0,
      week_start: weekStartStr,
    };
  },
};
