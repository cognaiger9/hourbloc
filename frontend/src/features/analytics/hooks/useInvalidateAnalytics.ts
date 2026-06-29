/**
 * Hook for invalidating analytics and blocks cache
 * Use this when user modifies data that affects analytics and blocks
 */

import { useQueryClient } from '@tanstack/react-query';

export function useInvalidateAnalytics() {
  const queryClient = useQueryClient();

  /**
   * Invalidate all analytics and blocks data
   * Use this for major data changes or manual refresh
   * Per docs: invalidate ALL caches when blocks are created/updated/deleted
   * Note: Not specifying refetchType will mark inactive queries as stale,
   * so they refetch when next mounted (e.g., navigating to review page)
   */
  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: ['analytics'],
    });
    queryClient.invalidateQueries({
      queryKey: ['blocks'],
    });
  };

  return {
    invalidateAll
  };
}
