/**
 * TaskBlueprint represents a task template that can be used to quickly create calendar blocks.
 * Tasks are reusable - dragging a task to the calendar creates a block but the task remains.
 */
export interface TaskBlueprint {
  /** Unique identifier (UUID or temp-{timestamp} for new tasks) */
  id: string;

  /** Task title */
  title: string;

  /** Optional task description */
  description?: string;

  /** Date this task is planned for */
  date: Date;

  /** Tag name (optional category) */
  tag?: string;

  /** Associated weekly goal ID */
  weeklyGoalId?: string;

  /** Whether the task has been completed */
  completed: boolean;

  /** Display order within the day (lower = earlier in list) */
  order: number;

  /** Timestamp when task was created */
  createdAt: Date;

  /** Timestamp when task was last updated */
  updatedAt: Date;
}
