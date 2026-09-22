import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPasses } from "@/services/api";
import { EmptyState } from "@/components/empty-state";
import { getStore } from "@/mocks/store";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/passes")({
  head: () => ({ meta: [{ title: "Passes | edupass.lk" }] }),
  component: AdminPasses,
});

function AdminPasses() {
  const { data, isLoading } = useQuery({
    queryKey: ["passes"],
    queryFn: () => listPasses(),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Issued passes</h1>
      <div className="mt-8 space-y-2">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : data && data.length > 0 ? (
          data.map((p) => {
            const seminar = getStore().seminars.find((s) => s.id === p.seminarId);
            const user = getStore().users.find((u) => u.id === p.userId);
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{p.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {seminar?.subject} · {user?.name} · {formatShortDate(p.issuedAt)}
                  </p>
                </div>
                <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No passes issued"
            description="Approved payments create passes here."
          />
        )}
      </div>
    </div>
  );
}
