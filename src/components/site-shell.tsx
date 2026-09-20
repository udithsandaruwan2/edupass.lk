import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-32 size-[520px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-24 right-[-120px] size-[460px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[520px] rounded-full bg-chart-5/20 blur-3xl" />
      </div>

      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-card/50 bg-card/55 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-medium tracking-tight text-foreground">
            pass<span className="text-accent">.lk</span>
          </span>
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            O/L &amp; A/L seminar passes
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/seminars" activeProps={{ className: "text-foreground" }}>
            Seminars
          </Link>
          <Link to="/pricing" activeProps={{ className: "text-foreground" }}>
            Pricing
          </Link>
          <Link to="/dashboard" activeProps={{ className: "text-foreground" }}>
            Institutions
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground"
          >
            Log in
          </Link>
          <Link
            to="/seminars"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            Get a pass
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-card/50 bg-card/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground md:flex-row">
        <span className="font-mono text-foreground">
          pass<span className="text-accent">.lk</span>
        </span>
        <span>Seminars · Passes · Fee handling for Sri Lankan institutes</span>
        <span>© 2025</span>
      </div>
    </footer>
  );
}
