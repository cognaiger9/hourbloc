'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/utils/common';
import { formatLocalTime } from '@/utils/dateUtils';
import type { TimelineBar } from '../types';

interface DailyTimelineProps {
  plannedBars: TimelineBar[];
  actualBars: TimelineBar[];
  startHour?: number; // e.g., 5 for 5AM
  endHour?: number; // e.g., 19 for 7PM
  className?: string;
}

// Helper function to calculate timeline bar position from local datetime
function calculateLocalTimelineBar(startDateTime: string, endDateTime: string): {
  start: number;
  width: number;
  startTime: string;
  endTime: string;
} {
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  // Get local hours and minutes
  const startHour = startDate.getHours();
  const startMinute = startDate.getMinutes();

  // Calculate start position as percentage of 24 hours
  const totalStartMinutes = startHour * 60 + startMinute;
  const start = (totalStartMinutes / (24 * 60)) * 100;

  // Calculate duration in minutes
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  const width = (durationMinutes / (24 * 60)) * 100;

  return {
    start: Math.round(start * 100) / 100,
    width: Math.round(width * 100) / 100,
    startTime: formatLocalTime(startDate),
    endTime: formatLocalTime(endDate),
  };
}

export default function DailyTimeline({
  plannedBars,
  actualBars,
  startHour = 0,
  endHour = 23,
  className,
}: DailyTimelineProps) {
  // State for tooltip
  const [hoveredBar, setHoveredBar] = useState<{ bar: TimelineBar; type: 'planned' | 'actual' } | null>(null);

  // Convert UTC-based bars to local time
  const localPlannedBars = useMemo(() => {
    return plannedBars.map(bar => {
      if (bar.startDateTime && bar.endDateTime) {
        const localData = calculateLocalTimelineBar(bar.startDateTime, bar.endDateTime);
        return {
          ...bar,
          start: localData.start,
          width: localData.width,
          startTime: localData.startTime,
          endTime: localData.endTime,
        };
      }
      return bar;
    });
  }, [plannedBars]);

  const localActualBars = useMemo(() => {
    return actualBars.map(bar => {
      if (bar.startDateTime && bar.endDateTime) {
        const localData = calculateLocalTimelineBar(bar.startDateTime, bar.endDateTime);
        return {
          ...bar,
          start: localData.start,
          width: localData.width,
          startTime: localData.startTime,
          endTime: localData.endTime,
        };
      }
      return bar;
    });
  }, [actualBars]);

  // Show every 2 hours for compact display
  const hours = [];
  for (let h = startHour; h <= endHour; h += 2) {
    hours.push(h);
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12AM';
    if (hour < 12) return `${hour}AM`;
    if (hour === 12) return '12PM';
    return `${hour - 12}PM`;
  };

  // Row positions - centered on horizontal baselines
  const plannedRowTop = '80px';
  const actualRowTop = '160px';

  return (
    <div className={cn('relative w-full h-[260px]', className)}>
      <div className="w-full h-full relative px-4">
        {/* Horizontal Baselines */}
        <div 
          className="absolute left-[80px] right-4 h-px bg-foreground/20 z-10"
          style={{ top: plannedRowTop }}
        />
        <div 
          className="absolute left-[80px] right-4 h-px bg-foreground/20 z-10"
          style={{ top: actualRowTop }}
        />

        {/* Grid Lines & Labels */}
        <div 
          className="absolute top-0 bottom-0 flex select-none pointer-events-none" 
          style={{ left: 'calc(80px + 16px + 16px)', right: '16px', gap: '0' }}
        >
          {hours.map((hour) => {
            // Calculate width: each 2-hour interval gets equal space
            const hourWidth = `${100 / hours.length}%`;
            return (
              <div
                key={hour}
                className="relative h-full flex flex-col justify-end"
                style={{ width: hourWidth }}
              >
                <div 
                  className="absolute w-px"
                  style={{ 
                    top: 0, 
                    bottom: '32px', // Space for time labels
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderLeft: '1px dashed rgba(107, 114, 128, 0.3)' // More contrast with grey-500 at 30% opacity
                  }} 
                />
                <span 
                  className="absolute text-xs font-medium text-foreground-secondary whitespace-nowrap"
                  style={{ 
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {formatHour(hour)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Planned Row - Centered on baseline */}
        <div
          className="absolute left-4 right-4 flex items-center gap-4 z-20"
          style={{
            top: plannedRowTop,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="text-sm font-medium tracking-wide text-foreground-secondary min-w-[80px]">
            PLANNED
          </div>
          <div className="relative flex-1 h-10">
            {localPlannedBars.map((bar, index) => (
              <div
                key={`planned-${index}`}
                className="timeline-bar absolute h-full shadow-sm cursor-pointer transition-all hover:ring-2 hover:ring-foreground/20 hover:z-10"
                style={{
                  left: `${bar.start}%`,
                  width: `${bar.width}%`,
                  backgroundColor: bar.opacity
                    ? `${bar.color}${Math.round(bar.opacity * 255)
                        .toString(16)
                        .padStart(2, '0')}`
                    : bar.color,
                  border: bar.borderColor
                    ? `1px solid ${bar.borderColor}${
                        bar.borderOpacity
                          ? Math.round(bar.borderOpacity * 255)
                              .toString(16)
                              .padStart(2, '0')
                          : ''
                      }`
                    : '1px dashed rgba(107, 114, 128, 0.4)',
                  animationDelay: `${index * 0.05}s`,
                }}
                onMouseEnter={() => setHoveredBar({ bar, type: 'planned' })}
                onMouseLeave={() => setHoveredBar(null)}
              />
            ))}
          </div>
        </div>

        {/* Actual Row - Centered on baseline */}
        <div
          className="absolute left-4 right-4 flex items-center gap-4 z-20"
          style={{
            top: actualRowTop,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="text-sm font-medium tracking-wide text-foreground-secondary min-w-[80px]">
            ACTUAL
          </div>
          <div className="relative flex-1 h-10">
            {localActualBars.map((bar, index) => (
              <div
                key={`actual-${index}`}
                className="timeline-bar absolute h-full shadow-sm cursor-pointer transition-all hover:ring-2 hover:ring-foreground/20 hover:z-10"
                style={{
                  left: `${bar.start}%`,
                  width: `${bar.width}%`,
                  backgroundColor: bar.opacity
                    ? `${bar.color}${Math.round(bar.opacity * 255)
                        .toString(16)
                        .padStart(2, '0')}`
                    : bar.color,
                  animationDelay: `${index * 0.05}s`,
                }}
                onMouseEnter={() => setHoveredBar({ bar, type: 'actual' })}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {bar.hasDots && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredBar && (
          <div
            className="absolute bg-foreground text-background text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none z-50 whitespace-nowrap"
            style={{
              left: `calc(80px + 16px + ${hoveredBar.bar.start}% + ${hoveredBar.bar.width / 2}%)`,
              top: hoveredBar.type === 'planned' ? 'calc(80px - 60px)' : 'calc(160px - 60px)',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-medium">
              {hoveredBar.bar.title || 'Block'}
            </div>
            <div className="text-xs opacity-80 mt-1">
              {hoveredBar.bar.startTime && hoveredBar.bar.endTime
                ? `${hoveredBar.bar.startTime} - ${hoveredBar.bar.endTime}`
                : 'Time not available'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

