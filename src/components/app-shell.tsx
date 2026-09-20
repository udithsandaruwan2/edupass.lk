import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DevToolbar } from "@/components/dev-toolbar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string };

export function AppShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: readonly NavItem[] | NavItem[];
  children?: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  return (
    <div className="paper-texture min-h-screen font-sans text-foreground antialiased">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-lg font-semibold">
              edu<span className="text-primary">pass</span>
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">{title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Public site</Link>
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2">
          {nav.map((item) => {
            const active = path === item.to || path.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent-soft font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children ?? <Outlet />}</main>
      <DevToolbar />
      <Toaster />
    </div>
  );
}
