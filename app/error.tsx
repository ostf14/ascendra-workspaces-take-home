"use client";

import { ErrorBoundary } from "@/components/layout/error-boundary";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      title="Something went wrong."
      error={error}
      reset={reset}
    />
  );
}
