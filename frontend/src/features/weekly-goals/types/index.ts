/**
 * Weekly Goals feature types
 */

export interface WeeklyGoal {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  order: number;
  weekStart: Date; // Monday of the week this goal belongs to
  // Optional backend fields (for future use)
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface WeeklyGoalsState {
  activeGoals: WeeklyGoal[];
  completedGoals: WeeklyGoal[];
}
