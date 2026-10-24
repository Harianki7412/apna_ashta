"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

export default function Admin() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState("pending");

  async function load() {
    try {
      const d = await api.get<{ items: any[] }>(
        `/api/admin/properties?status=${status}`,
      );
      setItems(d.items);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function update(id: string, s: string) {
    try {
      await api.patch("/api/admin/properties", { id, status: s });
      toast.success(`Marked ${s}`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Link
          href="/admin"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Properties
        </Link>
        <Link href="/admin/users" className="bg-gray-200 px-4 py-2 rounded">
          Users
        </Link>
        <Link href="/admin/kyc" className="bg-gray-200 px-4 py-2 rounded">
          KYC
        </Link>
      </div>
      <div className="flex gap-2 mb-4">
        {["pending", "approved", "rejected", "rented"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded text-sm ${status === s ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {items.map((p) => (
          <div
            key={p._id}
            className="bg-white p-4 rounded shadow flex justify-between items-center flex-wrap gap-2"
          >
            <div className="flex-1">
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-gray-500">
                {p.area} · ₹{p.rent} · {p.owner?.name}
              </p>
            </div>
            <div className="flex gap-2">
              {p.status !== "approved" && (
                <button
                  onClick={() => update(p._id, "approved")}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>
              )}
              {p.status !== "rejected" && (
                <button
                  onClick={() => update(p._id, "rejected")}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        ))}
        {!items.length && (
          <p className="text-gray-500">No {status} properties.</p>
        )}
      </div>
    </div>
  );
}
