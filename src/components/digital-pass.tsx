import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

export function DigitalPass({
  subject,
  level,
  medium,
  teacher,
  date,
  venue,
  seats,
  code,
  className,
}: {
  subject: string;
  level: string;
  medium: string;
  teacher: string;
  date: string;
  venue: string;
  seats: string;
  code: string;
  className?: string;
}) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(code, {
      width: 160,
      margin: 1,
      color: { dark: "#1e3a5f", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setQr(url);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div
      className={cn(
        "pass-reveal relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.38_0.14_255)] p-5 text-primary-foreground shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground/70">
            edupass.lk digital pass
          </p>
          <p className="mt-1 font-display text-xl font-semibold">{subject}</p>
          <p className="text-xs text-primary-foreground/75">
            {level} · {medium} medium
          </p>
        </div>
        <span className="rounded-md bg-card/15 px-2 py-1 font-mono text-[10px] uppercase tracking-wider">
          Gate entry
        </span>
      </div>

      <div className="my-4 h-px w-full border-t border-dashed border-primary-foreground/35" />

      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2 text-xs">
          <Row label="Lecturer" value={teacher} />
          <Row label="When" value={date} />
          <Row label="Venue" value={venue} />
          <Row label="Seats" value={seats} />
        </div>
        <div className="shrink-0">
          <div className="rounded-md bg-card p-2">
            {qr ? (
              <img src={qr} alt={`QR for ${code}`} className="size-24" />
            ) : (
              <div className="size-24 animate-pulse bg-muted" />
            )}
          </div>
          <p className="mt-1 text-center font-mono text-[10px] tracking-wider text-primary-foreground/85">
            {code}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-16 text-primary-foreground/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
