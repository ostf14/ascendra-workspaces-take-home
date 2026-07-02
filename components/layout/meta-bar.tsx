"use client";

import { DesignNotesToggle } from "@/components/layout/design-notes-toggle";
import { PersonaSwitcher } from "@/components/layout/persona-switcher";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

// The meta bar sits above the product chrome and carries viewer-perspective
// controls (persona switcher, design-notes overlay toggle). It reads as
// OS-level framing — "whose eyes am I looking through" — rather than as a
// product feature. Only rendered for users with multi-persona access; a
// single-role user never sees the abstraction (and never sees a toggle
// that would surface pins on routes they can't reach).
export function MetaBar() {
  const { data: currentUser } = useCurrentUser();
  if (currentUser?.role !== "admin") return null;

  return (
    <div
      role="banner"
      aria-label="Viewer perspective"
      className="sticky top-0 z-50 h-8 w-full border-b border-border-subtle bg-surface-tertiary"
      data-note="persona-switcher"
    >
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-3 px-6">
        <span className="text-[11px] font-normal uppercase tracking-[0.05em] text-text-tertiary">
          Viewing as
        </span>
        <PersonaSwitcher />
        <div className="ml-auto flex items-center gap-2">
          <DesignNotesToggle />
        </div>
      </div>
    </div>
  );
}
