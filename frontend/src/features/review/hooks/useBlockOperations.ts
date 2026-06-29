'use client';

import { useCallback } from 'react';
import { ReviewBlock } from '../types';
import { parseDurationToMinutes } from '@/utils/dateUtils';
import { trackReviewEvent } from '@/utils/analytics/reviewEvents';
import { useInvalidateAnalytics } from '@/features/analytics/hooks/useInvalidateAnalytics';

interface UseBlockOperationsParams {
  createBlock: (data: {
    title: string;
    startTime: string;
    endTime: string;
    tagId: string | null;
    notes?: string;
  }) => Promise<void>;
  updateBlock: (blockId: string, updatedBlock: Partial<ReviewBlock>) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  onSuccess?: () => void;
}

/**
 * Hook for handling block CRUD operations with analytics tracking
 */
export function useBlockOperations({
  createBlock,
  updateBlock,
  deleteBlock,
  onSuccess,
}: UseBlockOperationsParams) {
  const { invalidateAll } = useInvalidateAnalytics();

  const handleCreateBlock = useCallback(
    async (data: {
      title: string;
      startTime: string;
      endTime: string;
      tagId: string | null;
      notes?: string;
    }) => {
      try {
        // Calculate duration for tracking
        const duration = Math.round(
          (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / (1000 * 60)
        );
        trackReviewEvent.blockCreated({
          hasTag: !!data.tagId,
          duration,
        });

        await createBlock(data);
        invalidateAll(); // Invalidate all analytics data
        onSuccess?.();
      } catch (error) {
        console.error('Failed to create block:', error);
        throw error;
      }
    },
    [createBlock, invalidateAll, onSuccess]
  );

  const handleUpdateBlock = useCallback(
    async (blockId: string, updatedBlock: Partial<ReviewBlock>) => {
      try {
        // Track which fields were changed
        const fieldsChanged = Object.keys(updatedBlock);
        trackReviewEvent.blockEdited(blockId, fieldsChanged);

        await updateBlock(blockId, updatedBlock);
        invalidateAll();
      } catch (error) {
        console.error('Failed to update block:', error);
        throw error;
      }
    },
    [updateBlock, invalidateAll]
  );

  const handleDeleteBlock = useCallback(
    async (block: ReviewBlock) => {
      try {
        // Parse duration string to get total minutes for tracking
        const duration = parseDurationToMinutes(block.duration);
        trackReviewEvent.blockDeleted(block.id, duration);

        await deleteBlock(block.id);
        invalidateAll(); // Invalidate all analytics data
      } catch (error) {
        console.error('Failed to delete block:', error);
        throw error;
      }
    },
    [deleteBlock, invalidateAll]
  );

  return {
    handleCreateBlock,
    handleUpdateBlock,
    handleDeleteBlock,
  };
}
