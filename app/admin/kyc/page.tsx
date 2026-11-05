"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { hasAdminAccess } from "@/lib/role-access";
import { ArrowLeft } from "lucide-react";

type KycUser = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  kycDocument?: string;
  kycDocumentFront?: string;
  kycDocumentBack?: string;
};

export default function AdminKyc() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<KycUser[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/kyc");
      return;
    }
    if (status === "authenticated") {
      if (!hasAdminAccess(session?.user.role)) {
        toast.error("Admin access required");
        router.push("/");
      }
    }
  }, [status, session, router]);

  async function load() {
    try {
      const d = await api.get<KycUser[]>("/api/admin/kyc");
      setUsers(d);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unable to load KYC requests");
    }
  }

  useEffect(() => {
    if (status !== "authenticated" || !hasAdminAccess(session?.user.role)) return;
    let active = true;
    api.get<KycUser[]>("/api/admin/kyc")
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((e: unknown) => {
        if (active)
          toast.error(
            e instanceof Error ? e.message : "Unable to load KYC requests",
          );
      });
    return () => {
      active = false;
    };
  }, [status, session]);

  async function review(userId: string, stat: "verified" | "rejected") {
    try {
      await api.patch("/api/admin/kyc", { userId, status: stat });
      toast.success(`KYC ${stat}`);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unable to update KYC");
    }
  }

  if (status === "loading") {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 mb-4"
      >
        <ArrowLeft size={16} /> Back to Admin
      </Link>
      <h1 className="text-2xl font-bold mb-4">Pending KYC</h1>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u._id} className="card p-4">
            <p className="font-semibold">
              {u.name} · {u.email}
            </p>
            <p className="text-sm text-gray-500">Phone: {u.phone || "—"}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              {u.kycDocumentFront && (
                <a
                  href={u.kycDocumentFront}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 text-sm underline"
                >
                  View Aadhaar front
                </a>
              )}
              {u.kycDocumentBack && (
                <a
                  href={u.kycDocumentBack}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 text-sm underline"
                >
                  View Aadhaar back
                </a>
              )}
              {!u.kycDocumentFront && !u.kycDocumentBack && u.kycDocument && (
                <a
                  href={u.kycDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 text-sm underline"
                >
                  View legacy document
                </a>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => review(u._id, "verified")}
                className="btn btn-success btn-sm"
              >
                Verify
              </button>
              <button
                onClick={() => review(u._id, "rejected")}
                className="btn btn-danger btn-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {!users.length && <p className="text-gray-500">No pending KYC.</p>}
      </div>
    </div>
  );
}
