import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/reveal";
import { useLecturers } from "@/hooks/use-api";
import { lecturerPhoto } from "@/lib/images";
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
      <section className="ambient-grid mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <Reveal>
          <SectionHeader title="Lecturers" />
          <p className="-mt-4 mb-6 max-w-[46ch] text-sm text-muted-foreground sm:mb-8 sm:text-base">
            Trusted O/L and A/L masters — open a profile to see their seminar schedule.
          </p>
        </Reveal>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            className="rounded-xl border-border bg-card sm:max-w-xs"
            placeholder="Search name or subject"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search lecturers"
          />
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="rounded-xl bg-card sm:w-40" aria-label="Exam level">
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
              <Skeleton className="h-52 rounded-2xl" />
              <Skeleton className="h-52 rounded-2xl" />
              <Skeleton className="h-52 rounded-2xl" />
            </>
          ) : data && data.length > 0 ? (
            data.map((lec, i) => (
              <Reveal key={lec.id} delay={40 * i}>
                <Link
                  to="/lecturers/$slug"
                  params={{ slug: lec.slug }}
                  className="card-lift card-lift-hover block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
                >
                  <div className="flex gap-4 p-5">
                    <img
                      src={lecturerPhoto(i)}
                      alt=""
                      className="size-16 shrink-0 rounded-full object-cover ring-2 ring-border"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-semibold text-ink">{lec.name}</h2>
                      <p className="text-sm text-muted-foreground">{lec.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{lec.city}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {lec.levels.map((l) => (
                          <Badge key={l} variant="secondary">
                            {l}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
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
