import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useApprovePayment, usePendingPayments } from "@/hooks/use-api";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatLkr } from "@/services/api";
import { getStore } from "@/mocks/store";
import { formatShortDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Slip approval | edupass.lk" }] }),
  component: AdminPayments,
});

function AdminPayments() {
  const { data, isLoading } = usePendingPayments();
  const approve = useApprovePayment();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Bank slip approval</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Approve seminar pass slips. Institute fee slips are handled in the institute console.
      </p>
      <div className="mt-8 space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : data && data.filter((p) => p.kind === "seminar_pass").length > 0 ? (
          data
            .filter((p) => p.kind === "seminar_pass")
            .map((p) => {
              const seminar = getStore().seminars.find((s) => s.id === p.seminarId);
              const user = getStore().users.find((u) => u.id === p.userId);
              return (
                <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {seminar?.subject ?? "Seminar"} · {p.seats} seat(s)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.name} · {formatShortDate(p.createdAt)} · {formatLkr(p.amount)}
                      </p>
                      {p.slipNote ? (
                        <p className="mt-1 text-xs text-muted-foreground">Note: {p.slipNote}</p>
                      ) : null}
                    </div>
                    <Badge variant="secondary">pending</Badge>
                  </div>
                  {p.slipDataUrl ? (
                    <img
                      src={p.slipDataUrl}
                      alt="Bank slip"
                      className="mt-3 max-h-48 rounded-lg border border-border object-contain"
                    />
                  ) : null}
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      disabled={approve.isPending}
                      onClick={() => {
                        approve.mutate(
                          { id: p.id, approve: true },
                          {
                            onSuccess: () => toast.success("Approved — pass issued"),
                            onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
                          },
                        );
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={approve.isPending}
                      onClick={() => {
                        approve.mutate(
                          { id: p.id, approve: false },
                          { onSuccess: () => toast.message("Rejected") },
                        );
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })
        ) : (
          <EmptyState
            title="No pending slips"
            description="Bank transfer submissions for seminar passes will appear here."
          />
        )}
      </div>
    </div>
  );
}
