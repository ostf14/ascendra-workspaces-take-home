"use client";

import { ErrorBoundary } from "@/components/layout/error-boundary";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      title="Could not load fleet data."
      error={error}
      reset={reset}
    />
  );
}
