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

type EmailExtras<T extends { to: string; recipientName: string }> = Omit<
  T,
  "to" | "recipientName"
>;

type NotifyEmailData = {
  message: EmailExtras<Parameters<typeof sendNewMessageEmail>[0]>;
  property_approved: EmailExtras<
    Parameters<typeof sendPropertyApprovedEmail>[0]
  >;
  property_rejected: EmailExtras<
    Parameters<typeof sendPropertyRejectedEmail>[0]
  >;
  new_listing: EmailExtras<Parameters<typeof sendNewListingEmail>[0]>;
  system: never;
  kyc_verified: never;
  kyc_rejected: never;
  agreement_sent: EmailExtras<Parameters<typeof sendAgreementSentEmail>[0]>;
  agreement_confirmed: EmailExtras<
    Parameters<typeof sendAgreementConfirmedEmail>[0]
  >;
};

type NotifyBase = {
  title: string;
  body?: string;
  link?: string;
};

type NotifyPayloadWithoutEmail = {
  [Type in NotifyType]: {
    type: Type;
    email?: false;
    emailData?: NotifyEmailData[Type];
  } & NotifyBase;
}[NotifyType];

type NotifyPayloadWithEmail = {
  [Type in NotifyType]: {
    type: Type;
    email: true;
  } & (NotifyEmailData[Type] extends never
    ? { emailData?: never }
    : { emailData: NotifyEmailData[Type] }) &
    NotifyBase;
}[NotifyType];

type NotifyPayload = NotifyPayloadWithoutEmail | NotifyPayloadWithEmail;

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
