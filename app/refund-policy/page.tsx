import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — Flatova",
  description:
    "Refund policy for featured listings, subscriptions, and paid services on Flatova.",
};

export default function RefundPolicyPage() {
  return (
    <article className="max-w-3xl mx-auto prose">
      <h1>Refund &amp; Cancellation Policy</h1>
      <p className="text-sm text-gray-500">Last updated: October 27, 2026</p>

      <p>
        This Refund &amp; Cancellation Policy applies to all paid services
        offered on <strong>Flatova.in</strong>, operated by Flatova. By making a
        payment, you agree to this policy.
      </p>

      <h2>1. Free Services</h2>
      <p>
        Basic use of Flatova — browsing properties, listing up to 2 properties,
        chatting with owners — is <strong>completely free</strong>. No refund
        applies to free services.
      </p>

      <h2>2. Featured Listings (₹99 per listing)</h2>
      <ul>
        <li>
          <strong>Non-refundable</strong> once the listing is published as
          featured.
        </li>
        <li>
          <strong>Full refund</strong> if:
          <ul>
            <li>
              Payment deducted but listing not featured (technical failure)
            </li>
            <li>
              Listing removed by admin for reasons unrelated to owner's fault
            </li>
            <li>Duplicate payment in error</li>
          </ul>
        </li>
        <li>
          <strong>No refund</strong> if:
          <ul>
            <li>Owner voluntarily removes the featured listing</li>
            <li>Listing violates Terms</li>
            <li>Owner doesn't receive inquiries (not a valid reason)</li>
          </ul>
        </li>
      </ul>

      <h2>3. Subscription Plans</h2>
      <ul>
        <li>
          <strong>7-day money-back guarantee</strong> on first subscription
        </li>
        <li>
          <strong>After 7 days:</strong> No refund for current billing period.
          Cancel anytime to stop auto-renewal.
        </li>
        <li>
          <strong>Access until period end:</strong> Cancel mid-period → access
          until paid period ends.
        </li>
      </ul>

      <h2>4. Verification Services</h2>
      <ul>
        <li>
          <strong>Aadhaar KYC (₹50):</strong> Non-refundable once started
        </li>
        <li>
          <strong>Property verification (₹200):</strong> Full refund if not
          completed within 7 days
        </li>
        <li>
          <strong>Rent Agreement e-Sign (₹99):</strong> Non-refundable once PDF
          generated
        </li>
      </ul>

      <h2>5. How to Request a Refund</h2>
      <p>
        Email us at <strong>refunds@Flatova.in</strong> with:
      </p>
      <ul>
        <li>Payment ID / Transaction ID (from Razorpay receipt)</li>
        <li>Reason for refund</li>
        <li>Screenshots (if applicable)</li>
      </ul>
      <p>
        <strong>Response:</strong> 2 business days. <strong>Processing:</strong>{" "}
        5-7 business days to original payment method.
      </p>

      <h2>6. Cancellation of Subscription</h2>
      <p>
        To cancel: Profile → Subscription → Cancel. Or email support@Flatova.in
      </p>

      <h2>7. Disputes</h2>
      <p>
        Escalate to <strong>grievance@Flatova.in</strong>. Response within 15
        days as per Consumer Protection Act, 2019.
      </p>

      <h2>8. Contact</h2>
      <p>
        <strong>Refund queries:</strong> refunds@Flatova.in
        <br />
        <strong>Address:</strong> Flatova, College Road, Ashta, Sehore, MP —
        466116
      </p>
    </article>
  );
}
