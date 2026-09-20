import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { instituteNav } from "@/lib/nav";
import { RequireRole } from "@/components/require-role";

export const Route = createFileRoute("/institute")({
  component: InstituteLayout,
});

function InstituteLayout() {
  return (
    <RequireRole roles={["organizer", "lecturer", "admin"]}>
      <AppShell title="Institute console" nav={instituteNav}>
        <Outlet />
      </AppShell>
    </RequireRole>
  );
}
