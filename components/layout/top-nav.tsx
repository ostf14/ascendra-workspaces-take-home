"use client";

import Link from "next/link";

import { PersonaSwitcher } from "@/components/layout/persona-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

export function TopNav() {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const homeHref = isAdmin ? "/admin" : "/workspaces";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface-page/85 backdrop-blur supports-[backdrop-filter]:bg-surface-page/75">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-6">
          <Link
            href={homeHref}
            className="flex items-center gap-2 text-base font-medium tracking-tight text-text-primary"
          >
            <span
              aria-hidden
              className="inline-block size-2 rounded-full bg-accent"
            />
            <span>Ascendra</span>
          </Link>
          {isAdmin ? <PersonaSwitcher /> : null}
        </div>
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
