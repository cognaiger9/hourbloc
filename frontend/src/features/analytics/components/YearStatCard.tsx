import { LucideIcon } from 'lucide-react';

interface YearStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function YearStatCard({
  icon: Icon,
  label,
  value,
}: YearStatCardProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 flex items-center justify-center text-accent-green shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-primary font-medium text-foreground-secondary">{label}</span>
        <div className="text-[1.5rem] font-medium leading-none tracking-tight text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

