import { SearchX } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: any;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-up">
      <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4">
        <Icon
          size={40}
          className="text-brand-400 dark:text-brand-500"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
