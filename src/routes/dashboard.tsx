import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionUser } from "@/services/api";
import { hydrateStore } from "@/mocks/store";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    hydrateStore();
    const user = getSessionUser();
    if (!user) throw redirect({ to: "/auth/login" });
    if (user.role === "admin") throw redirect({ to: "/admin" });
    if (user.role === "organizer" || user.role === "lecturer") {
      throw redirect({ to: "/institute" });
    }
    if (user.role === "scanner") throw redirect({ to: "/scan" });
    throw redirect({ to: "/account" });
  },
  component: () => null,
});
