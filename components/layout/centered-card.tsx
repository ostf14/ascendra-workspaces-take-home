import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CenteredCard({
  icon,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-[480px] flex-col gap-5 px-6 py-16",
        className
      )}
    >
      {icon ? (
        <span className="inline-flex size-9 items-center justify-center rounded-md border border-border-default bg-surface-secondary">
          {icon}
        </span>
      ) : null}
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-medium text-text-primary">{title}</h1>
        {description ? (
          <p className="text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
