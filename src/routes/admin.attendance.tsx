import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAttendance } from "@/services/api";
import { EmptyState } from "@/components/empty-state";
import { getStore } from "@/mocks/store";
import { formatShortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({ meta: [{ title: "Attendance | edupass.lk" }] }),
  component: AdminAttendance,
});

function AdminAttendance() {
  const { data, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => listAttendance(),
  });

  const gate = (data ?? []).filter((a) => a.passId);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Seminar attendance</h1>
      <p className="mt-1 text-sm text-muted-foreground">Gate check-ins from QR scans.</p>
      <div className="mt-8 space-y-2">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : gate.length > 0 ? (
          gate.map((a) => {
            const seminar = getStore().seminars.find((s) => s.id === a.seminarId);
            const user = getStore().users.find((u) => u.id === a.studentId);
            return (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {seminar?.subject} · {formatShortDate(a.markedAt)}
                  </p>
                </div>
                <Badge>Present</Badge>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No check-ins yet"
            description="Use the gate scanner to mark attendance."
            actionLabel="Open scanner"
            actionTo="/scan"
          />
        )}
      </div>
    </div>
  );
}
