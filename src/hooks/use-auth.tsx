import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import type { User, UserRole } from "@/domain/types";
import { getSessionUser, switchRole as apiSwitchRole } from "@/services/api";
import { hydrateStore, subscribeStore, getStore } from "@/mocks/store";

type AuthContextValue = {
  user: User | null;
  role: UserRole;
  switchRole: (role: UserRole) => Promise<void>;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useStoreVersion() {
  return useSyncExternalStore(
    subscribeStore,
    () => getStore().sessionUserId ?? "guest",
    () => "guest",
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const version = useStoreVersion();

  useEffect(() => {
    hydrateStore();
  }, []);

  void version;
  const user = getSessionUser();
  const role: UserRole = user?.role ?? "guest";

  const value: AuthContextValue = {
    user,
    role,
    switchRole: async (next) => {
      await apiSwitchRole(next);
    },
    refresh: () => {
      // subscription triggers re-render
      hydrateStore();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
