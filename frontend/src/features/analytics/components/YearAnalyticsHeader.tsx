'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearAnalyticsHeaderProps {
  currentYear: number;
  onPreviousYear: () => void;
  onNextYear: () => void;
}

export default function YearAnalyticsHeader({
  currentYear,
  onPreviousYear,
  onNextYear,
}: YearAnalyticsHeaderProps) {
  const isCurrentYear = currentYear === new Date().getFullYear();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 className="text-[32px] font-medium tracking-tight text-foreground">
        Yearly Analytics
      </h1>

      <div className="flex items-center bg-[#EEEDE8] rounded-lg px-4 py-2 gap-4 border border-black/5 shadow-sm">
        <button
          onClick={onPreviousYear}
          className="transition-colors text-foreground-secondary hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-base font-medium select-none">{currentYear}</span>
        <button
          onClick={onNextYear}
          className="text-foreground-secondary hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

