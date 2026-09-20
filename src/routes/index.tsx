import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "edupass.lk — O/L & A/L seminar passes in Sri Lanka" },
      {
        name: "description",
        content:
          "Book O/L and A/L seminar passes, pay by card or bank transfer, and check in with a digital QR pass.",
      },
      { property: "og:title", content: "edupass.lk — O/L & A/L seminar passes" },
      {
        property: "og:description",
        content: "Simple seminar passes and institute tuition tools for Sri Lanka.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <section className="relative -mx-5 mt-0 min-h-[min(88vh,720px)] overflow-hidden">
        <div className="hero-photo absolute inset-0" />
        <div className="relative mx-auto flex min-h-[min(88vh,720px)] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 text-primary-foreground md:justify-center md:pb-24">
          <p className="rise font-display text-4xl font-semibold tracking-tight md:text-6xl">
            edupass<span className="text-accent-soft">.lk</span>
          </p>
          <h1
            className="rise mt-4 max-w-[18ch] font-display text-3xl font-medium leading-[1.15] tracking-tight md:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            Your seat at the next O/L &amp; A/L seminar
          </h1>
          <p
            className="rise mt-4 max-w-[40ch] text-base text-primary-foreground/85 md:text-lg"
            style={{ animationDelay: "140ms" }}
          >
            Browse lecturers, book a pass, pay by card or bank slip, and walk in with a QR code.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "200ms" }}>
            <Button size="lg" className="bg-card text-ink hover:bg-card/90" asChild>
              <Link to="/seminars">Browse seminars</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/lecturers">Find a lecturer</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-10 py-16 md:grid-cols-2">
        <div className="rise">
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-6 space-y-4 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">1. Choose</span> — pick an O/L or A/L
              seminar by subject, lecturer, city or medium.
            </li>
            <li>
              <span className="font-medium text-foreground">2. Pay</span> — card for instant pass,
              or bank transfer with slip upload for admin approval.
            </li>
            <li>
              <span className="font-medium text-foreground">3. Enter</span> — show your QR pass at
              the gate; attendance is marked on scan.
            </li>
          </ol>
        </div>
        <div
          className="rise border-l border-border pl-0 md:pl-10"
          style={{ animationDelay: "100ms" }}
        >
          <h2 className="font-display text-2xl font-semibold tracking-tight">For institutes</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Run weekly classes with student rosters, monthly fee collection (cash, card or slip),
            and attendance — without the public marketplace home.
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link to="/pricing">See institute tools</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
