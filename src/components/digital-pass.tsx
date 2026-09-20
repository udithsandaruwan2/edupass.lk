const QR_GRID = [
  [1, 1, 0, 1, 1],
  [1, 0, 1, 0, 1],
  [0, 1, 1, 1, 0],
  [1, 1, 0, 1, 1],
  [1, 0, 1, 0, 1],
];

export function DigitalPass({
  subject,
  level,
  medium,
  teacher,
  date,
  venue,
  seats,
  code,
}: {
  subject: string;
  level: string;
  medium: string;
  teacher: string;
  date: string;
  venue: string;
  seats: string;
  code: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-chart-4 p-5 text-accent-foreground ring-1 ring-card/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-foreground/70">
            Digital pass
          </p>
          <p className="mt-1 text-lg font-semibold">{subject}</p>
          <p className="text-xs text-accent-foreground/70">
            {level} · {medium}
          </p>
        </div>
        <span className="rounded-md bg-card/15 px-2 py-1 font-mono text-[10px] uppercase tracking-wider">
          Tier I
        </span>
      </div>

      <div className="my-4 flex items-center gap-2">
        <span className="size-4 shrink-0 -translate-y-4 rounded-full bg-gradient-to-br from-accent to-chart-4" />
        <span className="perf h-px w-full border-t border-dashed border-card/40" />
        <span className="size-4 shrink-0 -translate-y-4 rounded-full bg-gradient-to-br from-accent to-chart-4" />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2 text-xs">
          <Row label="Teacher" value={teacher} />
          <Row label="Date" value={date} />
          <Row label="Venue" value={venue} />
          <Row label="Seats" value={seats} />
        </div>
        <div className="shrink-0">
          <div className="grid aspect-square w-24 grid-cols-5 grid-rows-5 gap-0.5 rounded-md bg-card p-2">
            {QR_GRID.flat().map((cell, i) => (
              <span key={i} className={cell ? "bg-foreground" : "bg-card"} />
            ))}
          </div>
          <p className="mt-1 text-center font-mono text-[10px] tracking-wider text-accent-foreground/80">
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
      <span className="w-14 text-accent-foreground/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
