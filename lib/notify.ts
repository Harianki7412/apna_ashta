import { connectDB } from "./mongodb";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import {
  sendNewMessageEmail,
  sendPropertyApprovedEmail,
  sendPropertyRejectedEmail,
  sendKycVerifiedEmail,
  sendKycRejectedEmail,
  sendNewListingEmail,
  sendAgreementSentEmail,
  sendAgreementConfirmedEmail,
} from "./email";

export type NotifyType =
  | "message"
  | "property_approved"
  | "property_rejected"
  | "new_listing"
  | "system"
  | "kyc_verified"
  | "kyc_rejected"
  | "agreement_sent"
  | "agreement_confirmed";

interface NotifyPayload {
  type: NotifyType;
  title: string;
  body?: string;
  link?: string;
  email?: boolean;
  emailData?: any;
}

export async function notifyUser(userId: string, payload: NotifyPayload) {
  try {
    await connectDB();
    await Notification.create({
      user: userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link,
    });

    if (payload.email) {
      const u = await User.findById(userId).select("name email").lean();
      if (!u?.email) return;

      const name = u.name || "User";
      const emailArgs = { to: u.email, recipientName: name };

      switch (payload.type) {
        case "message":
          await sendNewMessageEmail({ ...emailArgs, ...payload.emailData });
          break;
        case "property_approved":
          await sendPropertyApprovedEmail({
            ...emailArgs,
            ...payload.emailData,
          });
          break;
        case "property_rejected":
          await sendPropertyRejectedEmail({
            ...emailArgs,
            ...payload.emailData,
          });
          break;
        case "kyc_verified":
          await sendKycVerifiedEmail(emailArgs);
          break;
        case "kyc_rejected":
          await sendKycRejectedEmail(emailArgs);
          break;
        case "new_listing":
          await sendNewListingEmail({ ...emailArgs, ...payload.emailData });
          break;
        case "agreement_sent":
          await sendAgreementSentEmail({ ...emailArgs, ...payload.emailData });
          break;
        case "agreement_confirmed":
          await sendAgreementConfirmedEmail({
            ...emailArgs,
            ...payload.emailData,
          });
          break;
      }
    }
  } catch (e) {
    console.error("[notifyUser]", e);
  }
}
