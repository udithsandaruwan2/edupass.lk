import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, ChevronDown, Ticket, CreditCard, QrCode } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { HeroPass3D } from "@/components/hero-pass-3d";
import { SeminarCard } from "@/components/seminar-card";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { useSeminars, useLecturers } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { images, lecturerPhoto } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "edupass.lk — O/L & A/L seminar passes" },
      {
        name: "description",
        content:
          "Book Sri Lanka O/L and A/L seminar passes, pay by card or bank slip, and check in with a QR code.",
      },
      { property: "og:title", content: "edupass.lk — Seminar passes for O/L & A/L" },
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
    <SiteShell heroOverlay>
      <section className="hero-viewport hero-atmosphere relative isolate overflow-hidden">
        {/* Layered grids + vibrant side washes on white */}
        <div className="hero-grid-layer hero-grid-drift pointer-events-none absolute inset-0" />
        <div className="hero-grid-fine pointer-events-none absolute inset-0 opacity-90" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute inset-y-[8%] right-0 w-[45%] bg-gradient-to-l from-primary/25 via-[oklch(0.7_0.12_220_/_0.18)] to-transparent blur-3xl" />

        <div className="relative z-10 mx-auto grid h-full max-w-6xl grid-cols-1 items-center gap-6 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[5.25rem] sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-24">
          <div className="flex flex-col justify-center py-4 sm:py-6 lg:py-10">
            <p className="rise text-xs font-semibold tracking-[0.2em] text-primary uppercase sm:text-sm">
              edupass.lk
            </p>
            <h1
              className="rise mt-3 max-w-[14ch] font-display text-[2.35rem] font-semibold leading-[1.05] text-ink sm:text-5xl md:text-6xl lg:text-[3.75rem]"
              style={{ animationDelay: "70ms" }}
            >
              Your seat at the next seminar
            </h1>
            <p
              className="rise mt-4 max-w-[34ch] text-[0.95rem] leading-relaxed text-muted-foreground sm:text-lg"
              style={{ animationDelay: "130ms" }}
            >
              O/L and A/L revision passes with QR check-in — pay by card or bank slip.
            </p>
            <div
              className="rise mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap"
              style={{ animationDelay: "190ms" }}
            >
              <Button size="lg" className="h-12 w-full rounded-full px-8 sm:w-auto" asChild>
                <Link to="/seminars">
                  Get a pass <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-primary/30 bg-card/80 px-8 text-ink hover:bg-accent-soft sm:w-auto"
                asChild
              >
                <Link to="/lecturers">Find a lecturer</Link>
              </Button>
            </div>
          </div>

          <div
            className="rise relative flex min-h-[240px] items-center justify-center sm:min-h-[300px] lg:min-h-0 lg:justify-end"
            style={{ animationDelay: "220ms" }}
          >
            <HeroPass3D />
          </div>

          <a
            href="#how-it-works"
            className="scroll-cue col-span-full mb-1 flex flex-col items-center gap-1 justify-self-center text-muted-foreground transition-colors hover:text-primary lg:absolute lg:bottom-5 lg:left-1/2 lg:-translate-x-1/2"
            aria-label="Scroll to how it works"
          >
            <span className="text-[10px] font-medium tracking-widest uppercase">Explore</span>
            <ChevronDown className="size-5" />
          </a>
        </div>
      </section>

      <section id="how-it-works" className="section-glow scroll-mt-24 border-b border-border bg-card">
        <div className="section-glow-wash" />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:gap-10 sm:py-14 md:grid-cols-3">
          <Reveal delay={0}>
            <Step
              icon={<Ticket className="size-5" />}
              step="01"
              title="Choose a seminar"
              body="Filter by O/L or A/L, subject, medium, and city — then open the details."
            />
          </Reveal>
          <Reveal delay={80}>
            <Step
              icon={<CreditCard className="size-5" />}
              step="02"
              title="Pay your way"
              body="Card issues a pass instantly. Bank transfer lets you upload a slip for approval."
            />
          </Reveal>
          <Reveal delay={160}>
            <Step
              icon={<QrCode className="size-5" />}
              step="03"
              title="Walk in with QR"
              body="Show your digital pass at the gate. Attendance lands in your student portal."
            />
          </Reveal>
        </div>
      </section>

      <section className="ambient-grid">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <Reveal>
            <SectionHeader
              title="Upcoming seminar passes"
              actionLabel="View all"
              actionTo="/seminars"
            />
            <p className="-mt-4 mb-8 max-w-[42ch] text-sm text-muted-foreground sm:text-base">
              Real sessions across Colombo, Kandy, Galle and beyond — each pass includes gate
              check-in.
            </p>
          </Reveal>
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {featured.map((s, i) => (
                <Reveal key={s.id} delay={60 * i}>
                  <SeminarCard seminar={s} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-glow bg-card">
        <div className="section-glow-wash" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <Reveal>
            <SectionHeader title="Meet the lecturers" actionLabel="View all" actionTo="/lecturers" />
          </Reveal>
          <div className="mt-2 grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-6">
            {(lecturers ?? []).slice(0, 6).map((lec, i) => (
              <Reveal key={lec.id} delay={50 * i}>
                <Link
                  to="/lecturers/$slug"
                  params={{ slug: lec.slug }}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="relative size-[4.5rem] overflow-hidden rounded-full ring-2 ring-border transition-[ring-color,transform] duration-300 group-hover:scale-[1.04] group-hover:ring-primary/40 sm:size-24">
                    <img
                      src={lecturerPhoto(i)}
                      alt=""
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">{lec.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{lec.title}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-glow mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="section-glow-wash rounded-[1.5rem]" />
        <Reveal>
          <div className="relative z-10 grid overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] sm:rounded-[1.5rem] md:grid-cols-2">
            <div className="relative min-h-[200px] sm:min-h-[240px] md:min-h-full">
              <img
                src={images.institute}
                alt="Study materials and books"
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                Institutes
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Classes, attendance &amp; monthly fees
              </h2>
              <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
                A quiet console for tuition institutes — roster students, mark attendance, and
                collect fees by cash, card or bank slip. Separate from the public seminar home.
              </p>
              <Button className="mt-6 w-full rounded-full px-6 sm:w-fit" asChild>
                <Link to="/pricing">
                  Explore institute tools <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}

function Step({
  icon,
  step,
  title,
  body,
}: {
  icon: ReactNode;
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative">
      <span className="font-mono text-[11px] font-medium text-primary/70">{step}</span>
      <div className="mt-3 flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
