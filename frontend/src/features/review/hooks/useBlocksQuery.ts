'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ReviewBlock, ReviewStats } from '../types';
import { getBlocksForDate } from '../api/blocks';
import { useUser } from '@/contexts/UserContext';

/**
 * Query configuration for blocks
 * Same pattern as analytics query config
 */
const BLOCKS_QUERY_CONFIG = {
  TODAY: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
  HISTORICAL: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  },
} as const;

/**
 * Calculate total time and block count from blocks
 */
function calculateStats(blocks: ReviewBlock[]): ReviewStats {
  // Parse duration strings and sum them up
  let totalMinutes = 0;

  blocks.forEach((block) => {
    const duration = block.duration;
    // Parse "2h 15m" or "1h" or "30m" format
    const hourMatch = duration.match(/(\d+)h/);
    const minuteMatch = duration.match(/(\d+)m/);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

    totalMinutes += hours * 60 + minutes;
  });

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalTime = `${hours}:${mins.toString().padStart(2, '0')}`;

  return {
    totalTime,
    blockCount: blocks.length,
  };
}

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * React Query hook for fetching blocks for a specific date
 * Blocks now include embedded tag data from the API, no need to wait for tags
 */
export function useBlocksQuery(date: Date) {
  const { timezone } = useUser();

  // Determine cache config based on whether it's today or historical
  const queryConfig = isToday(date)
    ? BLOCKS_QUERY_CONFIG.TODAY
    : BLOCKS_QUERY_CONFIG.HISTORICAL;

  // Create stable query key
  const queryKey = ['blocks', date.toDateString(), timezone];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const blocks = await getBlocksForDate(date, timezone);
      return blocks;
    },
    // No need to wait for tags - they're embedded in the block response
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
    // Override global setting: refetch on mount if stale
    // This is critical for focus → review flow where invalidateAll() marks cache as stale
    refetchOnMount: true,
  });

  // Calculate stats from blocks
  const stats = useMemo(() => {
    return calculateStats(query.data || []);
  }, [query.data]);

  return {
    blocks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    stats,
    refetch: query.refetch,
  };
}
