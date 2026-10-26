"use client";
import Script from "next/script";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export default function FeaturePropertyButton({
  propertyId,
}: {
  propertyId: string;
}) {
  const router = useRouter();

  async function pay() {
    try {
      const order = await api.post<any>("/api/payment/feature-property", {
        propertyId,
      });
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "Apna Ashta",
        description: "Feature for 30 days",
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await api.post("/api/payment/verify", { ...response, propertyId });
            toast.success("Featured!");
            router.refresh();
          } catch {
            toast.error("Verification failed");
          }
        },
        theme: { color: "#2563eb" },
      };
      new (window as any).Razorpay(options).open();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button onClick={pay} className="btn btn-sm bg-accent-500 text-white">
        ⭐ ₹99
      </button>
    </>
  );
}
