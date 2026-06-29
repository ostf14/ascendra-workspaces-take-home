import { type ReactNode } from "react";

export function RoutePlaceholder({
  path,
  hint,
}: {
  path: string;
  hint?: ReactNode;
}) {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-6 py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
        Placeholder
      </p>
      <h1 className="font-mono text-lg text-text-primary">{path}</h1>
      {hint ? (
        <p className="max-w-prose text-sm text-text-secondary">{hint}</p>
      ) : null}
    </section>
  );
}
