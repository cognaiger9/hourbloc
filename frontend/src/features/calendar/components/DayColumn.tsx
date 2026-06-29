'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/utils/common';
import { isToday } from '@/utils/dateUtils';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { Tag } from '@/types/tag';
import TaskCard from './TaskCard';

interface DayColumnProps {
  dayName: string;
  dayNumber: number;
  date: Date;
  blocks: CalendarBlock[];
  tags: Tag[];
  onAddTask?: (date: Date) => void;
  onTaskClick?: (block: CalendarBlock) => void;
  onToggleComplete?: (blockId: string) => void;
  completedBlockIds?: Set<string>;
}

export default function DayColumn({
  dayName,
  dayNumber,
  date,
  blocks,
  tags,
  onAddTask,
  onTaskClick,
  onToggleComplete,
  completedBlockIds = new Set(),
}: DayColumnProps) {
  const getTagById = (tagName: string): Tag | undefined => {
    return tags.find((tag) => tag.name === tagName);
  };

  const handleAddTask = () => {
    if (onAddTask) {
      onAddTask(date);
    }
  };

  const todayActive = isToday(date);

  return (
    <div className="w-80 flex flex-col gap-4 h-full">
      <div className="flex items-baseline justify-between px-1">
        <span
          className={cn(
            'text-base font-medium',
            todayActive ? 'text-accent-green' : 'text-foreground'
          )}
        >
          {dayName}
        </span>
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            todayActive && 'bg-accent-green shadow-sm shadow-accent-green/20'
          )}
        >
          <span
            className={cn(
              'text-base font-medium leading-none pt-0.5',
              todayActive ? 'text-white' : 'text-foreground-secondary'
            )}
          >
            {dayNumber}
          </span>
        </div>
      </div>

      <div className="flex-1 bg-white/50 border border-border rounded-2xl p-3 flex flex-col gap-3 overflow-y-auto no-scrollbar">
        {blocks.map((block) => {
          const tag = block.tag ? getTagById(block.tag) : undefined;
          const isCompleted = completedBlockIds.has(block.id);

          return (
            <TaskCard
              key={block.id}
              block={block}
              tag={tag}
              isCompleted={isCompleted}
              onToggleComplete={onToggleComplete}
              onClick={onTaskClick}
            />
          );
        })}

        {/* Add Task Button - positioned after task list */}
        <button
          className="w-full py-2.5 border border-dashed border-stone-300 rounded-lg text-sm font-medium text-foreground-secondary flex items-center justify-center gap-2 hover:bg-stone-100/50 hover:border-stone-400 transition-all group"
          onClick={handleAddTask}
        >
          <Plus className="w-4 h-4 text-stone-400 group-hover:text-stone-500 transition-colors" />
          <span>Add task</span>
        </button>
      </div>
    </div>
  );
}
