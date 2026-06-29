'use client';

import { Check } from 'lucide-react';
import { CalendarBlock } from '@/features/calendar/types/calendarBlock';
import { Tag } from '@/types/tag';
import { getTagColorStyles } from '@/utils/tagColors';

interface TaskCardProps {
  block: CalendarBlock;
  tag?: Tag;
  isCompleted?: boolean;
  onToggleComplete?: (blockId: string) => void;
  onClick?: (block: CalendarBlock) => void;
}

export default function TaskCard({
  block,
  tag,
  isCompleted = false,
  onToggleComplete,
  onClick,
}: TaskCardProps) {
  const tagStyles = tag ? getTagColorStyles(tag.color) : null;

  const handleClick = () => {
    if (onClick) {
      onClick(block);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(block.id);
    }
  };

  return (
    <div
      className="group bg-white p-3 rounded-lg border border-border shadow-sm hover:border-stone-300 transition-colors cursor-pointer flex gap-3 items-start"
      onClick={handleClick}
    >
      <div
        className="mt-0.5 w-4 h-4 rounded border border-stone-300 flex items-center justify-center text-white group-hover:border-stone-400 transition-colors"
        onClick={handleCheckboxClick}
        style={
          isCompleted
            ? {
                backgroundColor: '#1b1b1b',
                borderColor: '#1b1b1b',
              }
            : {}
        }
      >
        {isCompleted && <Check className="w-3 h-3 opacity-100" />}
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <span
          className={`text-sm font-medium leading-snug ${
            isCompleted ? 'text-foreground-secondary line-through' : 'text-foreground'
          }`}
        >
          {block.title}
        </span>
        {tag && (
          <div className="flex flex-wrap gap-2">
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded border"
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
    </div>
  );
}
