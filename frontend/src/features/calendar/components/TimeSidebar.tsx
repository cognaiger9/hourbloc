'use client';

import { forwardRef, useEffect, useState } from 'react';

interface TimeSidebarProps {
  onScroll: (scrollTop: number) => void;
  scrollTop?: number;
}

// Generate time labels (1 AM – 11 PM)
const generateTimeLabels = () => {
  const timeLabels = [];
  for (let hour = 1; hour <= 23; hour++) {
    let label: string;
    if (hour < 12) {
      label = `${hour}:00`;
    } else if (hour === 12) {
      label = `12:00`;
    } else {
      label = `${hour - 12}:00`;
    }
    const ampm = hour < 12 ? 'AM' : 'PM';
    timeLabels.push({ hour, label, ampm, top: hour * 60 });
  }
  return timeLabels;
};

const timeLabels = generateTimeLabels();

const TimeSidebar = forwardRef<HTMLDivElement, TimeSidebarProps>(
  ({ onScroll, scrollTop }, ref) => {
    const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());

    // Update current hour every minute
    useEffect(() => {
      const tick = () => setCurrentHour(new Date().getHours());
      const id = setInterval(tick, 60_000);
      return () => clearInterval(id);
    }, []);

    // Sync scroll position if controlled
    useEffect(() => {
      if (scrollTop !== undefined && ref && 'current' in ref && ref.current) {
        ref.current.scrollTop = scrollTop;
      }
    }, [scrollTop, ref]);

    const handleScroll = () => {
      if (ref && 'current' in ref && ref.current) {
        onScroll(ref.current.scrollTop);
      }
    };

    return (
      <div className="w-16 flex-shrink-0 border-r border-border bg-surface relative z-10">
        <div
          ref={ref}
          onScroll={handleScroll}
          className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="h-[1440px] relative w-full">
            {timeLabels.map(({ hour, label, ampm, top }) => {
              const isCurrent = hour === currentHour;
              return (
                <div
                  key={hour}
                  className="absolute w-full flex flex-col items-end pr-2.5"
                  style={{ top: `${top}px`, marginTop: '-18px' }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: '10px',
                      fontWeight: isCurrent ? 600 : 400,
                      lineHeight: 1.2,
                      color: isCurrent ? 'var(--accent-green)' : 'var(--foreground-secondary)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '8px',
                      fontWeight: isCurrent ? 600 : 400,
                      lineHeight: 1,
                      color: isCurrent ? 'var(--accent-green)' : 'var(--foreground-secondary)',
                      opacity: isCurrent ? 1 : 0.65,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {ampm}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

TimeSidebar.displayName = 'TimeSidebar';

export default TimeSidebar;
