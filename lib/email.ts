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

export async function sendGenericEmail(email: string, subject: string, html: string) {
  await resend.emails.send({ from: FROM, to: email, subject, html });
}