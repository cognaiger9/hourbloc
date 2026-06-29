'use client';

import { useRef, useMemo, useState } from 'react';
import { useToggleTaskCompletionMutation } from '@/features/calendar/hooks/useTaskBlueprints';
import { useDragTaskToGrid } from '@/features/calendar/hooks/useDragTaskToGrid';
import { Tag } from '@/types/tag';
import { TaskBlueprint } from '@/features/calendar/types/taskBlueprint';
import DayTaskList from './DayTaskList';
import DayCalendarGrid from './DayCalendarGrid';

interface DayViewProps {
  currentDate: Date;
  tasks: TaskBlueprint[];
  tags: Tag[];
  timezone: string;
  onAddTask: (date: Date) => void;
  onTaskClick: (task: TaskBlueprint) => void;
}

export default function DayView({ currentDate, tasks, tags, timezone, onAddTask, onTaskClick }: DayViewProps) {
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Sort tasks by order
  const taskBlueprints = useMemo(() => tasks.sort((a, b) => a.order - b.order), [tasks]);

  // Drag state management
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const { handleDragTaskToGrid } = useDragTaskToGrid(tags, timezone);

  // Toggle task completion mutation
  const toggleCompletion = useToggleTaskCompletionMutation();

  // Handle add task
  const handleAddTask = () => {
    onAddTask(currentDate);
  };

  // Handle task drag start
  const handleTaskDragStart = (task: TaskBlueprint) => {
    setDraggedTaskId(task.id);
  };

  // Handle task drop on calendar
  const handleTaskDrop = async (task: TaskBlueprint, targetTime: number) => {
    await handleDragTaskToGrid(task, currentDate, targetTime);
    setDraggedTaskId(null);
  };

  // Handle toggle task completion
  const handleToggleComplete = async (taskId: string) => {
    const task = taskBlueprints.find((t) => t.id === taskId);
    if (!task) return;
    await toggleCompletion.mutateAsync({ taskId, currentCompleted: task.completed });
  };

  return (
    <div className="flex flex-1 overflow-hidden relative" ref={gridContainerRef}>
      <DayTaskList
        tasks={taskBlueprints}
        tags={tags}
        onAddTask={handleAddTask}
        onTaskClick={onTaskClick}
        onToggleComplete={handleToggleComplete}
        onDragStart={handleTaskDragStart}
      />
      <DayCalendarGrid
        date={currentDate}
        tags={tags}
        gridContainerRef={gridContainerRef}
        timezone={timezone}
        onTaskDrop={handleTaskDrop}
        draggedTaskId={draggedTaskId}
      />
    </div>
  );
}
