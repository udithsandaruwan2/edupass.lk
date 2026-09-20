import { createFileRoute } from "@tanstack/react-router";
import { useMyPayments } from "@/hooks/use-api";
import { EmptyState } from "@/components/empty-state";
import { formatLkr } from "@/services/api";
import { getStore } from "@/mocks/store";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/account/payments")({
  head: () => ({ meta: [{ title: "Payments | edupass.lk" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { data, isLoading } = useMyPayments();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Payments</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Card payments settle instantly. Bank slips stay pending until approved.
      </p>
      <div className="mt-8 space-y-3">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : data && data.length > 0 ? (
          data.map((p) => {
            const seminar = p.seminarId
              ? getStore().seminars.find((s) => s.id === p.seminarId)
              : null;
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {p.kind === "seminar_pass"
                      ? (seminar?.subject ?? "Seminar pass")
                      : "Monthly fee"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.method.replace("_", " ")} · {formatShortDate(p.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{formatLkr(p.amount)}</span>
                  <Badge
                    variant={
                      p.status === "paid" || p.status === "approved"
                        ? "default"
                        : p.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No payments yet"
            description="Purchases and fee payments will appear here."
            actionLabel="Browse seminars"
            actionTo="/seminars"
          />
        )}
      </div>
    </div>
  );
}
