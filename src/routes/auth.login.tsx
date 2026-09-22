import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/api";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Log in | edupass.lk" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("demo");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.name}`);
      const dest =
        redirect ||
        (user.role === "admin"
          ? "/admin"
          : user.role === "organizer" || user.role === "lecturer"
            ? "/institute"
            : user.role === "scanner"
              ? "/scan"
              : "/account");
      void navigate({ to: dest });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto flex max-w-md justify-center px-5 py-10 sm:py-16">
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Log in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo accounts: student@example.com, admin@edupass.lk, scan@edupass.lk,
          organizer@lankavidya.lk — any password.
        </p>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="mt-1 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="mt-1 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/auth/signup" className="font-medium text-primary">
            Create an account
          </Link>
        </p>
        </div>
      </section>
    </SiteShell>
  );
}
