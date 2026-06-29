'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateRange, formatWeekRangeForGoals } from '@/utils/dateUtils';

interface WeeklyGoalsHeaderProps {
  weekStart: Date;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  isViewingToday: boolean;
}

export default function WeeklyGoalsHeader({
  weekStart,
  onNavigateWeek,
  onGoToToday,
  isViewingToday,
}: WeeklyGoalsHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <h1 className="text-[32px] font-medium tracking-tight text-foreground">
        {formatWeekRangeForGoals(weekStart)}
      </h1>

      <div className="flex items-center gap-3">
        {!isViewingToday && (
          <button
            onClick={onGoToToday}
            className="px-3 py-1.5 text-xs font-medium text-accent-green hover:bg-green-light rounded-md transition-colors border border-green-border"
          >
            Go to Current Week
          </button>
        )}
        {/* Navigation - Same style as WeekAnalyticsHeader */}
        <div className="flex items-center bg-surface border border-border rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-0.5">
          <button
            onClick={() => onNavigateWeek('prev')}
            className="p-1 hover:bg-black/5 rounded text-foreground-secondary transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-5 text-sm font-medium text-foreground min-w-[140px] text-center select-none">
            {formatDateRange(weekStart, 'week')}
          </div>
          <button
            onClick={() => onNavigateWeek('next')}
            className="p-1 hover:bg-black/5 rounded text-foreground-secondary transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
