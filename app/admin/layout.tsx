"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminCommandPalette from "@/components/AdminCommandPalette";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    } else if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "admin"
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (
    status === "loading" ||
    !session ||
    (session?.user as any)?.role !== "admin"
  ) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-danger-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Verifying...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-slate-950 flex">
      <AdminSidebar />
      <AdminCommandPalette />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 pt-20 lg:pt-6 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
