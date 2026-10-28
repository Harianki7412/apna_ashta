"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-24 h-24 rounded-full bg-danger-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={48} className="text-danger-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Kuch galat ho gaya</h1>
        <p className="text-gray-500 mb-2">
          Sorry, an unexpected error occurred.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-8">
          <button onClick={reset} className="btn btn-primary">
            <RefreshCw size={16} /> Try Again
          </button>
          <Link href="/" className="btn btn-secondary">
            <Home size={16} /> Home
          </Link>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Problem persists? Contact us:
          </p>
          <Link
            href="/contact"
            className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <MessageCircle size={14} /> Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
