'use client';

import { cn } from '@/utils/common';
import { isToday } from '@/utils/dateUtils';

interface DayHeadersProps {
  dates: Date[];
  viewMode: 'week' | 'day';
}

export default function DayHeaders({ dates, viewMode }: DayHeadersProps) {
  return (
    <div className="flex flex-none border-b border-border bg-surface z-20">
      {/* Time Column Spacer */}
      <div className="w-16 flex-shrink-0 border-r border-border bg-background"></div>

      {/* Day Columns Headers */}
      <div className="flex flex-1 min-w-0">
        {dates.map((date, index) => {
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNumber = date.getDate();
          const todayActive = isToday(date);

          return (
            <div
              key={index}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-3 border-r border-border min-w-0',
                viewMode === 'day' && 'border-r-0',
                index === dates.length - 1 && 'border-r-0',
                todayActive && 'bg-green-light'
              )}
            >
              <span
                className={cn(
                  'text-[12px] font-medium tracking-[0.3px] uppercase mb-1',
                  todayActive ? 'text-accent-green' : 'text-foreground-secondary'
                )}
              >
                {dayName}
              </span>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  todayActive && 'bg-accent-green shadow-sm shadow-accent-green/20'
                )}
              >
                <span
                  className={cn(
                    'text-lg font-medium leading-none pt-0.5',
                    todayActive ? 'text-white' : 'text-foreground'
                  )}
                >
                  {dayNumber}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

