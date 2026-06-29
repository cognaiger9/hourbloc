'use client';

import { Clock, Layers } from 'lucide-react';

interface DaySummaryStatsProps {
  totalWorkTime: string;
  totalBlocks: number;
}

export default function DaySummaryStats({ totalWorkTime, totalBlocks }: DaySummaryStatsProps) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-4">
      {/* Total Work Time Card */}
      <div className="bg-[#EEEDE8] rounded-2xl p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-foreground-secondary mb-auto">
          <Clock className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-primary font-medium text-foreground-secondary">
            Work Time
          </span>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 pt-2">
          <div className="text-foreground-secondary text-xs mb-1">Total Work Time</div>
          <div className="text-2xl font-medium tracking-tight text-foreground">
            {totalWorkTime}
          </div>
        </div>
      </div>

      {/* Total Blocks Card */}
      <div className="bg-[#EEEDE8] rounded-2xl p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-foreground-secondary mb-auto">
          <Layers className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-primary font-medium text-foreground-secondary">
            Work Blocks
          </span>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 pt-2">
          <div className="text-foreground-secondary text-xs mb-1">Total Blocks</div>
          <div className="text-2xl font-medium tracking-tight text-foreground">
            {totalBlocks}
          </div>
        </div>
      </div>
    </div>
  );
}

