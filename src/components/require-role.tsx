import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { UserRole } from "@/domain/types";
import { useAuth } from "@/hooks/use-auth";

export function RequireRole({
  roles,
  children,
  redirectTo = "/auth/login",
}: {
  roles: UserRole[];
  children: ReactNode;
  redirectTo?: string;
}) {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const ok = roles.includes(role);

  useEffect(() => {
    if (!ok) {
      void navigate({ to: redirectTo });
    }
  }, [ok, navigate, redirectTo]);

  if (!ok) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        {user ? "You do not have access to this area." : "Redirecting to sign in…"}
      </div>
    );
  }

  return <>{children}</>;
}
