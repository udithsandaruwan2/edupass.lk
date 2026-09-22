import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

/** Oversized 3D digital pass for the marketing hero — CSS perspective, rings, wiggle + periodic spin. */
export function HeroPass3D({ className }: { className?: string }) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL("EDU-HERO-DEMO", {
      width: 140,
      margin: 1,
      color: { dark: "#0f1c3d", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setQr(url);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={cn(
        "hero-pass-stage relative mx-auto flex aspect-square w-full max-w-[min(100%,420px)] items-center justify-center lg:max-w-none",
        className,
      )}
      aria-hidden
    >
      {/* Orbital rings under / around the pass */}
      <div className="hero-ring hero-ring-a pointer-events-none absolute inset-[6%] rounded-full" />
      <div className="hero-ring hero-ring-b pointer-events-none absolute inset-[14%] rounded-full" />
      <div className="hero-ring hero-ring-c pointer-events-none absolute inset-[22%] rounded-full" />

      {/* Soft floor glow */}
      <div className="pointer-events-none absolute bottom-[12%] left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[100%] bg-primary/35 blur-2xl" />

      <div className="hero-pass-orbit relative z-10 w-[72%] max-w-[280px] sm:max-w-[300px] lg:max-w-[320px]">
        <div className="hero-pass-wiggle">
          <div className="hero-pass-card relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[oklch(0.52_0.17_255)] via-[oklch(0.42_0.15_255)] to-[oklch(0.28_0.08_255)] p-5 text-primary-foreground shadow-[0_30px_60px_-20px_rgba(15,28,61,0.65),0_0_40px_-10px_oklch(0.55_0.18_255_/_0.45)]">
            <div className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-6 size-28 rounded-full bg-primary/40 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-primary-foreground/70 uppercase">
                  edupass.lk
                </p>
                <p className="mt-1 font-display text-xl font-semibold leading-tight sm:text-2xl">
                  Combined Maths
                </p>
                <p className="mt-0.5 text-xs text-primary-foreground/75">A/L · English medium</p>
              </div>
              <span className="rounded-md bg-card/15 px-2 py-1 font-mono text-[10px] tracking-wider uppercase">
                Live
              </span>
            </div>

            <div className="relative my-4 h-px w-full border-t border-dashed border-primary-foreground/35" />

            <div className="relative flex items-end justify-between gap-3">
              <div className="space-y-1.5 text-[11px] sm:text-xs">
                <Meta label="Lecturer" value="K. Perera" />
                <Meta label="When" value="Sat 9:00 AM" />
                <Meta label="Venue" value="Colombo BMICH" />
              </div>
              <div className="shrink-0">
                <div className="rounded-lg bg-card p-1.5 shadow-sm">
                  {qr ? (
                    <img src={qr} alt="" className="size-[4.5rem] sm:size-20" />
                  ) : (
                    <div className="size-[4.5rem] animate-pulse bg-muted sm:size-20" />
                  )}
                </div>
                <p className="mt-1 text-center font-mono text-[9px] tracking-wider text-primary-foreground/80">
                  EDU-HERO-DEMO
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-14 text-primary-foreground/55">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
