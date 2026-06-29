'use client';

import { Activity } from 'lucide-react';
import DailyTimeline from './DailyTimeline';
import type { TimelineBar } from '../types';

interface DailyTimelineSectionProps {
  plannedBars: TimelineBar[];
  actualBars: TimelineBar[];
  nowPosition?: number; // Deprecated - kept for backward compatibility
  viewingDate?: Date; // The date being viewed (to determine if it's today)
}

export default function DailyTimelineSection({
  plannedBars,
  actualBars,
  nowPosition,
  viewingDate,
}: DailyTimelineSectionProps) {
  return (
    <div className="bg-[#EEEDE8] rounded-2xl p-4 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-2 text-foreground-secondary">
        <Activity className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-lg font-medium text-foreground">Daily Timeline</span>
      </div>

      {/* Timeline Content */}
      <DailyTimeline
        plannedBars={plannedBars}
        actualBars={actualBars}
        startHour={0}
        endHour={23}
        className="no-scrollbar"
      />
    </div>
  );
}

