import Link from "next/link";
import { cn } from "@/utils/common";
import { ReactNode } from "react";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  href,
  onClick,
  variant = "primary",
  className,
  children,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center",
    "font-medium rounded-lg",
    "transition-colors",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  );

  const variantClasses = {
    primary: cn(
      "bg-accent-green text-white",
      "px-6 py-3",
      "hover:bg-green-hover"
    ),
    secondary: cn(
      "bg-background text-foreground",
      "border border-border",
      "px-6 py-3",
      "hover:bg-surface"
    ),
  };

  const classes = cn(baseClasses, variantClasses[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
