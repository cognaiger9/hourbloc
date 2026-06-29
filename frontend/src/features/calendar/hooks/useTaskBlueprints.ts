'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskBlueprintsApi } from '@/features/calendar/api/taskBlueprints';
import { TaskBlueprint } from '@/features/calendar/types/taskBlueprint';
import { formatDateKey } from '@/utils/dateUtils';

/**
 * Query key factory for task blueprints
 */
export const taskBlueprintKeys = {
  all: ['taskBlueprints'] as const,
  lists: () => [...taskBlueprintKeys.all, 'list'] as const,
  list: (filters: { date?: string; start_date?: string; end_date?: string }) =>
    [...taskBlueprintKeys.lists(), filters] as const,
};

/**
 * Hook to fetch task blueprints with optional date filtering
 */
export function useTaskBlueprintsQuery(params?: {
  date?: Date;
  startDate?: Date;
  endDate?: Date;
}) {
  // Convert Date objects to YYYY-MM-DD strings using local timezone
  const queryParams = params
    ? {
        date: params.date ? formatDateKey(params.date) : undefined,
        start_date: params.startDate ? formatDateKey(params.startDate) : undefined,
        end_date: params.endDate ? formatDateKey(params.endDate) : undefined,
      }
    : {};

  return useQuery({
    queryKey: taskBlueprintKeys.list(queryParams),
    queryFn: async () => {
      const apiTasks = await taskBlueprintsApi.getAll(queryParams);
      return apiTasks.map(taskBlueprintsApi.apiToTaskBlueprint);
    },
    initialData: [], // Prevent hung state while query loads
    initialDataUpdatedAt: 0, // Mark initial data as stale to trigger immediate fetch
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Force refetch on component mount even if initialData exists
  });
}

/**
 * Hook to create a new task blueprint with optimistic updates
 */
