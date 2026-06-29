/**
 * Centralized query key registry for TanStack Query.
 * All features import keys from here - no cross-feature hook imports needed.
 */

export const blockKeys = {
  all: ['blocks'] as const,
  lists: () => [...blockKeys.all, 'list'] as const,
  list: (filters: { block_type?: string; start_date?: string; end_date?: string }) =>
    [...blockKeys.lists(), filters] as const,
  forDate: (dateString: string, timezone: string) =>
    [...blockKeys.all, dateString, timezone] as const,
};

export const taskBlueprintKeys = {
  all: ['taskBlueprints'] as const,
  lists: () => [...taskBlueprintKeys.all, 'list'] as const,
  list: (filters: { date?: string; start_date?: string; end_date?: string }) =>
    [...taskBlueprintKeys.lists(), filters] as const,
};

export const backlogKeys = {
  all: ['backlog'] as const,
  lists: () => [...backlogKeys.all, 'list'] as const,
  list: (filters: { completed?: boolean }) => [...backlogKeys.lists(), filters] as const,
};

export const weeklyGoalKeys = {
  all: ['weeklyGoals'] as const,
  lists: () => [...weeklyGoalKeys.all, 'list'] as const,
  list: (filters: { week_start?: string }) => [...weeklyGoalKeys.lists(), filters] as const,
};

export const tagKeys = {
  all: ['tags'] as const,
};

export const analyticsKeys = {
  all: ['analytics'] as const,
  day: (year: number, month: number, date: number) =>
    [...analyticsKeys.all, 'day', year, month, date] as const,
  week: (year: number, month: number, date: number) =>
    [...analyticsKeys.all, 'week', year, month, date] as const,
  year: (year: number) => [...analyticsKeys.all, 'year', year] as const,
  overview: (month: number, year: number) =>
    [...analyticsKeys.all, 'overview', month, year] as const,
};
