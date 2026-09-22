import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Ticket,
  Wallet,
  ClipboardCheck,
  Banknote,
  CalendarDays,
  Users,
  BookOpen,
  UserRound,
  ScanLine,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DevToolbar } from "@/components/dev-toolbar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string };

const ICONS: Record<string, ReactNode> = {
  "/account": <LayoutDashboard className="size-4" />,
  "/account/passes": <Ticket className="size-4" />,
  "/account/payments": <Wallet className="size-4" />,
  "/account/attendance": <ClipboardCheck className="size-4" />,
  "/account/fees": <Banknote className="size-4" />,
  "/admin": <LayoutDashboard className="size-4" />,
  "/admin/seminars": <CalendarDays className="size-4" />,
  "/admin/lecturers": <UserRound className="size-4" />,
  "/admin/payments": <Wallet className="size-4" />,
  "/admin/passes": <Ticket className="size-4" />,
  "/admin/attendance": <ClipboardCheck className="size-4" />,
  "/institute": <LayoutDashboard className="size-4" />,
  "/institute/classes": <BookOpen className="size-4" />,
  "/institute/students": <Users className="size-4" />,
  "/institute/attendance": <ClipboardCheck className="size-4" />,
  "/institute/fees": <Banknote className="size-4" />,
  "/institute/payments": <Wallet className="size-4" />,
  "/scan": <ScanLine className="size-4" />,
  "/seminars": <CalendarDays className="size-4" />,
};

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
  const [open, setOpen] = useState(false);

  const navWithBrowse: NavItem[] = [
    ...nav,
    ...(title.includes("Student")
      ? [{ to: "/seminars", label: "Browse seminars" }]
      : title.includes("admin") || title.includes("Admin")
        ? [{ to: "/scan", label: "Gate scanner" }]
        : []),
  ];

  return (
    <div className="soft-canvas flex min-h-screen font-sans text-foreground antialiased">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" aria-hidden />
          </span>
          <div>
            <Link to="/" className="font-display text-sm font-semibold text-ink">
              edupass.lk
            </Link>
            <p className="text-[10px] text-muted-foreground">{title}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navWithBrowse.map((item) => {
            const active =
              path === item.to ||
              (item.to !== "/account" &&
                item.to !== "/admin" &&
                item.to !== "/institute" &&
                path.startsWith(`${item.to}/`)) ||
              (item.to === "/account" && path === "/account") ||
              (item.to === "/admin" && path === "/admin") ||
              (item.to === "/institute" && path === "/institute");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {ICONS[item.to] ?? <LayoutDashboard className="size-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
            <Link to="/">Public site</Link>
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <h1 className="font-display text-lg font-semibold text-ink md:text-xl">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden max-w-xs flex-1 sm:block lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search…"
                className="h-9 rounded-full border-border bg-muted/50 pl-9"
                aria-label="Search"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-primary">
                {(user?.name ?? "?").slice(0, 1)}
              </span>
              <span className="hidden text-sm font-medium sm:inline">
                {user?.name?.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        {open ? (
          <div className="border-b border-border bg-card p-3 md:hidden">
            <nav className="space-y-1">
              {navWithBrowse.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-accent-soft"
                >
                  {ICONS[item.to]}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl">{children ?? <Outlet />}</div>
        </main>
      </div>

      <DevToolbar />
      <Toaster />
    </div>
  );
}
