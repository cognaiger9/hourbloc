'use client';

import { useCallback } from 'react';
import { useTagsQuery } from '@/hooks/useTags';
import { useUser } from '@/contexts/UserContext';
import { useBlocksQuery } from './useBlocksQuery';
import {
  useCreateBlockMutation,
  useUpdateBlockMutation,
  useDeleteBlockMutation,
} from './useBlockMutations';

/**
 * Hook for managing review blocks for a specific date
 */
export function useReviewBlocks(date: Date) {
  const { data: tags = [] } = useTagsQuery();
  const { timezone } = useUser();

  // Use React Query for blocks
  const { blocks, isLoading, error, stats } = useBlocksQuery(date);

  // Get mutation hooks
  const createBlockMutation = useCreateBlockMutation();
  const updateBlockMutation = useUpdateBlockMutation();
  const deleteBlockMutation = useDeleteBlockMutation();

  const handleCreateBlock = useCallback(
    async (data: {
      title: string;
      startTime: string; // HH:mm format
      endTime: string; // HH:mm format
      tagId: string | null;
      notes?: string;
    }) => {
      try {
        // Convert HH:mm to ISO datetime for the viewing date
        const startDateTime = new Date(date);
        const [startHour, startMin] = data.startTime.split(':').map(Number);
        startDateTime.setHours(startHour, startMin, 0, 0);

        const endDateTime = new Date(date);
        const [endHour, endMin] = data.endTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMin, 0, 0);

        // Handle midnight crossing: if end time is before start time, add 1 day to end date
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        if (endMinutes < startMinutes) {
          // End time crosses midnight - add 1 day to end date
          endDateTime.setDate(endDateTime.getDate() + 1);
        }

        // Find tag info for optimistic update
        const tag = data.tagId ? tags.find((t) => t.id === data.tagId) : null;

        await createBlockMutation.mutateAsync({
          date,
          timezone,
          block: {
            title: data.title,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            tagId: data.tagId,
            tagName: tag?.name,
            tagColor: tag?.color,
            notes: data.notes,
          },
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create block';
        throw new Error(errorMessage);
      }
    },
    [date, timezone, tags, createBlockMutation]
  );

  const handleUpdateBlock = useCallback(
    async (blockId: string, updatedData: Partial<{ title: string; category: string; description: string; tagId: string | null }>) => {
      try {
        // Find the tag ID from the category name if category changed
        let tagId: string | null | undefined = undefined;
        let tagName: string | undefined = undefined;
        let tagColor: string | undefined = undefined;

        if (updatedData.category !== undefined) {
          const tag = tags.find((t) => t.name === updatedData.category);
          tagId = tag?.id || null;
          tagName = tag?.name || 'Other';
          tagColor = tag?.color;
        } else if (updatedData.tagId !== undefined) {
          tagId = updatedData.tagId;
          const tag = tagId ? tags.find((t) => t.id === tagId) : null;
          tagName = tag?.name || 'Other';
          tagColor = tag?.color;
        }

        await updateBlockMutation.mutateAsync({
          date,
          timezone,
          blockId,
          updates: {
            title: updatedData.title,
            tag_id: tagId,
            tagName,
            tagColor,
            notes: updatedData.description,
          },
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update block';
        throw new Error(errorMessage);
      }
    },
    [date, timezone, tags, updateBlockMutation]
  );

  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      try {
        await deleteBlockMutation.mutateAsync({
          date,
          timezone,
          blockId,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete block';
        throw new Error(errorMessage);
      }
    },
    [date, timezone, deleteBlockMutation]
  );

  return {
    blocks,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'An error occurred') : null,
    stats,
    createBlock: handleCreateBlock,
    updateBlock: handleUpdateBlock,
    deleteBlock: handleDeleteBlock,
  };
}
