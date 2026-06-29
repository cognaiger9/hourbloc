'use client';

import { QueryClient } from '@tanstack/react-query';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { useCalendarStore } from '@/features/calendar/store/calendarStore';
import { blockKeys } from '@/features/calendar/hooks/useBlocks';

/**
 * Find block by ID - checks store (single temp) then cache (saved)
 *
 * This provides a unified lookup that handles both:
 * - Temp blocks (unsaved, living in Zustand store)
 * - Saved blocks (persisted, living in React Query cache)
 */
export function findBlock(
  blockId: string | null,
  queryClient: QueryClient
): CalendarBlock | null {
  if (!blockId) return null;

  // FIRST: Check store for THE temp block
  const store = useCalendarStore.getState();
  if (store.tempBlock && store.tempBlock.id === blockId) {
    return store.tempBlock;
  }

  // SECOND: Check cache for saved blocks
  const blockQueries = queryClient.getQueriesData({ queryKey: blockKeys.lists() });
  for (const [_, data] of blockQueries) {
    const blocks = data as CalendarBlock[] | undefined;
    if (!blocks) continue;
    const found = blocks.find((b) => b.id === blockId);
    if (found) return found;
  }

  return null;
}

/**
 * Merge temp block (if exists) with saved blocks for rendering
 *
 * Used by views to combine both sources of blocks:
 * - Saved blocks from React Query cache
 * - Single temp block from Zustand store (if exists)
 */
export function getMergedBlocks(
  savedBlocks: CalendarBlock[],
  tempBlock: CalendarBlock | null
): CalendarBlock[] {
  if (!tempBlock) return savedBlocks;

  return [...savedBlocks, tempBlock];
}

/**
 * Check if block ID is temporary
 * Temp blocks have IDs starting with 'temp-'
 */
export function isTempBlock(blockId: string): boolean {
  return blockId.startsWith('temp-');
}
