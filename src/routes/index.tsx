import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, Ticket, CreditCard, QrCode } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { SeminarCard } from "@/components/seminar-card";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { useSeminars, useLecturers } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "edupass.lk — Educational event & seminar passes" },
      {
        name: "description",
        content:
          "Buy O/L & A/L seminar passes, track attendance and fees — education events and learning ops in one platform.",
      },
      { property: "og:title", content: "edupass.lk — Seminar passes + education ops" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: seminars, isLoading } = useSeminars();
  const { data: lecturers } = useLecturers();
  const featured = (seminars ?? []).slice(0, 4);

  return (
    <SiteShell>
      {/* Hero — SkillSync split, no stats in first viewport */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-16 lg:gap-14">
        <div className="rise">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            edupass.lk
          </p>
          <h1 className="mt-3 max-w-[16ch] font-display text-4xl font-semibold leading-[1.12] tracking-tight text-ink md:text-5xl">
            Educational event passes for O/L &amp; A/L
          </h1>
          <p className="mt-4 max-w-[40ch] text-base text-muted-foreground md:text-lg">
            Browse seminars, purchase a digital pass, and manage attendance and fees — event
            passes and education tools in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full px-6" asChild>
              <Link to="/seminars">
                Get a pass <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6" asChild>
              <Link to="/lecturers">Browse lecturers</Link>
            </Button>
          </div>
        </div>

        <div
          className="rise relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-card)] md:aspect-auto md:min-h-[420px]"
          style={{ animationDelay: "100ms" }}
        >
          <div className="hero-lms absolute inset-0" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-primary-foreground md:p-8">
            <p className="font-display text-2xl font-semibold md:text-3xl">Seminar hall ready</p>
            <p className="mt-2 max-w-[28ch] text-sm text-primary-foreground/80">
              QR check-in at the gate · Card or bank slip · Student &amp; institute dashboards
            </p>
          </div>
          <div className="absolute right-6 top-6 rounded-2xl bg-card/95 px-4 py-3 text-sm shadow-lg backdrop-blur">
            <p className="font-semibold text-ink">Pass + education</p>
            <p className="text-xs text-muted-foreground">One platform</p>
          </div>
        </div>
      </section>

      {/* How it works — below fold */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
          <Step
            icon={<Ticket className="size-5" />}
            title="Choose"
            body="Pick an O/L or A/L seminar by subject, lecturer, city or medium."
          />
          <Step
            icon={<CreditCard className="size-5" />}
            title="Pay"
            body="Card for an instant pass, or bank transfer with slip upload for approval."
          />
          <Step
            icon={<QrCode className="size-5" />}
            title="Enter"
            body="Show your QR at the gate. Attendance and fees stay in your student portal."
          />
        </div>
      </section>

      {/* Featured passes */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <SectionHeader title="Seminar passes" actionLabel="View all" actionTo="/seminars" />
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((s, i) => (
              <SeminarCard key={s.id} seminar={s} delay={50 * i} />
            ))}
          </div>
        )}
      </section>

      {/* Lecturers */}
      <section className="bg-card py-14">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeader title="Lecturers" actionLabel="View all" actionTo="/lecturers" />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
            {(lecturers ?? []).slice(0, 6).map((lec) => (
              <Link
                key={lec.id}
                to="/lecturers/$slug"
                params={{ slug: lec.slug }}
                className="rise group flex flex-col items-center text-center"
              >
                <div
                  className="flex size-20 items-center justify-center rounded-full font-display text-lg font-semibold text-primary-foreground shadow-md transition-transform group-hover:scale-105"
                  style={{ background: `oklch(0.55 0.14 ${lec.photoHue})` }}
                >
                  {lec.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{lec.name}</p>
                <p className="text-xs text-muted-foreground">{lec.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Institute teaser */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-primary px-8 py-10 text-primary-foreground md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              For tuition institutes
            </h2>
            <p className="mt-2 max-w-[42ch] text-sm text-primary-foreground/85">
              Run classes, mark attendance, and collect monthly fees — without the public seminar
              marketplace home.
            </p>
          </div>
          <Button
            size="lg"
            className="rounded-full bg-card text-ink hover:bg-card/90"
            asChild
          >
            <Link to="/pricing">
              See institute tools <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
