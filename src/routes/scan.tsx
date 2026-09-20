import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { RequireRole } from "@/components/require-role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkInPass, getPassByCode } from "@/services/api";
import { getStore } from "@/mocks/store";
import { formatSeminarWhen } from "@/lib/format";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Gate scanner | edupass.lk" }] }),
  component: ScanPage,
});

function ScanPage() {
  return (
    <RequireRole roles={["scanner", "admin"]}>
      <SiteShell>
        <Scanner />
      </SiteShell>
    </RequireRole>
  );
}

function Scanner() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  async function onCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await checkInPass(code.trim());
      const seminar = getStore().seminars.find((s) => s.id === result.pass.seminarId);
      const user = getStore().users.find((u) => u.id === result.pass.userId);
      setLast(
        `${user?.name ?? "Student"} · ${seminar?.subject ?? "Seminar"} · ${result.pass.code}`,
      );
      toast.success("Checked in");
      setCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function preview() {
    const pass = await getPassByCode(code.trim());
    if (!pass) {
      toast.error("Pass not found");
      return;
    }
    const seminar = getStore().seminars.find((s) => s.id === pass.seminarId);
    toast.message(
      `${pass.code} · ${seminar?.subject ?? ""} · ${formatSeminarWhen(seminar?.startsAt ?? "")} · ${pass.status}`,
    );
  }

  return (
    <section className="mx-auto max-w-md py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Gate scanner</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter or paste the pass code from the QR (camera scanning can plug in later). Demo: buy a
        pass first, then paste its code here.
      </p>
      <form onSubmit={(e) => void onCheckIn(e)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="code">Pass code</Label>
          <Input
            id="code"
            className="mt-1 font-mono text-lg tracking-wide"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="EDU-XXX-XXXX"
            required
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" size="lg" disabled={busy}>
            {busy ? "Checking…" : "Check in"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => void preview()}>
            Preview
          </Button>
        </div>
      </form>
      {last ? (
        <div className="mt-8 rounded-xl border border-success/40 bg-success/10 p-4 text-sm">
          Last check-in: {last}
        </div>
      ) : null}
    </section>
  );
}
