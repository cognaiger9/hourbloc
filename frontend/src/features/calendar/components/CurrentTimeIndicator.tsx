'use client';

import { useState, useEffect } from 'react';
import { isSameDay } from '@/utils/dateUtils';

interface CurrentTimeIndicatorProps {
  dates: Date[];
  totalDates: number; // total columns in grid (for percentage calc)
}

function getNowFraction(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

function formatNowLabel(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const mm = m.toString().padStart(2, '0');
  return `${displayH}:${mm} ${ampm}`;
}

export default function CurrentTimeIndicator({ dates, totalDates }: CurrentTimeIndicatorProps) {
  const [nowFraction, setNowFraction] = useState(getNowFraction);
  const [nowLabel, setNowLabel] = useState(formatNowLabel);

  // Update every minute
  useEffect(() => {
    const tick = () => {
      setNowFraction(getNowFraction());
      setNowLabel(formatNowLabel());
    };
    // Sync to next minute boundary
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    const timeoutId = setTimeout(() => {
      tick();
      const intervalId = setInterval(tick, 60_000);
      return () => clearInterval(intervalId);
    }, msToNextMinute);
    return () => clearTimeout(timeoutId);
  }, []);

  const today = new Date();
  const todayIndex = dates.findIndex((d) => isSameDay(d, today));

  // Only render if today is visible in the current date range
  if (todayIndex === -1) return null;

  const topPx = nowFraction * 60; // 60px per hour

  // Position within the column (mirrors block positioning in CalendarGrid)
  const leftPercent = (todayIndex / totalDates) * 100;
  const widthPercent = 100 / totalDates;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: `${topPx}px`,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        zIndex: 40,
      }}
    >
      {/* Now-dot on the left edge */}
      <div
        style={{
          position: 'absolute',
          left: '-1px',
          top: '-4px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-green)',
          animation: 'now-pulse 2.4s ease-in-out infinite',
        }}
      />

      {/* Horizontal line */}
      <div
        style={{
          position: 'absolute',
          left: '6px',
          right: '0',
          top: '-1px',
          height: '2px',
          backgroundColor: 'var(--accent-green)',
          opacity: 0.85,
        }}
      />

      {/* Time pill */}
      <div
        style={{
          position: 'absolute',
          right: '6px',
          top: '-9px',
          backgroundColor: 'var(--accent-green)',
          color: '#fff',
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 500,
          lineHeight: 1,
          padding: '2px 5px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        {nowLabel}
      </div>
    </div>
  );
}
