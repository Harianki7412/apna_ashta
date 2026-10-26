import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your Apna Ashta password',
    html: `
      <h2>Password Reset</h2>
      <p>Click below to reset. Link expires in 1 hour.</p>
      <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Reset Password</a>
      <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
    `,
  });
}

export async function sendOtpEmail(email: string, otp: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${otp} is your Apna Ashta verification code`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb;margin:0 0 16px">Apna Ashta</h2>
        <p style="font-size:16px;color:#111827">Your verification code is:</p>
        <div style="background:#eff6ff;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#2563eb">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:14px">This code expires in <strong>15 minutes</strong>.</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendGenericEmail(email: string, subject: string, html: string) {
  await resend.emails.send({ from: FROM, to: email, subject, html });
}