import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({
  children,
  className = "mx-auto w-full max-w-7xl",
}: PageShellProps) {
  return <div className={className}>{children}</div>;
}
