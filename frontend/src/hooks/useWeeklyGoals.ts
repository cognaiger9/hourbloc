'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { weeklyGoalsApi } from '@/features/weekly-goals/api/weeklyGoals';
import { WeeklyGoal } from '@/features/weekly-goals/types';
import { formatDateKey, getMondayOfWeek } from '@/utils/dateUtils';

/**
 * Query key factory for weekly goals
 */
export const weeklyGoalKeys = {
  all: ['weeklyGoals'] as const,
  lists: () => [...weeklyGoalKeys.all, 'list'] as const,
  list: (filters: { week_start?: string }) => [...weeklyGoalKeys.lists(), filters] as const,
};

/**
 * Hook to fetch weekly goals with optional week_start filtering
 */
export function useWeeklyGoalsQuery(weekStart: Date) {
  // Format Date to YYYY-MM-DD string (local date, no timezone conversion)
  const weekStartStr = formatDateKey(weekStart);

  return useQuery({
    queryKey: weeklyGoalKeys.list({ week_start: weekStartStr }),
    queryFn: async () => {
      const apiGoals = await weeklyGoalsApi.getAll({ week_start: weekStartStr });
      return apiGoals.map(weeklyGoalsApi.apiToWeeklyGoal);
    },
    initialData: [], // Prevent hung state while query loads
    initialDataUpdatedAt: 0, // Mark initial data as stale to trigger immediate fetch
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Force refetch on component mount even if initialData exists
  });
}

/**
 * Hook to fetch weekly goals for a given week with filtering
 * Uses React Query internally to fetch from the backend API
 */
export function useWeeklyGoals(weekStart: Date) {
  // Use the React Query hook to fetch goals
  const { data: goals = [] } = useWeeklyGoalsQuery(weekStart);

  // Filter goals for the requested week (should already be filtered by API, but keep for safety)
  const requestedWeekStart = getMondayOfWeek(weekStart);
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const goalWeekStart = getMondayOfWeek(goal.weekStart);
      return goalWeekStart.getTime() === requestedWeekStart.getTime();
    });
  }, [goals, requestedWeekStart]);

  // Filter to only active (non-completed) goals
  const activeGoals = useMemo(() => {
    return filteredGoals.filter((goal) => !goal.completed);
  }, [filteredGoals]);

  return {
    goals: filteredGoals,
    activeGoals,
  };
}

/**
 * Hook to create a new weekly goal with optimistic updates
 */
