"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; match: (pathname: string) => boolean };

const workspacesLink: NavLink = {
  href: "/workspaces",
  label: "Workspaces",
  match: (pathname) => pathname.startsWith("/workspaces"),
};

const adminLink: NavLink = {
  href: "/admin",
  label: "Admin",
  match: (pathname) => pathname.startsWith("/admin"),
};

export function TopNav() {
  const pathname = usePathname() ?? "/";
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const links: NavLink[] = isAdmin ? [workspacesLink, adminLink] : [workspacesLink];
  const homeHref = isAdmin ? "/admin" : "/workspaces";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface-page/85 backdrop-blur supports-[backdrop-filter]:bg-surface-page/75">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-8">
          <Link
            href={homeHref}
            className="flex items-center gap-2 text-base font-medium tracking-tight text-text-primary"
          >
            <span
              aria-hidden
              className="inline-block size-2 rounded-full bg-accent-coral"
            />
            <span>Ascendra</span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = link.match(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "text-text-primary"
                      : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
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
