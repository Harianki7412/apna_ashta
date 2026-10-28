const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface EmailLayoutOptions {
  title: string;
  preheader?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaColor?: string;
}

function layout({
  title,
  preheader,
  body,
  ctaLabel,
  ctaUrl,
  ctaColor = "#2563eb",
}: EmailLayoutOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;visibility:hidden;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;text-align:center;vertical-align:middle;font-size:18px;">🏠</td>
                        <td style="padding-left:12px;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Flatova</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;line-height:1.3;">${title}</h1>
              <div style="color:#374151;font-size:15px;line-height:1.6;margin-top:12px;">${body}</div>
              ${
                ctaLabel && ctaUrl
                  ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                <tr>
                  <td align="center" style="border-radius:10px;background:${ctaColor};">
                    <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
                You're receiving this because you have an account on <a href="${BASE_URL}" style="color:#2563eb;text-decoration:none;">Flatova</a>.<br>
                Made with ❤️ in Ashta, MP
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC TEMPLATES
   ═══════════════════════════════════════════════════════════ */

export function passwordResetEmail(token: string) {
  const url = `${BASE_URL}/reset-password?token=${token}`;
  return {
    subject: "Reset your Flatova password",
    html: layout({
      title: "Password Reset",
      preheader: "Reset your password in 1 click",
      body: `
        <p style="margin:0 0 16px;">We received a request to reset your password.</p>
        <p style="margin:0 0 16px;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <p style="margin:0;color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      `,
      ctaLabel: "Reset Password",
      ctaUrl: url,
    }),
  };
}

export function otpEmail(otp: string) {
  return {
    subject: `${otp} is your Flatova verification code`,
    html: layout({
      title: "Your Verification Code",
      preheader: `Your OTP is ${otp}`,
      body: `
        <p style="margin:0 0 20px;">Enter this code to verify your account:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="background:#eff6ff;border-radius:12px;padding:20px 32px;text-align:center;">
              <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#2563eb;font-family:'Courier New',monospace;">${otp}</span>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;color:#6b7280;font-size:13px;text-align:center;">This code expires in <strong>15 minutes</strong>.</p>
      `,
    }),
  };
}

export function newMessageEmail({
  recipientName,
  senderName,
  preview,
  conversationId,
}: {
  recipientName: string;
  senderName: string;
  preview: string;
  conversationId: string;
}) {
  const url = `${BASE_URL}/chat?c=${conversationId}`;
  return {
    subject: `💬 New message from ${senderName}`,
    html: layout({
      title: "New Message",
      preheader: preview.slice(0, 80),
      body: `
        <p style="margin:0 0 16px;">Hi ${recipientName},</p>
        <p style="margin:0 0 20px;"><strong>${senderName}</strong> sent you a message:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#f9fafb;border-left:4px solid #2563eb;border-radius:8px;padding:16px;">
              <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;font-style:italic;">"${preview}"</p>
            </td>
          </tr>
        </table>
      `,
      ctaLabel: "Reply Now",
      ctaUrl: url,
    }),
  };
}

export function propertyApprovedEmail({
  recipientName,
  propertyTitle,
  propertyId,
}: {
  recipientName: string;
  propertyTitle: string;
  propertyId: string;
}) {
  const url = `${BASE_URL}/properties/${propertyId}`;
  return {
    subject: "🎉 Your property is live!",
    html: layout({
      title: "Your Property is Live! 🎉",
      preheader: "Tenants can now find and contact you",
      body: `
        <p style="margin:0 0 16px;">Hi ${recipientName},</p>
        <p style="margin:0 0 20px;">Great news! Your property has been approved and is now visible to thousands of tenants.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#f0fdf4;border:1px solid #10b981;border-radius:12px;padding:16px;">
              <p style="margin:0;color:#065f46;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Property</p>
              <p style="margin:4px 0 0;color:#111827;font-size:16px;font-weight:700;">${propertyTitle}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#6b7280;font-size:13px;">💡 Tip: Properties with 5+ photos get 3x more inquiries. Consider adding more photos.</p>
      `,
      ctaLabel: "View Listing",
      ctaUrl: url,
      ctaColor: "#10b981",
    }),
  };
}

export function propertyRejectedEmail({
  recipientName,
  propertyTitle,
  propertyId,
}: {
  recipientName: string;
  propertyTitle: string;
  propertyId: string;
}) {
  const url = `${BASE_URL}/properties/${propertyId}/edit`;
  return {
    subject: "Your property listing needs changes",
    html: layout({
      title: "Listing Needs Changes",
      preheader: "Please update your property to go live",
      body: `
        <p style="margin:0 0 16px;">Hi ${recipientName},</p>
        <p style="margin:0 0 20px;">Our team reviewed your listing and it needs some changes before it can go live.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#fef2f2;border:1px solid #ef4444;border-radius:12px;padding:16px;">
              <p style="margin:0;color:#991b1b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Property</p>
              <p style="margin:4px 0 0;color:#111827;font-size:16px;font-weight:700;">${propertyTitle}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 8px;font-weight:600;">Common reasons for rejection:</p>
        <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
          <li>Unclear or low-quality photos</li>
          <li>Missing or inaccurate details</li>
          <li>Suspicious pricing (too low/high)</li>
        </ul>
      `,
      ctaLabel: "Fix Listing",
      ctaUrl: url,
      ctaColor: "#ef4444",
    }),
  };
}

export function kycVerifiedEmail({ recipientName }: { recipientName: string }) {
  return {
    subject: "✅ Your KYC is verified!",
    html: layout({
      title: "KYC Verified! ✅",
      preheader: "Your Verified badge is now active",
      body: `
        <p style="margin:0 0 16px;">Hi ${recipientName},</p>
        <p style="margin:0 0 20px;">Your identity has been verified. A <strong style="color:#10b981;">✓ Verified</strong> badge now appears on your profile and all your listings.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;">
              <p style="margin:0;color:#059669;font-size:14px;">Verified owners get up to <strong>40% more inquiries</strong> from serious tenants.</p>
            </td>
          </tr>
        </table>
      `,
      ctaLabel: "View Profile",
      ctaUrl: `${BASE_URL}/profile`,
      ctaColor: "#10b981",
    }),
  };
}

export function kycRejectedEmail({ recipientName }: { recipientName: string }) {
  return {
    subject: "KYC verification needs attention",
    html: layout({
      title: "KYC Verification Failed",
      preheader: "Please re-upload a clear document",
      body: `
        <p style="margin:0 0 16px;">Hi ${recipientName},</p>
        <p style="margin:0 0 20px;">We couldn't verify your KYC document. This is usually because the photo is blurry or details aren't readable.</p>
        <p style="margin:0 0 8px;font-weight:600;">Please re-upload:</p>
        <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
          <li>A clear, well-lit photo</li>
          <li>Full document visible (no cropping)</li>
          <li>No glare or shadows</li>
        </ul>
      `,
      ctaLabel: "Re-upload Document",
      ctaUrl: `${BASE_URL}/verify`,
      ctaColor: "#f59e0b",
    }),
  };
}

export function newListingEmail({
  recipientName,
  count,
  searchName,
  searchUrl,
}: {
  recipientName: string;
  count: number;
  searchName: string;
  searchUrl: string;
}) {
  return {
    subject: `🏠 ${count} new ${count === 1 ? "property" : "properties"} match your saved search`,
    html: layout({
      title: `New Properties Found!`,
      preheader: `${count} new ${count === 1 ? "listing" : "listings"} match "${searchName}"`,
      body: `
        <p style="margin:0 0 16px;">Hi ${recipientName},</p>
        <p style="margin:0 0 20px;">Great news! <strong>${count} new ${count === 1 ? "property" : "properties"}</strong> match your saved search:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;">
              <p style="margin:0;color:#1e40af;font-size:13px;font-weight:600;">Search: ${searchName}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#6b7280;font-size:13px;">Be the first to contact the owner — popular properties go fast!</p>
      `,
      ctaLabel: "View Properties",
      ctaUrl: searchUrl,
    }),
  };
}

export function agreementSentEmail({
  recipientName,
  ownerName,
  propertyTitle,
  agreementId,
}: {
  recipientName: string;
  ownerName: string;
  propertyTitle: string;
  agreementId: string;
}) {
  return {
    subject: "📝 Rent agreement ready for your review",
    html: layout({
      title: "Rent Agreement to Review",
      preheader: `${ownerName} sent you an agreement`,
      body: `
        <p style="margin:0 0 16px;">Hi ${recipientName},</p>
        <p style="margin:0 0 20px;"><strong>${ownerName}</strong> has sent you a rent agreement for review.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:16px;">
              <p style="margin:0;color:#92400e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Property</p>
              <p style="margin:4px 0 0;color:#111827;font-size:16px;font-weight:700;">${propertyTitle}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#6b7280;font-size:13px;">⚠️ Review all terms carefully before confirming. Once confirmed, a legal PDF is generated.</p>
      `,
      ctaLabel: "Review Agreement",
      ctaUrl: `${BASE_URL}/agreements/${agreementId}`,
      ctaColor: "#f59e0b",
    }),
  };
}

export function agreementConfirmedEmail({
  recipientName,
  tenantName,
  propertyTitle,
  agreementId,
}: {
  recipientName: string;
  tenantName: string;
  propertyTitle: string;
  agreementId: string;
}) {
  return {
    subject: "✅ Rent agreement confirmed!",
    html: layout({
      title: "Agreement Confirmed! ✅",
      preheader: "PDF is ready to download",
      body: `
        <p style="margin:0 0 16px;">Hi ${recipientName},</p>
        <p style="margin:0 0 20px;"><strong>${tenantName}</strong> has confirmed the rent agreement for:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#f0fdf4;border:1px solid #10b981;border-radius:12px;padding:16px;">
              <p style="margin:0;color:#065f46;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Property</p>
              <p style="margin:4px 0 0;color:#111827;font-size:16px;font-weight:700;">${propertyTitle}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#6b7280;font-size:13px;">📄 The legal PDF is now available for download.</p>
      `,
      ctaLabel: "Download PDF",
      ctaUrl: `${BASE_URL}/agreements/${agreementId}`,
      ctaColor: "#10b981",
    }),
  };
}
