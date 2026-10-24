"use client";
import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const dismissed = localStorage.getItem("install-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 86400000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShow(true), 15000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setPrompt(null);
  }

  function dismiss() {
    setShow(false);
    localStorage.setItem("install-dismissed", String(Date.now()));
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white border-2 border-blue-600 rounded-lg shadow-xl z-50 p-4">
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-gray-400"
      >
        <X size={18} />
      </button>
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded">
          <Download className="text-blue-600" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm">Install Apna Ashta</h3>
          <p className="text-xs text-gray-600 mt-1">
            Add to home screen for faster access and offline browsing.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={install}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="text-gray-500 px-2 py-1 text-xs"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
