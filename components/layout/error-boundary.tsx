"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import { ApiError } from "@/lib/api/client";

export function ErrorBoundary({
  title,
  error,
  reset,
}: {
  title: string;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(title, error);
  }, [title, error]);

  const description =
    error instanceof ApiError
      ? `${error.message}${error.status ? ` (${error.status})` : ""}`
      : error.message || "Something went wrong.";

  return (
    <section
      role="alert"
      className="mx-auto flex w-full max-w-[640px] flex-col items-start gap-5 px-6 py-16"
    >
      <span className="inline-flex size-9 items-center justify-center rounded-md border border-border-default bg-surface-secondary text-status-error">
        <AlertTriangle className="size-4" strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-text-primary">{title}</h1>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </section>
  );
}
