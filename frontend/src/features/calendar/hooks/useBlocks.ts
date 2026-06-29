'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blocksApi } from '@/features/calendar/api/blocks';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { parseLocalTimeISO } from '@/utils/timezoneUtils';
import { trackCalendarEvent } from '@/utils/analytics/calendarEvents';
import { trackActivationMilestone } from '@/utils/analytics/activationEvents';
import { useCalendarStore } from '@/features/calendar/store/calendarStore';
import { blockKeys } from '@/lib/queryKeys';

export { blockKeys };

/**
 * Format Date to YYYY-MM-DD string for stable cache keys
 */
function formatDateForCacheKey(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD
}

/**
 * Hook to fetch blocks with optional filtering
 * Blocks include embedded tag data from the API, no need to wait for tags
 */
export function useBlocksQuery(
  params: {
    startDate?: Date;
    endDate?: Date;
    blockType?: 'planned' | 'actual';
  },
  timezone: string
) {
  // API parameters with full timestamps
  const apiParams = {
    start_date: params.startDate?.toISOString(),
    end_date: params.endDate?.toISOString(),
    block_type: params.blockType || 'planned',
  };

  // Cache key parameters with date-only strings
  const cacheKeyParams = {
    start_date: formatDateForCacheKey(params.startDate),
    end_date: formatDateForCacheKey(params.endDate),
    block_type: params.blockType || 'planned',
  };

  return useQuery({
    queryKey: blockKeys.list(cacheKeyParams),
    queryFn: async () => {
      const apiBlocks = await blocksApi.getAll(apiParams);

      // Convert API blocks to CalendarBlock format
      return apiBlocks.map((apiBlock): CalendarBlock => {
        // Use embedded tag data from API response
        const tagName = apiBlock.tag?.name || '';

        // Parse UTC times and convert to user's timezone
        const startParsed = parseLocalTimeISO(apiBlock.start_time, timezone);
        const endParsed = parseLocalTimeISO(apiBlock.end_time, timezone);

        return {
          id: apiBlock.id,
          date: startParsed.date,
          startTime: startParsed.timeDecimal,
          endTime: endParsed.timeDecimal,
          title: apiBlock.title,
          description: apiBlock.notes || '',
          tag: tagName,
          isNewlyCreated: false,
        };
      });
    },
    initialData: [],
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Force refetch on component mount even if initialData exists
  });
}

/**
 * Hook to create a new block with optimistic updates
 */
