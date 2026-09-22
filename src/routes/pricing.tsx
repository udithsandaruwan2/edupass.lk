import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { BookOpen, ClipboardCheck, Banknote, ArrowRight } from "lucide-react";
import { images } from "@/lib/images";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "For institutes | edupass.lk" },
      {
        name: "description",
        content:
          "Institute tools for classes, attendance and monthly fee collection on edupass.lk.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <SiteShell>
      <section className="relative isolate min-h-[min(42svh,280px)] overflow-hidden sm:min-h-[min(38svh,320px)]">
        <img
          src={images.students}
          alt="Students collaborating"
          className="absolute inset-0 size-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/65 to-navy/45" />
        <div className="relative mx-auto flex h-full min-h-[inherit] max-w-6xl items-end px-5 pb-8 pt-6 sm:pb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-primary-foreground/70 uppercase">
              Institutes
            </p>
            <h1 className="mt-2 max-w-[18ch] font-display text-3xl font-semibold text-primary-foreground sm:text-4xl md:text-[2.75rem] md:leading-tight">
              Built for tuition institutes
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <Reveal>
          <p className="max-w-[48ch] text-sm text-muted-foreground sm:text-base">
            Run weekly classes without the public seminar home — manage rosters, mark attendance,
            and collect monthly fees by cash, card or bank slip.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 md:grid-cols-3">
          <Reveal delay={0}>
            <Feature
              icon={<BookOpen className="size-5" />}
              title="Classes & roster"
              body="Create batches for O/L and A/L subjects, enrol students, and keep schedules clear."
            />
          </Reveal>
          <Reveal delay={80}>
            <Feature
              icon={<ClipboardCheck className="size-5" />}
              title="Attendance"
              body="Mark present or absent each session. Students see the same records in their account."
            />
          </Reveal>
          <Reveal delay={160}>
            <Feature
              icon={<Banknote className="size-5" />}
              title="Monthly fees"
              body="Record cash at the desk, or let students pay by card / upload a bank slip for approval."
            />
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap">
            <Button size="lg" className="h-12 w-full rounded-full px-6 sm:w-auto" asChild>
              <Link to="/auth/login">
                Open institute console <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full px-6 sm:w-auto"
              asChild
            >
              <Link to="/seminars">Browse public seminars</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Demo organizer: organizer@lankavidya.lk (any password). Or append{" "}
            <code className="font-mono">?dev=1</code> and switch role to organizer.
          </p>
        </Reveal>
      </section>
    </SiteShell>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-primary">
        {icon}
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-ink sm:text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
