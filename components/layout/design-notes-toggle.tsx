"use client";

import { Lightbulb } from "lucide-react";

import { useDesignNotes } from "@/lib/design-notes/context";
import { cn } from "@/lib/utils";

// Meta-bar toggle for the design-notes overlay. Off is a ghost tertiary
// chip; on flips to accent color + accent-muted background — a nudge that
// the annotations layer is currently active. Only shown to admin users
// (see the meta-bar) because half the pins anchor to admin surfaces and a
// single-role engineer flipping the toggle would only find broken pins.
export function DesignNotesToggle() {
  const { enabled, toggle } = useDesignNotes();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[11px] font-medium leading-none transition-colors",
        enabled
          ? "text-accent"
          : "text-text-tertiary hover:text-text-primary"
      )}
      style={
        enabled ? { background: "var(--accent-muted)" } : undefined
      }
    >
      <Lightbulb className="size-3.5" strokeWidth={1.5} />
      Design notes
    </button>
  );
}
