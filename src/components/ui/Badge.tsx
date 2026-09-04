import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-primary-soft text-primary ring-1 ring-primary/20",
    secondary: "bg-secondary-soft text-secondary ring-1 ring-secondary/20",
    success: "bg-success-bg text-success-fg ring-1 ring-success-fg/20",
    danger: "bg-danger-soft text-danger ring-1 ring-danger/20",
    neutral: "bg-card-hover text-fg-secondary border border-card-border",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap tracking-wide ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
