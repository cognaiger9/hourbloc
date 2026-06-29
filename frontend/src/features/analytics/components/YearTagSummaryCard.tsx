'use client';

import SVGDonutChart from './SVGDonutChart';
import type { WorkTimeByTag } from '../types';

interface YearTagSummaryCardProps {
  workTimeByTag: WorkTimeByTag[];
}

export default function YearTagSummaryCard({ workTimeByTag }: YearTagSummaryCardProps) {
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
    <div className="xl:col-span-7 bg-[#EEEDE8] rounded-3xl p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-white/40 flex flex-col md:flex-row items-center justify-center gap-12">
      {/* Donut Chart */}
      <div className="relative w-64 h-64 shrink-0">
        <SVGDonutChart segments={donutSegments} size={256} />
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-4 w-full md:w-auto min-w-[240px]">
        {workTimeByTag.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between w-full ${
              index < workTimeByTag.length - 1 ? 'border-b border-black/5 pb-1' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-base text-foreground">{item.tag}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-base text-foreground-secondary">{item.time}</span>
              <span className="text-base font-medium text-foreground w-8 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

