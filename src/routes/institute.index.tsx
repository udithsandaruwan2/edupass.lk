import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useClasses, useFees } from "@/hooks/use-api";
import { getStore } from "@/mocks/store";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/institute/")({
  head: () => ({ meta: [{ title: "Institute | edupass.lk" }] }),
  component: InstituteHome,
});

function InstituteHome() {
  const { user } = useAuth();
  const instituteId = user?.instituteId ?? "inst-lvi";
  const institute = getStore().institutes.find((i) => i.id === instituteId);
  const { data: classes, isLoading: cLoading } = useClasses(instituteId);
  const { data: fees, isLoading: fLoading } = useFees();

  const pendingFees = (fees ?? []).filter(
    (f) => f.status === "pending" && classes?.some((c) => c.id === f.classId),
  ).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{institute?.name ?? "Institute"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Classes, attendance and monthly fees — separate from the public seminar marketplace.
      </p>
      {cLoading || fLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card label="Classes" value={classes?.length ?? 0} to="/institute/classes" />
          <Card
            label="Enrolled students"
            value={new Set(classes?.flatMap((c) => c.studentIds) ?? []).size}
            to="/institute/students"
          />
          <Card label="Pending fees" value={pendingFees} to="/institute/fees" />
        </div>
      )}
    </div>
  );
}

function Card({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link to={to} className="rounded-xl border border-border bg-card p-4 hover:shadow-md">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold">{value}</p>
    </Link>
  );
}
