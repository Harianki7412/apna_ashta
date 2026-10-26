import { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — Apna Ashta" };

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto prose">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: October 25, 2026</p>
      <p>
        Apna Ashta operates <strong>apnaashta.in</strong>, a hyperlocal rental
        listing service for Ashta, MP, India. Compliant with DPDP Act 2023.
      </p>
      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Account:</strong> Name, email, phone, encrypted password
        </li>
        <li>
          <strong>Property:</strong> Details, photos, address, coordinates
        </li>
        <li>
          <strong>KYC:</strong> ID (voluntary)
        </li>
        <li>
          <strong>Communications:</strong> Chat messages
        </li>
      </ul>
      <h2>2. How We Use It</h2>
      <ul>
        <li>To display listings and enable communication</li>
        <li>To process payments</li>
        <li>To verify identity (KYC)</li>
        <li>To send notifications</li>
      </ul>
      <h2>3. Third Parties</h2>
      <p>
        Cloudinary (images), MongoDB Atlas (DB), Resend (email), MSG91 (OTP),
        Razorpay (payments), Vercel (hosting).
      </p>
      <h2>4. Your Rights (DPDP Act)</h2>
      <ul>
        <li>Access, correction, erasure</li>
        <li>Grievance: privacy@apnaashta.in</li>
      </ul>
      <h2>5. Contact</h2>
      <p>
        <strong>grievance@apnaashta.in</strong> · Ashta, Sehore, MP — 466116
      </p>
    </article>
  );
}
