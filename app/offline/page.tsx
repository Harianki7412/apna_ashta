"use client";
import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <WifiOff size={44} className="text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">You're offline</h1>
        <p className="text-gray-500 mb-6">
          {online ? "Connection restored!" : "Check your internet."}
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-lg w-full"
          >
            <RefreshCw size={18} /> Try Again
          </button>
          <Link href="/" className="btn btn-secondary btn-lg w-full">
            <Home size={18} /> Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
