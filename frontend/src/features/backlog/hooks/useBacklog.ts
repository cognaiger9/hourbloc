'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backlogApi } from '@/features/backlog/api/backlog';
import { BacklogTask } from '@/features/backlog/types';
import { formatDateKey } from '@/utils/dateUtils';
import { taskBlueprintKeys } from '@/features/calendar/hooks/useTaskBlueprints';

/**
 * Query key factory for backlog tasks
 */
export const backlogKeys = {
  all: ['backlog'] as const,
  lists: () => [...backlogKeys.all, 'list'] as const,
  list: (filters: { completed?: boolean }) => [...backlogKeys.lists(), filters] as const,
};

/**
 * Hook to fetch backlog tasks with optional completion filter
 */
export function useBacklogQuery(params?: { completed?: boolean }) {
  return useQuery({
    queryKey: backlogKeys.list(params || {}),
    queryFn: async () => {
      const apiTasks = await backlogApi.getAll(params);
      return apiTasks.map(backlogApi.apiToBacklogTask);
    },
    initialData: [], // Prevent hung state while query loads
    initialDataUpdatedAt: 0, // Mark initial data as stale to trigger immediate fetch
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Force refetch on component mount
  });
}

/**
 * Hook to create a new backlog task with optimistic updates
 */
export function useCreateBacklogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { text: string; description?: string; completed?: boolean; order?: number }) => {
      return backlogApi.create({
        ...data,
        description: data.description || null,
      });
    },
    // Optimistic update
    onMutate: async (newTaskData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: backlogKeys.all });

      // Snapshot previous values for all relevant queries
      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: backlogKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Create optimistic task
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticTask: BacklogTask = {
        id: tempId,
        text: newTaskData.text,
        description: newTaskData.description,
        completed: newTaskData.completed ?? false,
        order: newTaskData.order ?? 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Optimistically update all matching query caches
      queryClient.setQueriesData({ queryKey: backlogKeys.lists() }, (old: BacklogTask[] | undefined) => {
        if (!old) return [optimisticTask];
        return [...old, optimisticTask];
      });

      return { previousTasks, tempId };
    },
    // On success, replace optimistic task with real one and invalidate
    onSuccess: (createdTask, variables, context) => {
      queryClient.setQueriesData({ queryKey: backlogKeys.lists() }, (old: BacklogTask[] | undefined) => {
        if (!old) return old;
        return old.map((task) => {
          if (task.id === context?.tempId) {
            return {
              ...task,
              id: createdTask.id,
              created_at: new Date(createdTask.created_at),
              updated_at: new Date(createdTask.updated_at),
            };
          }
          return task;
        });
      });

      // Invalidate all backlog queries to ensure all views are in sync
      queryClient.invalidateQueries({ queryKey: backlogKeys.all });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

/**
 * Hook to update an existing backlog task with optimistic updates
 */
export function useUpdateBacklogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<BacklogTask, 'text' | 'description' | 'completed' | 'order'>>;
    }) => {
      const apiUpdates: any = {};
      if (updates.text !== undefined) apiUpdates.text = updates.text;
      if (updates.description !== undefined) apiUpdates.description = updates.description || null;
      if (updates.completed !== undefined) apiUpdates.completed = updates.completed;
      if (updates.order !== undefined) apiUpdates.order = updates.order;

      return backlogApi.update(id, apiUpdates);
    },
    // Optimistic update
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: backlogKeys.all });

      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: backlogKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: backlogKeys.lists() }, (old: BacklogTask[] | undefined) => {
        if (!old) return old;
        return old.map((task) => (task.id === id ? { ...task, ...updates, updated_at: new Date() } : task));
      });

      return { previousTasks };
    },
    // On success, update with real data and invalidate
    onSuccess: (updatedTask) => {
      const realTask = backlogApi.apiToBacklogTask(updatedTask);

      queryClient.setQueriesData({ queryKey: backlogKeys.lists() }, (old: BacklogTask[] | undefined) => {
        if (!old) return old;
        return old.map((task) => (task.id === updatedTask.id ? realTask : task));
      });

      // Invalidate all backlog queries to ensure all views are in sync
      queryClient.invalidateQueries({ queryKey: backlogKeys.all });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

/**
 * Hook to delete a backlog task with optimistic updates
 */
export function useDeleteBacklogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      return backlogApi.delete(taskId);
    },
    // Optimistic update
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: backlogKeys.all });

      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: backlogKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Optimistically remove
      queryClient.setQueriesData({ queryKey: backlogKeys.lists() }, (old: BacklogTask[] | undefined) => {
        if (!old) return old;
        return old.filter((task) => task.id !== taskId);
      });

      return { previousTasks };
    },
    // On success, invalidate all backlog queries
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backlogKeys.all });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

/**
 * Hook to toggle task completion with optimistic updates
 */
export function useToggleBacklogCompletionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, currentCompleted }: { taskId: string; currentCompleted: boolean }) => {
      // Use the pre-captured completion state to determine new state
      return backlogApi.update(taskId, { completed: !currentCompleted });
    },
    // Optimistic update
    onMutate: async ({ taskId }: { taskId: string; currentCompleted: boolean }) => {
      await queryClient.cancelQueries({ queryKey: backlogKeys.all });

      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: backlogKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Toggle completed state
      queryClient.setQueriesData({ queryKey: backlogKeys.lists() }, (old: BacklogTask[] | undefined) => {
        if (!old) return old;
        return old.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed, updated_at: new Date() } : task
        );
      });

      return { previousTasks };
    },
    // On success, invalidate all backlog queries
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backlogKeys.all });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

/**
 * Hook to reorder tasks with optimistic updates
 */
export function useReorderBacklogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskOrders: Array<{ id: string; order: number }>) => {
      return backlogApi.reorder(taskOrders);
    },
    // Optimistic update
    onMutate: async (taskOrders) => {
      await queryClient.cancelQueries({ queryKey: backlogKeys.all });

      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: backlogKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Create a map for quick lookup
      const orderMap = new Map(taskOrders.map((to) => [to.id, to.order]));

      // Optimistically update orders
      queryClient.setQueriesData({ queryKey: backlogKeys.lists() }, (old: BacklogTask[] | undefined) => {
        if (!old) return old;
        return old.map((task) => {
          const newOrder = orderMap.get(task.id);
          return newOrder !== undefined ? { ...task, order: newOrder, updated_at: new Date() } : task;
        });
      });

      return { previousTasks };
    },
    // On success, invalidate all backlog queries
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backlogKeys.all });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

/**
 * Hook to move a backlog task to task blueprints (calendar)
 * This crosses feature boundaries so it invalidates both backlog and task blueprint queries
 */
export function useMoveToTaskBlueprintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, targetDate }: { taskId: string; targetDate: string }) => {
      return backlogApi.moveToTaskBlueprint(taskId, targetDate);
    },
    // No optimistic update for cross-feature operations
    onSuccess: () => {
      // Invalidate backlog queries (task removed from backlog)
      queryClient.invalidateQueries({ queryKey: backlogKeys.all });
      // Invalidate task blueprint queries (task added to calendar)
      queryClient.invalidateQueries({ queryKey: taskBlueprintKeys.all });
    },
  });
}
