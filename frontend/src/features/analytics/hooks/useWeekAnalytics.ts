'use client';

import { useQuery } from '@tanstack/react-query';
import { getWeekAnalytics } from '../api/analytics';
import { ANALYTICS_QUERY_CONFIG } from '../config/queryConfig';
import type { WeekAnalyticsData } from '../types';
import { analyticsKeys } from '@/lib/queryKeys';

interface UseWeekAnalyticsResult {
  data: WeekAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Check if a date falls within the current week
 */
function isCurrentWeek(weekStart: Date): boolean {
  // Get the Monday of the current week
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() + diff);
  currentWeekStart.setHours(0, 0, 0, 0);

  return (
    weekStart.getFullYear() === currentWeekStart.getFullYear() &&
    weekStart.getMonth() === currentWeekStart.getMonth() &&
    weekStart.getDate() === currentWeekStart.getDate()
  );
}

/**
 * Hook to fetch and manage week analytics data using TanStack Query
 */
export function useWeekAnalytics(weekStart: Date): UseWeekAnalyticsResult {
  const isThisWeek = isCurrentWeek(weekStart);

  // Create a stable query key using the week start date components
  const queryKey = analyticsKeys.week(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getWeekAnalytics(weekStart),
    // Current week: shorter cache times (2 min stale, 15 min cache)
    // Historical weeks: longer cache times (15 min stale, 2 hour cache)
    staleTime: isThisWeek
      ? ANALYTICS_QUERY_CONFIG.TODAY.staleTime
      : ANALYTICS_QUERY_CONFIG.HISTORICAL.staleTime,
    gcTime: isThisWeek
      ? ANALYTICS_QUERY_CONFIG.TODAY.cacheTime
      : ANALYTICS_QUERY_CONFIG.HISTORICAL.cacheTime,
    // Override global setting: refetch on mount if stale
    // This is critical for focus → analytics flow where invalidateAll() marks cache as stale
    refetchOnMount: true,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch week analytics') : null,
    refetch: () => {
      refetch();
    },
  };
}
