import { Metadata } from "next";

export const metadata: Metadata = { title: "Terms — Apna Ashta" };

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto prose">
      <h1>Terms of Service</h1>
      <p className="text-sm text-gray-500">Last updated: October 25, 2026</p>
      <p>
        By using <strong>apnaashta.in</strong>, you agree to these terms.
      </p>
      <h2>1. What We Are</h2>
      <p>
        Apna Ashta is an online marketplace connecting owners with tenants. We
        are not a broker or party to any rental agreement.
      </p>
      <h2>2. Eligibility</h2>
      <ul>
        <li>18+ years old</li>
        <li>Accurate information</li>
      </ul>
      <h2>3. Owner Responsibilities</h2>
      <ul>
        <li>Accurate property details</li>
        <li>Legal owner or authorized agent</li>
        <li>Photos of actual property</li>
        <li>Admin approval required</li>
      </ul>
      <h2>4. Prohibited</h2>
      <ul>
        <li>False listings</li>
        <li>Harassment</li>
        <li>Illegal content</li>
        <li>Attempting to hack</li>
      </ul>
      <h2>5. Payments</h2>
      <p>
        Basic use is free. Featured listing is ₹99 for 30 days, non-refundable.
      </p>
      <h2>6. Limitation of Liability</h2>
      <p>
        Platform provided "as is". We are not responsible for owner-tenant
        disputes.
      </p>
      <h2>7. Governing Law</h2>
      <p>Laws of India. Jurisdiction: Ashta, District Sehore, MP.</p>
      <h2>8. Contact</h2>
      <p>
        <strong>legal@apnaashta.in</strong>
      </p>
    </article>
  );
}
