"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

export default function VerifyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "kyc">("phone");

  async function sendOtp() {
    try {
      await api.post("/api/otp/send", { phone });
      setStep("otp");
      toast.success("OTP sent");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function verify() {
    try {
      await api.post("/api/otp/verify", { phone, otp });
      setStep("kyc");
      toast.success("Phone verified");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function uploadKyc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const t = toast.loading("Uploading...");
    try {
      await api.post("/api/kyc/upload", fd);
      toast.success("KYC submitted", { id: t });
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4 mt-12">
      <h1 className="text-2xl font-bold">Verification</h1>
      {step === "phone" && (
        <>
          <input
            placeholder="10-digit phone"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className="w-full border p-2 rounded"
          />
          <button
            onClick={sendOtp}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Send OTP
          </button>
        </>
      )}
      {step === "otp" && (
        <>
          <p className="text-sm text-gray-600">OTP sent to +91{phone}</p>
          <input
            placeholder="6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full border p-2 rounded text-center text-xl tracking-widest"
          />
          <button
            onClick={verify}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Verify OTP
          </button>
        </>
      )}
      {step === "kyc" && (
        <>
          <p className="text-sm text-gray-600">
            Upload Aadhaar/PAN for KYC verification
          </p>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={uploadKyc}
            className="w-full border p-2 rounded"
          />
        </>
      )}
    </div>
  );
}
