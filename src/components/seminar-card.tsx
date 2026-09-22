import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Calendar } from "lucide-react";
import type { Seminar } from "@/domain/types";
import { formatLkr } from "@/services/api";
import { getStore } from "@/mocks/store";
import { formatSeminarWhen } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const HUES = [255, 220, 200, 240, 230, 210];

export function SeminarCard({
  seminar,
  delay = 0,
  className,
}: {
  seminar: Seminar;
  delay?: number;
  className?: string;
}) {
  const lecturer = getStore().lecturers.find((l) => l.id === seminar.lecturerId);
  const hue = HUES[Math.abs(seminar.id.charCodeAt(4) || 0) % HUES.length];

  return (
    <article
      className={cn(
        "rise card-lift card-lift-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Link to="/seminars/$id" params={{ id: seminar.id }} className="relative block aspect-[16/10]">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, oklch(0.55 0.16 ${hue}), oklch(0.38 0.12 ${hue + 20}))`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,oklch(1_0_0/0.2),transparent_50%)]" />
        <Badge className="absolute left-3 top-3 bg-card/95 text-foreground shadow-sm">
          {seminar.level}
        </Badge>
        <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
          {seminar.medium} medium
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          to="/seminars/$id"
          params={{ id: seminar.id }}
          className="font-display text-base font-semibold leading-snug tracking-tight hover:text-primary"
        >
          {seminar.subject}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          {lecturer?.name ?? "Lecturer"}
        </p>
        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" aria-hidden />
            {formatSeminarWhen(seminar.startsAt)}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {seminar.city} · {seminar.seatsLeft} seats left
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="font-display text-lg font-semibold text-ink">
            {formatLkr(seminar.price)}
          </span>
          <Link
            to="/seminars/$id"
            params={{ id: seminar.id }}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            aria-label={`View ${seminar.subject}`}
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
