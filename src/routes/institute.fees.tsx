import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useClasses, useFees } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatLkr, markFeeCash } from "@/services/api";
import { getStore } from "@/mocks/store";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/institute/fees")({
  head: () => ({ meta: [{ title: "Fees | edupass.lk" }] }),
  component: InstituteFees,
});

function InstituteFees() {
  const { user } = useAuth();
  const instituteId = user?.instituteId ?? "inst-lvi";
  const { data: classes } = useClasses(instituteId);
  const classIds = new Set((classes ?? []).map((c) => c.id));
  const { data: fees, isLoading } = useFees();
  const qc = useQueryClient();
  const list = (fees ?? []).filter((f) => classIds.has(f.classId));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Monthly fees</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Record cash payments or wait for student card / slip payments.
      </p>
      <div className="mt-8 space-y-3">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : list.length > 0 ? (
          list.map((fee) => {
            const cls = getStore().classes.find((c) => c.id === fee.classId);
            const student = getStore().users.find((u) => u.id === fee.studentId);
            return (
              <div
                key={fee.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {student?.name} · {cls?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fee.month} · {formatLkr(fee.amount)}
                    {fee.paidMethod ? ` · ${fee.paidMethod}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      fee.status === "paid" || fee.status === "approved" ? "default" : "secondary"
                    }
                  >
                    {fee.status}
                  </Badge>
                  {fee.status === "pending" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        void markFeeCash(fee.id).then(() => {
                          toast.success("Marked paid (cash)");
                          void qc.invalidateQueries({ queryKey: ["fees"] });
                        });
                      }}
                    >
                      Cash received
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No fees"
            description="Fees appear when students are on class rosters."
          />
        )}
      </div>
    </div>
  );
}
