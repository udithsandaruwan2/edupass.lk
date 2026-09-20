import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Countdown({ target, className }: { target: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) {
    return (
      <div
        className={cn(
          "rounded-xl bg-accent-soft px-4 py-3 text-sm font-medium text-primary",
          className,
        )}
      >
        Seminar is underway or finished
      </div>
    );
  }

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      <Unit label="Days" value={days} />
      <Unit label="Hours" value={hours} />
      <Unit label="Mins" value={mins} />
      <Unit label="Secs" value={secs} pulse />
    </div>
  );
}

function Unit({ label, value, pulse }: { label: string; value: number; pulse?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card px-2 py-3 text-center">
      <div
        className={cn(
          "font-mono text-2xl font-semibold tabular-nums text-ink",
          pulse && "tick-pulse",
        )}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
