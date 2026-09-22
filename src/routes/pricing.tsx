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
      <section className="relative isolate h-48 overflow-hidden md:h-56">
        <img
          src={images.students}
          alt="Students collaborating"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/70" />
        <div className="relative mx-auto flex h-full max-w-6xl items-end px-5 pb-8">
          <h1 className="font-display text-3xl font-semibold text-primary-foreground md:text-4xl">
            Built for tuition institutes
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <Reveal>
          <p className="max-w-[48ch] text-muted-foreground">
            Run weekly classes without the public seminar home — manage rosters, mark attendance,
            and collect monthly fees by cash, card or bank slip.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
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
          <div className="mt-12 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full px-6" asChild>
              <Link to="/auth/login">
                Open institute console <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6" asChild>
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
    <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-primary">
        {icon}
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
