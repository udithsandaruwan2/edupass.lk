import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — pass tiers & institute fees | pass.lk" },
      {
        name: "description",
        content:
          "Transparent pass tiers for students and a simple per-payment fee for Sri Lankan institutes.",
      },
      { property: "og:title", content: "Pricing — pass tiers & institute fees" },
      {
        property: "og:description",
        content: "Student pass tiers in LKR and low-cost fee handling for institutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Tier I · Single seminar",
    price: "LKR 3,000 – 4,500",
    points: ["One session", "Digital pass + QR", "Printed notes at gate"],
  },
  {
    name: "Tier II · Term pass",
    price: "LKR 12,500",
    points: ["All sessions of one subject", "Seat held till start", "Recording access 7 days"],
  },
  {
    name: "Institute plan",
    price: "2.9% per payment",
    points: ["Class & schedule console", "Fee tracking and reminders", "Payouts twice a month"],
  },
];

function PricingPage() {
  return (
    <SiteShell>
      <section className="py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Pricing</h1>
        <p className="mt-2 max-w-[48ch] text-muted-foreground">
          Students pay per pass. Institutes pay only when a fee is collected.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className="rise flex flex-col rounded-2xl border border-card/60 bg-card/60 p-6 backdrop-blur-xl"
              style={{ animationDelay: `${60 * i}ms` }}
            >
              <p className="text-sm font-semibold">{tier.name}</p>
              <p className="mt-3 font-mono text-xl font-medium">{tier.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {tier.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                to="/seminars"
                className="mt-6 rounded-xl bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground ring-1 ring-foreground/5"
              >
                Choose
              </Link>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
