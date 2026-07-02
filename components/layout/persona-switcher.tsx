"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, type ReactNode } from "react";
import { Settings2, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

type Mode = "engineer" | "admin";

const STORAGE_KEY: Record<Mode, string> = {
  engineer: "ascendra:last-path:engineer",
  admin: "ascendra:last-path:admin",
};

const FALLBACK: Record<Mode, string> = {
  engineer: "/workspaces",
  admin: "/admin",
};

function activeModeFromPath(pathname: string): Mode {
  return pathname.startsWith("/admin") ? "admin" : "engineer";
}

// Persona switcher — a viewer-perspective control, not tab navigation.
// Lives in the meta bar above the product chrome. Order is engineer-then-
// admin because engineer is the base persona (every user has engineer
// access; admin is elevated).
//
// Persistence: the last URL visited within each mode (including its search
// params — the master-detail selection lives there) is written to
// localStorage on every navigation. Switching to the other persona and
// back lands the user where they left off, not on the mode's landing page.
export function PersonaSwitcher() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const active = activeModeFromPath(pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only persist paths that live inside one of the two modes. Auth pages,
    // 404s, and the root redirect don't belong to either bucket.
    const searchString = searchParams.toString();
    const url = searchString ? `${pathname}?${searchString}` : pathname;
    try {
      if (pathname.startsWith("/admin")) {
        window.localStorage.setItem(STORAGE_KEY.admin, url);
      } else if (pathname.startsWith("/workspaces")) {
        window.localStorage.setItem(STORAGE_KEY.engineer, url);
      }
    } catch {
      // Storage disabled — fall back to the mode's landing page on switch.
    }
  }, [pathname, searchParams]);

  const goToMode = useCallback(
    (mode: Mode) => {
      if (mode === active) return;
      let target: string | null = null;
      if (typeof window !== "undefined") {
        try {
          target = window.localStorage.getItem(STORAGE_KEY[mode]);
        } catch {
          target = null;
        }
      }
      router.push(target ?? FALLBACK[mode]);
    },
    [active, router]
  );

  return (
    <div
      role="tablist"
      aria-label="Persona"
      className="inline-flex items-center gap-0.5 rounded-md bg-surface-secondary p-0.5"
    >
      <SegmentButton
        active={active === "engineer"}
        onClick={() => goToMode("engineer")}
        icon={<UserRound className="size-3" strokeWidth={1.5} />}
        label="Engineer"
      />
      <SegmentButton
        active={active === "admin"}
        onClick={() => goToMode("admin")}
        icon={<Settings2 className="size-3" strokeWidth={1.5} />}
        label="Admin"
      />
    </div>
  );
}

function SegmentButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-label={`Switch to ${label}`}
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-medium leading-none transition-colors",
        active
          ? "bg-surface-elevated text-text-primary shadow-[0_1px_2px_rgba(15,15,17,0.06)]"
          : "text-text-tertiary hover:text-text-primary"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
