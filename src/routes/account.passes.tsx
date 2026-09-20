import { createFileRoute } from "@tanstack/react-router";
import { useMyPasses } from "@/hooks/use-api";
import { DigitalPass } from "@/components/digital-pass";
import { EmptyState } from "@/components/empty-state";
import { getStore } from "@/mocks/store";
import { formatSeminarWhen } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/account/passes")({
  head: () => ({ meta: [{ title: "My passes | edupass.lk" }] }),
  component: PassesPage,
});

function PassesPage() {
  const { data, isLoading } = useMyPasses();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">My passes</h1>
      <p className="mt-1 text-sm text-muted-foreground">Show the QR at the seminar gate.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
          </>
        ) : data && data.length > 0 ? (
          data.map((pass) => {
            const seminar = getStore().seminars.find((s) => s.id === pass.seminarId);
            const lecturer = getStore().lecturers.find((l) => l.id === seminar?.lecturerId);
            if (!seminar) return null;
            return (
              <div key={pass.id}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant={pass.status === "active" ? "default" : "secondary"}>
                    {pass.status}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">{pass.code}</span>
                </div>
                <DigitalPass
                  subject={seminar.subject}
                  level={seminar.level}
                  medium={seminar.medium}
                  teacher={lecturer?.name ?? "Lecturer"}
                  date={formatSeminarWhen(seminar.startsAt)}
                  venue={`${seminar.venue}, ${seminar.city}`}
                  seats={`${pass.seats} seat(s)`}
                  code={pass.code}
                />
              </div>
            );
          })
        ) : (
          <div className="md:col-span-2">
            <EmptyState
              title="No passes yet"
              description="Book an O/L or A/L seminar to get your first digital pass."
              actionLabel="Browse seminars"
              actionTo="/seminars"
            />
          </div>
        )}
      </div>
    </div>
  );
}
