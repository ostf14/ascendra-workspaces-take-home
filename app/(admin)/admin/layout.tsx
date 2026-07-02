"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AdminSubNav } from "@/components/admin/admin-sub-nav";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isPending } = useCurrentUser();

  // Engineers should never reach the admin surface. The persona switcher
  // hides the entrance for them, but direct URL entry still lands here —
  // redirect them into their own workspaces surface. Optimistically render
  // during the /api/me fetch; the effect fires the moment role is known.
  useEffect(() => {
    if (isPending) return;
    if (user && user.role !== "admin") {
      router.replace("/workspaces");
    }
  }, [isPending, user, router]);

  if (!isPending && user && user.role !== "admin") return null;

  return (
    <>
      <AdminSubNav />
      {children}
    </>
  );
}
