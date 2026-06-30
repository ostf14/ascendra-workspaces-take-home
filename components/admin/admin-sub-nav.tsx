"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type SubLink = { href: string; label: string; match: (pathname: string) => boolean };

const LINKS: SubLink[] = [
  {
    href: "/admin",
    label: "Overview",
    match: (pathname) => pathname === "/admin",
  },
  {
    href: "/admin/workspaces",
    label: "Workspaces",
    match: (pathname) => pathname.startsWith("/admin/workspaces"),
  },
  {
    href: "/admin/utilization",
    label: "Utilization",
    match: (pathname) => pathname.startsWith("/admin/utilization"),
  },
  {
    href: "/admin/templates",
    label: "Templates",
    match: (pathname) => pathname.startsWith("/admin/templates"),
  },
];

export function AdminSubNav() {
  const pathname = usePathname() ?? "/admin";
  return (
    <nav
      aria-label="Admin sections"
      className="sticky top-14 z-30 border-b border-border-subtle bg-surface-page/85 backdrop-blur supports-[backdrop-filter]:bg-surface-page/75"
    >
      <ul className="mx-auto flex w-full max-w-[1440px] items-center gap-1 px-6">
        {LINKS.map((link) => {
          const isActive = link.match(pathname);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "inline-block border-b-2 px-3 py-3 text-sm transition-colors",
                  isActive
                    ? "border-accent-coral text-text-primary"
                    : "border-transparent text-text-tertiary hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
