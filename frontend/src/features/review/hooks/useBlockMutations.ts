'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewBlock } from '../types';
import { createBlock, updateBlock, deleteBlock } from '../api/blocks';
import { formatMinutes, formatTimeRange } from '@/utils/dateUtils';
import { analyticsKeys, blockKeys } from '@/lib/queryKeys';

/**
 * Hook for creating a new block with optimistic updates
 */
export function useCreateBlockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      date: Date;
      timezone: string;
      block: {
        title: string;
        startTime: string; // ISO datetime
        endTime: string; // ISO datetime
        tagId: string | null;
        tagName?: string;
        tagColor?: string;
        notes?: string;
      };
    }) => {
      await createBlock({
        title: data.block.title,
        start_time: data.block.startTime,
        end_time: data.block.endTime,
        tag_id: data.block.tagId,
        notes: data.block.notes || null,
      });
    },
    // Optimistic update
    onMutate: async ({ date, timezone, block }) => {
      const queryKey = blockKeys.forDate(date.toDateString(), timezone);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousBlocks = queryClient.getQueryData<ReviewBlock[]>(queryKey);

      // Create optimistic block
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const startDate = new Date(block.startTime);
      const endDate = new Date(block.endTime);
      const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

      const optimisticBlock: ReviewBlock = {
        id: tempId,
        title: block.title,
        category: block.tagName || 'Other',
        categoryColor: block.tagColor || '#6b7280',
        categoryBg: `bg-[${block.tagColor || '#6b7280'}]`,
        categoryBorder: `border-[${block.tagColor || '#6b7280'}]`,
        description: block.notes,
        duration: formatMinutes(durationMinutes),
        timeRange: formatTimeRange(block.startTime, block.endTime),
        tagId: block.tagId,
      };

      // Optimistically update cache
      queryClient.setQueryData<ReviewBlock[]>(queryKey, (old = []) => [...old, optimisticBlock]);

      return { previousBlocks, queryKey };
    },
    // On success, invalidate all blocks and analytics
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: blockKeys.all,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.all,
        refetchType: 'active',
      });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousBlocks && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousBlocks);
      }
    },
  });
}

/**
 * Hook for updating a block with optimistic updates
 */
export function useUpdateBlockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      date: Date;
      timezone: string;
      blockId: string;
      updates: {
        title?: string;
        tag_id?: string | null;
        tagName?: string;
        tagColor?: string;
        notes?: string | null;
      };
    }) => {
      await updateBlock(data.blockId, {
        title: data.updates.title,
        tag_id: data.updates.tag_id,
        notes: data.updates.notes,
      });
    },
    // Optimistic update
    onMutate: async ({ date, timezone, blockId, updates }) => {
      const queryKey = blockKeys.forDate(date.toDateString(), timezone);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousBlocks = queryClient.getQueryData<ReviewBlock[]>(queryKey);

      // Optimistically update cache
      queryClient.setQueryData<ReviewBlock[]>(queryKey, (old = []) =>
        old.map((block) => {
          if (block.id !== blockId) return block;

          const updatedBlock = { ...block };
          if (updates.title !== undefined) updatedBlock.title = updates.title;
          if (updates.tagName !== undefined) updatedBlock.category = updates.tagName || 'Other';
          if (updates.tagColor !== undefined) {
            updatedBlock.categoryColor = updates.tagColor || '#6b7280';
            updatedBlock.categoryBg = `bg-[${updates.tagColor || '#6b7280'}]`;
            updatedBlock.categoryBorder = `border-[${updates.tagColor || '#6b7280'}]`;
          }
          if (updates.notes !== undefined) updatedBlock.description = updates.notes || undefined;
          if (updates.tag_id !== undefined) updatedBlock.tagId = updates.tag_id;

          return updatedBlock;
        })
      );

      return { previousBlocks, queryKey };
    },
    // On success, invalidate all blocks and analytics
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: blockKeys.all,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.all,
        refetchType: 'active',
      });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousBlocks && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousBlocks);
      }
    },
  });
}

/**
 * Hook for deleting a block with optimistic updates
 */
export function useDeleteBlockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { date: Date; timezone: string; blockId: string }) => {
      await deleteBlock(data.blockId);
    },
    // Optimistic update
    onMutate: async ({ date, timezone, blockId }) => {
      const queryKey = blockKeys.forDate(date.toDateString(), timezone);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousBlocks = queryClient.getQueryData<ReviewBlock[]>(queryKey);

      // Optimistically remove from cache
      queryClient.setQueryData<ReviewBlock[]>(queryKey, (old = []) =>
        old.filter((block) => block.id !== blockId)
      );

      return { previousBlocks, queryKey };
    },
    // On success, invalidate all blocks and analytics
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: blockKeys.all,
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.all,
        refetchType: 'active',
      });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousBlocks && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousBlocks);
      }
    },
  });
}
