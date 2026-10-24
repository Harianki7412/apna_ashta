"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RentAgreementModal({
  propertyId,
  rent,
  deposit,
}: {
  propertyId: string;
  rent: number;
  deposit: number;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tenantName: "",
    tenantPhone: "",
    tenantAddress: "",
    startDate: new Date().toISOString().split("T")[0],
    durationMonths: 11,
    noticePeriodDays: 30,
    includeFurniture: false,
  });

  async function generate() {
    const t = toast.loading("Generating...");
    try {
      const res = await fetch("/api/agreement/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, ...form }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rent-agreement-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss(t);
      toast.success("Downloaded");
      setOpen(false);
    } catch (e: any) {
      toast.dismiss(t);
      toast.error(e.message);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        📄 Generate Rent Agreement
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Rent Agreement</h2>
            <div className="space-y-2">
              <input
                placeholder="Tenant Full Name"
                className="w-full border p-2 rounded"
                value={form.tenantName}
                onChange={(e) =>
                  setForm({ ...form, tenantName: e.target.value })
                }
              />
              <input
                placeholder="Tenant Phone"
                className="w-full border p-2 rounded"
                value={form.tenantPhone}
                onChange={(e) =>
                  setForm({ ...form, tenantPhone: e.target.value })
                }
              />
              <input
                placeholder="Tenant Permanent Address"
                className="w-full border p-2 rounded"
                value={form.tenantAddress}
                onChange={(e) =>
                  setForm({ ...form, tenantAddress: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="text-sm">
                  Start Date
                  <input
                    type="date"
                    className="w-full border p-2 rounded"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </label>
                <label className="text-sm">
                  Duration (months)
                  <input
                    type="number"
                    className="w-full border p-2 rounded"
                    value={form.durationMonths}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        durationMonths: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
              <label className="text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.includeFurniture}
                  onChange={(e) =>
                    setForm({ ...form, includeFurniture: e.target.checked })
                  }
                />
                Includes furniture
              </label>
              <div className="bg-blue-50 p-3 rounded text-sm">
                <p>
                  <strong>Rent:</strong> ₹{rent}
                </p>
                <p>
                  <strong>Deposit:</strong> ₹{deposit}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={generate}
                  disabled={!form.tenantName}
                  className="flex-1 bg-green-600 text-white py-2 rounded disabled:opacity-50"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 border py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
