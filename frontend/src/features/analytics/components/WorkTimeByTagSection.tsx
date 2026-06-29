'use client';

import { Tag } from 'lucide-react';
import SVGDonutChart from './SVGDonutChart';
import type { WorkTimeByTag } from '../types';

interface WorkTimeByTagSectionProps {
  workTimeByTag: WorkTimeByTag[];
}

export default function WorkTimeByTagSection({ workTimeByTag }: WorkTimeByTagSectionProps) {
  // Calculate donut chart segments
  const donutSegments = workTimeByTag.map((item) => ({
    color: item.color,
    percentage: item.percentage,
    tag: item.tag,
    time: item.time,
  }));

  return (
    <div className="lg:col-span-8 bg-[#EEEDE8] rounded-2xl p-4 flex flex-col">
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-2 text-foreground-secondary">
          <Tag className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-lg font-medium text-foreground">Work Time by Tag</span>
        </div>
        <p className="text-foreground-secondary text-sm">
          See how you spent your work time across different tags
        </p>
      </div>

      {workTimeByTag.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <Tag className="w-12 h-12 mx-auto mb-3 text-foreground-secondary opacity-40" strokeWidth={1.5} />
            <p className="text-foreground-secondary text-sm">No work time data available yet</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12">
          {/* Donut Chart */}
          <SVGDonutChart segments={donutSegments} className="flex-shrink-0" />

          {/* Legend */}
          <div className="flex flex-col gap-4 min-w-[200px]">
            {workTimeByTag.map((item, index) => (
              <div key={index}>
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-base font-medium text-foreground">{item.tag}</span>
                </div>
                <div className="flex items-center gap-6 pl-7">
                  <span className="text-sm text-foreground-secondary">{item.time}</span>
                  <span className="text-sm text-foreground-secondary">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

