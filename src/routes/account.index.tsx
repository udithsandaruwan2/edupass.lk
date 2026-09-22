import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Ticket, Wallet, ClipboardCheck, Banknote } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMyPasses, useMyPayments, useFees } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/section-header";
import { logout } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({
  head: () => ({ meta: [{ title: "Account | edupass.lk" }] }),
  component: AccountOverview,
});

function AccountOverview() {
  const { user } = useAuth();
  const { data: passes } = useMyPasses();
  const { data: payments } = useMyPayments();
  const { data: fees } = useFees({ studentId: user?.id });

  const activePasses = (passes ?? []).filter((p) => p.status === "active").length;
  const pendingPay = (payments ?? []).filter((p) => p.status === "pending").length;
  const dueFees = (fees ?? []).filter((f) => f.status === "pending").length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Welcome, {user?.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        {!user?.verified ? (
          <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
            Email not verified.{" "}
            <Link to="/auth/verify" className="font-medium text-primary underline">
              Verify now
            </Link>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          icon={<Ticket className="size-5" />}
          label="Active passes"
          value={activePasses}
          to="/account/passes"
        />
        <Metric
          icon={<Wallet className="size-5" />}
          label="Pending payments"
          value={pendingPay}
          to="/account/payments"
        />
        <Metric
          icon={<Banknote className="size-5" />}
          label="Fees due"
          value={dueFees}
          to="/account/fees"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickLink
          to="/account/passes"
          icon={<Ticket className="size-5" />}
          title="My passes"
          desc="Digital QR passes for seminars"
        />
        <QuickLink
          to="/account/payments"
          icon={<Wallet className="size-5" />}
          title="Payments"
          desc="Card charges and bank slips"
        />
        <QuickLink
          to="/account/attendance"
          icon={<ClipboardCheck className="size-5" />}
          title="Attendance"
          desc="Check-ins and class marks"
        />
        <QuickLink
          to="/account/fees"
          icon={<Banknote className="size-5" />}
          title="Monthly fees"
          desc="Institute tuition balances"
        />
      </div>

      <Button
        variant="outline"
        className="rounded-xl"
        onClick={() => {
          void logout().then(() => {
            toast.success("Signed out");
            window.location.href = "/";
          });
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  to,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  to: string;
}) {
  return (
    <Link to={to}>
      <DashboardCard className="card-lift card-lift-hover transition-shadow">
        <div className="flex items-center gap-3 text-primary">{icon}</div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-3xl font-semibold text-ink">{value}</p>
      </DashboardCard>
    </Link>
  );
}

function QuickLink({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link to={to} className="block">
      <DashboardCard className="card-lift card-lift-hover flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-primary">
          {icon}
        </div>
        <div>
          <div className="font-display text-lg font-semibold">{title}</div>
          <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
        </div>
      </DashboardCard>
    </Link>
  );
}
