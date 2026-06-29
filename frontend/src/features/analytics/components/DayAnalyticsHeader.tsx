'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayAnalyticsHeaderProps {
  formattedDateRange: string;
  formattedDateShort: string;
  isCurrentDateToday: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onGoToToday: () => void;
}

export default function DayAnalyticsHeader({
  formattedDateRange,
  formattedDateShort,
  isCurrentDateToday,
  onPreviousDay,
  onNextDay,
  onGoToToday,
}: DayAnalyticsHeaderProps) {

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 className="text-[32px] font-medium tracking-tight text-foreground">
        {formattedDateRange}
      </h1>

      {/* Date Navigation */}
      <div className="flex items-center gap-3">
        {!isCurrentDateToday && (
          <button
            onClick={onGoToToday}
            className="px-3 py-1.5 text-xs font-medium text-accent-green hover:bg-green-light rounded-md transition-colors border border-green-border"
          >
            Go to Today
          </button>
        )}
        <div className="flex items-center bg-[#EEEDE8] rounded-lg p-2 gap-2">
          <button
            onClick={onPreviousDay}
            className="w-9 h-9 flex items-center justify-center rounded-md transition-colors hover:bg-white/50 text-foreground-secondary"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="bg-white/0 px-2 min-w-[80px] text-center">
            <span className="text-sm font-medium text-foreground">{formattedDateShort}</span>
          </div>
          <button
            onClick={onNextDay}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/50 rounded-md transition-colors text-foreground-secondary"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}

