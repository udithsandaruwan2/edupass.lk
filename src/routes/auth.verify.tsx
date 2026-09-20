import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyEmail } from "@/services/api";
import { RequireRole } from "@/components/require-role";

export const Route = createFileRoute("/auth/verify")({
  head: () => ({ meta: [{ title: "Verify email | edupass.lk" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  return (
    <RequireRole roles={["student", "admin", "organizer", "lecturer", "scanner"]}>
      <SiteShell>
        <VerifyForm />
      </SiteShell>
    </RequireRole>
  );
}

function VerifyForm() {
  const navigate = useNavigate();
  const [code, setCode] = useState("123456");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await verifyEmail(code);
      toast.success("Email verified");
      void navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the 6-digit code from your inbox. Demo code is always{" "}
        <span className="font-mono text-foreground">123456</span>.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            className="mt-1 font-mono tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            inputMode="numeric"
            maxLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </section>
  );
}
