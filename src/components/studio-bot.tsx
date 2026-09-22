import { useEffect, useId, useState } from "react";
import { Bot, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SAMPLE = [
  { role: "bot" as const, text: "Hi — I can help you find an O/L or A/L seminar pass." },
  { role: "user" as const, text: "Any Combined Maths this Saturday in Colombo?" },
  {
    role: "bot" as const,
    text: "Yes — K. Perera at BMICH, 9:00 AM. Want me to open the pass checkout?",
  },
];

/** Floating sample AI assistant — bottom-right, powered by Studio 1028. */
export function StudioBot() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="pointer-events-none fixed right-4 bottom-[5.25rem] z-40 flex flex-col items-end gap-3 sm:right-5 sm:bottom-6">
      <div
        id={panelId}
        role="dialog"
        aria-label="edupass assistant preview"
        aria-hidden={!open}
        className={cn(
          "pointer-events-auto w-[min(100vw-2rem,20rem)] origin-bottom-right overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-[0_20px_50px_-24px_rgba(15,28,61,0.45)] backdrop-blur-xl transition-[opacity,transform] duration-300",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center gap-2 border-b border-border/70 bg-navy px-3.5 py-2.5 text-primary-foreground">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Bot className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">edupass assistant</p>
            <p className="text-[10px] text-primary-foreground/65">Sample preview</p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 rounded-lg text-primary-foreground hover:bg-white/10"
            aria-label="Close assistant preview"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex max-h-64 flex-col gap-2.5 overflow-y-auto p-3.5">
          {SAMPLE.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[90%] rounded-2xl px-3 py-2 text-[13px] leading-snug",
                m.role === "bot"
                  ? "self-start bg-accent-soft text-ink"
                  : "self-end bg-primary text-primary-foreground",
              )}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="border-t border-border/70 px-3.5 py-2.5">
          <p className="text-center text-[10px] tracking-wide text-muted-foreground">
            Powered by{" "}
            <span className="font-semibold text-ink">Studio 1028</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        className="pointer-events-auto group relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_-8px_oklch(0.45_0.16_255_/_0.55)] transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close assistant preview" : "Open assistant preview"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/35 opacity-40 [animation-duration:2.4s]" />
        {open ? <X className="relative size-6" /> : <MessageCircle className="relative size-6" />}
      </button>
    </div>
  );
}
