'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/utils/api/tagsApi';
import { type StoredTag, type Tag } from '@/types/tag';

// Convert API tags to UI tags
function apiTagsToTags(apiTags: StoredTag[]): Tag[] {
  return apiTags
    .filter((tag) => !tag.deleted_at)
    .map((apiTag) => ({
      id: apiTag.id,
      name: apiTag.name,
      color: apiTag.color,
    }));
}

/**
 * Hook to fetch all tags
 * Uses React Query cache for instant UI
 */
export function useTagsQuery() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const apiTags = await tagsApi.getAll();
      return apiTagsToTags(apiTags);
    },
    initialData: [], // Prevent hung state while query loads
    initialDataUpdatedAt: 0, // Mark initial data as stale to trigger immediate fetch
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new tag with optimistic updates
 */
export function useCreateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      return tagsApi.create(data);
    },
    // Optimistic update
    onMutate: async (newTagData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tags'] });

      // Snapshot previous value
      const previousTags = queryClient.getQueryData<Tag[]>(['tags']);

      // Create optimistic tag
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticTag: Tag = {
        id: tempId,
        name: newTagData.name,
        color: newTagData.color,
      };

      // Optimistically update cache
      queryClient.setQueryData<Tag[]>(['tags'], (old = []) => [...old, optimisticTag]);

      return { previousTags, tempId };
    },
    // On success, replace optimistic tag with real one
    onSuccess: (createdTag, _variables, context) => {
      queryClient.setQueryData<Tag[]>(['tags'], (old = []) =>
        old.map((tag) =>
          tag.id === context?.tempId
            ? { id: createdTag.id, name: createdTag.name, color: createdTag.color }
            : tag
        )
      );
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(['tags'], context.previousTags);
      }
    },
  });
}

/**
 * Hook to update an existing tag with optimistic updates
 */
export function useUpdateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; color?: string } }) => {
      return tagsApi.update(id, updates);
    },
    // Optimistic update
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tags'] });

      // Snapshot previous value
      const previousTags = queryClient.getQueryData<Tag[]>(['tags']);

      // Optimistically update cache
      queryClient.setQueryData<Tag[]>(['tags'], (old = []) =>
        old.map((tag) =>
          tag.id === id
            ? { ...tag, ...(updates.name && { name: updates.name }), ...(updates.color && { color: updates.color }) }
            : tag
        )
      );

      return { previousTags };
    },
    // On success, update with real data
    onSuccess: (updatedTag) => {
      queryClient.setQueryData<Tag[]>(['tags'], (old = []) =>
        old.map((tag) =>
          tag.id === updatedTag.id
            ? { id: updatedTag.id, name: updatedTag.name, color: updatedTag.color }
            : tag
        )
      );
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(['tags'], context.previousTags);
      }
    },
  });
}

/**
 * Hook to delete a tag with optimistic updates
 */
export function useDeleteTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagId: string) => {
      return tagsApi.delete(tagId);
    },
    // Optimistic update
    onMutate: async (tagId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tags'] });

      // Snapshot previous value
      const previousTags = queryClient.getQueryData<Tag[]>(['tags']);

      // Optimistically remove from cache
      queryClient.setQueryData<Tag[]>(['tags'], (old = []) =>
        old.filter((tag) => tag.id !== tagId)
      );

      return { previousTags };
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(['tags'], context.previousTags);
      }
    },
  });
}

/**
 * Utility hook to find a tag by name
 */
export function useFindTagByName(name: string): Tag | undefined {
  const { data: tags = [] } = useTagsQuery();
  return tags.find((tag) => tag.name === name);
}
