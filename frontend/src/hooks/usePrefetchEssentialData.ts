'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/utils/api/tagsApi';
import { type StoredTag } from '@/types/tag';
import { tagKeys } from '@/lib/queryKeys';

// Shared conversion logic (same as useTags.ts)
function apiTagsToTags(apiTags: StoredTag[]) {
  return apiTags
    .filter((tag) => !tag.deleted_at)
    .map((apiTag) => ({
      id: apiTag.id,
      name: apiTag.name,
      color: apiTag.color,
    }));
}

export function usePrefetchEssentialData() {
  const queryClient = useQueryClient();

  const prefetchEssentialData = useCallback(async () => {
    console.log('[usePrefetchEssentialData] Starting prefetch...');

    // Prefetch tags using same config as useTagsQuery
    await queryClient.prefetchQuery({
      queryKey: tagKeys.all,
      queryFn: async () => {
        console.log('[usePrefetchEssentialData] Fetching tags...');
        const apiTags = await tagsApi.getAll();
        return apiTagsToTags(apiTags);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes (matches useTagsQuery)
    });

    console.log('[usePrefetchEssentialData] Prefetch complete');
  }, [queryClient]);

  return { prefetchEssentialData };
}
