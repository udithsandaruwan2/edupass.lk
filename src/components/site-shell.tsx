import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DevToolbar } from "@/components/dev-toolbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="paper-texture min-h-screen font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5">{children}</main>
      <SiteFooter />
      <DevToolbar />
      <Toaster />
    </div>
  );
}

function SiteHeader() {
  const { user, role } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const accountHref =
    role === "admin"
      ? "/admin"
      : role === "organizer" || role === "lecturer"
        ? "/institute"
        : role === "scanner"
          ? "/scan"
          : user
            ? "/account"
            : "/auth/login";

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            edu<span className="text-primary">pass</span>
            <span className="text-muted-foreground">.lk</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <NavLink to="/seminars" current={path}>
            Seminars
          </NavLink>
          <NavLink to="/lecturers" current={path}>
            Lecturers
          </NavLink>
          <NavLink to="/pricing" current={path}>
            For institutes
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={accountHref}>{user ? user.name.split(" ")[0] : "Log in"}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/seminars">Get a pass</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, current, children }: { to: string; current: string; children: ReactNode }) {
  const active = current === to || current.startsWith(`${to}/`);
  return (
    <Link to={to} className={cn(active && "font-medium text-foreground")}>
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center">
        <span className="font-display text-base text-foreground">
          edu<span className="text-primary">pass</span>.lk
        </span>
        <span>O/L &amp; A/L seminar passes · tuition class ops for Sri Lanka</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
