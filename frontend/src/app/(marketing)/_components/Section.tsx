import { cn } from "@/utils/common";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: "default" | "surface" | "background";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "6xl" | "full";
  id?: string;
}

export default function Section({
  children,
  className,
  background = "default",
  maxWidth = "6xl",
  id,
}: SectionProps) {
  const baseClasses = "px-6 lg:px-16 py-16";

  const backgroundClasses = {
    default: "",
    surface: "bg-surface",
    background: "bg-background",
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "6xl": "max-w-6xl",
    full: "",
  };

  const classes = cn(
    baseClasses,
    backgroundClasses[background],
    className
  );

  return (
    <section 
      id={id} 
      className={classes}
      style={id ? { scrollMarginTop: '76px' } : undefined}
    >
      <div className={cn(maxWidthClasses[maxWidth], "mx-auto")}>
        {children}
      </div>
    </section>
  );
}
