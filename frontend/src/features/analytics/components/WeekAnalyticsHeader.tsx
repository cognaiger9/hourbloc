'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isViewingToday, formatDateRange } from '@/utils/dateUtils';

interface WeekAnalyticsHeaderProps {
  currentDate: Date;
  datesToShow: Date[];
  navigateDate: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
}

export default function WeekAnalyticsHeader({
  currentDate,
  datesToShow,
  navigateDate,
  goToToday,
}: WeekAnalyticsHeaderProps) {
  const isCurrentlyViewingToday = isViewingToday(currentDate, 'week', datesToShow);

  // Format week range using dateUtils - add "Week of" prefix and year
  const formatWeekRangeHeader = () => {
    const dateRange = formatDateRange(currentDate, 'week');
    const year = currentDate.getFullYear();
    return `Week of ${dateRange}, ${year}`;
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <h1 className="text-[32px] font-medium tracking-tight text-foreground">
        {formatWeekRangeHeader()}
      </h1>

      <div className="flex items-center gap-3">
        {/* Navigation - Simple style like CalendarHeader */}
        <div className="flex items-center bg-surface border border-border rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-0.5">
          <button
            onClick={() => navigateDate('prev')}
            className="p-1 rounded transition-colors hover:bg-black/5 text-foreground-secondary"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-5 text-sm font-medium text-foreground min-w-[140px] text-center select-none">
            {formatDateRange(currentDate, 'week')}
          </div>
          <button
            onClick={() => navigateDate('next')}
            className="p-1 hover:bg-black/5 rounded text-foreground-secondary transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {!isCurrentlyViewingToday && (
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-medium text-accent-green hover:bg-green-light rounded-md transition-colors border border-green-border"
          >
            Go to Today
          </button>
        )}
      </div>
    </header>
  );
}

