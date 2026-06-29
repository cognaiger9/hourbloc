/**
 * API methods for review blocks
 * Fetches blocks for a specific date and converts them to ReviewBlock format
 */

import { apiRequest } from '@/utils/api/client';
import { formatDuration, formatTimeRange } from '@/utils/dateUtils';
import { localToUTC } from '@/utils/timezoneUtils';
import { getTagColorStyles } from '@/utils/tagColors';
import { ReviewBlock, ApiBlock } from '../types';


/**
 * Convert API block to ReviewBlock format
 * Now uses embedded tag data from the API response (no need for tag lookup)
 */
function apiBlockToReviewBlock(apiBlock: ApiBlock): ReviewBlock {
  // Use embedded tag data from API response
  const category = apiBlock.tag?.name || 'Other';
  const tagColor = apiBlock.tag?.color || '#6B7280';
  const colorStyles = getTagColorStyles(tagColor);

  return {
    id: apiBlock.id,
    title: apiBlock.title,
    category,
    ...colorStyles,
    description: apiBlock.notes || undefined,
    duration: formatDuration(apiBlock.start_time, apiBlock.end_time),
    timeRange: formatTimeRange(apiBlock.start_time, apiBlock.end_time),
    tagId: apiBlock.tag_id,
  };
}

/**
 * Get blocks for a specific date
 * Blocks now include embedded tag data from the API
 */
export async function getBlocksForDate(
  date: Date,
  timezone: string
): Promise<ReviewBlock[]> {
  // Convert local day boundaries to UTC using user's timezone
  const startOfDayUTC = localToUTC(date, 0, timezone); // 00:00 in user's timezone
  const endOfDayUTC = localToUTC(date, 23.999, timezone); // 23:59:59.999 in user's timezone

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('start_date', startOfDayUTC);
  queryParams.append('end_date', endOfDayUTC);
  queryParams.append('block_type', 'actual');

  const apiBlocks = await apiRequest<ApiBlock[]>(`/api/v1/blocks/?${queryParams.toString()}`, {
    method: 'GET',
  });

  // Filter out deleted blocks and convert to ReviewBlock format
  const dayBlocks = apiBlocks.filter((block) => !block.deleted_at);

  return dayBlocks.map((block) => apiBlockToReviewBlock(block));
}

/**
 * Update a block
 */
export async function updateBlock(
  blockId: string,
  data: {
    title?: string;
    tag_id?: string | null;
    notes?: string | null;
  }
): Promise<void> {
  await apiRequest(`/api/v1/blocks/${blockId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a block
 */
export async function deleteBlock(blockId: string): Promise<void> {
  await apiRequest(`/api/v1/blocks/${blockId}`, {
    method: 'DELETE',
  });
}

/**
 * Create a new actual block for review
 */
export async function createBlock(data: {
  title: string;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  tag_id?: string | null;
  notes?: string | null;
}): Promise<void> {
  await apiRequest('/api/v1/blocks/', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      block_type: 'actual', // Always actual for review
    }),
  });
}

