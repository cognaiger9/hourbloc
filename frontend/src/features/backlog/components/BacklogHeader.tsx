'use client';

import { Plus } from 'lucide-react';

interface BacklogHeaderProps {
  onAddTask: () => void;
}

export default function BacklogHeader({ onAddTask }: BacklogHeaderProps) {
  return (
    <header className="flex flex-row items-start justify-between px-6 sm:px-12 pb-6 gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium tracking-tight leading-9 text-[#1B1B1B]">
          Backlog
        </h1>
        <p className="text-base font-normal text-[#6D6D6D] leading-6">
          Unscheduled tasks and ideas.
        </p>
      </div>

      <button
        onClick={onAddTask}
        className="shrink-0 group relative flex items-center justify-center gap-2 px-3.5 h-9 bg-white border border-[#E4E2DD] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-[#d4d2cd] hover:bg-gray-50/50 transition-all duration-200 outline-none focus:ring-2 focus:ring-[#E4E2DD] focus:ring-offset-1 active:scale-[0.98] mt-1"
      >
        <Plus className="w-4 h-4 text-[#1B1B1B] stroke-[1.5]" />
        <span className="text-sm font-medium text-[#1B1B1B] leading-5 hidden sm:inline">
          Add task
        </span>
        <span className="text-sm font-medium text-[#1B1B1B] leading-5 sm:hidden">
          Add
        </span>
      </button>
    </header>
  );
}
