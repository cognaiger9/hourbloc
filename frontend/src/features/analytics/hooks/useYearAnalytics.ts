'use client';

import { useQuery } from '@tanstack/react-query';
import { getYearAnalytics } from '../api/analytics';
import { ANALYTICS_QUERY_CONFIG } from '../config/queryConfig';
import type { YearAnalyticsData } from '../types';

interface UseYearAnalyticsResult {
  data: YearAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage year analytics data using TanStack Query
 */
export function useYearAnalytics(year: number): UseYearAnalyticsResult {
  const currentYear = new Date().getFullYear();
  const isCurrentYear = year === currentYear;

  // Create a stable query key using the year
  const queryKey = ['analytics', 'year', year];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getYearAnalytics(year),
    // Current year: shorter cache times (5 min stale, 1 hour cache)
    // Historical years: longer cache times (15 min stale, 2 hour cache)
    staleTime: isCurrentYear
      ? ANALYTICS_QUERY_CONFIG.OVERVIEW.staleTime
      : ANALYTICS_QUERY_CONFIG.HISTORICAL.staleTime,
    gcTime: isCurrentYear
      ? ANALYTICS_QUERY_CONFIG.OVERVIEW.cacheTime
      : ANALYTICS_QUERY_CONFIG.HISTORICAL.cacheTime,
    // Override global setting: refetch on mount if stale
    // This is critical for focus → analytics flow where invalidateAll() marks cache as stale
    refetchOnMount: true,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch year analytics') : null,
    refetch: () => {
      refetch();
    },
  };
}
