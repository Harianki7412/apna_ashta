"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import toast from "react-hot-toast";
import { trackEvent } from "@/components/GoogleAnalytics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPrompt() {
  const pathname = usePathname();
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<"idle" | "installing" | "installed">("idle");
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    try {
      const dismissed = localStorage.getItem("install-dismissed");
      if (dismissed && Date.now() - Number(dismissed) < 7 * 86400000) return;
    } catch (error) {
      console.warn("[PWA] Could not read install preference:", error);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      showTimer.current = setTimeout(() => {
        setShow(true);
        trackEvent("pwa_install_prompt_shown");
      }, 20000);
    };
    const installed = () => {
      setStep("installed");
      setShow(true);
      trackEvent("pwa_installed");
      closeTimer.current = setTimeout(() => setShow(false), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
      if (showTimer.current) clearTimeout(showTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [pathname]);

  async function install() {
    if (!prompt) return;
    setStep("installing");
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      trackEvent(
        outcome === "accepted" ? "pwa_install_accepted" : "pwa_install_declined",
      );
      if (outcome === "accepted") {
        setStep("installed");
        closeTimer.current = setTimeout(() => setShow(false), 2000);
      } else setStep("idle");
      setPrompt(null);
    } catch (error) {
      console.error("[PWA] Install prompt failed:", error);
      setStep("idle");
      toast.error("Could not start the install prompt. Please try again.");
    }
  }

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem("install-dismissed", String(Date.now()));
    } catch (error) {
      console.warn("[PWA] Could not save install preference:", error);
    }
    trackEvent("pwa_install_prompt_dismissed");
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
              : "Quick access and an offline fallback when your connection drops."}
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
