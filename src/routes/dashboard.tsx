import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { lkr } from "@/data/seminars";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Institution console — classes & fees | pass.lk" },
      {
        name: "description",
        content:
          "Track revenue, enrolments and pending fees, and manage class schedules for your institute.",
      },
      { property: "og:title", content: "Institution console — classes & fees" },
      {
        property: "og:description",
        content: "One console for classes, schedules and fee collection in LKR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

type ClassRow = { name: string; level: string; schedule: string; students: number; hall: string };

const initialClasses: ClassRow[] = [
  { name: "Combined Maths · Intensive", level: "A/L", schedule: "Mon & Wed · 16:00", students: 48, hall: "Hall A" },
  { name: "Physics · Problem Sprint", level: "A/L", schedule: "Tue & Thu · 15:30", students: 36, hall: "Hall B" },
  { name: "Biology · Revision Clinic", level: "O/L", schedule: "Sat · 09:00", students: 52, hall: "Online" },
  { name: "Science · Core Revision", level: "O/L", schedule: "Fri · 14:00", students: 29, hall: "Hall A" },
];

const students = [
  { name: "Amara D.", cls: "Combined Maths", amount: 4500, status: "Paid" as const },
  { name: "Rohan S.", cls: "Physics", amount: 4000, status: "Pending" as const },
  { name: "Isuru M.", cls: "Biology", amount: 3500, status: "Paid" as const },
  { name: "Nethmi P.", cls: "Science", amount: 3000, status: "Pending" as const },
  { name: "Tharindu S.", cls: "Combined Maths", amount: 4500, status: "Paid" as const },
];

function DashboardPage() {
  const [classes, setClasses] = useState(initialClasses);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", level: "A/L", schedule: "", hall: "" });

  const addClass = () => {
    if (!form.name.trim()) return;
    setClasses((c) => [
      ...c,
      {
        name: form.name,
        level: form.level,
        schedule: form.schedule || "To be scheduled",
        hall: form.hall || "Hall A",
        students: 0,
      },
    ]);
    setForm({ name: "", level: "A/L", schedule: "", hall: "" });
    setOpen(false);
  };

  return (
    <SiteShell>
      <section className="py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Institution console
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Lanka Vidya Institute</h1>
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground ring-1 ring-foreground/5"
          >
            + Create class
          </button>
        </div>

        {open && (
          <div className="rise mt-6 grid gap-3 rounded-2xl border border-card/60 bg-card/70 p-5 backdrop-blur-xl md:grid-cols-5">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Class name"
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm md:col-span-2"
            />
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <option>A/L</option>
              <option>O/L</option>
            </select>
            <input
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              placeholder="Sat · 09:00"
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            />
            <button
              onClick={addClass}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
            >
              Save class
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Metric label="REVENUE COLLECTED" value={lkr(1240000)} note="+12% vs last term" />
          <Metric label="ENROLLED" value={`${classes.reduce((a, c) => a + c.students, 0)}`} note={`${classes.length} active classes`} />
          <Metric label="FEES PENDING" value={lkr(86000)} note="14 students" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-card/60 bg-card/70 p-6 backdrop-blur-xl lg:col-span-2">
            <h2 className="text-xl font-bold tracking-tight">Classes &amp; schedule</h2>
            <div className="mt-4 divide-y divide-border">
              {classes.map((c) => (
                <div key={c.name} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      <span className="mr-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                        {c.level}
                      </span>
                      {c.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {c.schedule} · {c.hall}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {c.students} students
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-card/60 bg-card/70 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold tracking-tight">Fee status</h2>
            <div className="mt-4 space-y-3">
              {students.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {s.cls} · {lkr(s.amount)}
                    </p>
                  </div>
                  <span
                    className={
                      s.status === "Paid"
                        ? "rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                        : "rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning"
                    }
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-card/60 bg-card/70 p-5 backdrop-blur-xl">
      <p className="font-mono text-[10px] tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-medium">{value}</p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
