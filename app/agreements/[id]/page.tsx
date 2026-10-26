"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Download,
  Clock,
  FileText,
  AlertTriangle,
  Loader2,
  MapPin,
  Home,
  IndianRupee,
  Calendar,
  X,
} from "lucide-react";

export default function AgreementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { status } = useSession();

  const [data, setData] = useState<{
    agreement: any;
    isOwner: boolean;
    isTenant: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/agreements/${id}`);
    }
  }, [status, router, id]);

  useEffect(() => {
    if (status !== "authenticated" || !id) return;
    api
      .get<any>(`/api/agreements/${id}`)
      .then(setData)
      .catch((e) => {
        toast.error(e.message);
        router.push("/agreements");
      })
      .finally(() => setLoading(false));
  }, [id, status, router]);

  async function handleConfirm() {
    if (!window.confirm("Confirm this rent agreement? PDF will be generated."))
      return;
    setConfirming(true);
    try {
      await api.post(`/api/agreements/${id}/confirm`, {});
      toast.success("Agreement confirmed! PDF is ready.");
      const d = await api.get<any>(`/api/agreements/${id}`);
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setConfirming(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return toast.error("Reason required");
    setRejecting(true);
    try {
      await api.post(`/api/agreements/${id}/reject`, { reason: rejectReason });
      toast.success("Agreement rejected");
      setRejectModal(false);
      const d = await api.get<any>(`/api/agreements/${id}`);
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRejecting(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Cancel this agreement? Tenant will be notified."))
      return;
    setCancelling(true);
    try {
      await api.delete(`/api/agreements/${id}`);
      toast.success("Agreement cancelled");
      const d = await api.get<any>(`/api/agreements/${id}`);
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCancelling(false);
    }
  }

  async function downloadPdf() {
    window.open(`/api/agreements/${id}/pdf`, "_blank");
  }

  if (loading || !data) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="skeleton h-8 w-32 rounded mb-4" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  const { agreement, isOwner, isTenant } = data;
  const d = agreement.details;
  const property = agreement.property;

  const statusConfig: Record<
    string,
    { label: string; cls: string; icon: any; color: string }
  > = {
    pending: {
      label: "Awaiting Tenant Confirmation",
      cls: "badge-warning",
      icon: Clock,
      color: "text-warning-600",
    },
    confirmed: {
      label: "Confirmed",
      cls: "badge-success",
      icon: CheckCircle2,
      color: "text-success-600",
    },
    rejected: {
      label: "Rejected",
      cls: "badge-danger",
      icon: XCircle,
      color: "text-danger-600",
    },
    cancelled: {
      label: "Cancelled",
      cls: "badge-danger",
      icon: XCircle,
      color: "text-gray-500",
    },
  };
  const statusInfo = statusConfig[agreement.status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/agreements"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 mb-4"
      >
        <ArrowLeft size={16} /> All Agreements
      </Link>

      <div
        className={`card p-4 mb-4 border-l-4 ${
          agreement.status === "confirmed"
            ? "border-l-success-500 bg-success-50/50"
            : agreement.status === "pending"
              ? "border-l-warning-500 bg-warning-50/50"
              : "border-l-danger-500 bg-danger-50/50"
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <StatusIcon size={24} className={statusInfo.color} />
            <div>
              <p className="font-bold">{statusInfo.label}</p>
              <p className="text-xs text-gray-600">
                {agreement.status === "pending" &&
                  isTenant &&
                  "Please review details below and confirm."}
                {agreement.status === "pending" &&
                  isOwner &&
                  "Waiting for tenant to confirm."}
                {agreement.status === "confirmed" &&
                  "PDF is ready. Both parties can download."}
                {agreement.status === "rejected" &&
                  `Reason: ${agreement.tenantRejectionReason || "Not specified"}`}
                {agreement.status === "cancelled" &&
                  "This agreement was cancelled by the owner."}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {agreement.status === "confirmed" && (
              <button onClick={downloadPdf} className="btn btn-success btn-sm">
                <Download size={14} /> Download PDF
              </button>
            )}
            {agreement.status === "pending" && isTenant && (
              <>
                <button
                  onClick={() => setRejectModal(true)}
                  className="btn btn-danger btn-sm"
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="btn btn-success btn-sm disabled:opacity-50"
                >
                  {confirming ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {confirming ? "Confirming..." : "Confirm & Generate PDF"}
                </button>
              </>
            )}
            {agreement.status === "pending" && isOwner && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn btn-ghost btn-sm disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Agreement"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3">
          {property?.images?.[0] ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={property.images[0]}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Home size={28} className="text-brand-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link
              href={`/properties/${property?._id}`}
              className="font-bold hover:text-brand-600 block truncate"
            >
              {property?.title}
            </Link>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={12} /> {property?.area}, {property?.city}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="card p-3">
          <IndianRupee size={16} className="text-brand-600 mb-1" />
          <p className="text-xs text-gray-500">Monthly Rent</p>
          <p className="font-bold">₹{d.rentAmount?.toLocaleString("en-IN")}</p>
        </div>
        <div className="card p-3">
          <IndianRupee size={16} className="text-brand-600 mb-1" />
          <p className="text-xs text-gray-500">Deposit</p>
          <p className="font-bold">
            ₹{d.securityDeposit?.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="card p-3">
          <Calendar size={16} className="text-brand-600 mb-1" />
          <p className="text-xs text-gray-500">Start Date</p>
          <p className="font-bold">
            {d.startDate ? format(new Date(d.startDate), "MMM d, yyyy") : "—"}
          </p>
        </div>
        <div className="card p-3">
          <Calendar size={16} className="text-brand-600 mb-1" />
          <p className="text-xs text-gray-500">Expiry</p>
          <p className="font-bold">
            {d.expiryDate ? format(new Date(d.expiryDate), "MMM d, yyyy") : "—"}
          </p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText size={18} className="text-brand-600" /> Agreement Details
        </h2>
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Owner</h3>
          <p className="text-sm">{d.ownerName}</p>
          <p className="text-xs text-gray-500">
            S/o or D/o. {d.ownerFatherName}
          </p>
          <p className="text-xs text-gray-500">{d.ownerAddress}</p>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Tenant</h3>
          <p className="text-sm">{d.tenantName}</p>
          <p className="text-xs text-gray-500">
            S/o or D/o. {d.tenantFatherName}
          </p>
          <p className="text-xs text-gray-500">{d.tenantOfficeOrInstitution}</p>
          <p className="text-xs text-gray-500">{d.tenantAddress}</p>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Property</h3>
          <p className="text-sm">{d.propertyAddress}</p>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Terms</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Maintenance:</span> ₹
              {d.maintenanceCharge?.toLocaleString("en-IN") || 0}
            </div>
            <div>
              <span className="text-gray-500">Notice Period:</span>{" "}
              {d.noticePeriodDays} days
            </div>
            <div>
              <span className="text-gray-500">Court City:</span> {d.city}
            </div>
            {d.chequeNumber && (
              <div>
                <span className="text-gray-500">Cheque:</span> {d.chequeNumber}
              </div>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">
            Annexure · Inventory
          </h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Bedrooms:</span> {d.bedrooms}
            </div>
            <div>
              <span className="text-gray-500">Fans:</span> {d.fans}
            </div>
            <div>
              <span className="text-gray-500">CFL Lights:</span> {d.cflLights}
            </div>
            <div>
              <span className="text-gray-500">Geysers:</span> {d.geysers}
            </div>
            <div>
              <span className="text-gray-500">Mirrors:</span> {d.mirrors}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">
            Witnesses
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium">1. {d.witness1Name}</p>
              <p className="text-xs text-gray-500">{d.witness1Address}</p>
            </div>
            <div>
              <p className="font-medium">2. {d.witness2Name}</p>
              <p className="text-xs text-gray-500">{d.witness2Address}</p>
            </div>
          </div>
        </div>
      </div>

      {agreement.status === "pending" && isTenant && (
        <div className="card p-6 mt-4 bg-brand-50 border-brand-200">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle
              size={20}
              className="text-brand-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="font-semibold text-sm">
                Please review all details above carefully
              </p>
              <p className="text-xs text-gray-600 mt-1">
                By confirming, a legally-formatted PDF will be generated and
                shared with both parties.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRejectModal(true)}
              className="flex-1 btn btn-ghost"
            >
              <XCircle size={14} /> Request Changes
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 btn btn-success disabled:opacity-50"
            >
              {confirming ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {confirming ? "Generating PDF..." : "Confirm & Generate PDF"}
            </button>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Reject Agreement</h3>
              <button
                onClick={() => setRejectModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Please tell the owner what needs to change.
            </p>
            <textarea
              rows={4}
              className="input"
              placeholder="e.g. Rent amount should be ₹7,500 not ₹8,000"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setRejectModal(false)}
                className="flex-1 btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="flex-1 btn btn-danger disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Reject & Notify Owner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
