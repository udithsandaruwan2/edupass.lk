import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { DigitalPass } from "@/components/digital-pass";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  BANK_DETAILS,
  formatLkr,
  getLecturer,
  getSeminar,
  payWithCard,
  submitBankSlip,
} from "@/services/api";
import { formatSeminarWhen, readFileAsDataUrl } from "@/lib/format";
import { hydrateStore } from "@/mocks/store";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/checkout/$seminarId")({
  loader: async ({ params }) => {
    hydrateStore();
    const seminar = await getSeminar(params.seminarId);
    if (!seminar) throw notFound();
    const lecturer = await getLecturer(seminar.lecturerId);
    return { seminar, lecturer };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Checkout · ${loaderData.seminar.subject} | edupass.lk`
          : "Checkout | edupass.lk",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { seminar, lecturer } = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [seats, setSeats] = useState(1);
  const [method, setMethod] = useState<"card" | "bank_slip">("card");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);

  const total = seminar.price * seats;

  async function onSubmit() {
    if (!user) {
      toast.error("Please sign in first");
      void navigate({ to: "/auth/login", search: { redirect: `/checkout/${seminar.id}` } });
      return;
    }
    if (!user.verified) {
      toast.error("Verify your email before purchasing");
      void navigate({ to: "/auth/verify" });
      return;
    }
    setBusy(true);
    try {
      if (method === "card") {
        const { pass } = await payWithCard({ seminarId: seminar.id, seats });
        setIssuedCode(pass.code);
        toast.success("Payment received — pass issued");
      } else {
        if (!slipFile) {
          toast.error("Upload your bank slip image");
          setBusy(false);
          return;
        }
        const slipDataUrl = await readFileAsDataUrl(slipFile);
        await submitBankSlip({
          seminarId: seminar.id,
          seats,
          slipDataUrl,
          note: note || undefined,
        });
        toast.success("Slip submitted — awaiting admin approval");
        void navigate({ to: "/account/payments" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1fr_0.9fr]">
        <div className="rise space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Checkout</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {seminar.subject} · {seminar.level} · {formatSeminarWhen(seminar.startsAt)}
            </p>
          </div>

          <div className="flex items-center justify-between border-b border-border py-3 text-sm">
            <span className="text-muted-foreground">Seats</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-8"
                onClick={() => setSeats((s) => Math.max(1, s - 1))}
                aria-label="Decrease seats"
              >
                −
              </Button>
              <span className="w-6 text-center font-mono">{seats}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-8"
                onClick={() => setSeats((s) => Math.min(seminar.seatsLeft, s + 1))}
                aria-label="Increase seats"
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex justify-between border-b border-border py-3">
            <span className="font-medium">Total</span>
            <span className="font-mono text-lg">{formatLkr(total)}</span>
          </div>

          <div>
            <Label className="mb-3 block">Payment method</Label>
            <RadioGroup
              value={method}
              onValueChange={(v) => setMethod(v as "card" | "bank_slip")}
              className="gap-3"
            >
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4">
                <RadioGroupItem value="card" id="card" className="mt-0.5" />
                <div>
                  <div className="font-medium">Card payment</div>
                  <p className="text-xs text-muted-foreground">
                    Simulated card charge — pass issued immediately.
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4">
                <RadioGroupItem value="bank_slip" id="bank" className="mt-0.5" />
                <div>
                  <div className="font-medium">Bank transfer / deposit</div>
                  <p className="text-xs text-muted-foreground">
                    Transfer to our account, upload the slip, wait for admin approval.
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {method === "bank_slip" ? (
            <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Transfer to</p>
              <dl className="grid gap-1 text-muted-foreground">
                <div>
                  {BANK_DETAILS.bankName} · {BANK_DETAILS.branch}
                </div>
                <div>
                  {BANK_DETAILS.accountName} · {BANK_DETAILS.accountNumber}
                </div>
              </dl>
              <div>
                <Label htmlFor="slip">Upload slip</Label>
                <Input
                  id="slip"
                  type="file"
                  accept="image/*,.pdf"
                  className="mt-1"
                  onChange={(e) => setSlipFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div>
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                  id="note"
                  className="mt-1"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reference number or depositor name"
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="card-num">Card number</Label>
                <Input id="card-num" className="mt-1" placeholder="4242 4242 4242 4242" />
              </div>
              <div>
                <Label htmlFor="exp">Expiry</Label>
                <Input id="exp" className="mt-1" placeholder="12/28" />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" className="mt-1" placeholder="123" />
              </div>
            </div>
          )}

          <Button
            className="w-full rounded-full"
            size="lg"
            disabled={busy}
            onClick={() => void onSubmit()}
          >
            {busy ? "Processing…" : method === "card" ? "Pay & issue pass" : "Submit slip"}
          </Button>
          <Link
            to="/seminars/$id"
            params={{ id: seminar.id }}
            className="block text-center text-sm text-primary"
          >
            ← Back to seminar
          </Link>
        </div>

        <div className="rise" style={{ animationDelay: "100ms" }}>
          <DigitalPass
            subject={seminar.subject}
            level={seminar.level}
            medium={seminar.medium}
            teacher={lecturer?.name ?? "Lecturer"}
            date={formatSeminarWhen(seminar.startsAt)}
            venue={`${seminar.venue}, ${seminar.city}`}
            seats={`${seats} of ${seminar.seats}`}
            code={issuedCode ?? "PENDING"}
          />
          {issuedCode ? (
            <p className="mt-4 text-center text-sm">
              <Link to="/account/passes" className="font-medium text-primary">
                View in My passes →
              </Link>
            </p>
          ) : (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Preview — QR activates after payment or slip approval
            </p>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