export function useCreateWeeklyGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      text: string;
      description?: string;
      completed?: boolean;
      order?: number;
      weekStart: Date;
    }) => {
      const apiData = {
        text: data.text,
        description: data.description || null,
        completed: data.completed ?? false,
        order: data.order ?? 0,
        week_start: formatDateKey(data.weekStart),
      };
      return weeklyGoalsApi.create(apiData);
    },
    // Optimistic update
    onMutate: async (newGoalData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: weeklyGoalKeys.all });

      // Snapshot previous values for all relevant queries
      const previousGoals = new Map();
      queryClient.getQueriesData({ queryKey: weeklyGoalKeys.lists() }).forEach(([key, data]) => {
        previousGoals.set(key, data);
      });

      // Create optimistic goal
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticGoal: WeeklyGoal = {
        id: tempId,
        text: newGoalData.text,
        description: newGoalData.description,
        completed: newGoalData.completed ?? false,
        order: newGoalData.order ?? 0,
        weekStart: newGoalData.weekStart,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistically update all matching query caches
      const weekStartStr = formatDateKey(newGoalData.weekStart);

      // Update all list queries (this includes the specific query for the current week)
      queryClient.setQueriesData(
        { queryKey: weeklyGoalKeys.lists() },
        (old: WeeklyGoal[] | undefined) => {
          if (!old) return [optimisticGoal];
          // Check if goal already exists (prevent duplicates from multiple updates)
          if (old.some((goal) => goal.id === tempId)) {
            return old;
          }
          return [...old, optimisticGoal];
        }
      );

      return { previousGoals, tempId, weekStartStr };
    },
    // On success, replace optimistic goal with real one and invalidate
    onSuccess: (createdGoal, _variables, context) => {
      const realGoal = weeklyGoalsApi.apiToWeeklyGoal(createdGoal);

      // Update the specific query key that was used
      if (context?.weekStartStr) {
        const specificQueryKey = weeklyGoalKeys.list({ week_start: context.weekStartStr });
        queryClient.setQueryData(
          specificQueryKey,
          (old: WeeklyGoal[] | undefined) => {
            if (!old) return [realGoal];
            return old.map((goal) => (goal.id === context?.tempId ? realGoal : goal));
          }
        );
      }

      // Also update all list queries
      queryClient.setQueriesData(
        { queryKey: weeklyGoalKeys.lists() },
        (old: WeeklyGoal[] | undefined) => {
          if (!old) return [realGoal];
          return old.map((goal) => (goal.id === context?.tempId ? realGoal : goal));
        }
      );

      // Invalidate all weekly goal queries to ensure all views are in sync
      queryClient.invalidateQueries({ queryKey: weeklyGoalKeys.all });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousGoals) {
        context.previousGoals.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

/**
 * Hook to update an existing weekly goal with optimistic updates
 */
export function useUpdateWeeklyGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<WeeklyGoal>;
    }) => {
      const apiUpdates: {
        text?: string;
        description?: string | null;
        completed?: boolean;
        order?: number;
        week_start?: string;
      } = {};
      if (updates.text !== undefined) apiUpdates.text = updates.text;
      if (updates.description !== undefined) apiUpdates.description = updates.description || null;
      if (updates.completed !== undefined) apiUpdates.completed = updates.completed;
      if (updates.order !== undefined) apiUpdates.order = updates.order;
      if (updates.weekStart !== undefined) {
        apiUpdates.week_start = formatDateKey(updates.weekStart);
      }

      return weeklyGoalsApi.update(id, apiUpdates);
    },
    // Optimistic update
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: weeklyGoalKeys.all });

      const previousGoals = new Map();
      queryClient.getQueriesData({ queryKey: weeklyGoalKeys.lists() }).forEach(([key, data]) => {
        previousGoals.set(key, data);
      });

      // Optimistically update all queries that might contain this goal
      queryClient.setQueriesData(
        { queryKey: weeklyGoalKeys.lists() },
        (old: WeeklyGoal[] | undefined) => {
          if (!old) return old;
          return old.map((goal) =>
            goal.id === id ? { ...goal, ...updates, updatedAt: new Date() } : goal
          );
        }
      );

      return { previousGoals };
    },
    // On success, update with real data and invalidate
    onSuccess: (updatedGoal) => {
      const realGoal = weeklyGoalsApi.apiToWeeklyGoal(updatedGoal);

      queryClient.setQueriesData(
        { queryKey: weeklyGoalKeys.lists() },
        (old: WeeklyGoal[] | undefined) => {
          if (!old) return old;
          return old.map((goal) => (goal.id === updatedGoal.id ? realGoal : goal));
        }
      );

      // Invalidate all weekly goal queries to ensure all views are in sync
      queryClient.invalidateQueries({ queryKey: weeklyGoalKeys.all });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousGoals) {
        context.previousGoals.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

/**
 * Hook to delete a weekly goal with optimistic updates
 */
export function useDeleteWeeklyGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      return weeklyGoalsApi.delete(goalId);
    },
    // Optimistic update
    onMutate: async (goalId) => {
      await queryClient.cancelQueries({ queryKey: weeklyGoalKeys.all });

      const previousGoals = new Map();
      queryClient.getQueriesData({ queryKey: weeklyGoalKeys.lists() }).forEach(([key, data]) => {
        previousGoals.set(key, data);
      });

      // Optimistically remove from all queries
      queryClient.setQueriesData(
        { queryKey: weeklyGoalKeys.lists() },
        (old: WeeklyGoal[] | undefined) => {
          if (!old) return old;
          return old.filter((goal) => goal.id !== goalId);
        }
      );

      return { previousGoals };
    },
    // On success, invalidate all weekly goal queries
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weeklyGoalKeys.all });
    },
    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousGoals) {
        context.previousGoals.forEach((data, key) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}
