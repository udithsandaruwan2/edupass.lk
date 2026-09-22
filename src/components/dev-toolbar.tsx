import { useEffect } from "react";
import type { UserRole } from "@/domain/types";
import { useAuth } from "@/hooks/use-auth";
import { resetStore } from "@/mocks/store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES: UserRole[] = ["guest", "student", "admin", "scanner", "organizer", "lecturer"];

/** Always-on role switcher for demos — no hide control. */
export function DevToolbar() {
  const { role, switchRole } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Persist so deep links with ?dev=1 still mark the session
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "1") localStorage.setItem("edupass.dev", "1");
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-md">
      <span className="hidden text-[10px] font-medium tracking-wider text-muted-foreground uppercase sm:inline">
        Dev role
      </span>
      <Select
        value={role}
        onValueChange={(v) => {
          void switchRole(v as UserRole);
        }}
      >
        <SelectTrigger className="h-8 w-[130px] rounded-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        className="h-8 shrink-0 rounded-full"
        onClick={() => {
          resetStore();
          window.location.reload();
        }}
      >
        Reset data
      </Button>
    </div>
  );
}
