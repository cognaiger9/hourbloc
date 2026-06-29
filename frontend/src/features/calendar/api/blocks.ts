/**
 * API methods for calendar blocks
 * Pure HTTP API calls only - no localStorage or state management
 */

import { apiRequest } from '@/utils/api/client';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { createLocalTimeISO } from '@/utils/timezoneUtils';

/**
 * API methods for blocks
 */
export const blocksApi = {
  /**
   * Get all blocks for the current user
   */
  async getAll(params?: {
    start_date?: string;
    end_date?: string;
    block_type?: 'planned' | 'actual';
  }): Promise<Array<{
    id: string;
    user_id: string;
    title: string;
    start_time: string;
    end_time: string;
    block_type: 'planned' | 'actual';
    tag_id: string | null;
    tag?: {
      id: string;
      name: string;
      color: string;
    } | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.block_type) queryParams.append('block_type', params.block_type);
    
    const queryString = queryParams.toString();
    return apiRequest(`/api/v1/blocks/?${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new block
   */
  async create(data: {
    title: string;
    start_time: string; // ISO datetime string
    end_time: string; // ISO datetime string
    block_type: 'planned' | 'actual';
    tag_id?: string | null;
    notes?: string | null;
  }): Promise<{
    id: string;
    user_id: string;
    title: string;
    start_time: string;
    end_time: string;
    block_type: 'planned' | 'actual';
    tag_id: string | null;
    tag?: {
      id: string;
      name: string;
      color: string;
    } | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }> {
    return apiRequest('/api/v1/blocks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing block
   */
  async update(
    blockId: string,
    data: {
      title?: string;
      start_time?: string;
      end_time?: string;
      block_type?: 'planned' | 'actual';
      tag_id?: string | null;
      notes?: string | null;
    }
  ): Promise<{
    id: string;
    user_id: string;
    title: string;
    start_time: string;
    end_time: string;
    block_type: 'planned' | 'actual';
    tag_id: string | null;
    tag?: {
      id: string;
      name: string;
      color: string;
    } | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }> {
    return apiRequest(`/api/v1/blocks/${blockId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a block (soft delete)
   */
  async delete(blockId: string): Promise<{ message: string }> {
    return apiRequest(`/api/v1/blocks/${blockId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Helper: Convert CalendarBlock to API format
   */
  calendarBlockToApiData(block: CalendarBlock, tagId: string | null, timezone: string) {
    // Convert local time to UTC using timezone
    const startTime = createLocalTimeISO(
      block.date,
      Math.floor(block.startTime),
      (block.startTime % 1) * 60,
      timezone
    );

    // Handle midnight crossing: if end time is before start time, add 1 day to end date
    const endDate = block.endTime < block.startTime
      ? new Date(block.date.getTime() + 86400000) // Add 1 day in milliseconds
      : block.date;

    const endTime = createLocalTimeISO(
      endDate,
      Math.floor(block.endTime),
      (block.endTime % 1) * 60,
      timezone
    );

    return {
      title: block.title || 'Untitled',
      start_time: startTime,
      end_time: endTime,
      block_type: 'planned' as const,
      tag_id: tagId || null,
      notes: block.description || null,
    };
  },
};

