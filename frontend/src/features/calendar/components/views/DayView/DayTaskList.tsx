'use client';

import { useMemo, useState } from 'react';
import { Plus, GripVertical } from 'lucide-react';
import { TaskBlueprint } from '@/features/calendar/types/taskBlueprint';
import { Tag } from '@/types/tag';
import { getTagColorStyles } from '@/utils/tagColors';

interface DayTaskListProps {
  tasks: TaskBlueprint[];
  tags: Tag[];
  onAddTask: () => void;
  onTaskClick: (task: TaskBlueprint) => void;
  onToggleComplete: (taskId: string) => void;
  onDragStart: (task: TaskBlueprint) => void;
}

export default function DayTaskList({
  tasks,
  tags,
  onAddTask,
  onTaskClick,
  onToggleComplete,
  onDragStart,
}: DayTaskListProps) {
  // Sort tasks by order
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.order - b.order);
  }, [tasks]);

  // Get tag by name
  const getTagByName = (tagName: string): Tag | undefined => {
    return tags.find((tag) => tag.name === tagName);
  };

  // Track which task is currently being dragged
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: TaskBlueprint) => {
    // Don't allow dragging completed tasks
    if (task.completed) {
      e.preventDefault();
      return;
    }

    // Set drag data
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'copy';

    // Update visual state
    setDraggingTaskId(task.id);

    // Notify parent
    onDragStart(task);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  return (
    <aside className="w-[380px] bg-background border-r border-border flex flex-col shrink-0 z-10">
      <div className="flex flex-col h-full overflow-y-auto px-8 py-8">
        {/* Task List Items */}
        <div className="space-y-3">
          {sortedTasks.map((task) => {
            const tag = task.tag ? getTagByName(task.tag) : undefined;
            const isCompleted = task.completed;
            const tagStyles = tag ? getTagColorStyles(tag.color) : null;

            return (
              <div
                key={task.id}
                className="group bg-white border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer select-none relative"
                onClick={() => onTaskClick(task)}
                draggable={!isCompleted}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: draggingTaskId === task.id ? 0.5 : 1,
                  cursor: isCompleted ? 'pointer' : 'grab',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-4 h-4 rounded border border-[#D1D1D1] hover:border-foreground shrink-0 flex items-center justify-center transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task.id);
                    }}
                    style={
                      isCompleted
                        ? {
                            backgroundColor: '#1b1b1b',
                            borderColor: '#1b1b1b',
                          }
                        : {}
                    }
                  >
                    {isCompleted && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p
                      className={`text-sm text-foreground leading-tight ${
                        isCompleted ? 'line-through text-foreground-secondary' : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    {tag && (
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: tagStyles?.categoryBg,
                            color: tagStyles?.categoryColor,
                            borderColor: tagStyles?.categoryBorder,
                          }}
                        >
                          {tag.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <GripVertical className="w-3.5 h-3.5 text-[#9E9E9E] opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="w-full border border-dashed border-[#D1D1D1] rounded-lg h-[42px] flex items-center justify-center gap-2 text-foreground-secondary hover:bg-[#EAE8E4] hover:border-[#BDBDBD] transition-all mt-3 group"
        >
          <Plus className="w-4 h-4 group-hover:text-accent-green transition-colors" />
          <span className="text-sm font-medium">Add task</span>
        </button>
      </div>
    </aside>
  );
}
