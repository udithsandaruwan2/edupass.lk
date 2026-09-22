import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { adminNav } from "@/lib/nav";
import { RequireRole } from "@/components/require-role";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RequireRole roles={["admin"]}>
      <AppShell title="Platform admin" nav={adminNav}>
        <Outlet />
      </AppShell>
    </RequireRole>
  );
}
