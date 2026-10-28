import { Resend } from "resend";
import * as templates from "./email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

async function send(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (e) {
    console.error("[Email send failed]", { to, subject, error: e });
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const t = templates.passwordResetEmail(token);
  await send(email, t.subject, t.html);
}

export async function sendOtpEmail(email: string, otp: string) {
  const t = templates.otpEmail(otp);
  await send(email, t.subject, t.html);
}

export async function sendNewMessageEmail(
  args: Parameters<typeof templates.newMessageEmail>[0] & { to: string },
) {
  const { to, ...rest } = args;
  const t = templates.newMessageEmail(rest);
  await send(to, t.subject, t.html);
}

export async function sendPropertyApprovedEmail(
  args: Parameters<typeof templates.propertyApprovedEmail>[0] & { to: string },
) {
  const { to, ...rest } = args;
  const t = templates.propertyApprovedEmail(rest);
  await send(to, t.subject, t.html);
}

export async function sendPropertyRejectedEmail(
  args: Parameters<typeof templates.propertyRejectedEmail>[0] & { to: string },
) {
  const { to, ...rest } = args;
  const t = templates.propertyRejectedEmail(rest);
  await send(to, t.subject, t.html);
}

export async function sendKycVerifiedEmail(
  args: Parameters<typeof templates.kycVerifiedEmail>[0] & { to: string },
) {
  const { to, ...rest } = args;
  const t = templates.kycVerifiedEmail(rest);
  await send(to, t.subject, t.html);
}

export async function sendKycRejectedEmail(
  args: Parameters<typeof templates.kycRejectedEmail>[0] & { to: string },
) {
  const { to, ...rest } = args;
  const t = templates.kycRejectedEmail(rest);
  await send(to, t.subject, t.html);
}

export async function sendNewListingEmail(
  args: Parameters<typeof templates.newListingEmail>[0] & { to: string },
) {
  const { to, ...rest } = args;
  const t = templates.newListingEmail(rest);
  await send(to, t.subject, t.html);
}

export async function sendAgreementSentEmail(
  args: Parameters<typeof templates.agreementSentEmail>[0] & { to: string },
) {
  const { to, ...rest } = args;
  const t = templates.agreementSentEmail(rest);
  await send(to, t.subject, t.html);
}

export async function sendAgreementConfirmedEmail(
  args: Parameters<typeof templates.agreementConfirmedEmail>[0] & {
    to: string;
  },
) {
  const { to, ...rest } = args;
  const t = templates.agreementConfirmedEmail(rest);
  await send(to, t.subject, t.html);
}

/* Backward-compatible generic */
export async function sendGenericEmail(
  email: string,
  subject: string,
  html: string,
) {
  await send(email, subject, html);
}
