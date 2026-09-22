import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Countdown } from "@/components/countdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSeminar, getLecturer, formatLkr } from "@/services/api";
import { formatSeminarWhen } from "@/lib/format";
import { hydrateStore } from "@/mocks/store";

export const Route = createFileRoute("/seminars/$id")({
  loader: async ({ params }) => {
    hydrateStore();
    const seminar = await getSeminar(params.id);
    if (!seminar) throw notFound();
    const lecturer = await getLecturer(seminar.lecturerId);
    return { seminar, lecturer };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.seminar.subject} · ${loaderData.seminar.level} | edupass.lk`
          : "Seminar | edupass.lk",
      },
    ],
  }),
  component: SeminarDetailPage,
});

function SeminarDetailPage() {
  const { seminar, lecturer } = Route.useLoaderData();

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rise">
          <div className="flex flex-wrap gap-2">
            <Badge>{seminar.level}</Badge>
            <Badge variant="secondary">{seminar.medium} medium</Badge>
            {seminar.stream ? <Badge variant="outline">{seminar.stream}</Badge> : null}
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {seminar.subject}
          </h1>
          <p className="mt-3 text-muted-foreground">{seminar.description}</p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <Detail label="Lecturer" value={lecturer?.name ?? "—"} />
            <Detail label="When" value={formatSeminarWhen(seminar.startsAt)} />
            <Detail label="Venue" value={seminar.venue} />
            <Detail label="City" value={seminar.city} />
            <Detail label="Seats left" value={`${seminar.seatsLeft} / ${seminar.seats}`} />
            <Detail label="Pass price" value={formatLkr(seminar.price)} />
          </dl>

          {lecturer ? (
            <p className="mt-6 text-sm">
              <Link
                to="/lecturers/$slug"
                params={{ slug: lecturer.slug }}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                View {lecturer.name}&apos;s profile
              </Link>
            </p>
          ) : null}

          <Button className="mt-8 rounded-full px-6" size="lg" asChild>
            <Link to="/checkout/$seminarId" params={{ seminarId: seminar.id }}>
              Purchase pass
            </Link>
          </Button>
        </div>

        <div className="rise space-y-4" style={{ animationDelay: "100ms" }}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-lg font-semibold">Starts in</h2>
            <Countdown target={seminar.startsAt} className="mt-4" />
            <p className="mt-4 text-xs text-muted-foreground">
              Arrive early with your QR pass ready. Gate staff will scan once per seat.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
