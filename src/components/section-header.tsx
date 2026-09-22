import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  actionLabel,
  actionTo,
  className,
}: {
  title: string;
  actionLabel?: string;
  actionTo?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {title}
      </h2>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {actionLabel} →
        </Link>
      ) : null}
    </div>
  );
}

export function DashboardCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
