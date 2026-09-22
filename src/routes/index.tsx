import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, Ticket, CreditCard, QrCode } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
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
    <SiteShell>
      {/* Full-bleed photo hero — brand, one line, CTAs only */}
      <section className="relative isolate min-h-[min(88vh,680px)] overflow-hidden">
        <img
          src={images.hero}
          alt="Students in a seminar hall"
          className="absolute inset-0 size-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/88 via-navy/70 to-navy/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-navy/20" />

        <div className="relative mx-auto flex min-h-[min(88vh,680px)] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:pb-24">
          <p className="rise font-display text-sm font-semibold tracking-[0.16em] text-primary-foreground/80 uppercase">
            edupass.lk
          </p>
          <h1
            className="rise mt-3 max-w-[15ch] font-display text-4xl font-semibold leading-[1.08] text-primary-foreground md:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Your seat at the next seminar
          </h1>
          <p
            className="rise mt-4 max-w-[36ch] text-base text-primary-foreground/85 md:text-lg"
            style={{ animationDelay: "140ms" }}
          >
            O/L and A/L revision passes with QR check-in — pay by card or bank slip.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "200ms" }}>
            <Button
              size="lg"
              className="rounded-full bg-card px-7 text-ink hover:bg-card/95"
              asChild
            >
              <Link to="/seminars">
                Get a pass <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-primary-foreground/35 bg-transparent px-7 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/lecturers">Find a lecturer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3">
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

      {/* Featured passes */}
      <section className="ambient-grid">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <SectionHeader
              title="Upcoming seminar passes"
              actionLabel="View all"
              actionTo="/seminars"
            />
            <p className="-mt-4 mb-8 max-w-[42ch] text-muted-foreground">
              Real sessions across Colombo, Kandy, Galle and beyond — each pass includes gate
              check-in.
            </p>
          </Reveal>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((s, i) => (
                <Reveal key={s.id} delay={60 * i}>
                  <SeminarCard seminar={s} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lecturers with photos */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <SectionHeader title="Meet the lecturers" actionLabel="View all" actionTo="/lecturers" />
          </Reveal>
          <div className="mt-2 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6">
            {(lecturers ?? []).slice(0, 6).map((lec, i) => (
              <Reveal key={lec.id} delay={50 * i}>
                <Link
                  to="/lecturers/$slug"
                  params={{ slug: lec.slug }}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="relative size-[4.75rem] overflow-hidden rounded-full ring-2 ring-border transition-[ring-color,transform] duration-300 group-hover:scale-[1.04] group-hover:ring-primary/40 sm:size-24">
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

      {/* Institute — photo + copy */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <div className="grid overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[var(--shadow-card)] md:grid-cols-2">
            <div className="relative min-h-[240px] md:min-h-full">
              <img
                src={images.institute}
                alt="Study materials and books"
                className="absolute inset-0 size-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Institutes
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">
                Classes, attendance &amp; monthly fees
              </h2>
              <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
                A quiet console for tuition institutes — roster students, mark attendance, and
                collect fees by cash, card or bank slip. Separate from the public seminar home.
              </p>
              <Button className="mt-6 w-fit rounded-full px-6" asChild>
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
