"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="card mx-auto max-w-xl p-8 text-center" role="alert">
      <AlertTriangle size={36} className="mx-auto mb-4 text-danger-500" />
      <h1 className="text-xl font-bold">This admin page could not be loaded</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
        An unexpected error occurred. Try again, or return to the admin dashboard.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-gray-400">
          Error ID: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button onClick={reset} className="btn btn-primary">
          <RefreshCw size={15} /> Try again
        </button>
        <Link href="/admin" className="btn btn-secondary">
          Admin dashboard
        </Link>
      </div>
    </div>
  );
}
