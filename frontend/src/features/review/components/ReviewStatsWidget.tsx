'use client';

import { AlarmClock, SquareCheckBig } from 'lucide-react';
import { ReviewStats } from '../types';

interface ReviewStatsWidgetProps {
  stats: ReviewStats;
}

export default function ReviewStatsWidget({ stats }: ReviewStatsWidgetProps) {
  return (
    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md border border-black/5 rounded-xl pl-3 pr-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Timer */}
      <div className="flex items-center gap-2">
        <AlarmClock width={14} height={14} strokeWidth={2.5} className="text-black" />
        <span className="text-sm font-medium text-foreground">{stats.totalTime}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-black/10"></div>

      {/* Count */}
      <div className="flex items-center gap-2">
        <SquareCheckBig width={14} height={14} strokeWidth={2.5} className="text-black" />
        <span className="text-sm font-medium text-foreground">{stats.blockCount}</span>
      </div>
    </div>
  );
}
