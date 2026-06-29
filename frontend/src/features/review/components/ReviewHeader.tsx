'use client';

import { Plus } from 'lucide-react';
import { ReviewStats } from '../types';
import DateNavigation from './DateNavigation';
import ReviewStatsWidget from './ReviewStatsWidget';

interface ReviewHeaderProps {
  currentDate: Date;
  isToday: boolean;
  stats: ReviewStats;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onAddBlock: () => void;
}

export default function ReviewHeader({
  currentDate,
  isToday,
  stats,
  onNavigateDate,
  onGoToToday,
  onAddBlock,
}: ReviewHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Date Navigation */}
      <DateNavigation
        currentDate={currentDate}
        isToday={isToday}
        onNavigateDate={onNavigateDate}
        onGoToToday={onGoToToday}
      />

      {/* Right Side: Add Block + Stats Widget */}
      <div className="flex items-center gap-3">
        {/* Add Block Button */}
        <button
          onClick={onAddBlock}
          className="flex items-center gap-2 px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-hover transition-colors shadow-sm"
        >
          <Plus width={16} height={16} strokeWidth={2} />
          <span className="text-sm font-medium">Add Block</span>
        </button>

        {/* Stats Widget */}
        <ReviewStatsWidget stats={stats} />
      </div>
    </header>
  );
}
