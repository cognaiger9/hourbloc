'use client';

import SVGDonutChart from './SVGDonutChart';
import type { WorkTimeByTag } from '../types';

interface WeekSummaryCardProps {
  totalWorkTime: string;
  previousWeekWorkTime: string;
  totalBlocks: number;
  workTimeByTag: WorkTimeByTag[];
}

export default function WeekSummaryCard({
  totalWorkTime,
  previousWeekWorkTime,
  totalBlocks,
  workTimeByTag,
}: WeekSummaryCardProps) {
  // Prepare donut chart segments (ordered from largest to smallest for proper rendering)
  const donutSegments = [...workTimeByTag]
    .sort((a, b) => b.percentage - a.percentage)
    .map((item) => ({
      color: item.color,
      percentage: item.percentage,
      tag: item.tag,
      time: item.time,
    }));

  return (
    <div className="bg-[#EEEDE8] rounded-2xl p-6 mb-6 border border-[#E4E2DD]/50 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Left: Stats */}
      <div className="lg:col-span-3 flex flex-col items-center justify-between h-full">
        <div className="w-full border-b border-[#E4E2DD] pb-3 mb-3">
          <h2 className="text-primary font-semibold text-center text-sm">Weekly Summary</h2>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 py-2">
          <span className="text-primary font-normal mb-0.5 text-sm">Work Time</span>
          <span className="text-[1.75rem] font-semibold leading-none tracking-tight mb-1">
            {totalWorkTime}
          </span>
          <span className="text-secondary font-normal text-foreground-secondary text-xs">
            Previous week: {previousWeekWorkTime}
          </span>
        </div>

        <div className="w-full pt-4 mt-3 flex flex-col items-center">
          <span className="text-primary font-normal mb-1 text-sm">Blocks</span>
          <span className="text-[1.75rem] font-semibold leading-none">{totalBlocks}</span>
        </div>
      </div>

      {/* Middle: Donut Chart */}
      <div className="lg:col-span-5 flex justify-center items-center py-2">
        <SVGDonutChart segments={donutSegments} size={180} />
      </div>

      {/* Right: Legend */}
      <div className="lg:col-span-4 flex flex-col justify-center gap-0.5 h-full py-2">
        {workTimeByTag.length > 0 ? (
          workTimeByTag.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.tag}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-foreground-secondary w-[60px]">
                  {item.time}
                </span>
                <span className="text-sm text-foreground-secondary w-8 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-foreground-secondary text-center">
              No work time recorded for this week
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

