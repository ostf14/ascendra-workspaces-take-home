"use client";

import { useSyncExternalStore } from "react";

import { EXPECTED_TRANSITION_SECONDS } from "@/lib/constants";

// Module-level map of workspace id → epoch ms when the in-flight transition
// started. Set by the lifecycle mutation hooks in onMutate, cleared when
// the status settles. Survives across components subscribed via useSyncExternalStore.

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

function getSnapshot(id: string): number | undefined {
  return startedAt.get(id);
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

// Ticks every second so subscribers re-render the countdown. Cheap — only
// fires while there is an active transition somewhere in the app.
let tickHandle: number | undefined;
let tickRefCount = 0;

function ensureTicker(): () => void {
  if (typeof window === "undefined") return () => {};
  tickRefCount += 1;
  if (tickHandle === undefined) {
    tickHandle = window.setInterval(emit, 1000);
  }
  return () => {
    tickRefCount -= 1;
    if (tickRefCount <= 0 && tickHandle !== undefined) {
      window.clearInterval(tickHandle);
      tickHandle = undefined;
      tickRefCount = 0;
    }
  };
}

export function useTransitionProgress(id: string): TransitionProgress {
  const started = useSyncExternalStore(
    (listener) => {
      const stopTick = ensureTicker();
      const stopSub = subscribe(listener);
      return () => {
        stopSub();
        stopTick();
      };
    },
    () => getSnapshot(id),
    () => undefined
  );

  if (started === undefined) return SSR_DEFAULT;

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
  const secondsRemaining = Math.max(
    0,
    EXPECTED_TRANSITION_SECONDS - elapsedSeconds
  );
  const almostDone = elapsedSeconds >= EXPECTED_TRANSITION_SECONDS;

  return {
    started: true,
    elapsedSeconds,
    secondsRemaining,
    almostDone,
  };
}
