'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/common';
import DayTooltip from './DayTooltip';
import type { CalendarDay, CalendarData, TooltipData } from '../types';

interface CalendarHeatmapProps {
  monthName: string;
  calendarDays: CalendarDay[];
  calendarData: CalendarData;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarHeatmap({
  monthName,
  calendarDays,
  calendarData,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const handleMouseEnter = (
    day: number,
    workTime: string | undefined,
    blocks: number | undefined,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (workTime && blocks !== undefined) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip({
        day,
        workTime,
        blocks,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top,
        },
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };
  return (
    <div className="lg:col-span-7 bg-[#EEEDE8] rounded-3xl p-6 shadow-sm flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button
          onClick={onPreviousMonth}
          className="p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 opacity-40" />
        </button>
        <h3 className="text-lg font-medium">{monthName}</h3>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <ChevronRight className="w-5 h-5 opacity-40" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-6 flex-grow">
        {/* Labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium opacity-40 py-1"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((item, index) => {
          if (item.day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const { day, isToday, heatmapData: heatmap } = item;
          const hasWork = heatmap?.hasWork ?? false;
          const opacity = heatmap?.opacity ?? 0;

          if (isToday) {
            return (
              <div
                key={day}
                className="aspect-square flex items-center justify-center rounded-lg text-xs font-bold bg-surface text-accent-green shadow-sm ring-1 ring-black/5 transition-all hover:scale-105 cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(day, heatmap?.workTime, heatmap?.blocks, e)}
                onMouseLeave={handleMouseLeave}
              >
                {day}
              </div>
            );
          }

          if (!hasWork) {
            return (
              <div
                key={day}
                className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium text-foreground opacity-40 bg-surface transition-all hover:scale-105"
              >
                {day}
              </div>
            );
          }

          const bgColor = `rgba(60, 191, 111, ${opacity})`;
          const textColor = opacity >= 0.5 ? 'text-white' : 'text-foreground';

          return (
            <div
              key={day}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all hover:scale-105 cursor-pointer',
                textColor
              )}
              style={{ backgroundColor: bgColor }}
              onMouseEnter={(e) => handleMouseEnter(day, heatmap?.workTime, heatmap?.blocks, e)}
              onMouseLeave={handleMouseLeave}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Footer Stats (Cards) */}
      <div className="flex gap-3 mt-auto">
        <div className="flex-1 bg-surface rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 shadow-sm h-20">
          <span className="text-xs font-medium opacity-60">Days Worked</span>
          <span className="text-base font-medium tracking-tight">
            {calendarData.daysWorked} of {calendarData.totalDays}
          </span>
        </div>
        <div className="flex-1 bg-surface rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 shadow-sm h-20">
          <span className="text-xs font-medium opacity-60">Avg Work Day</span>
          <span className="text-base font-medium tracking-tight">
            {calendarData.avgWorkDay}
          </span>
        </div>
        <div className="flex-1 bg-surface rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 shadow-sm h-20">
          <span className="text-xs font-medium opacity-60">Total Work</span>
          <span className="text-base font-medium tracking-tight">
            {calendarData.totalWork}
          </span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <DayTooltip
          day={tooltip.day}
          workTime={tooltip.workTime}
          blocks={tooltip.blocks}
          position={tooltip.position}
        />
      )}
    </div>
  );
}

