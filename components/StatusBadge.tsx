import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type StatusBadgeTone = "brand" | "success" | "warning" | "danger";

interface StatusBadgeProps {
  children: ReactNode;
  tone: StatusBadgeTone;
  icon?: LucideIcon;
  className?: string;
}

export function StatusBadge({
  children,
  tone,
  icon: Icon,
  className = "",
}: StatusBadgeProps) {
  return (
    <span className={`badge badge-${tone} ${className}`.trim()}>
      {Icon && <Icon size={10} />}
      {children}
    </span>
  );
}
