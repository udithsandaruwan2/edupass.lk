import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { SeminarCard } from "@/components/seminar-card";
import { seminars } from "@/data/seminars";

export const Route = createFileRoute("/seminars")({
  head: () => ({
    meta: [
      { title: "Seminars — O/L & A/L sessions | pass.lk" },
      {
        name: "description",
        content:
          "Browse upcoming O/L and A/L seminars across Sri Lanka, check seats left and book a pass in LKR.",
      },
      { property: "og:title", content: "Upcoming O/L & A/L seminars | pass.lk" },
      {
        property: "og:description",
        content: "Combined Maths, Physics, Chemistry, Biology and more — book your pass online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeminarsPage,
});

const filters = ["All", "A/L", "O/L"] as const;

function SeminarsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const list = seminars.filter((s) => filter === "All" || s.level === filter);

  return (
    <SiteShell>
      <section className="py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Upcoming seminars</h1>
        <p className="mt-2 max-w-[48ch] text-muted-foreground">
          Every session includes a digital pass with a QR code for gate check-in.
        </p>

        <div className="mt-6 flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                f === filter
                  ? "rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
                  : "rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur"
              }
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {list.map((seminar, i) => (
            <SeminarCard key={seminar.id} seminar={seminar} delay={60 * i} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
