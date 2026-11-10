import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

interface FavoritesContextValue {
  ids: string[];
  isFavorite: (seminarId: string) => boolean;
  toggle: (seminarId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ids, setIds] = usePersistentState<string[]>('edupass-demo-saved', () => ['sem-cmaths-paper', 'sem-econ-paper']);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string) => {
      const next = !ids.includes(id);
      setIds((prev) => (next ? [...prev, id] : prev.filter((x) => x !== id)));
      return next;
    },
    [ids, setIds],
  );

  const value = useMemo(() => ({ ids, isFavorite, toggle }), [ids, isFavorite, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
