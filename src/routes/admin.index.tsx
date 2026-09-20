import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminStats } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin | edupass.lk" }] }),
  component: AdminHome,
});

function AdminHome() {
  const { data, isLoading } = useAdminStats();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Admin overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage seminars, lecturers, slip approvals and attendance.
      </p>
      {isLoading || !data ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Seminars" value={data.seminars} />
          <Stat label="Passes issued" value={data.passes} />
          <Stat label="Pending slips" value={data.pendingSlips} href="/admin/payments" />
          <Stat label="Gate check-ins" value={data.checkedIn} href="/admin/attendance" />
        </div>
      )}
      <p className="mt-8 text-sm">
        <Link to="/scan" className="font-medium text-primary">
          Open gate scanner →
        </Link>
      </p>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold">{value}</p>
    </>
  );
  if (href) {
    return (
      <Link to={href} className="rounded-xl border border-border bg-card p-4 hover:shadow-md">
        {inner}
      </Link>
    );
  }
  return <div className="rounded-xl border border-border bg-card p-4">{inner}</div>;
}
