"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";

export default function StartChatButton({
  ownerId,
  propertyId,
}: {
  ownerId: string;
  propertyId: string;
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
      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
    >
      {t("chatWithOwner")}
    </button>
  );
}
