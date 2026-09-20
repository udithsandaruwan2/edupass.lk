import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { DigitalPass } from "@/components/digital-pass";
import { SeminarCard } from "@/components/seminar-card";
import { seminars } from "@/data/seminars";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "pass.lk — O/L & A/L seminar passes in Sri Lanka" },
      {
        name: "description",
        content:
          "Book O/L and A/L seminar passes, pay fees online in LKR, and manage classes and fee collection from one institution console.",
      },
      { property: "og:title", content: "pass.lk — O/L & A/L seminar passes" },
      {
        property: "og:description",
        content:
          "One pass for every seminar. Online fee handling and a class console for Sri Lankan institutes.",
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
      <section className="grid gap-8 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20">
        <div className="rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-card/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-success" /> Term II 2025 · Registration
            open
          </span>
          <h1 className="mt-5 max-w-[16ch] text-balance text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
            One pass. Every seminar.
          </h1>
          <p className="mt-4 max-w-[42ch] text-pretty text-muted-foreground">
            Book O/L and A/L seminar passes, pay fees in one tap, and hand your institution a
            clean console for classes, schedules and fee tracking.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/seminars"
              className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground ring-1 ring-foreground/5 transition-opacity hover:opacity-90"
            >
              Browse seminars
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl border border-border bg-card/70 px-5 py-3 text-sm font-medium text-foreground backdrop-blur"
            >
              Open institution console
            </Link>
          </div>
          <dl className="mt-9 grid max-w-md grid-cols-3 gap-4">
            <Stat label="SEMINARS" value="1,240" />
            <Stat label="INSTITUTES" value="86" />
            <Stat label="COLLECTED" value="LKR 38.4M" />
          </dl>
        </div>

        <div className="rise" style={{ animationDelay: "120ms" }}>
          <DigitalPass
            subject="Combined Mathematics"
            level="A/L"
            medium="Sinhala Medium"
            teacher="K. Perera"
            date="Sat · 12 Apr"
            venue="Colombo 07"
            seats="1 of 40"
            code="PSS-9K2-4471"
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Scan at the gate · valid for Tier I &amp; II sessions
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Upcoming seminars</h2>
            <p className="mt-1 text-sm text-muted-foreground">Selected sessions for Term II</p>
          </div>
          <Link to="/seminars" className="text-sm font-medium text-accent">
            View all →
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {seminars.slice(0, 3).map((seminar, i) => (
            <SeminarCard key={seminar.id} seminar={seminar} delay={60 * (i + 1)} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div
          className="rise rounded-2xl border border-card/60 bg-card/70 p-6 backdrop-blur-xl"
          style={{ animationDelay: "120ms" }}
        >
          <h2 className="text-xl font-bold tracking-tight">Booking summary</h2>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-accent-soft/70 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Combined Mathematics · Tier I</p>
                <p className="text-xs text-muted-foreground">1 seat · Sat 12 Apr</p>
              </div>
              <span className="font-mono text-sm">LKR 4,500</span>
            </div>
            <LineItem label="Institute fee" value="LKR 1,000" />
            <LineItem label="Governing body levy" value="LKR 250" />
            <div className="flex items-center justify-between border-t border-dashed border-border px-1 pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-mono text-lg font-medium">LKR 5,750</span>
            </div>
          </div>
          <Link
            to="/checkout/$seminarId"
            params={{ seminarId: "combined-maths" }}
            className="mt-5 block w-full rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground ring-1 ring-foreground/5 transition-opacity hover:opacity-90"
          >
            Pay with eZ Cash / card
          </Link>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Digital pass + QR delivered instantly
          </p>
        </div>

        <div
          className="rise rounded-2xl border border-card/60 bg-card/70 p-6 backdrop-blur-xl"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Institution console</h2>
              <p className="text-sm text-muted-foreground">Lanka Vidya Institute</p>
            </div>
            <Link
              to="/dashboard"
              className="rounded-lg border border-border bg-card/70 px-3 py-2 text-sm font-medium"
            >
              + Create class
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <MiniStat label="REVENUE" value="₨ 1.24M" />
            <MiniStat label="ENROLLED" value="342" />
            <MiniStat label="PENDING" value="₨ 86K" />
          </div>

          <h3 className="mt-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Fee status
          </h3>
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card/60">
            <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-border px-4 py-2 text-[11px] font-medium text-muted-foreground">
              <span>Student</span>
              <span>Fee</span>
            </div>
            <FeeRow name="Amara D. · Combined Maths" status="Paid" />
            <FeeRow name="Rohan S. · Physics" status="Pending" />
            <FeeRow name="Isuru M. · Biology" status="Paid" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-mono text-lg text-foreground">{value}</dd>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-accent-soft/70 p-3">
      <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-medium">{value}</p>
    </div>
  );
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-1 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

export function FeeRow({ name, status }: { name: string; status: "Paid" | "Pending" }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-border px-4 py-2.5 text-sm first:border-t-0">
      <span>{name}</span>
      <span
        className={
          status === "Paid"
            ? "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
            : "rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning"
        }
      >
        {status}
      </span>
    </div>
  );
}
