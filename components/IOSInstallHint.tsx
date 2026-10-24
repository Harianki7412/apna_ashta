"use client";
import { useEffect, useState } from "react";

export default function IOSInstallHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = localStorage.getItem("ios-hint");
    if (isIOS && !standalone && !dismissed)
      setTimeout(() => setShow(true), 20000);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white border rounded-lg shadow p-4 z-50 md:hidden">
      <button
        onClick={() => {
          setShow(false);
          localStorage.setItem("ios-hint", "1");
        }}
        className="float-right text-gray-400"
      >
        ✕
      </button>
      <p className="text-sm">
        📲 <strong>Install:</strong> Tap <strong>Share</strong> →{" "}
        <strong>Add to Home Screen</strong>
      </p>
    </div>
  );
}
