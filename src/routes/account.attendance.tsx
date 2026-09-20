import { createFileRoute } from "@tanstack/react-router";
import { useMyAttendance } from "@/hooks/use-api";
import { EmptyState } from "@/components/empty-state";
import { getStore } from "@/mocks/store";
import { formatShortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/account/attendance")({
  head: () => ({ meta: [{ title: "Attendance | edupass.lk" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  const { data, isLoading } = useMyAttendance();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Attendance</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Seminar gate scans and institute class marks.
      </p>
      <div className="mt-8 space-y-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : data && data.length > 0 ? (
          data.map((a) => {
            const seminar = a.seminarId
              ? getStore().seminars.find((s) => s.id === a.seminarId)
              : null;
            const cls = a.classId ? getStore().classes.find((c) => c.id === a.classId) : null;
            return (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{seminar?.subject ?? cls?.name ?? "Session"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatShortDate(a.markedAt)}
                    {a.passId ? " · Gate scan" : " · Class"}
                  </p>
                </div>
                <Badge variant={a.present ? "default" : "destructive"}>
                  {a.present ? "Present" : "Absent"}
                </Badge>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No attendance yet"
            description="After a gate scan or class mark, records show up here."
          />
        )}
      </div>
    </div>
  );
}
