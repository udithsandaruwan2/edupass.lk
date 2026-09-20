import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({
  head: () => ({ meta: [{ title: "Account | edupass.lk" }] }),
  component: AccountOverview,
});

function AccountOverview() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      {!user?.verified ? (
        <div className="mt-6 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          Email not verified.{" "}
          <Link to="/auth/verify" className="font-medium text-primary underline">
            Verify now
          </Link>
        </div>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <QuickLink to="/account/passes" title="My passes" desc="Digital QR passes for seminars" />
        <QuickLink to="/account/payments" title="Payments" desc="Card charges and bank slips" />
        <QuickLink to="/account/attendance" title="Attendance" desc="Check-ins and class marks" />
        <QuickLink to="/account/fees" title="Monthly fees" desc="Institute tuition balances" />
      </div>
      <Button
        variant="outline"
        className="mt-10"
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

function QuickLink({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <div className="font-display text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
