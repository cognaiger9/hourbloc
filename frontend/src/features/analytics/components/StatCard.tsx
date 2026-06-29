import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/common';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor?: string;
  className?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  iconColor = 'text-accent-green',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-2.5',
        className
      )}
    >
      <Icon className={cn('w-5 h-5 mb-0.5', iconColor)} />
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-foreground opacity-60">
          {label}
        </span>
        <span className="text-2xl font-medium tracking-tight">{value}</span>
      </div>
    </div>
  );
}

