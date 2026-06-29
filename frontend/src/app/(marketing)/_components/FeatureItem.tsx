import { cn } from "@/utils/common";
import { LucideIcon } from "lucide-react";

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function FeatureItem({
  icon: Icon,
  title,
  description,
  className,
}: FeatureItemProps) {
  return (
    <div
      className={cn(
        "bg-background border border-border rounded-xl p-5",
        "flex items-center gap-5",
        className
      )}
    >
      <div className="w-12 h-12 bg-green-light rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="text-accent-green" size={24} />
      </div>
      <div>
        <h3 className="text-section-title font-medium mb-1">{title}</h3>
        <p className="text-secondary text-foreground-secondary">{description}</p>
      </div>
    </div>
  );
}
