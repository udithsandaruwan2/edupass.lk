import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { SeminarCard } from "@/components/seminar-card";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/reveal";
import { useSeminars } from "@/hooks/use-api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/seminars")({
  head: () => ({
    meta: [
      { title: "Seminar passes — O/L & A/L | edupass.lk" },
      {
        name: "description",
        content:
          "Browse upcoming O/L and A/L seminar passes across Sri Lanka and book a digital pass.",
      },
    ],
  }),
  component: SeminarsPage,
});

function SeminarsPage() {
  const [level, setLevel] = useState("All");
  const [medium, setMedium] = useState("All");
  const [city, setCity] = useState("All");
  const [q, setQ] = useState("");
  const { data: allSeminars } = useSeminars();
  const { data, isLoading } = useSeminars({ level, medium, city, q: q || undefined });

  const cities = useMemo(() => {
    const set = new Set((allSeminars ?? []).map((s) => s.city));
    return ["All", ...Array.from(set).sort()];
  }, [allSeminars]);

  return (
    <SiteShell>
      <section className="ambient-grid">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <Reveal>
            <SectionHeader title="Seminar passes" />
            <p className="-mt-4 mb-8 max-w-[48ch] text-muted-foreground">
              Filter by exam level, medium and city. Every pass includes a QR code for gate
              check-in.
            </p>
          </Reveal>

          <div className="grid gap-3 rounded-2xl border border-border bg-card/90 p-4 shadow-[var(--shadow-card)] backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Search subject or venue"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search seminars"
              className="rounded-xl"
            />
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger aria-label="Exam level" className="rounded-xl">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {["All", "O/L", "A/L"].map((v) => (
                  <SelectItem key={v} value={v}>
                    {v === "All" ? "All levels" : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={medium} onValueChange={setMedium}>
              <SelectTrigger aria-label="Medium" className="rounded-xl">
                <SelectValue placeholder="Medium" />
              </SelectTrigger>
              <SelectContent>
                {["All", "Sinhala", "English", "Tamil"].map((v) => (
                  <SelectItem key={v} value={v}>
                    {v === "All" ? "All mediums" : `${v} medium`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger aria-label="City" className="rounded-xl">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v === "All" ? "All cities" : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-10">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-80 rounded-2xl" />
                <Skeleton className="h-80 rounded-2xl" />
                <Skeleton className="h-80 rounded-2xl" />
              </div>
            ) : data && data.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((seminar, i) => (
                  <Reveal key={seminar.id} delay={35 * i}>
                    <SeminarCard seminar={seminar} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No seminars match"
                description="Try clearing a filter or check back soon for new revision sessions."
                actionLabel="Clear search"
                actionTo="/seminars"
              />
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
