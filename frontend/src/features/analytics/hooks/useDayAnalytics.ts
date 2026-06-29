'use client';

import { useQuery } from '@tanstack/react-query';
import { getDayAnalytics } from '../api/analytics';
import { ANALYTICS_QUERY_CONFIG } from '../config/queryConfig';
import type { DayAnalyticsData } from '../types';

interface UseDayAnalyticsResult {
  data: DayAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage day analytics data using TanStack Query
 */
export function useDayAnalytics(date: Date): UseDayAnalyticsResult {
  // Check if the date is today
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Create a stable query key using the date components
  const queryKey = [
    'analytics',
    'day',
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getDayAnalytics(date),
    // Today's data: shorter cache times (2 min stale, 15 min cache)
    // Historical data: longer cache times (15 min stale, 2 hour cache)
    staleTime: isToday
      ? ANALYTICS_QUERY_CONFIG.TODAY.staleTime
      : ANALYTICS_QUERY_CONFIG.HISTORICAL.staleTime,
    gcTime: isToday
      ? ANALYTICS_QUERY_CONFIG.TODAY.cacheTime
      : ANALYTICS_QUERY_CONFIG.HISTORICAL.cacheTime,
    // Override global setting: refetch on mount if stale
    // This is critical for focus → analytics flow where invalidateAll() marks cache as stale
    refetchOnMount: true,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch day analytics') : null,
    refetch: () => {
      refetch();
    },
  };
}

