import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useFees } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatLkr, payFeeWithCard, submitFeeSlip } from "@/services/api";
import { getStore } from "@/mocks/store";
import { readFileAsDataUrl } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/account/fees")({
  head: () => ({ meta: [{ title: "Fees | edupass.lk" }] }),
  component: FeesPage,
});

function FeesPage() {
  const { user } = useAuth();
  const { data, isLoading } = useFees({ studentId: user?.id });
  const qc = useQueryClient();
  const [slipFor, setSlipFor] = useState<string | null>(null);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Monthly fees</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pay institute tuition by card or bank slip.
      </p>
      <div className="mt-8 space-y-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : data && data.length > 0 ? (
          data.map((fee) => {
            const cls = getStore().classes.find((c) => c.id === fee.classId);
            return (
              <div key={fee.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{cls?.name ?? "Class"}</p>
                    <p className="text-xs text-muted-foreground">
                      {fee.month} · {formatLkr(fee.amount)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      fee.status === "paid" || fee.status === "approved" ? "default" : "secondary"
                    }
                  >
                    {fee.status}
                  </Badge>
                </div>
                {fee.status === "pending" && !fee.paymentId ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        void payFeeWithCard(fee.id)
                          .then(() => {
                            toast.success("Fee paid by card");
                            void qc.invalidateQueries({ queryKey: ["fees"] });
                          })
                          .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"));
                      }}
                    >
                      Pay by card
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSlipFor(fee.id)}>
                      Upload bank slip
                    </Button>
                  </div>
                ) : null}
                {slipFor === fee.id ? (
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    <Label htmlFor={`slip-${fee.id}`}>Slip image</Label>
                    <Input
                      id={`slip-${fee.id}`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void readFileAsDataUrl(file).then((url) =>
                          submitFeeSlip({ feeId: fee.id, slipDataUrl: url }).then(() => {
                            toast.success("Slip submitted");
                            setSlipFor(null);
                            void qc.invalidateQueries({ queryKey: ["fees"] });
                          }),
                        );
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No fees on file"
            description="When an institute enrols you in a class, monthly fees appear here."
          />
        )}
      </div>
    </div>
  );
}
