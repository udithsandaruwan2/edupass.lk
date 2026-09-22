import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Calendar } from "lucide-react";
import type { Seminar } from "@/domain/types";
import { formatLkr } from "@/services/api";
import { getStore } from "@/mocks/store";
import { formatSeminarWhen } from "@/lib/format";
import { seminarImage } from "@/lib/images";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SeminarCard({
  seminar,
  className,
}: {
  seminar: Seminar;
  delay?: number;
  className?: string;
}) {
  const lecturer = getStore().lecturers.find((l) => l.id === seminar.lecturerId);
  const src = seminarImage(seminar.subject);

  return (
    <article
      className={cn(
        "card-lift card-lift-hover group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <Link
        to="/seminars/$id"
        params={{ id: seminar.id }}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <img
          src={src}
          alt=""
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-transparent" />
        <Badge className="absolute left-3 top-3 border-0 bg-card/95 text-foreground shadow-sm backdrop-blur-sm">
          {seminar.level}
        </Badge>
        <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
          {seminar.medium}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          to="/seminars/$id"
          params={{ id: seminar.id }}
          className="font-display text-[0.95rem] font-semibold leading-snug tracking-tight text-ink transition-colors hover:text-primary"
        >
          {seminar.subject}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">{lecturer?.name ?? "Lecturer"}</p>
        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden />
            <span className="line-clamp-1">{formatSeminarWhen(seminar.startsAt)}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
            {seminar.city} · {seminar.seatsLeft} left
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="font-display text-lg font-semibold text-ink">
            {formatLkr(seminar.price)}
          </span>
          <Link
            to="/seminars/$id"
            params={{ id: seminar.id }}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-300 hover:scale-105"
            aria-label={`View ${seminar.subject}`}
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
