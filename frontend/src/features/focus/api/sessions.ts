/**
 * API methods for focus sessions
 * Pure HTTP API calls only - no localStorage or state management
 */

import { apiRequest } from '@/utils/api/client';
import { createLocalTimeISO } from '@/utils/timezoneUtils';

export interface CreateFocusSessionParams {
  tagId: string | null;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  tagName: string;
  timezone: string;
  title?: string;
  notes?: string | null;
}

/**
 * API methods for focus sessions
 */
export const sessionsApi = {
  /**
   * Create a focus session block
   */
  async create({
    tagId,
    startTime,
    endTime,
    durationSeconds,
    tagName,
    timezone,
    title,
    notes,
  }: CreateFocusSessionParams): Promise<{
    id: string;
    user_id: string;
    title: string;
    start_time: string;
    end_time: string;
    block_type: 'planned' | 'actual';
    tag_id: string | null;
    notes: string | null;
    duration_seconds: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }> {
    const blockTitle = title || (tagName
      ? `Focus Session - ${tagName}`
      : 'Focus Session');

    return apiRequest('/api/v1/blocks/', {
      method: 'POST',
      body: JSON.stringify({
        title: blockTitle,
        start_time: createLocalTimeISO(startTime, timezone),
        end_time: createLocalTimeISO(endTime, timezone),
        duration_seconds: durationSeconds,
        block_type: 'actual',
        tag_id: tagId,
        notes: notes || null,
      }),
    });
  },
};

