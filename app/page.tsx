"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUser } from "@/lib/hooks/use-current-user";

// Role-gated redirect per sitemap: admin → /admin, engineer → /workspaces.
export default function RootPage() {
  const router = useRouter();
  const { data, isPending, isError } = useCurrentUser();

  useEffect(() => {
    if (!data) return;
    router.replace(data.role === "admin" ? "/admin" : "/workspaces");
  }, [data, router]);

  return (
    <section
      aria-busy={isPending}
      className="mx-auto flex w-full max-w-[480px] flex-col items-start gap-3 px-6 py-16"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
        Ascendra workspaces
      </p>
      <p className="text-sm text-text-secondary">
        {isError
          ? "Could not load your account. Sign in and try again."
          : "Routing you to your home…"}
      </p>
    </section>
  );
}
