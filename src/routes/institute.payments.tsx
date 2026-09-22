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

export const Route = createFileRoute("/institute/payments")({
  head: () => ({ meta: [{ title: "Fee slips | edupass.lk" }] }),
  component: InstitutePayments,
});

function InstitutePayments() {
  const { data, isLoading } = usePendingPayments();
  const approve = useApprovePayment();
  const slips = (data ?? []).filter((p) => p.kind === "monthly_fee");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Fee slip approval</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Approve student bank transfers for monthly tuition.
      </p>
      <div className="mt-8 space-y-4">
        {isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : slips.length > 0 ? (
          slips.map((p) => {
            const user = getStore().users.find((u) => u.id === p.userId);
            const fee = getStore().fees.find((f) => f.id === p.feeId);
            const cls = fee ? getStore().classes.find((c) => c.id === fee.classId) : null;
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {user?.name} · {cls?.name ?? "Class"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDate(p.createdAt)} · {formatLkr(p.amount)}
                    </p>
                  </div>
                  <Badge variant="secondary">pending</Badge>
                </div>
                {p.slipDataUrl ? (
                  <img
                    src={p.slipDataUrl}
                    alt="Fee slip"
                    className="mt-3 max-h-40 rounded-lg border border-border object-contain"
                  />
                ) : null}
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      approve.mutate(
                        { id: p.id, approve: true },
                        { onSuccess: () => toast.success("Fee approved") },
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      approve.mutate(
                        { id: p.id, approve: false },
                        { onSuccess: () => toast.message("Rejected") },
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No pending fee slips"
            description="Student bank slip uploads for monthly fees appear here."
          />
        )}
      </div>
    </div>
  );
}
