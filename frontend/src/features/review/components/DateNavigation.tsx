'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateShort } from '@/utils/dateUtils';

interface DateNavigationProps {
  currentDate: Date;
  isToday: boolean;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
}

export default function DateNavigation({
  currentDate,
  isToday,
  onNavigateDate,
  onGoToToday,
}: DateNavigationProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Previous Day */}
      <button
        onClick={() => onNavigateDate('prev')}
        className="w-8 h-8 flex items-center justify-center rounded text-foreground-secondary hover:bg-black/5 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-black/5"
        aria-label="Previous day"
      >
        <ChevronLeft width={20} height={20} strokeWidth={1.5} />
      </button>

      {/* Current Date */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-medium tracking-tight text-foreground">
          {formatDateShort(currentDate)}
        </h1>
      </div>

      {/* Next Day */}
      <button
        onClick={() => onNavigateDate('next')}
        className="w-8 h-8 flex items-center justify-center rounded text-foreground-secondary hover:bg-black/5 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-black/5"
        aria-label="Next day"
      >
        <ChevronRight width={20} height={20} strokeWidth={1.5} />
      </button>

      {/* Today Badge */}
      {isToday && (
        <div className="ml-1 px-2 py-0.5 bg-[#EBECEA] border border-border rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <span className="text-xs font-medium text-foreground-secondary">Today</span>
        </div>
      )}

      {/* Go to Today Button (if not today) */}
      {!isToday && (
        <button
          onClick={onGoToToday}
          className="ml-1 px-2 py-0.5 text-xs font-medium text-accent-green hover:bg-green-light rounded border border-green-border transition-colors"
        >
          Go to Today
        </button>
      )}
    </div>
  );
}
