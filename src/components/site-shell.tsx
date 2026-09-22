import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { DevToolbar } from "@/components/dev-toolbar";
import { StudioBot } from "@/components/studio-bot";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/seminars", label: "Seminars" },
  { to: "/lecturers", label: "Lecturers" },
  { to: "/pricing", label: "Institutes" },
] as const;

export function SiteShell({
  children,
  heroOverlay = false,
}: {
  children: ReactNode;
  /** When true, nav sits over a full-bleed hero (home). */
  heroOverlay?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-background font-sans text-foreground antialiased">
      <FloatingNav heroOverlay={heroOverlay} />
      <main className={cn(!heroOverlay && "pt-[4.75rem] sm:pt-[5.25rem]")}>{children}</main>
      <SiteFooter />
      <StudioBot />
      <DevToolbar />
      <Toaster />
    </div>
  );
}

function FloatingNav({ heroOverlay }: { heroOverlay: boolean }) {
  const { user, role } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Soft glass over light hero; denser glass after scroll / menu open
  const onHero = heroOverlay && !scrolled && !open;
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
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-6xl overflow-hidden rounded-2xl border transition-[background,border-color,box-shadow,backdrop-filter] duration-300",
          onHero
            ? "border-primary/15 bg-card/55 shadow-[0_8px_28px_-14px_oklch(0.45_0.12_255_/_0.28)] backdrop-blur-xl"
            : "border-border/70 bg-card/80 shadow-[var(--shadow-card)] backdrop-blur-xl",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-[3.6rem] sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:size-9">
              <GraduationCap className="size-4 sm:size-5" aria-hidden />
            </span>
            <span className="truncate font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
              edupass
              <span className="text-primary">.lk</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                current={path}
                exact={"exact" in item ? item.exact : false}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <Button size="sm" className="hidden rounded-full px-4 sm:inline-flex" asChild>
                <Link to={accountHref}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex" asChild>
                  <Link to="/auth/signup">Register</Link>
                </Button>
                <Button size="sm" className="rounded-full px-4" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile panel */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 md:hidden",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <nav className="flex flex-col gap-1 border-t border-border/60 px-3 py-3">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <Link
                  to={accountHref}
                  className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/auth/signup"
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  Register
                </Link>
              )}
            </nav>
          </div>
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
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-accent-soft font-semibold text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy text-primary-foreground sm:mt-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5" aria-hidden />
            <span className="font-display text-lg font-semibold">edupass.lk</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
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