export function useCreateBlockMutation(timezone: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (block: CalendarBlock & { tagId?: string | null }) => {
      const tagId = block.tagId || null;
      const blockData = blocksApi.calendarBlockToApiData(block, tagId, timezone);
      return blocksApi.create(blockData);
    },
    // Optimistic update
    onMutate: async (block) => {
      await queryClient.cancelQueries({ queryKey: blockKeys.all });

      const previousBlocks = new Map();
      queryClient.getQueriesData({ queryKey: blockKeys.lists() }).forEach(([key, data]) => {
        previousBlocks.set(key, data);
      });

      // Create optimistic block
      const optimisticBlock: CalendarBlock = {
        ...block,
        isNewlyCreated: false,
      };

      // Optimistically add to cache
      queryClient.setQueriesData({ queryKey: blockKeys.lists() }, (old: CalendarBlock[] | undefined) => {
        if (!old) return [optimisticBlock];
        return [...old.filter((b) => b.id !== block.id), optimisticBlock];
      });

      return { previousBlocks, tempId: block.id };
    },
    // On success, replace with real block
    onSuccess: (createdBlock, variables, context) => {
      const store = useCalendarStore.getState();

      // Clean up temp block from store if this was a temp block creation
      if (context?.tempId?.startsWith('temp-')) {
        store.clearTempBlock();

        // Update selection to real block ID if temp block was selected
        if (store.selectedBlockId === context.tempId) {
          store.selectBlock(createdBlock.id, store.modalPosition ?? undefined);
        }
      }

      // Use embedded tag data from API response, fallback to variables if not returned
      const tagName = createdBlock.tag?.name || variables.tag || '';

      const startParsed = parseLocalTimeISO(createdBlock.start_time, timezone);
      const endParsed = parseLocalTimeISO(createdBlock.end_time, timezone);

      const realBlock: CalendarBlock = {
        id: createdBlock.id,
        date: startParsed.date,
        startTime: startParsed.timeDecimal,
        endTime: endParsed.timeDecimal,
        title: createdBlock.title,
        description: createdBlock.notes || '',
        tag: tagName,
        isNewlyCreated: false,
      };

      // Add real block to cache (temp block was never in cache, so just add)
      queryClient.setQueriesData({ queryKey: blockKeys.lists() }, (old: CalendarBlock[] | undefined) => {
        if (!old) return [realBlock];
        // No need to filter out temp block - it was never in cache
        return [...old, realBlock];
      });

      queryClient.invalidateQueries({ queryKey: blockKeys.all });

      // Track analytics
      const duration = Math.round((variables.endTime - variables.startTime) * 60);
      trackCalendarEvent.blockCreated({
        id: createdBlock.id,
        duration,
        hasTag: !!variables.tag,
        hasNotes: !!variables.description,
        viewMode: 'week',
      });

      // Check if this is the first block
      const allBlocks = queryClient.getQueryData<CalendarBlock[]>(blockKeys.list({ block_type: 'planned' }));
      if (allBlocks && allBlocks.filter((b) => !b.id.startsWith('temp-')).length === 1) {
        trackActivationMilestone.firstBlock();
      }
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousBlocks) {
        context.previousBlocks.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

/**
 * Hook to update an existing block with optimistic updates
 */
export function useUpdateBlockMutation(timezone: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ block, tagId }: { block: CalendarBlock; tagId?: string | null }) => {
      const finalTagId = tagId || null;
      const blockData = blocksApi.calendarBlockToApiData(block, finalTagId, timezone);
      return blocksApi.update(block.id, blockData);
    },
    // Optimistic update
    onMutate: async ({ block }) => {
      await queryClient.cancelQueries({ queryKey: blockKeys.all });

      const previousBlocks = new Map();
      queryClient.getQueriesData({ queryKey: blockKeys.lists() }).forEach(([key, data]) => {
        previousBlocks.set(key, data);
      });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: blockKeys.lists() }, (old: CalendarBlock[] | undefined) => {
        if (!old) return old;
        return old.map((b) => (b.id === block.id ? { ...block, isNewlyCreated: false } : b));
      });

      return { previousBlocks };
    },
    // On success, update with real data
    onSuccess: (updatedBlock, variables) => {
      // Use embedded tag data from API response, fallback to variables if not returned
      const tagName = updatedBlock.tag?.name || variables.block.tag || '';

      const startParsed = parseLocalTimeISO(updatedBlock.start_time, timezone);
      const endParsed = parseLocalTimeISO(updatedBlock.end_time, timezone);

      const realBlock: CalendarBlock = {
        id: updatedBlock.id,
        date: startParsed.date,
        startTime: startParsed.timeDecimal,
        endTime: endParsed.timeDecimal,
        title: updatedBlock.title,
        description: updatedBlock.notes || '',
        tag: tagName,
        isNewlyCreated: false,
      };

      queryClient.setQueriesData({ queryKey: blockKeys.lists() }, (old: CalendarBlock[] | undefined) => {
        if (!old) return old;
        return old.map((b) => (b.id === updatedBlock.id ? realBlock : b));
      });

      queryClient.invalidateQueries({ queryKey: blockKeys.all });

      // Track analytics
      trackCalendarEvent.blockEdited({
        id: updatedBlock.id,
        fields_changed: [],
      });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousBlocks) {
        context.previousBlocks.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

/**
 * Hook to delete a block with optimistic updates
 */
export function useDeleteBlockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockId: string) => {
      // Skip API call for temp blocks
      if (blockId.startsWith('temp-')) {
        return { message: 'Temp block deleted' };
      }
      return blocksApi.delete(blockId);
    },
    // Optimistic update
    onMutate: async (blockId) => {
      await queryClient.cancelQueries({ queryKey: blockKeys.all });

      const previousBlocks = new Map();
      queryClient.getQueriesData({ queryKey: blockKeys.lists() }).forEach(([key, data]) => {
        previousBlocks.set(key, data);
      });

      // Find block for analytics
      let deletedBlock: CalendarBlock | undefined;
      queryClient.getQueriesData({ queryKey: blockKeys.lists() }).forEach(([_, data]) => {
        const blocks = data as CalendarBlock[] | undefined;
        const found = blocks?.find((b) => b.id === blockId);
        if (found) deletedBlock = found;
      });

      // Track deletion
      if (deletedBlock) {
        const duration = Math.round((deletedBlock.endTime - deletedBlock.startTime) * 60);
        trackCalendarEvent.blockDeleted({
          id: blockId,
          duration,
        });
      }

      // Optimistically remove
      queryClient.setQueriesData({ queryKey: blockKeys.lists() }, (old: CalendarBlock[] | undefined) => {
        if (!old) return old;
        return old.filter((b) => b.id !== blockId);
      });

      return { previousBlocks };
    },
    // On success, invalidate all block queries
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousBlocks) {
        context.previousBlocks.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}
