"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

export default function AdminKyc() {
  const [users, setUsers] = useState<any[]>([]);

  async function load() {
    try {
      const d = await api.get<any[]>("/api/admin/kyc");
      setUsers(d);
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function review(userId: string, status: string) {
    try {
      await api.patch("/api/admin/kyc", { userId, status });
      toast.success(`KYC ${status}`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pending KYC</h1>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u._id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">
              {u.name} · {u.email}
            </p>
            <p className="text-sm text-gray-500">Phone: {u.phone || "—"}</p>
            {u.kycDocument && (
              <a
                href={u.kycDocument}
                target="_blank"
                className="text-blue-600 text-sm underline"
              >
                View Document
              </a>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => review(u._id, "verified")}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Verify
              </button>
              <button
                onClick={() => review(u._id, "rejected")}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {!users.length && (
          <p className="text-gray-500">No pending KYC requests.</p>
        )}
      </div>
    </div>
  );
}
