'use client';

import { GripVertical, Check } from 'lucide-react';
import { WeeklyGoal } from '../types';

interface GoalItemProps {
  goal: WeeklyGoal;
  onToggleComplete: (goalId: string) => void;
  onEdit: (goal: WeeklyGoal) => void;
}

export default function GoalItem({ goal, onToggleComplete, onEdit }: GoalItemProps) {
  const handleTextClick = (e: React.MouseEvent) => {
    // Don't trigger edit if clicking on checkbox or drag handle
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-drag-handle]')) {
      return;
    }
    onEdit(goal);
  };

  return (
    <div className="group flex items-center gap-4 p-3 -mx-3 rounded-lg hover:bg-[#FAFAF9] transition-colors">
      {/* Checkbox */}
      <button
        onClick={() => onToggleComplete(goal.id)}
        className={`
          relative flex items-center justify-center h-5 w-5 rounded-[5px] border transition-colors flex-none cursor-pointer
          ${
            goal.completed
              ? 'bg-[#3CBF6F] border-[#3CBF6F] text-white'
              : 'border-[#E4E2DD] bg-white hover:border-[#D4D4D4]'
          }
        `}
        aria-label={goal.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {goal.completed && <Check width={12} height={12} strokeWidth={2.5} />}
      </button>

      {/* Text - Clickable */}
      <span
        onClick={handleTextClick}
        className={`
          text-base font-normal flex-1 cursor-pointer
          ${
            goal.completed
              ? 'text-[#6D6D6D] line-through decoration-[#E4E2DD]'
              : 'text-[#1B1B1B]'
          }
        `}
      >
        {goal.text}
      </span>

      {/* Drag Handle - only show for active goals */}
      {!goal.completed && (
        <div
          data-drag-handle
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#E4E2DD] cursor-grab"
        >
          <GripVertical width={16} height={16} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
