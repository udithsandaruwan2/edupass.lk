import { Link } from "@tanstack/react-router";
import type { Seminar } from "@/domain/types";
import { formatLkr } from "@/services/api";
import { getStore } from "@/mocks/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSeminarWhen } from "@/lib/format";

export function SeminarCard({ seminar, delay = 0 }: { seminar: Seminar; delay?: number }) {
  const lecturer = getStore().lecturers.find((l) => l.id === seminar.lecturerId);

  return (
    <article
      className="rise flex flex-col border-b border-border py-5 first:pt-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary">{seminar.level}</Badge>
        <span className="font-mono text-[11px] text-muted-foreground">{seminar.city}</span>
      </div>
      <Link
        to="/seminars/$id"
        params={{ id: seminar.id }}
        className="mt-3 font-display text-xl font-semibold tracking-tight hover:text-primary"
      >
        {seminar.subject}
      </Link>
      <p className="mt-1 text-sm text-muted-foreground">
        {lecturer?.name ?? "Lecturer"} · {seminar.medium} medium
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatSeminarWhen(seminar.startsAt)} · {seminar.venue}
      </p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        {seminar.seatsLeft} of {seminar.seats} seats left
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-base font-medium">{formatLkr(seminar.price)}</span>
        <Button size="sm" asChild>
          <Link to="/seminars/$id" params={{ id: seminar.id }}>
            Details
          </Link>
        </Button>
      </div>
    </article>
  );
}
