'use client';

import { SquareSplitHorizontal, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/utils/common';
import { formatDateRange, formatWeekTitle, formatDateShort } from '@/utils/dateUtils';

type CalendarViewType = 'todo' | 'day' | 'calendar';
type ViewMode = 'week' | 'day';

interface UnifiedCalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  viewMode: ViewMode;
  isViewingToday: boolean;
  pendingTasks: number;
  goalsCount: number;
  onViewChange: (view: CalendarViewType) => void;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onNavigateDay?: (direction: 'prev' | 'next') => void; // Optional day-specific navigation for day view
}

export default function UnifiedCalendarHeader({
  currentDate,
  viewType,
  viewMode,
  isViewingToday,
  pendingTasks,
  goalsCount,
  onViewChange,
  onNavigateDate,
  onGoToToday,
  onNavigateDay,
}: UnifiedCalendarHeaderProps) {
  // Format week title (for todo and calendar views)
  const weekTitle = formatWeekTitle(currentDate);

  // Format day title (for day view) - e.g., "Monday, Jan 8"
  const dayTitle = useMemo(() => {
    if (viewType === 'day') {
      return formatDateRange(currentDate, 'day');
    }
    return weekTitle;
  }, [currentDate, viewType, weekTitle]);

  // Format date range for navigator
  // For day view, show short date without weekday (e.g., "Jan 8")
  // For other views, use the regular formatDateRange
  const dateRange = useMemo(() => {
    if (viewType === 'day') {
      return formatDateShort(currentDate);
    }
    return formatDateRange(currentDate, viewMode);
  }, [currentDate, viewType, viewMode]);

  // Use day navigation for day view, otherwise use regular navigation
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (viewType === 'day' && onNavigateDay) {
      onNavigateDay(direction);
    } else {
      onNavigateDate(direction);
    }
  };

  return (
    <header className="flex-none px-8 py-6 border-b border-border flex items-center justify-between bg-background z-10">
      {/* Title Group */}
      <div className="flex flex-col gap-0.5">
        <h1
          className="tracking-tight text-foreground"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {dayTitle}
        </h1>
        {viewType !== 'calendar' && (
          <p className="text-sm text-foreground-secondary">
            {pendingTasks} tasks pending{goalsCount > 0 ? ` · ${goalsCount} goals` : ''}
          </p>
        )}
      </div>

      {/* Controls Group */}
      <div className="flex items-center gap-5">
        {/* Go to Today Button - Show when not viewing current week */}
        {!isViewingToday && (
          <button
            onClick={onGoToToday}
            className="px-3 py-1.5 text-xs font-medium text-accent-green hover:bg-green-light rounded-md transition-colors border border-green-border"
          >
            Go to Today
          </button>
        )}

        {/* View Toggle */}
        <div className="flex items-center bg-white border border-border rounded-lg p-0.5 shadow-sm">
          <button
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewType === 'day'
                ? 'bg-stone-100 text-foreground hover:text-black'
                : 'text-foreground-secondary hover:text-foreground hover:bg-stone-50'
            )}
            onClick={() => onViewChange('day')}
            aria-label="Day view"
          >
            <SquareSplitHorizontal className="w-4 h-4" />
          </button>
          <button
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewType === 'calendar'
                ? 'bg-stone-100 text-foreground hover:text-black'
                : 'text-foreground-secondary hover:text-foreground hover:bg-stone-50'
            )}
            onClick={() => onViewChange('calendar')}
            aria-label="Calendar view"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewType === 'todo'
                ? 'bg-stone-100 text-foreground hover:text-black'
                : 'text-foreground-secondary hover:text-foreground hover:bg-stone-50'
            )}
            onClick={() => onViewChange('todo')}
            aria-label="Todo list view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center bg-white border border-border rounded-md px-1 py-1 shadow-sm">
          <button
            className="p-1 text-foreground-secondary hover:text-foreground hover:bg-stone-50 rounded transition-colors"
            onClick={() => handleNavigate('prev')}
            aria-label={viewType === 'day' || viewMode === 'day' ? 'Previous day' : 'Previous week'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium px-3 min-w-[120px] text-center">{dateRange}</span>
          <button
            className="p-1 text-foreground-secondary hover:text-foreground hover:bg-stone-50 rounded transition-colors"
            onClick={() => handleNavigate('next')}
            aria-label={viewType === 'day' || viewMode === 'day' ? 'Next day' : 'Next week'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