export function useCreateTaskBlueprintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      date: Date;
      tag?: string;
      tagId?: string | null;
      weeklyGoalId?: string | null;
      completed?: boolean;
      order?: number;
    }) => {
      const apiData = {
        title: data.title,
        description: data.description || null,
        date: formatDateKey(data.date), // Use local date formatting
        tag_id: data.tagId || null,
        weekly_goal_id: data.weeklyGoalId || null,
        completed: data.completed ?? false,
        order: data.order ?? 0,
      };
      return taskBlueprintsApi.create(apiData);
    },
    // Optimistic update
    onMutate: async (newTaskData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskBlueprintKeys.all });

      // Snapshot previous values for all relevant queries
      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: taskBlueprintKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Create optimistic task
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticTask: TaskBlueprint = {
        id: tempId,
        title: newTaskData.title,
        description: newTaskData.description,
        date: newTaskData.date,
        tag: newTaskData.tag,
        weeklyGoalId: newTaskData.weeklyGoalId || undefined,
        completed: newTaskData.completed ?? false,
        order: newTaskData.order ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistically update all matching query caches
      queryClient.setQueriesData(
        { queryKey: taskBlueprintKeys.lists() },
        (old: TaskBlueprint[] | undefined) => {
          if (!old) return [optimisticTask];
          return [...old, optimisticTask];
        }
      );

      return { previousTasks, tempId };
    },
    // On success, replace optimistic task with real one and invalidate
    onSuccess: (createdTask, variables, context) => {
      queryClient.setQueriesData(
        { queryKey: taskBlueprintKeys.lists() },
        (old: TaskBlueprint[] | undefined) => {
          if (!old) return old;
          // Update the temp task with the real ID, but preserve tag/goal data from optimistic update
          return old.map((task) => {
            if (task.id === context?.tempId) {
              return {
                ...task, // Preserve optimistic data (including tag)
                id: createdTask.id, // Use real ID from server
                createdAt: new Date(createdTask.created_at),
                updatedAt: new Date(createdTask.updated_at),
              };
            }
            return task;
          });
        }
      );

      // Invalidate all task blueprint queries to ensure all views are in sync
      queryClient.invalidateQueries({ queryKey: taskBlueprintKeys.all });
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
 * Hook to update an existing task blueprint with optimistic updates
 */
export function useUpdateTaskBlueprintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      tagId,
    }: {
      id: string;
      updates: Partial<TaskBlueprint>;
      tagId?: string | null;
    }) => {
      const apiUpdates: any = {};
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.description !== undefined) apiUpdates.description = updates.description || null;
      if (updates.date !== undefined) apiUpdates.date = formatDateKey(updates.date);
      if (tagId !== undefined) apiUpdates.tag_id = tagId;
      if (updates.weeklyGoalId !== undefined) apiUpdates.weekly_goal_id = updates.weeklyGoalId || null;
      if (updates.completed !== undefined) apiUpdates.completed = updates.completed;
      if (updates.order !== undefined) apiUpdates.order = updates.order;

      return taskBlueprintsApi.update(id, apiUpdates);
    },
    // Optimistic update
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: taskBlueprintKeys.all });

      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: taskBlueprintKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: taskBlueprintKeys.lists() },
        (old: TaskBlueprint[] | undefined) => {
          if (!old) return old;
          return old.map((task) => (task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task));
        }
      );

      return { previousTasks };
    },
    // On success, update with real data and invalidate
    onSuccess: (updatedTask) => {
      const realTask = taskBlueprintsApi.apiToTaskBlueprint({
        ...updatedTask,
        tag: null,
        weekly_goal: null,
      });

      queryClient.setQueriesData(
        { queryKey: taskBlueprintKeys.lists() },
        (old: TaskBlueprint[] | undefined) => {
          if (!old) return old;
          return old.map((task) => (task.id === updatedTask.id ? realTask : task));
        }
      );

      // Invalidate all task blueprint queries to ensure all views are in sync
      queryClient.invalidateQueries({ queryKey: taskBlueprintKeys.all });
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
 * Hook to delete a task blueprint with optimistic updates
 */
export function useDeleteTaskBlueprintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      return taskBlueprintsApi.delete(taskId);
    },
    // Optimistic update
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskBlueprintKeys.all });

      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: taskBlueprintKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Optimistically remove
      queryClient.setQueriesData(
        { queryKey: taskBlueprintKeys.lists() },
        (old: TaskBlueprint[] | undefined) => {
          if (!old) return old;
          return old.filter((task) => task.id !== taskId);
        }
      );

      return { previousTasks };
    },
    // On success, invalidate all task blueprint queries
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskBlueprintKeys.all });
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
export function useToggleTaskCompletionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, currentCompleted }: { taskId: string; currentCompleted: boolean }) => {
      // Use the pre-captured completion state to determine new state
      return taskBlueprintsApi.update(taskId, { completed: !currentCompleted });
    },
    // Optimistic update
    onMutate: async ({ taskId }: { taskId: string; currentCompleted: boolean }) => {
      await queryClient.cancelQueries({ queryKey: taskBlueprintKeys.all });

      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: taskBlueprintKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Toggle completed state
      queryClient.setQueriesData(
        { queryKey: taskBlueprintKeys.lists() },
        (old: TaskBlueprint[] | undefined) => {
          if (!old) return old;
          return old.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed, updatedAt: new Date() } : task
          );
        }
      );

      return { previousTasks };
    },
    // On success, invalidate all task blueprint queries
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskBlueprintKeys.all });
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
export function useReorderTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskOrders: Array<{ id: string; order: number }>) => {
      return taskBlueprintsApi.reorder(taskOrders);
    },
    // Optimistic update
    onMutate: async (taskOrders) => {
      await queryClient.cancelQueries({ queryKey: taskBlueprintKeys.all });

      const previousTasks = new Map();
      queryClient.getQueriesData({ queryKey: taskBlueprintKeys.lists() }).forEach(([key, data]) => {
        previousTasks.set(key, data);
      });

      // Create a map for quick lookup
      const orderMap = new Map(taskOrders.map((to) => [to.id, to.order]));

      // Optimistically update orders
      queryClient.setQueriesData(
        { queryKey: taskBlueprintKeys.lists() },
        (old: TaskBlueprint[] | undefined) => {
          if (!old) return old;
          return old.map((task) => {
            const newOrder = orderMap.get(task.id);
            return newOrder !== undefined ? { ...task, order: newOrder, updatedAt: new Date() } : task;
          });
        }
      );

      return { previousTasks };
    },
    // On success, invalidate all task blueprint queries
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskBlueprintKeys.all });
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
