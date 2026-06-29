'use client';

import { formatElapsedTime } from '@/utils/dateUtils';

interface TimerDisplayProps {
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

export default function TimerDisplay({
  elapsedSeconds,
  isRunning,
  isPaused,
}: TimerDisplayProps) {
  return (
    <div className="relative w-[384px] h-[384px] flex items-center justify-center">
      {/* SVG Rings */}
      <svg className="absolute inset-0 w-full h-full timer-svg" viewBox="0 0 384 384" fill="none" style={{ transform: 'rotate(-90deg)' }}>
        {/* Progress Circle */}
        <circle cx="192" cy="192" r="172.8" stroke="#3CBF6F" strokeWidth="5.76" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm"></circle>
      </svg>

      {/* Center Text */}
      <div className="flex flex-col items-center z-10 text-center">
        {/* Time */}
        <h1 className="text-[64px] leading-none font-semibold tracking-[-0.05em] text-foreground tabular-nums">
          {formatElapsedTime(elapsedSeconds)}
        </h1>
        
        {/* Status */}
        <div className="mt-2.5">
          <span className="text-xs font-medium text-[#9CA3AF] tracking-[0.025em]">
            {!isRunning ? 'Ready to start' : isPaused ? 'Paused' : 'Stopwatch mode'}
          </span>
        </div>
      </div>
    </div>
  );
}

