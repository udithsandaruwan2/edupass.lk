import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { useLecturers } from "@/hooks/use-api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/lecturers")({
  head: () => ({
    meta: [
      { title: "Lecturers | edupass.lk" },
      {
        name: "description",
        content: "Browse O/L and A/L tuition lecturers and their upcoming seminar passes.",
      },
    ],
  }),
  component: LecturersPage,
});

function LecturersPage() {
  const [level, setLevel] = useState("All");
  const [q, setQ] = useState("");
  const { data, isLoading } = useLecturers({ level, q: q || undefined });

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <SectionHeader title="Lecturers" />
        <p className="-mt-4 mb-8 max-w-[48ch] text-muted-foreground">
          Find trusted O/L and A/L masters, then open their seminar schedule.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            className="rounded-xl sm:max-w-xs"
            placeholder="Search name or subject"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search lecturers"
          />
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="rounded-xl sm:w-40" aria-label="Exam level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["All", "O/L", "A/L"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v === "All" ? "All levels" : v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </>
          ) : data && data.length > 0 ? (
            data.map((lec, i) => (
              <Link
                key={lec.id}
                to="/lecturers/$slug"
                params={{ slug: lec.slug }}
                className="rise card-lift card-lift-hover block rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className="flex size-14 items-center justify-center rounded-full font-display text-lg font-semibold text-primary-foreground"
                  style={{ background: `oklch(0.55 0.14 ${lec.photoHue})` }}
                  aria-hidden
                >
                  {lec.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold">{lec.name}</h2>
                <p className="text-sm text-muted-foreground">{lec.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">{lec.city}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {lec.levels.map((l) => (
                    <Badge key={l} variant="secondary">
                      {l}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))
          ) : (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                title="No lecturers found"
                description="Try a different search or level filter."
              />
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
