"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { MessageCircle, Check } from "lucide-react";

export default function StartChatButton({
  ownerId,
  propertyId,
  hasChatted = false,
}: {
  ownerId: string;
  propertyId: string;
  hasChatted?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("property");

  async function start() {
    if (!session) return router.push("/login");
    try {
      const convo: any = await api.post("/api/conversations", {
        otherUserId: ownerId,
        propertyId,
      });
      router.push(`/chat?c=${convo._id}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <button
      onClick={start}
      className={`btn w-full ${hasChatted ? "btn-success" : "btn-primary"}`}
    >
      {hasChatted ? <Check size={16} /> : <MessageCircle size={16} />}
      {hasChatted ? "Continue Chat" : t("chatWithOwner")}
    </button>
  );
}
