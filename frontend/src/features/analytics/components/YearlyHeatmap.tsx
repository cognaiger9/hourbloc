'use client';

import { useState } from 'react';
import {
  formatDateKey,
  getDaysInMonth,
  getFirstDayOfMonth,
  toMondayBasedDay,
  getWeeksInMonth,
} from '@/utils/dateUtils';
import DayTooltip from './DayTooltip';
import type { DailyActivityData, MonthData, TooltipData } from '../types';

interface YearlyHeatmapProps {
  months: MonthData[];
  className?: string;
}

// Generate calendar grid cells for a month
const generateCalendarGrid = (
  year: number,
  monthIndex: number,
  activity: Map<string, DailyActivityData>
): Array<{
  date: Date | null;
  hasActivity: boolean;
  isEmpty: boolean;
  workTime: string | null;
  blocks: number | null;
}> => {
  const firstDay = getFirstDayOfMonth(year, monthIndex);
  const mondayBasedFirstDay = toMondayBasedDay(firstDay);
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const weeks = getWeeksInMonth(year, monthIndex);
  const totalCells = weeks * 7;
  const cells: Array<{
    date: Date | null;
    hasActivity: boolean;
    isEmpty: boolean;
    workTime: string | null;
    blocks: number | null;
  }> = [];

  // Add empty cells before the first day of the month
  for (let i = 0; i < mondayBasedFirstDay; i++) {
    cells.push({ date: null, hasActivity: false, isEmpty: true, workTime: null, blocks: null });
  }

  // Add cells for each day in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const dateKey = formatDateKey(date);
    const activityData = activity.get(dateKey);
    const hasActivity = activityData?.hasActivity || false;
    const workTime = activityData?.workTime || null;
    const blocks = activityData?.blocks || null;
    cells.push({ date, hasActivity, isEmpty: false, workTime, blocks });
  }

  // Add empty cells after the last day of the month to complete the grid
  const remainingCells = totalCells - cells.length;
  for (let i = 0; i < remainingCells; i++) {
    cells.push({ date: null, hasActivity: false, isEmpty: true, workTime: null, blocks: null });
  }

  return cells;
};

export default function YearlyHeatmap({
  months,
  className,
}: YearlyHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const handleMouseEnter = (
    day: number,
    workTime: string | null,
    blocks: number | null,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (workTime && blocks !== null) {
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
    <div
      className={`bg-[#EEEDE8] rounded-3xl p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-white/40 overflow-x-auto hide-scrollbar ${className}`}
    >
      <div className="min-w-[800px] flex justify-between gap-4">
        {months.map((monthData, monthIndex) => {
          const weeks = getWeeksInMonth(monthData.year, monthData.monthIndex);
          const gridCells = generateCalendarGrid(
            monthData.year,
            monthData.monthIndex,
            monthData.activity
          );

          return (
            <div key={monthIndex} className="flex flex-col items-center gap-3">
              {/* Calendar grid: weeks as columns, days as rows (7 rows × weeks columns) */}
              {/* Grid renders row by row, so we iterate by row (day) then column (week) */}
              <div 
                className="grid gap-1" 
                style={{ 
                  gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
                  gridTemplateRows: 'repeat(7, minmax(0, 1fr))'
                }}
              >
                {Array.from({ length: 7 * weeks }).map((_, index) => {
                  // Calculate row (day of week: 0=Monday, 1=Tuesday, ..., 6=Sunday) and column (week: 0, 1, 2, ...)
                  // Since grid renders row by row, index goes: row0-col0, row0-col1, ..., row1-col0, row1-col1, ...
                  const row = Math.floor(index / weeks); // Day of week (0-6)
                  const col = index % weeks; // Week number (0, 1, 2, ...)
                  
                  // In gridCells, data is stored sequentially: week0-day0, week0-day1, ..., week1-day0, week1-day1, ...
                  // So: cellIndex = col * 7 + row
                  const cellIndex = col * 7 + row;
                  const cell = gridCells[cellIndex] || { date: null, hasActivity: false, isEmpty: true, workTime: null, blocks: null };

                  // Use deterministic opacity based on date to avoid hydration mismatch
                  const hash = cell.date
                    ? (cell.date.getTime() % 2)
                    : (index % 2);
                  const opacity = cell.hasActivity
                    ? hash === 0
                      ? 'opacity-100'
                      : 'opacity-60'
                    : '';
                  const bgColor = cell.hasActivity ? 'bg-accent-green' : 'bg-[#DCD9D6]';

                  return (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-[3px] ${bgColor} ${opacity} ${
                        cell.isEmpty ? 'opacity-20' : ''
                      } ${cell.hasActivity ? 'cursor-pointer hover:scale-125 transition-transform' : ''}`}
                      onMouseEnter={cell.date && cell.hasActivity ? (e) => handleMouseEnter(cell.date!.getDate(), cell.workTime, cell.blocks, e) : undefined}
                      onMouseLeave={cell.hasActivity ? handleMouseLeave : undefined}
                    />
                  );
                })}
              </div>
              <span className="text-sm font-medium text-foreground">
                {monthData.month}
              </span>
              <span className="text-xs font-regular text-foreground-secondary">
                {monthData.hours}
              </span>
            </div>
          );
        })}
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

