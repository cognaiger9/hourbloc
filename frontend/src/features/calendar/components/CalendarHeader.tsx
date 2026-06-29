'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/common';
import { formatDateRange } from '@/utils/dateUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: 'week' | 'day';
  isViewingToday: boolean;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onViewModeChange: (mode: 'week' | 'day') => void;
}

export default function CalendarHeader({
  currentDate,
  viewMode,
  isViewingToday,
  onNavigateDate,
  onGoToToday,
  onViewModeChange,
}: CalendarHeaderProps) {
  return (
    <header className="flex-none h-16 px-6 flex items-center justify-between border-b border-border bg-background z-30 relative">
      {/* Date Navigation */}
      <div className="flex items-center gap-6">
        <div className="flex items-center bg-surface border border-border rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-0.5">
          <button
            onClick={() => onNavigateDate('prev')}
            className="p-1 hover:bg-black/5 rounded text-foreground-secondary transition-colors"
            aria-label={viewMode === 'day' ? 'Previous day' : 'Previous week'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-5 text-sm font-medium text-foreground min-w-[140px] text-center select-none">
            {formatDateRange(currentDate, viewMode)}
          </div>
          <button
            onClick={() => onNavigateDate('next')}
            className="p-1 hover:bg-black/5 rounded text-foreground-secondary transition-colors"
            aria-label={viewMode === 'day' ? 'Next day' : 'Next week'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {!isViewingToday && (
          <button
            onClick={onGoToToday}
            className="px-3 py-1.5 text-xs font-medium text-accent-green hover:bg-green-light rounded-md transition-colors border border-green-border"
          >
            Go to Today
          </button>
        )}
      </div>

      {/* View Switcher */}
      <div className="flex items-center bg-border/50 rounded-lg p-[2px]">
        <button
          onClick={() => onViewModeChange('week')}
          className={cn(
            'px-3 py-1 rounded-md text-xs font-medium leading-4 transition-all',
            viewMode === 'week'
              ? 'bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-foreground'
              : 'text-foreground-secondary hover:text-foreground hover:bg-surface/50'
          )}
        >
          Week
        </button>
        <button
          onClick={() => onViewModeChange('day')}
          className={cn(
            'px-3 py-1 rounded-md text-xs font-medium leading-4 transition-all',
            viewMode === 'day'
              ? 'bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-foreground'
              : 'text-foreground-secondary hover:text-foreground hover:bg-surface/50'
          )}
        >
          Day
        </button>
      </div>
    </header>
  );
}

