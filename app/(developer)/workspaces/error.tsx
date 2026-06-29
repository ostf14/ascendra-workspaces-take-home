"use client";

import { ErrorBoundary } from "@/components/layout/error-boundary";

export default function WorkspacesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      title="Could not load workspaces."
      error={error}
      reset={reset}
    />
  );
}
