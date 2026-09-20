import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { SeminarCard } from "@/components/seminar-card";
import { EmptyState } from "@/components/empty-state";
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
      { title: "Seminars — O/L & A/L | edupass.lk" },
      {
        name: "description",
        content: "Browse upcoming O/L and A/L seminars across Sri Lanka and book a digital pass.",
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
      <section className="py-12">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Upcoming seminars
        </h1>
        <p className="mt-2 max-w-[48ch] text-muted-foreground">
          Filter by exam level, medium and city. Every pass includes a QR code for gate check-in.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search subject or venue"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search seminars"
          />
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger aria-label="Exam level">
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
            <SelectTrigger aria-label="Medium">
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
            <SelectTrigger aria-label="City">
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

        <div className="mt-10 divide-y divide-border border-t border-border">
          {isLoading ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid gap-x-10 md:grid-cols-2">
              {data.map((seminar, i) => (
                <SeminarCard key={seminar.id} seminar={seminar} delay={40 * i} />
              ))}
            </div>
          ) : (
            <div className="py-8">
              <EmptyState
                title="No seminars match"
                description="Try clearing a filter or check back soon for new revision sessions."
                actionLabel="Clear search"
                actionTo="/seminars"
              />
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
