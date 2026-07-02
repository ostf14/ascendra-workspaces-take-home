"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DESIGN_NOTES,
  decisionUrl,
  type DesignNote,
} from "@/lib/design-notes/catalog";
import { useDesignNotes } from "@/lib/design-notes/context";

type Anchor = {
  note: DesignNote;
  number: number;
  x: number;
  y: number;
};

// Clamp a pin's viewport coordinates so it never sits behind the meta-bar,
// off the right edge, or off the left. The default anchor is the top-right
// corner of the target element, offset outward (translate(-8, -8) baked
// into the pin's own CSS). Elements near the edges of the viewport push
// the raw coord out of frame — clamp the numeric coord instead of only
// styling around it, so both the pin AND its popover anchor stay in view.
function clampPin(x: number, y: number, vw: number): { x: number; y: number } {
  const RIGHT_MARGIN = 32;
  const LEFT_MARGIN = 12;
  const TOP_MARGIN = 48; // 32px meta-bar + 16px breathing room
  return {
    x: Math.max(LEFT_MARGIN, Math.min(x, vw - RIGHT_MARGIN)),
    y: Math.max(TOP_MARGIN, y),
  };
}

// Compute anchor positions on the events that can move them: window
// resize, scroll (capture:true — catches nested scroll containers too),
// ResizeObserver on the body (catches container-driven size shifts), and
// MutationObserver on the body (catches anchors appearing / disappearing).
// All triggers batch through a shared rAF so we recompute at most once per
// frame regardless of how many events fire.
function useAnchorPositions(enabled: boolean, pathname: string): Anchor[] {
  const [anchors, setAnchors] = useState<Anchor[]>([]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") {
      setAnchors([]);
      return;
    }

    let raf = 0;
    let mounted = true;

    function recompute() {
      if (!mounted) return;
      const vw = window.innerWidth;
      const next: Anchor[] = [];
      DESIGN_NOTES.forEach((note, i) => {
        const el = document.querySelector<HTMLElement>(
          `[data-note="${note.id}"]`
        );
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        const clamped = clampPin(rect.right, rect.top, vw);
        next.push({
          note,
          number: i + 1,
          x: clamped.x,
          y: clamped.y,
        });
      });
      setAnchors((prev) => {
        if (prev.length !== next.length) return next;
        for (let i = 0; i < prev.length; i += 1) {
          const a = prev[i]!;
          const b = next[i]!;
          if (
            a.note.id !== b.note.id ||
            Math.round(a.x) !== Math.round(b.x) ||
            Math.round(a.y) !== Math.round(b.y)
          ) {
            return next;
          }
        }
        return prev;
      });
    }

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        recompute();
      });
    }

    recompute();

    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, {
      passive: true,
      capture: true,
    });
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mounted = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, {
        capture: true,
      } as EventListenerOptions);
      ro.disconnect();
      mo.disconnect();
    };
  }, [enabled, pathname]);

  return anchors;
}

export function DesignNotesOverlay() {
  const { enabled } = useDesignNotes();
  const pathname = usePathname() ?? "/";
  const anchors = useAnchorPositions(enabled, pathname);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the active popover when the overlay flips off, or the route
  // changes (the anchor may no longer exist).
  useEffect(() => {
    if (!enabled) setActiveId(null);
  }, [enabled]);
  useEffect(() => {
    setActiveId(null);
  }, [pathname]);

  if (!mounted || !enabled) return null;

  return createPortal(
    <div
      aria-hidden={activeId ? undefined : true}
      className="pointer-events-none fixed inset-0 z-[60]"
    >
      {anchors.map((anchor) => (
        <Pin
          key={anchor.note.id}
          anchor={anchor}
          open={activeId === anchor.note.id}
          onOpenChange={(open) =>
            setActiveId(open ? anchor.note.id : null)
          }
        />
      ))}
    </div>,
    document.body
  );
}

function Pin({
  anchor,
  open,
  onOpenChange,
}: {
  anchor: Anchor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { note, number, x, y } = anchor;
  // Pin sits at the top-right corner of the anchor, overlapping a touch.
  const size = 22;
  const left = x - size / 2;
  const top = y - size / 2;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Design note ${number}: ${note.title}`}
          data-design-pin={number}
          className="pointer-events-auto absolute inline-flex items-center justify-center rounded-full font-mono text-[11px] font-medium leading-none text-white shadow-[0_1px_3px_rgba(15,15,17,0.25)] outline-hidden ring-2 ring-surface-elevated transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-accent/40"
          style={{
            left: `${left}px`,
            top: `${top}px`,
            width: `${size}px`,
            height: `${size}px`,
            background: "var(--accent)",
          }}
        >
          {number}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-[320px] gap-2 p-3"
      >
        <div className="flex items-baseline gap-2">
          <span
            aria-hidden
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            {number}
          </span>
          <h3 className="text-sm font-medium text-text-primary">
            {note.title}
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-text-secondary">
          {note.excerpt}
        </p>
        <a
          href={decisionUrl(note)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
          style={{ color: "var(--accent)" }}
        >
          → {note.decisionFile}
          <ArrowUpRight className="size-3" strokeWidth={1.5} />
        </a>
      </PopoverContent>
    </Popover>
  );
}
