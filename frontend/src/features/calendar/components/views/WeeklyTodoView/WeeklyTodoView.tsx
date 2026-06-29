'use client';

import { useMemo } from 'react';
import { Tag } from '@/types/tag';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { TaskBlueprint } from '@/features/calendar/types/taskBlueprint';
import { useToggleTaskCompletionMutation } from '@/features/calendar/hooks/useTaskBlueprints';
import DayColumn from '@/features/calendar/components/DayColumn';
import { getWeekDates, isSameDay } from '@/utils/dateUtils';
import { useDragToScroll } from './useDragToScroll';

interface WeeklyTodoViewProps {
  currentDate: Date;
  tasks: TaskBlueprint[];
  tags: Tag[];
  onAddTask?: (date: Date) => void;
  onTaskClick?: (task: TaskBlueprint) => void;
}

export default function WeeklyTodoView({ currentDate, tasks, tags, onAddTask, onTaskClick }: WeeklyTodoViewProps) {
  const weekDates = useMemo(() => getWeekDates(currentDate, 'week'), [currentDate]);
  const { containerRef, cursorClass } = useDragToScroll();

  // Toggle task completion mutation
  const toggleCompletion = useToggleTaskCompletionMutation();

  // Group tasks by day and sort by order
  const tasksByDay = useMemo(() => {
    const grouped: Record<string, TaskBlueprint[]> = {};

    weekDates.forEach((date) => {
      const dateKey = date.toDateString();
      grouped[dateKey] = tasks
        .filter((task) => isSameDay(task.date, date))
        .sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [tasks, weekDates]);

  // Get completed task IDs
  const completedTaskIds = useMemo(() => {
    return new Set(tasks.filter((task) => task.completed).map((task) => task.id));
  }, [tasks]);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Convert TaskBlueprint to CalendarBlock format for DayColumn (temporary compatibility)
  // TODO: Update DayColumn to accept TaskBlueprint directly
  const convertTaskToBlock = (task: TaskBlueprint): CalendarBlock => ({
    id: task.id,
    date: task.date,
    startTime: 0, // Placeholder - task blueprints don't have specific times
    endTime: 0, // Placeholder - task blueprints don't have specific times
    title: task.title,
    description: task.description || '',
    tag: task.tag || '',
    weeklyGoalId: task.weeklyGoalId,
  });

  // Handle task click - convert CalendarBlock back to TaskBlueprint
  const handleTaskClick = (block: CalendarBlock) => {
    if (!onTaskClick) return;

    // Find the original task from the query data
    const originalTask = tasks.find((task) => task.id === block.id);
    if (originalTask) {
      onTaskClick(originalTask);
    }
  };

  // Handle toggle task completion
  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    await toggleCompletion.mutateAsync({ taskId, currentCompleted: task.completed });
  };

  return (
    <main ref={containerRef} className={`flex-1 overflow-x-auto overflow-y-hidden p-8 ${cursorClass}`}>
      <div className="flex h-full gap-6 min-w-max">
        {weekDates.map((date, index) => {
          const dateKey = date.toDateString();
          const dayTasks = tasksByDay[dateKey] || [];
          const dayBlocks = dayTasks.map(convertTaskToBlock);
          const dayName = dayNames[index];
          const dayNumber = date.getDate();

          return (
            <DayColumn
              key={dateKey}
              dayName={dayName}
              dayNumber={dayNumber}
              date={date}
              blocks={dayBlocks}
              tags={tags}
              onAddTask={onAddTask}
              onTaskClick={onTaskClick ? handleTaskClick : undefined}
              onToggleComplete={handleToggleComplete}
              completedBlockIds={completedTaskIds}
            />
          );
        })}
      </div>
    </main>
  );
}
