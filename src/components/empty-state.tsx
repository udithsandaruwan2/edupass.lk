import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionTo ? (
        <Button className="mt-6" asChild>
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
