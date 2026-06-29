"use client";

import { type ReactNode, useEffect, useState } from "react";

let bootstrapped: Promise<void> | null = null;

async function enableMocking(): Promise<void> {
  if (typeof window === "undefined") return;
  if (bootstrapped) return bootstrapped;
  bootstrapped = (async () => {
    const { worker } = await import("@/mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  })();
  return bootstrapped;
}

export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    enableMocking()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error) => {
        // Surface the failure rather than hanging the app.
        // eslint-disable-next-line no-console
        console.error("MSW failed to start", error);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-background"
      >
        <span className="text-sm text-text-tertiary">Starting workspace…</span>
      </div>
    );
  }

  return <>{children}</>;
}
