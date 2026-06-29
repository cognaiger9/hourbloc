'use client';

interface DayTooltipProps {
  day: number;
  workTime: string;
  blocks: number;
  position: { x: number; y: number };
}

export default function DayTooltip({ day, workTime, blocks, position }: DayTooltipProps) {
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%) translateY(-8px)',
      }}
    >
      <div className="bg-foreground text-surface rounded-lg px-3 py-2 shadow-lg">
        <div className="text-xs font-semibold mb-1">Day {day}</div>
        <div className="text-xs opacity-90">
          <div>{workTime}</div>
          <div>{blocks} {blocks === 1 ? 'session' : 'sessions'}</div>
        </div>
        {/* Arrow */}
        <div
          className="absolute left-1/2 -bottom-1 w-2 h-2 bg-foreground transform rotate-45 -translate-x-1/2"
        />
      </div>
    </div>
  );
}
