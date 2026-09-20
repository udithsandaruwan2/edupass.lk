import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { studentNav } from "@/lib/nav";
import { RequireRole } from "@/components/require-role";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

function AccountLayout() {
  return (
    <RequireRole roles={["student", "admin", "organizer", "lecturer", "scanner"]}>
      <AppShell title="Student account" nav={studentNav}>
        <Outlet />
      </AppShell>
    </RequireRole>
  );
}
