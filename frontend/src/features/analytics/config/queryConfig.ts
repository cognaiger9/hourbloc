/**
 * TanStack Query configuration for analytics data
 */

export const ANALYTICS_QUERY_CONFIG = {
  // Today's data changes frequently
  TODAY: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  },

  // Overview data (today + historical)
  OVERVIEW: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },

  // Historical data changes rarely
  HISTORICAL: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 2 * 60 * 60 * 1000, // 2 hours
  },
} as const;
