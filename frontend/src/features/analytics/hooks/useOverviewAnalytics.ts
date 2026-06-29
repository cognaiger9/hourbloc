/**
 * TanStack Query hook for fetching and caching overview analytics
 */

import { useQuery } from '@tanstack/react-query';
import { getOverviewAnalytics } from '../api/analytics';
import { ANALYTICS_QUERY_CONFIG } from '../config/queryConfig';
import { analyticsKeys } from '@/lib/queryKeys';
import type {
  TodayData,
  LifetimeData,
  StreaksData,
  CalendarData,
  HeatmapDay,
} from '../types';

export interface OverviewAnalyticsData {
  todayData: TodayData;
  lifetimeData: LifetimeData;
  streaksData: StreaksData;
  calendarData: CalendarData;
  heatmapData: HeatmapDay[];
}

/**
 * Hook for fetching overview analytics with TanStack Query caching
 * @param month - 0-indexed month (0-11)
 * @param year - Year (e.g., 2026)
 * @returns TanStack Query result with analytics data, loading state, and error state
 */
export function useOverviewAnalytics(month: number, year: number) {
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  return useQuery({
    queryKey: analyticsKeys.overview(month, year),
    queryFn: () => getOverviewAnalytics(month, year),
    // Current month: shorter TTL (data changes frequently)
    // Past months: longer TTL (historical, immutable)
    staleTime: isCurrentMonth
      ? ANALYTICS_QUERY_CONFIG.OVERVIEW.staleTime
      : ANALYTICS_QUERY_CONFIG.HISTORICAL.staleTime,
    gcTime: isCurrentMonth
      ? ANALYTICS_QUERY_CONFIG.OVERVIEW.cacheTime
      : ANALYTICS_QUERY_CONFIG.HISTORICAL.cacheTime,
    // Override global setting: refetch on mount if stale
    // This is critical for focus → analytics flow where invalidateAll() marks cache as stale
    refetchOnMount: true,
  });
}
