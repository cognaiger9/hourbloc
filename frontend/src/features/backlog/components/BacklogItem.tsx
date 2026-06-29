'use client';

import { BacklogTask } from '../types';

interface BacklogItemProps {
  task: BacklogTask;
  onToggleComplete: (taskId: string) => void;
  onEdit?: (task: BacklogTask) => void;
}

export default function BacklogItem({
  task,
  onToggleComplete,
  onEdit,
}: BacklogItemProps) {
  const handleCheckboxChange = () => {
    onToggleComplete(task.id);
  };

  const handleClick = () => {
    if (onEdit && !task.completed) {
      onEdit(task);
    }
  };

  return (
    <div
      className="list-item group flex items-center gap-4 py-3 min-h-[50px] -mx-3 px-3 rounded-lg hover:bg-[#FAFAFA] cursor-pointer list-none"
      onClick={handleClick}
    >
      {/* Checkbox */}
      <label
        className="custom-checkbox relative inline-flex items-center justify-center w-5 h-5 cursor-pointer flex-none m-0"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleCheckboxChange}
          className="peer absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className={`
          w-5 h-5 rounded border bg-white group-hover:border-[#6D6D6D] transition-colors duration-200 flex items-center justify-center
          ${task.completed ? 'bg-[#1B1B1B] border-[#1B1B1B]' : 'border-[#D0D0D0]'}
        `}>
          <svg
            className={`
              w-3 h-3 text-white transition-all duration-200
              ${task.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </label>

      {/* Text */}
      <span
        className={`
          flex-1 text-base font-normal leading-normal select-none group-hover:text-black transition-colors ml-4
          ${task.completed ? 'line-through text-[#D0D0D0]' : 'text-[#1B1B1B]'}
        `}
      >
        {task.text}
      </span>
    </div>
  );
}
