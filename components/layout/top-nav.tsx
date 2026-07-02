"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { cn } from "@/lib/utils";

export function TopNav() {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const homeHref = isAdmin ? "/admin" : "/workspaces";

  return (
    <header
      className={cn(
        "sticky z-40 w-full border-b border-border-subtle bg-surface-page/85 backdrop-blur supports-[backdrop-filter]:bg-surface-page/75",
        // Admin sees the 32px meta bar above; the product nav sits below it.
        // Engineers have no meta bar, so the product nav is flush to the top.
        isAdmin ? "top-8" : "top-0"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-6 px-6">
        <Link
          href={homeHref}
          className="flex items-center gap-2 text-base font-medium tracking-tight text-text-primary"
        >
          <span
            aria-hidden
            data-note="cool-neutrals-palette"
            className="inline-block size-2 rounded-full bg-accent"
          />
          <span>Ascendra</span>
        </Link>
        <div className="flex items-center gap-3">
          {currentUser ? (
            <span className="hidden text-sm text-text-tertiary sm:inline">
              {currentUser.name}
            </span>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
