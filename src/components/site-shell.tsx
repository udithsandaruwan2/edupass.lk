import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { DevToolbar } from "@/components/dev-toolbar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <SiteHeader />
      <main>{children}</main>
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
    <header className="sticky top-0 z-30 border-b border-border/80 bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            edupass<span className="text-primary">.lk</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <NavLink to="/" current={path} exact>
            Home
          </NavLink>
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
          {user ? (
            <Button size="sm" className="rounded-full px-5" asChild>
              <Link to={accountHref}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link to="/auth/signup">Register</Link>
              </Button>
              <Button size="sm" className="rounded-full px-5" asChild>
                <Link to="/auth/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  current,
  children,
  exact,
}: {
  to: string;
  current: string;
  children: ReactNode;
  exact?: boolean;
}) {
  const active = exact ? current === to : current === to || current.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      className={cn(
        "transition-colors hover:text-foreground",
        active && "font-semibold text-primary",
      )}
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-20 bg-navy text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5" aria-hidden />
            <span className="font-display text-lg font-semibold">edupass.lk</span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Educational event passes and tuition tools for Sri Lanka O/L &amp; A/L.
          </p>
        </div>
        <FooterCol
          title="Passes"
          links={[
            { to: "/seminars", label: "Browse seminars" },
            { to: "/lecturers", label: "Lecturers" },
            { to: "/auth/signup", label: "Create account" },
          ]}
        />
        <FooterCol
          title="Education"
          links={[
            { to: "/pricing", label: "Institute console" },
            { to: "/account", label: "Student portal" },
            { to: "/scan", label: "Gate scanner" },
          ]}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
            Platform
          </p>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Seminar passes · QR attendance · Monthly fees · Class roster
          </p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} edupass.lk · All rights reserved
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-primary-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
