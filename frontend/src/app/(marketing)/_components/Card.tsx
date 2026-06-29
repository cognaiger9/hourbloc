import { cn } from "@/utils/common";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  children,
  className,
  variant = "default",
  padding = "md",
}: CardProps) {
  const baseClasses = "bg-surface rounded-2xl border border-border";

  const variantClasses = {
    default: "",
    elevated: "shadow-lg shadow-black/5",
    outlined: "border-2",
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6 lg:p-8",
    lg: "p-8 lg:p-10",
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  );

  return <div className={classes}>{children}</div>;
}
