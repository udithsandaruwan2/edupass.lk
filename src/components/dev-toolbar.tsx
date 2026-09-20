import { useEffect, useState } from "react";
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

export function DevToolbar() {
  const { role, switchRole } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("dev") === "1" || localStorage.getItem("edupass.dev") === "1";
    setVisible(flag);
    if (params.get("dev") === "1") localStorage.setItem("edupass.dev", "1");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-lg">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
        className="h-8 rounded-full"
        onClick={() => {
          resetStore();
          window.location.reload();
        }}
      >
        Reset data
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 rounded-full"
        onClick={() => {
          localStorage.removeItem("edupass.dev");
          setVisible(false);
        }}
      >
        Hide
      </Button>
    </div>
  );
}
