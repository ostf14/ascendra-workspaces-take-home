"use client";

import { useEffect, useState } from "react";

import { EXPECTED_TRANSITION_SECONDS } from "@/lib/constants";

// Module-level map of workspace id → epoch ms when the in-flight transition
// started. Set by the lifecycle mutation hooks in onMutate, cleared when
// the status settles. Subscribers tick every second to render the countdown.

type Listener = () => void;

const startedAt = new Map<string, number>();
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function markTransitionStarted(id: string): void {
  startedAt.set(id, Date.now());
  emit();
}

export function clearTransition(id: string): void {
  if (startedAt.delete(id)) emit();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export type TransitionProgress = {
  /** True once a mutation has called markTransitionStarted for this id. */
  started: boolean;
  /** Whole seconds expected to remain; never below 0 (clamped). */
  secondsRemaining: number;
  /** True once elapsed has crossed EXPECTED_TRANSITION_SECONDS. */
  almostDone: boolean;
  /** Whole seconds elapsed since markTransitionStarted. */
  elapsedSeconds: number;
};

const SSR_DEFAULT: TransitionProgress = {
  started: false,
  secondsRemaining: EXPECTED_TRANSITION_SECONDS,
  almostDone: false,
  elapsedSeconds: 0,
};

function computeProgress(id: string): TransitionProgress {
  const at = startedAt.get(id);
  if (at === undefined) return SSR_DEFAULT;
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - at) / 1000));
  const secondsRemaining = Math.max(
    0,
    EXPECTED_TRANSITION_SECONDS - elapsedSeconds
  );
  return {
    started: true,
    elapsedSeconds,
    secondsRemaining,
    almostDone: elapsedSeconds >= EXPECTED_TRANSITION_SECONDS,
  };
}

export function useTransitionProgress(id: string): TransitionProgress {
  // Re-render on:
  //   - external changes (mark / clear) via the listener subscription
  //   - every wall-second so the countdown ticks even when the underlying
  //     started-at value doesn't move
  const [progress, setProgress] = useState<TransitionProgress>(() =>
    typeof window === "undefined" ? SSR_DEFAULT : computeProgress(id)
  );

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      if (cancelled) return;
      setProgress(computeProgress(id));
    };
    refresh();
    const unsubscribe = subscribe(refresh);
    const tick = window.setInterval(refresh, 1000);
    return () => {
      cancelled = true;
      unsubscribe();
      window.clearInterval(tick);
    };
  }, [id]);

  return progress;
}
