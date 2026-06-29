'use client';

import { Plus } from 'lucide-react';

interface AddGoalButtonProps {
  onClick: () => void;
}

export default function AddGoalButton({ onClick }: AddGoalButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 -mx-3 mt-1 rounded-lg hover:bg-[#FAFAF9] transition-colors text-left group w-full"
    >
      <div className="flex items-center justify-center h-5 w-5 text-[#6D6D6D] group-hover:text-[#1B1B1B] transition-colors">
        <Plus width={16} height={16} strokeWidth={1.5} />
      </div>
      <span className="text-sm font-medium text-[#6D6D6D] group-hover:text-[#1B1B1B] transition-colors">
        Add new goal
      </span>
    </button>
  );
}
