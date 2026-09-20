import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { DigitalPass } from "@/components/digital-pass";
import { lkr, seminars } from "@/data/seminars";

export const Route = createFileRoute("/checkout/$seminarId")({
  loader: ({ params }) => {
    const seminar = seminars.find((s) => s.id === params.seminarId);
    if (!seminar) throw notFound();
    return { seminar };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable | pass.lk" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Book ${loaderData.seminar.subject} pass | pass.lk`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Reserve your seat for the ${loaderData.seminar.level} ${loaderData.seminar.subject} seminar with ${loaderData.seminar.teacher}.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `${loaderData.seminar.date} · ${loaderData.seminar.venue} · ${lkr(loaderData.seminar.price)}`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const { seminar } = Route.useLoaderData();
  const [seats, setSeats] = useState(1);
  const [paid, setPaid] = useState(false);

  const instituteFee = 1000 * seats;
  const levy = 250 * seats;
  const total = seminar.price * seats + instituteFee + levy;

  return (
    <SiteShell>
      <section className="grid gap-6 py-12 lg:grid-cols-[1fr_0.9fr]">
        <div className="rise rounded-2xl border border-card/60 bg-card/70 p-6 backdrop-blur-xl">
          <h1 className="text-xl font-bold tracking-tight">Booking summary</h1>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-accent-soft/70 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{seminar.subject} · Tier I</p>
                <p className="text-xs text-muted-foreground">
                  {seats} seat{seats > 1 ? "s" : ""} · {seminar.date} · {seminar.venue}
                </p>
              </div>
              <span className="font-mono text-sm">{lkr(seminar.price * seats)}</span>
            </div>

            <div className="flex items-center justify-between px-1 py-1 text-sm">
              <span className="text-muted-foreground">Seats</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSeats((s) => Math.max(1, s - 1))}
                  className="size-7 rounded-lg border border-border bg-card/70 font-mono"
                >
                  −
                </button>
                <span className="w-6 text-center font-mono">{seats}</span>
                <button
                  onClick={() => setSeats((s) => Math.min(seminar.seatsLeft, s + 1))}
                  className="size-7 rounded-lg border border-border bg-card/70 font-mono"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 py-1 text-sm">
              <span className="text-muted-foreground">Institute fee</span>
              <span className="font-mono">{lkr(instituteFee)}</span>
            </div>
            <div className="flex items-center justify-between px-1 py-1 text-sm">
              <span className="text-muted-foreground">Governing body levy</span>
              <span className="font-mono">{lkr(levy)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-border px-1 pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-mono text-lg font-medium">{lkr(total)}</span>
            </div>
          </div>

          <button
            onClick={() => setPaid(true)}
            className="mt-5 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground ring-1 ring-foreground/5 transition-opacity hover:opacity-90"
          >
            {paid ? "Payment received" : "Pay with eZ Cash / card"}
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {paid
              ? "Your pass is issued — show the QR at the gate."
              : "Digital pass + QR delivered instantly"}
          </p>
          <Link to="/seminars" className="mt-4 block text-center text-sm text-accent">
            ← Back to seminars
          </Link>
        </div>

        <div className="rise" style={{ animationDelay: "120ms" }}>
          <DigitalPass
            subject={seminar.subject}
            level={seminar.level}
            medium={seminar.medium}
            teacher={seminar.teacher}
            date={seminar.date}
            venue={seminar.venue}
            seats={`${seats} of ${seminar.seats}`}
            code={`PSS-${seminar.id.slice(0, 3).toUpperCase()}-44${seats}1`}
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Scan at the gate · valid for Tier I &amp; II sessions
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
