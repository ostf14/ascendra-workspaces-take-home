"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { parseISO } from "date-fns";

import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Provisioning VM", durationSeconds: 3 },
  { label: "Pulling image", durationSeconds: 4 },
  { label: "Installing dependencies", durationSeconds: 4 },
  { label: "Starting services", durationSeconds: 3 },
] as const;

const TOTAL = STEPS.reduce((acc, step) => acc + step.durationSeconds, 0);

function describeStep(elapsedSeconds: number): {
  currentIndex: number;
  progress: number;
} {
  let cumulative = 0;
  for (let i = 0; i < STEPS.length; i += 1) {
    const step = STEPS[i];
    if (!step) continue;
    cumulative += step.durationSeconds;
    if (elapsedSeconds < cumulative) {
      const into = elapsedSeconds - (cumulative - step.durationSeconds);
      return { currentIndex: i, progress: into / step.durationSeconds };
    }
  }
  return { currentIndex: STEPS.length - 1, progress: 1 };
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s elapsed`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds - minutes * 60);
  return `${minutes}m ${remaining}s elapsed`;
}

export function StartingProgress({ workspace }: { workspace: VM }) {
  const isStarting = workspace.status === "starting";
  const startedAt = parseISO(workspace.lastActiveAt);
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    Math.max(0, (Date.now() - startedAt.getTime()) / 1000)
  );

  useEffect(() => {
    if (!isStarting) return;
    const id = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, (Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isStarting, startedAt]);

  if (!isStarting) return null;

  const { currentIndex } = describeStep(Math.min(elapsedSeconds, TOTAL));

  return (
    <section
      aria-live="polite"
      aria-label="Starting workspace"
      className="rounded-lg border border-border-default bg-surface-secondary p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-text-primary">Starting workspace</h2>
        <span className="font-mono text-xs text-text-tertiary">
          {formatElapsed(elapsedSeconds)}
        </span>
      </header>
      <ol className="mt-4 flex flex-col gap-2">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li
              key={step.label}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                isCurrent && "bg-surface-elevated"
              )}
            >
              <span className="inline-flex size-5 items-center justify-center">
                {isComplete ? (
                  <Check
                    className="size-4 text-status-running"
                    strokeWidth={1.5}
                  />
                ) : isCurrent ? (
                  <Loader2
                    className="size-4 animate-spin text-status-pending"
                    strokeWidth={1.5}
                  />
                ) : (
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-text-tertiary"
                  />
                )}
              </span>
              <span
                className={cn(
                  isComplete
                    ? "text-text-secondary"
                    : isCurrent
                      ? "text-text-primary"
                      : "text-text-tertiary"
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
