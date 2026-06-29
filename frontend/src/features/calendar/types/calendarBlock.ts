export interface CalendarBlock {
  id: string;
  date: Date; // The date (day) this block belongs to
  startTime: number; // Hour (0-23) when block starts
  endTime: number; // Hour (0-23) when block ends (startTime + 1)
  title: string;
  description: string;
  tag: string; // One of: 'Design System', 'Development', 'Meeting', 'Research', 'Break', 'Other'
  weeklyGoalId?: string; // Optional: ID of the weekly goal this task is associated with
  sourceTaskId?: string; // Optional: ID of the TaskBlueprint this block was created from
  isNewlyCreated?: boolean; // True if block was just created and not yet saved
}

