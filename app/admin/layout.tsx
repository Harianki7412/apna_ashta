"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminCommandPalette from "@/components/AdminCommandPalette";
import { canAccessManagementRoute } from "@/lib/role-access";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    } else if (
      status === "authenticated" &&
      !canAccessManagementRoute(session?.user?.role, pathname)
    ) {
      router.push(
        session?.user?.role === "management_team" ? "/admin" : "/",
      );
    }
  }, [status, session, router, pathname]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (
    status === "loading" ||
    !session ||
    !canAccessManagementRoute(session?.user?.role, pathname)
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
        <div className="admin-content mx-auto w-full max-w-[1680px] px-4 pt-20 pb-8 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
