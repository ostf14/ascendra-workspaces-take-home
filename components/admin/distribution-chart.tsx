"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { UtilizationBucket } from "@/lib/domain/types";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

// Distribution surface is two stacked sections in one card:
//   1. Vertical histogram with semantic zone bands behind the bars
//   2. Three summary rows tying each zone to a next action (or lack of one)
//
// The horizontal-bar histogram this replaced was accurate but neutral — you
// could read "half the fleet is idle" but not "idle costs $X/month". The
// zoned histogram + action ribbon links the shape of the distribution to a
// concrete action per zone.

type Zone = {
  key: "idle" | "healthy" | "nearCap";
  label: string;
  color: string; // CSS var
  bandOpacity: number;
  description: string;
  bucketIndices: number[];
};

const ZONES: readonly Zone[] = [
  {
    key: "idle",
    label: "Idle",
    color: "var(--status-idle)",
    bandOpacity: 0.08,
    description: "Auto-stop and recover the spend",
    bucketIndices: [0, 1],
  },
  {
    key: "healthy",
    label: "Healthy",
    color: "var(--status-running)",
    bandOpacity: 0.06,
    description: "Sweet spot, nothing to do",
    bucketIndices: [2, 3],
  },
  {
    key: "nearCap",
    label: "Near capacity",
    color: "var(--status-pending)",
    bandOpacity: 0.08,
    description: "Move users to bigger templates before they hit real limits",
    bucketIndices: [4],
  },
] as const;

// Compact zone labels sit above the histogram, tracking-wide.
const ZONE_HEADERS: Record<Zone["key"], string> = {
  idle: "IDLE",
  healthy: "HEALTHY",
  nearCap: "NEAR CAP",
};

// Widths of the zone bands as fractions of the plot width — 5 buckets total,
// two per side zone, one for near-cap. Contiguous (no gaps between bands) so
// the color reads as territory, not a chip.
const ZONE_WIDTHS: Record<Zone["key"], string> = {
  idle: "40%",
  healthy: "40%",
  nearCap: "20%",
};

const BUCKET_TICKS = ["0–10", "10–30", "30–60", "60–85", "85–100"];

