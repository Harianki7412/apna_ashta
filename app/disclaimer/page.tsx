import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — Flatova",
  description: "Legal disclaimer for use of Flatova rental platform.",
};

export default function DisclaimerPage() {
  return (
    <article className="max-w-3xl mx-auto prose">
      <h1>Legal Disclaimer</h1>
      <p className="text-sm text-gray-500">Last updated: October 27, 2026</p>

      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #f59e0b",
          borderRadius: "12px",
          padding: "16px",
          margin: "16px 0",
        }}
      >
        <p
          className="text-sm"
          style={{ color: "#92400e", fontWeight: 600, margin: 0 }}
        >
          ⚠️ Important: Flatova is a marketplace, NOT a real estate broker,
          agent, or party to any rental transaction.
        </p>
      </div>

      <h2>1. Nature of Platform</h2>
      <p>
        Flatova operates an <strong>online marketplace</strong> that connects
        property owners with tenants. We are <strong>not</strong>:
      </p>
      <ul>
        <li>A real estate agent or broker</li>
        <li>A party to any rental agreement</li>
        <li>Responsible for rent collection, deposits, or disputes</li>
        <li>Guaranteeing the accuracy of listings</li>
      </ul>
      <p>
        All rental transactions happen{" "}
        <strong>directly between owner and tenant</strong>.
      </p>

      <h2>2. Information Accuracy</h2>
      <p>While we review listings, we cannot guarantee:</p>
      <ul>
        <li>Accuracy of property details or photos</li>
        <li>Property availability at contact time</li>
        <li>Legal ownership by the listing party</li>
      </ul>

      <h2>3. "Verified" Badge Meaning</h2>
      <p>
        "Verified" means we reviewed the user's government ID (Aadhaar/PAN).
        This is <strong>identity verification</strong>, not a guarantee of
        property ownership or reliability.
      </p>

      <h2>4. No Guarantee of Results</h2>
      <ul>
        <li>
          <strong>Tenants:</strong> We don't guarantee you'll find a property
        </li>
        <li>
          <strong>Owners:</strong> We don't guarantee inquiries or rentals
        </li>
        <li>
          <strong>Featured listings:</strong> No guarantee of more inquiries
        </li>
      </ul>

      <h2>5. Third-Party Services</h2>
      <p>
        We integrate Razorpay, Cloudinary, Resend, MSG91. We are not responsible
        for their downtime or failures.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by Indian law, Flatova is{" "}
        <strong>not liable</strong> for:
      </p>
      <ul>
        <li>Fraud, theft, or criminal activity by users</li>
        <li>Loss of rent, deposit, or property damage</li>
        <li>Disputes between owner and tenant</li>
        <li>Any indirect or consequential damages</li>
      </ul>
      <p>
        Maximum aggregate liability is limited to the amount you paid us in the{" "}
        <strong>previous 12 months</strong>.
      </p>

      <h2>7. User Responsibility</h2>
      <ul>
        <li>Verify property details in person before paying</li>
        <li>Sign a proper written rent agreement</li>
        <li>Check ownership documents</li>
        <li>Don't pay advance before seeing property</li>
        <li>Comply with applicable laws</li>
      </ul>

      <h2>8. Local Laws</h2>
      <p>
        Rentals in Madhya Pradesh governed by{" "}
        <strong>MP Accommodation Control Act, 1961</strong>. Consult a lawyer
        for formal advice.
      </p>

      <h2>9. Tax Compliance</h2>
      <p>
        Rent income is taxable. Flatova doesn't provide tax advice. Consult a
        CA.
      </p>

      <h2>10. Contact</h2>
      <p>
        Legal queries: <strong>legal@Flatova.in</strong>
      </p>
    </article>
  );
}
