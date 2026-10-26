"use client";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  XCircle as CancelIcon,
  Download,
} from "lucide-react";

export default function AgreementCard({
  agreement,
  role,
}: {
  agreement: any;
  role: "owner" | "tenant";
}) {
  const other = role === "owner" ? agreement.tenant : agreement.owner;
  const property = agreement.property;

  const statusConfig: Record<
    string,
    { label: string; cls: string; icon: any }
  > = {
    pending: {
      label: "Awaiting Confirmation",
      cls: "badge-warning",
      icon: Clock,
    },
    confirmed: { label: "Confirmed", cls: "badge-success", icon: CheckCircle2 },
    rejected: { label: "Rejected", cls: "badge-danger", icon: XCircle },
    cancelled: { label: "Cancelled", cls: "badge-danger", icon: CancelIcon },
  };
  const status = statusConfig[agreement.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Link
      href={`/agreements/${agreement._id}`}
      className="card p-4 hover:shadow-card-hover transition-shadow block"
    >
      <div className="flex items-start gap-3">
        {/* Property thumb */}
        {property?.images?.[0] ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <Image
              src={property.images[0]}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
            <FileText size={24} className="text-brand-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <h3 className="font-bold truncate">
                {property?.title || "Property"}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {role === "owner" ? "To: " : "From: "}
                {other?.name}
              </p>
            </div>
            <span className={`badge ${status.cls} flex-shrink-0`}>
              <StatusIcon size={10} /> {status.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>
              ₹{(agreement.details?.rentAmount || 0).toLocaleString("en-IN")}/mo
            </span>
            <span>·</span>
            <span>
              {agreement.details?.startDate &&
                format(new Date(agreement.details.startDate), "MMM d, yyyy")}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Sent {format(new Date(agreement.createdAt), "MMM d, yyyy")}
            </span>
            {agreement.status === "confirmed" && agreement.pdfUrl && (
              <span className="text-success-600 font-semibold flex items-center gap-1">
                <Download size={12} /> PDF ready
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
