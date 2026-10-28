"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const pathname = usePathname();
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<"idle" | "installing" | "installed">("idle");

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const dismissed = localStorage.getItem("install-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 86400000) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShow(true), 20000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!prompt) return;
    setStep("installing");
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setStep("installed");
      setTimeout(() => setShow(false), 2000);
    } else setStep("idle");
    setPrompt(null);
  }

  function dismiss() {
    setShow(false);
    localStorage.setItem("install-dismissed", String(Date.now()));
  }

  if (!show) return null;
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white dark:bg-slate-800 border-2 border-brand-600 dark:border-brand-500 rounded-2xl shadow-xl dark:shadow-2xl z-50 p-4 animate-fade-up">
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
          <Download className="text-white" size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-900 dark:text-slate-100">
            {step === "installed" ? "Installed! 🎉" : "Install Flatova"}
          </h3>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
            {step === "installed"
              ? "Look on your home screen"
              : "Faster access + offline browsing"}
          </p>
          {step !== "installed" && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={install}
                disabled={step === "installing"}
                className="btn btn-primary btn-sm flex-1"
              >
                {step === "installing" ? "..." : "Install"}
              </button>
              <button onClick={dismiss} className="btn btn-ghost btn-sm">
                Later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
