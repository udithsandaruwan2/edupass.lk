import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

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
      <section className="py-14">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Built for tuition institutes
        </h1>
        <p className="mt-3 max-w-[48ch] text-muted-foreground">
          Run weekly classes without the public seminar home — manage rosters, mark attendance, and
          collect monthly fees by cash, card or bank slip.
        </p>

        <div className="mt-12 grid gap-8 border-t border-border pt-10 md:grid-cols-3">
          <Feature
            title="Classes & roster"
            body="Create batches for O/L and A/L subjects, enrol students, and keep schedules clear."
          />
          <Feature
            title="Attendance"
            body="Mark present or absent each session. Students see the same records in their account."
          />
          <Feature
            title="Monthly fees"
            body="Record cash at the desk, or let students pay by card / upload a bank slip for approval."
          />
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link to="/auth/login">Open institute console</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/seminars">Browse public seminars</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Demo organizer: organizer@lankavidya.lk (any password). Or append{" "}
          <code className="font-mono">?dev=1</code> and switch role to organizer.
        </p>
      </section>
    </SiteShell>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
