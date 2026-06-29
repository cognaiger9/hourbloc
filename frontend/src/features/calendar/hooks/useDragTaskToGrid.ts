'use client';

import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { TaskBlueprint } from '@/features/calendar/types/taskBlueprint';
import { Tag } from '@/types/tag';
import { useCreateBlockMutation } from './useBlocks';

/**
 * Hook for dragging task blueprints from the to-do list to the calendar grid
 * to create calendar blocks
 */
export function useDragTaskToGrid(tags: Tag[], timezone: string) {
  const createBlock = useCreateBlockMutation(timezone);

  /**
   * Handle dragging a task blueprint to the calendar grid
   * Creates a new calendar block from the task blueprint
   * The task blueprint remains in the store (reusable template)
   */
  const handleDragTaskToGrid = async (task: TaskBlueprint, targetDate: Date, targetTime: number) => {
    // Find tagId from tag name
    const tag = tags.find((t) => t.name === task.tag);
    const tagId = tag?.id || null;

    // Create CalendarBlock from TaskBlueprint
    const newBlock: CalendarBlock & { tagId?: string | null } = {
      id: `temp-${Date.now()}`,
      date: targetDate,
      startTime: targetTime,
      endTime: targetTime + 1, // Default 1 hour duration
      title: task.title,
      description: task.description || '',
      tag: task.tag || '',
      tagId,
      weeklyGoalId: task.weeklyGoalId,
      sourceTaskId: task.id, // Track which task this block was created from
      isNewlyCreated: true,
    };

    // Use React Query mutation to create the block
    // (task remains as reusable template)
    await createBlock.mutateAsync(newBlock);
  };

  return { handleDragTaskToGrid };
}
