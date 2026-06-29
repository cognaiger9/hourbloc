'use client';

import YearStatCard from './YearStatCard';
import type { YearSummaryStat } from '../types';

interface YearSummaryStatsCardProps {
  summaryStats: YearSummaryStat[];
}

export default function YearSummaryStatsCard({ summaryStats }: YearSummaryStatsCardProps) {
  return (
    <div className="xl:col-span-5 bg-[#EEEDE8] rounded-3xl p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-white/40">
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        {summaryStats.map((stat, index) => (
          <YearStatCard key={index} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </div>
    </div>
  );
}

