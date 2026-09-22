import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Countdown } from "@/components/countdown";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSeminar, getLecturer, formatLkr } from "@/services/api";
import { formatSeminarWhen } from "@/lib/format";
import { hydrateStore } from "@/mocks/store";
import { seminarImage, lecturerPhotoBySlug } from "@/lib/images";

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
  const cover = seminarImage(seminar.subject);

  return (
    <SiteShell>
      <section className="relative isolate h-52 overflow-hidden md:h-64">
        <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/40 to-navy/20" />
        <div className="relative mx-auto flex h-full max-w-6xl items-end px-5 pb-6">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-card/95 text-foreground">{seminar.level}</Badge>
            <Badge className="bg-card/80 text-foreground">{seminar.medium} medium</Badge>
            {seminar.stream ? (
              <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground">
                {seminar.stream}
              </Badge>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {seminar.subject}
          </h1>
          <p className="mt-3 max-w-[52ch] leading-relaxed text-muted-foreground">
            {seminar.description}
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <Detail label="Lecturer" value={lecturer?.name ?? "—"} />
            <Detail label="When" value={formatSeminarWhen(seminar.startsAt)} />
            <Detail label="Venue" value={seminar.venue} />
            <Detail label="City" value={seminar.city} />
            <Detail label="Seats left" value={`${seminar.seatsLeft} / ${seminar.seats}`} />
            <Detail label="Pass price" value={formatLkr(seminar.price)} />
          </dl>

          {lecturer ? (
            <Link
              to="/lecturers/$slug"
              params={{ slug: lecturer.slug }}
              className="mt-8 flex w-fit items-center gap-3 rounded-full border border-border bg-card py-1.5 pr-4 pl-1.5 transition-colors hover:border-primary/30"
            >
              <img
                src={lecturerPhotoBySlug(lecturer.slug)}
                alt=""
                className="size-9 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-ink">
                View {lecturer.name}&apos;s profile
              </span>
            </Link>
          ) : null}

          <Button className="mt-8 rounded-full px-7" size="lg" asChild>
            <Link to="/checkout/$seminarId" params={{ seminarId: seminar.id }}>
              Purchase pass
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-lg font-semibold text-ink">Starts in</h2>
            <Countdown target={seminar.startsAt} className="mt-4" />
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Arrive a little early with your QR pass ready. Gate staff scan once per seat.
            </p>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
