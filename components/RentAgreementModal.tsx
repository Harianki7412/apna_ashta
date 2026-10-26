"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import {
  FileText,
  User,
  Home,
  MapPin,
  Users,
  ChevronRight,
  ChevronLeft,
  Send,
  X,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

type Phase = "select-tenant" | "fill-details";
type Step = "owner" | "tenant" | "lease" | "inventory" | "witnesses";

export default function RentAgreementModal({
  propertyId,
  rent,
  deposit,
  propertyAddress,
  city,
  bedrooms,
}: {
  propertyId: string;
  rent: number;
  deposit: number;
  propertyAddress?: string;
  city?: string;
  bedrooms?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("select-tenant");
  const [step, setStep] = useState<Step>("owner");
  const [sending, setSending] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const [form, setForm] = useState({
    place: city || "Ashta",
    agreementDate: new Date().toISOString().split("T")[0],
    ownerName: "",
    ownerFatherName: "",
    ownerAddress: "",
    tenantName: "",
    tenantFatherName: "",
    tenantOfficeOrInstitution: "",
    tenantAddress: "",
    propertyAddress: propertyAddress || "",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    rentAmount: rent,
    maintenanceCharge: 0,
    securityDeposit: deposit,
    chequeNumber: "",
    chequeDate: "",
    noticePeriodDays: 30,
    city: city || "Ashta",
    bedrooms: bedrooms || 1,
    fans: 2,
    cflLights: 4,
    geysers: 1,
    mirrors: 2,
    witness1Name: "",
    witness1Address: "",
    witness2Name: "",
    witness2Address: "",
  });

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: "owner", label: "Owner", icon: User },
    { key: "tenant", label: "Tenant", icon: User },
    { key: "lease", label: "Lease", icon: Home },
    { key: "inventory", label: "Inventory", icon: MapPin },
    { key: "witnesses", label: "Witnesses", icon: Users },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  useEffect(() => {
    if (!open || phase !== "select-tenant") return;
    setLoadingTenants(true);
    api
      .get<any[]>(`/api/properties/${propertyId}/interested-tenants`)
      .then(setTenants)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingTenants(false));
  }, [open, phase, propertyId]);

  function selectTenant(t: any) {
    if (t.hasActiveAgreement) {
      return toast.error("An active agreement already exists with this tenant");
    }
    setSelectedTenant(t);
    setForm((f) => ({
      ...f,
      tenantName: t.name || "",
    }));
    setPhase("fill-details");
    setStep("owner");
  }

  function next() {
    if (stepIndex < steps.length - 1) setStep(steps[stepIndex + 1].key);
  }
  function prev() {
    if (stepIndex > 0) setStep(steps[stepIndex - 1].key);
  }

  function validateStep(): string | null {
    if (step === "owner") {
      if (!form.ownerName.trim()) return "Owner name required";
      if (!form.ownerFatherName.trim()) return "Owner's father's name required";
      if (!form.ownerAddress.trim()) return "Owner address required";
    }
    if (step === "tenant") {
      if (!form.tenantName.trim()) return "Tenant name required";
      if (!form.tenantFatherName.trim())
        return "Tenant's father's name required";
      if (!form.tenantOfficeOrInstitution.trim())
        return "Office/Institution required";
      if (!form.tenantAddress.trim()) return "Tenant address required";
    }
    if (step === "lease") {
      if (!form.propertyAddress.trim()) return "Property address required";
      if (!form.rentAmount) return "Rent amount required";
      if (!form.startDate) return "Start date required";
      if (!form.expiryDate) return "Expiry date required";
    }
    if (step === "witnesses") {
      if (!form.witness1Name.trim()) return "Witness 1 name required";
      if (!form.witness1Address.trim()) return "Witness 1 address required";
      if (!form.witness2Name.trim()) return "Witness 2 name required";
      if (!form.witness2Address.trim()) return "Witness 2 address required";
    }
    return null;
  }

  async function send() {
    const err = validateStep();
    if (err) return toast.error(err);
    if (!selectedTenant) return toast.error("Select a tenant first");

    setSending(true);
    const t = toast.loading("Sending agreement to tenant...");
    try {
      const res = await api.post<any>("/api/agreements", {
        tenantId: selectedTenant._id,
        propertyId,
        ...form,
      });
      toast.success("Agreement sent! Tenant will be notified.", { id: t });
      setOpen(false);
      router.push("/agreements");
    } catch (e: any) {
      toast.error(e.message, { id: t });
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setPhase("select-tenant");
    setStep("owner");
    setSelectedTenant(null);
    setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-success w-full">
        <FileText size={16} /> Send Rent Agreement
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-brand-600 to-brand-700 text-white">
              <div>
                <h2 className="text-lg font-bold">Send Rent Agreement</h2>
                <p className="text-xs text-brand-100">
                  {phase === "select-tenant"
                    ? "Select tenant to send agreement"
                    : `To: ${selectedTenant?.name}`}
                </p>
              </div>
              <button
                onClick={reset}
                className="p-2 rounded-lg hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>

            {/* ═══ PHASE 1: SELECT TENANT ═══ */}
            {phase === "select-tenant" && (
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="font-bold mb-2">Select Tenant</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Only tenants you have chatted with about this property can be
                  selected.
                </p>

                {loadingTenants ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton h-16 rounded-xl" />
                    ))}
                  </div>
                ) : tenants.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle
                      size={40}
                      className="text-gray-300 mx-auto mb-3"
                    />
                    <p className="text-sm text-gray-600 mb-2">No tenants yet</p>
                    <p className="text-xs text-gray-500 mb-4">
                      Tenants need to message you about this property before you
                      can send an agreement.
                    </p>
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push("/chat");
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Go to Messages
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tenants.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => selectTenant(t)}
                        disabled={t.hasActiveAgreement}
                        className={`w-full card p-3 text-left hover:border-brand-300 transition-all flex items-center gap-3 ${
                          t.hasActiveAgreement
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold flex-shrink-0">
                          {t.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{t.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {t.email || t.phone}
                          </p>
                        </div>
                        {t.hasActiveAgreement ? (
                          <span className="badge badge-warning">Active</span>
                        ) : (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══ PHASE 2: FILL DETAILS ═══ */}
            {phase === "fill-details" && (
              <>
                {/* Stepper */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  {steps.map((s, i) => {
                    const Icon = s.icon;
                    const active = i === stepIndex;
                    const done = i < stepIndex;
                    return (
                      <div key={s.key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              done
                                ? "bg-success-500 text-white"
                                : active
                                  ? "bg-brand-600 text-white ring-4 ring-brand-100"
                                  : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {done ? "✓" : <Icon size={14} />}
                          </div>
                          <span
                            className={`text-[10px] mt-1 font-medium ${
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
                            className={`h-0.5 flex-1 ${done ? "bg-success-500" : "bg-gray-200"}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* OWNER */}
                  {step === "owner" && (
                    <div className="space-y-4 animate-fade-up">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Agreement Date</label>
                          <input
                            type="date"
                            className="input"
                            value={form.agreementDate}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                agreementDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Place</label>
                          <input
                            className="input"
                            value={form.place}
                            onChange={(e) =>
                              setForm({ ...form, place: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <h3 className="font-bold text-brand-600 pt-2">
                        Owner Details
                      </h3>
                      <input
                        required
                        className="input"
                        placeholder="Owner Full Name *"
                        value={form.ownerName}
                        onChange={(e) =>
                          setForm({ ...form, ownerName: e.target.value })
                        }
                      />
                      <input
                        required
                        className="input"
                        placeholder="Father's Name (S/o or D/o) *"
                        value={form.ownerFatherName}
                        onChange={(e) =>
                          setForm({ ...form, ownerFatherName: e.target.value })
                        }
                      />
                      <textarea
                        required
                        rows={2}
                        className="input"
                        placeholder="Permanent Address *"
                        value={form.ownerAddress}
                        onChange={(e) =>
                          setForm({ ...form, ownerAddress: e.target.value })
                        }
                      />
                    </div>
                  )}

                  {/* TENANT */}
                  {step === "tenant" && (
                    <div className="space-y-4 animate-fade-up">
                      <h3 className="font-bold text-brand-600">
                        Tenant Details
                      </h3>
                      <input
                        required
                        className="input"
                        placeholder="Tenant Full Name *"
                        value={form.tenantName}
                        onChange={(e) =>
                          setForm({ ...form, tenantName: e.target.value })
                        }
                      />
                      <input
                        required
                        className="input"
                        placeholder="Father's Name (S/o or D/o) *"
                        value={form.tenantFatherName}
                        onChange={(e) =>
                          setForm({ ...form, tenantFatherName: e.target.value })
                        }
                      />
                      <input
                        required
                        className="input"
                        placeholder="Working/Studying at *"
                        value={form.tenantOfficeOrInstitution}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tenantOfficeOrInstitution: e.target.value,
                          })
                        }
                      />
                      <textarea
                        required
                        rows={2}
                        className="input"
                        placeholder="Permanent Address *"
                        value={form.tenantAddress}
                        onChange={(e) =>
                          setForm({ ...form, tenantAddress: e.target.value })
                        }
                      />
                    </div>
                  )}

                  {/* LEASE */}
                  {step === "lease" && (
                    <div className="space-y-4 animate-fade-up">
                      <h3 className="font-bold text-brand-600">
                        Property & Lease
                      </h3>
                      <textarea
                        required
                        rows={2}
                        className="input"
                        placeholder="Property Address *"
                        value={form.propertyAddress}
                        onChange={(e) =>
                          setForm({ ...form, propertyAddress: e.target.value })
                        }
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Start Date *</label>
                          <input
                            type="date"
                            className="input"
                            value={form.startDate}
                            onChange={(e) =>
                              setForm({ ...form, startDate: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Expiry Date *</label>
                          <input
                            type="date"
                            className="input"
                            value={form.expiryDate}
                            onChange={(e) =>
                              setForm({ ...form, expiryDate: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Monthly Rent (₹) *</label>
                          <input
                            type="number"
                            className="input"
                            value={form.rentAmount}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                rentAmount: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Maintenance (₹)</label>
                          <input
                            type="number"
                            className="input"
                            value={form.maintenanceCharge}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                maintenanceCharge: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="label">
                            Security Deposit (₹) *
                          </label>
                          <input
                            type="number"
                            className="input"
                            value={form.securityDeposit}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                securityDeposit: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Notice Period (days)</label>
                          <input
                            type="number"
                            className="input"
                            value={form.noticePeriodDays}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                noticePeriodDays: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Cheque No.</label>
                          <input
                            className="input"
                            value={form.chequeNumber}
                            onChange={(e) =>
                              setForm({ ...form, chequeNumber: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Cheque Date</label>
                          <input
                            type="date"
                            className="input"
                            value={form.chequeDate}
                            onChange={(e) =>
                              setForm({ ...form, chequeDate: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Court City *</label>
                        <input
                          className="input"
                          value={form.city}
                          onChange={(e) =>
                            setForm({ ...form, city: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* INVENTORY */}
                  {step === "inventory" && (
                    <div className="space-y-4 animate-fade-up">
                      <h3 className="font-bold text-brand-600">
                        Annexure-I · Inventory
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: "bedrooms", label: "Bedrooms" },
                          { key: "fans", label: "Fans" },
                          { key: "cflLights", label: "CFL Lights" },
                          { key: "geysers", label: "Geysers" },
                          { key: "mirrors", label: "Mirrors" },
                        ].map((item) => (
                          <div key={item.key}>
                            <label className="label">{item.label}</label>
                            <input
                              type="number"
                              min={0}
                              className="input"
                              value={(form as any)[item.key]}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  [item.key]: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WITNESSES */}
                  {step === "witnesses" && (
                    <div className="space-y-4 animate-fade-up">
                      <h3 className="font-bold text-brand-600">Witnesses</h3>
                      <p className="text-sm text-gray-500">
                        Two witnesses are legally required for registration.
                      </p>
                      <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                        <h4 className="font-semibold text-sm">Witness 1 *</h4>
                        <input
                          required
                          className="input"
                          placeholder="Full Name"
                          value={form.witness1Name}
                          onChange={(e) =>
                            setForm({ ...form, witness1Name: e.target.value })
                          }
                        />
                        <input
                          required
                          className="input"
                          placeholder="Complete Address"
                          value={form.witness1Address}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              witness1Address: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                        <h4 className="font-semibold text-sm">Witness 2 *</h4>
                        <input
                          required
                          className="input"
                          placeholder="Full Name"
                          value={form.witness2Name}
                          onChange={(e) =>
                            setForm({ ...form, witness2Name: e.target.value })
                          }
                        />
                        <input
                          required
                          className="input"
                          placeholder="Complete Address"
                          value={form.witness2Address}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              witness2Address: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="p-3 bg-brand-50 rounded-lg text-xs text-brand-700">
                        <CheckCircle2 size={14} className="inline mr-1" />
                        Tenant will review and confirm this agreement. PDF
                        generates only after tenant approval.
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                  <button
                    onClick={prev}
                    disabled={stepIndex === 0}
                    className="btn btn-ghost btn-sm disabled:opacity-50"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <span className="text-xs text-gray-500">
                    {stepIndex + 1} / {steps.length}
                  </span>
                  {stepIndex < steps.length - 1 ? (
                    <button onClick={next} className="btn btn-primary btn-sm">
                      Next <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={send}
                      disabled={sending}
                      className="btn btn-success btn-sm disabled:opacity-50"
                    >
                      <Send size={14} />{" "}
                      {sending ? "Sending..." : "Send to Tenant"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