export function DistributionChart({ buckets }: { buckets: UtilizationBucket[] }) {
  const total = buckets.reduce((acc, b) => acc + b.count, 0);
  const max = Math.max(1, ...buckets.map((b) => b.count));

  const zoneAggregates = ZONES.map((zone) => {
    const bucketsInZone = zone.bucketIndices.map((i) => buckets[i]).filter(
      (b): b is UtilizationBucket => b !== undefined
    );
    const count = bucketsInZone.reduce((acc, b) => acc + b.count, 0);
    const recoverable = bucketsInZone.reduce(
      (acc, b) => acc + (b.recoverableMonthlyCost ?? 0),
      0
    );
    return { zone, count, recoverable };
  });

  return (
    <section
      aria-label="CPU distribution across running workspaces"
      data-note="distribution-histogram"
      className="flex flex-col rounded-lg border border-border-default bg-surface-elevated"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
        <h2 className="text-sm font-medium text-text-primary">
          CPU distribution · running workspaces
        </h2>
        <span className="text-xs text-text-tertiary">
          {formatNumber(total)} workspace{total === 1 ? "" : "s"}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <Histogram buckets={buckets} max={max} />
        <div className="border-t border-border-subtle" />
        <ul className="flex flex-col gap-4">
          {zoneAggregates.map(({ zone, count, recoverable }) => (
            <SummaryRow
              key={zone.key}
              zone={zone}
              count={count}
              recoverable={recoverable}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Histogram({
  buckets,
  max,
}: {
  buckets: UtilizationBucket[];
  max: number;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      {/* Zone header labels — semantic, muted, above the plot area */}
      <div className="flex text-[11px] font-medium">
        {ZONES.map((zone) => (
          <div
            key={zone.key}
            className="text-center tracking-[0.05em]"
            style={{
              flexBasis: ZONE_WIDTHS[zone.key],
              color: zone.color,
            }}
          >
            {ZONE_HEADERS[zone.key]}
          </div>
        ))}
      </div>

      {/* Plot area: continuous zone bands underneath, bar columns on top */}
      <div className="relative min-h-[140px] flex-1">
        {/* Bands: three contiguous rectangles filling the plot */}
        <div aria-hidden className="absolute inset-0 flex overflow-hidden rounded-sm">
          {ZONES.map((zone) => (
            <div
              key={zone.key}
              style={{
                flexBasis: ZONE_WIDTHS[zone.key],
                background: `color-mix(in oklab, ${zone.color} ${zone.bandOpacity * 100}%, transparent)`,
              }}
            />
          ))}
        </div>

        {/* Bars: equal-width columns aligned to the bottom of the plot */}
        <div className="relative grid h-full grid-cols-5 items-end gap-3 px-2">
          {buckets.map((bucket, i) => {
            const pct = (bucket.count / max) * 100;
            const label = bucket.label;
            return (
              <div
                key={label}
                className="flex h-full flex-col items-center justify-end gap-1"
              >
                <span className="font-mono text-base font-medium tabular-nums leading-none text-text-primary">
                  {bucket.count}
                </span>
                <div
                  aria-hidden
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${Math.max(pct, bucket.count > 0 ? 3 : 1.5)}%`,
                    background:
                      bucket.count === 0
                        ? "var(--border-default)"
                        : "var(--accent)",
                    minHeight: bucket.count > 0 ? "6px" : "2px",
                  }}
                />
                <span className="sr-only">
                  {label}: {bucket.count} workspace
                  {bucket.count === 1 ? "" : "s"}
                  {i === buckets.length - 1 ? "." : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis tick labels, one per bucket */}
      <div className="grid grid-cols-5 gap-3 px-2">
        {BUCKET_TICKS.map((tick) => (
          <span
            key={tick}
            className="text-center font-mono text-[11px] text-text-tertiary tabular-nums"
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({
  zone,
  count,
  recoverable,
}: {
  zone: Zone;
  count: number;
  recoverable: number;
}) {
  return (
    <li className="flex flex-col gap-0.5">
      <div className="flex items-baseline gap-3">
        <span
          aria-hidden
          className="inline-block size-2.5 shrink-0 translate-y-0.5 rounded-full"
          style={{ background: zone.color }}
        />
        <span className="text-sm font-medium text-text-primary">
          {zone.label}
        </span>
        <span className="text-sm text-text-secondary">
          {formatNumber(count)} workspace{count === 1 ? "" : "s"}
        </span>
        <div className="ml-auto flex items-baseline gap-3">
          <ZoneAction zone={zone} count={count} recoverable={recoverable} />
        </div>
      </div>
      <p className="pl-[22px] text-xs text-text-tertiary">{zone.description}</p>
    </li>
  );
}

function ZoneAction({
  zone,
  count,
  recoverable,
}: {
  zone: Zone;
  count: number;
  recoverable: number;
}) {
  if (zone.key === "idle") {
    if (count === 0) {
      return (
        <span className="font-mono text-sm text-text-tertiary">—</span>
      );
    }
    return (
      <>
        <span
          className="font-mono text-sm font-medium tabular-nums"
          style={{ color: zone.color }}
        >
          ~{formatCurrency(recoverable, { fractionDigits: 0 })}/month
        </span>
        <Link
          href="/admin/workspaces?idleOnly=true"
          className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Stop idle workspaces
          <ArrowRight className="size-3.5" strokeWidth={1.5} />
        </Link>
      </>
    );
  }
  if (zone.key === "nearCap") {
    if (count === 0) {
      return (
        <span className="font-mono text-sm text-text-tertiary">—</span>
      );
    }
    return (
      <Link
        href="/admin/templates"
        className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
        style={{ color: "var(--accent)" }}
      >
        Consider larger templates
        <ArrowRight className="size-3.5" strokeWidth={1.5} />
      </Link>
    );
  }
  return <span className="font-mono text-sm text-text-tertiary">—</span>;
}
