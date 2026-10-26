"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  Phone,
  ShieldCheck,
  Upload,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileCheck,
  Lock,
} from "lucide-react";

type Step = "phone" | "otp" | "kyc" | "done";

export default function VerifyPage() {
  const { status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/verify");
    }
  }, [status, router]);

  async function sendOtp() {
    if (phone.length !== 10) return toast.error("10-digit phone");
    setLoading(true);
    try {
      await api.post("/api/otp/send", { identifier: phone, method: "phone" });
      setStep("otp");
      toast.success("OTP sent");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (otp.length !== 6) return toast.error("6-digit OTP");
    setLoading(true);
    try {
      await api.post("/api/otp/verify", {
        identifier: phone,
        method: "phone",
        otp,
      });
      setStep("kyc");
      toast.success("Phone verified!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function uploadKyc() {
    if (!file) return toast.error("Select a document");
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/api/kyc/upload", fd);
      setStep("done");
      toast.success("KYC submitted");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="max-w-xl mx-auto">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  const steps = [
    { key: "phone", label: "Phone", icon: Phone },
    { key: "otp", label: "OTP", icon: Lock },
    { key: "kyc", label: "KYC", icon: FileCheck },
    { key: "done", label: "Done", icon: CheckCircle2 },
  ] as const;
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 mb-6"
      >
        <ArrowLeft size={16} /> Back
      </Link>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold">Verify Your Account</h1>
        <p className="text-gray-500 mt-1">Get a verified badge</p>
      </div>
      <div className="flex items-center justify-between mb-8 px-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    done
                      ? "bg-success-500 text-white"
                      : active
                        ? "bg-brand-600 text-white ring-4 ring-brand-100"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <span
                  className={`text-xs font-medium ${
                    active
                      ? "text-brand-600"
                      : done
                        ? "text-success-600"
                        : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 -mt-4 ${done ? "bg-success-500" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="card p-6 md:p-8">
        {step === "phone" && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-xl font-bold">Enter your phone</h2>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-gray-100 rounded-xl text-sm font-medium border border-gray-200">
                +91
              </span>
              <input
                type="tel"
                className="input flex-1 text-lg"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                autoFocus
              />
            </div>
            <button
              onClick={sendOtp}
              disabled={loading || phone.length !== 10}
              className="btn btn-primary btn-lg w-full"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  Send OTP <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}
        {step === "otp" && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-xl font-bold">Enter OTP</h2>
            <p className="text-sm text-gray-500">Sent to +91 {phone}</p>
            <input
              type="text"
              inputMode="numeric"
              className="input text-center text-3xl tracking-[0.5em] font-bold"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              autoFocus
            />
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="btn btn-primary btn-lg w-full"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Verify <CheckCircle2 size={16} />
                </>
              )}
            </button>
            <button
              onClick={() => setStep("phone")}
              className="text-sm text-gray-500 w-full"
            >
              ← Change
            </button>
          </div>
        )}
        {step === "kyc" && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-xl font-bold">Upload ID</h2>
            <p className="text-sm text-gray-500">
              Aadhaar, PAN, or any govt ID
            </p>
            <label className="flex flex-col items-center border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-xl p-8 cursor-pointer bg-gray-50/50">
              <Upload size={36} className="text-gray-400 mb-2" />
              <span className="text-sm font-medium">
                {file ? file.name : "Click to upload"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                JPG, PNG, PDF up to 10MB
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {file && (
              <div className="flex items-center gap-2 p-3 bg-success-50 rounded-lg text-sm text-success-700">
                <CheckCircle2 size={16} />
                <span className="truncate">{file.name}</span>
              </div>
            )}
            <button
              onClick={uploadKyc}
              disabled={loading || !file}
              className="btn btn-primary btn-lg w-full"
            >
              {loading ? (
                "Uploading..."
              ) : (
                <>
                  Submit <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}
        {step === "done" && (
          <div className="text-center py-8 animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-success-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">All Done!</h2>
            <p className="text-gray-500 mb-6">
              KYC under review — usually 24 hours.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => router.push("/profile")}
                className="btn btn-secondary"
              >
                Profile
              </button>
              <button
                onClick={() => router.push("/properties")}
                className="btn btn-primary"
              >
                Browse
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
