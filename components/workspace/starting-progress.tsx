"use client";

import { Check, Loader2 } from "lucide-react";

import {
  EXPECTED_TRANSITION_SECONDS,
  STARTING_STEPS,
  STOPPING_STEPS,
} from "@/lib/constants";
import { useTransitionProgress } from "@/lib/transition-tracker";
import type { VM } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type Verb = "Starting" | "Stopping";

function statusToVerb(status: VM["status"]): Verb | null {
  if (status === "starting") return "Starting";
  if (status === "stopping") return "Stopping";
  return null;
}

function stepsFor(verb: Verb): readonly string[] {
  return verb === "Starting" ? STARTING_STEPS : STOPPING_STEPS;
}

function currentStepIndex(verb: Verb, elapsedSeconds: number): number {
  const steps = stepsFor(verb);
  const perStep = EXPECTED_TRANSITION_SECONDS / steps.length;
  const index = Math.floor(elapsedSeconds / perStep);
  return Math.min(index, steps.length - 1);
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s elapsed`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${minutes}m ${rest}s elapsed`;
}

export function StartingProgress({ workspace }: { workspace: VM }) {
  const verb = statusToVerb(workspace.status);
  const progress = useTransitionProgress(workspace.id);

  if (!verb) return null;
  const steps = stepsFor(verb);
  const elapsedSeconds = progress.started ? progress.elapsedSeconds : 0;
  const currentIndex = currentStepIndex(verb, elapsedSeconds);
  const remainingLabel = progress.started
    ? progress.almostDone
      ? "almost done…"
      : `~${progress.secondsRemaining}s remaining`
    : `~${EXPECTED_TRANSITION_SECONDS}s remaining`;

  return (
    <section
      aria-live="polite"
      aria-label={`${verb} workspace`}
      className="rounded-lg border border-border-default bg-surface-secondary p-5"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-text-primary">
          {verb} workspace
        </h2>
        <span className="font-mono text-xs text-text-tertiary">
          {formatElapsed(elapsedSeconds)} · {remainingLabel}
        </span>
      </header>
      <ol className="mt-4 flex flex-col gap-2">
        {steps.map((label, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li
              key={label}
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
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
