import { Link } from "@tanstack/react-router";
import { lkr, type Seminar } from "@/data/seminars";

export function SeminarCard({
  seminar,
  delay = 0,
}: {
  seminar: Seminar;
  delay?: number;
}) {
  return (
    <article
      className="rise flex flex-col rounded-2xl border border-card/60 bg-card/60 p-5 backdrop-blur-xl"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          {seminar.level}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{seminar.date}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{seminar.subject}</h3>
      <p className="text-sm text-muted-foreground">
        {seminar.teacher} · {seminar.venue}
      </p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        {seminar.seatsLeft} of {seminar.seats} seats left
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-dashed border-border pt-4">
        <span className="font-mono text-base font-medium">{lkr(seminar.price)}</span>
        <Link
          to="/checkout/$seminarId"
          params={{ seminarId: seminar.id }}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground ring-1 ring-foreground/5"
        >
          Book
        </Link>
      </div>
    </article>
  );
}
