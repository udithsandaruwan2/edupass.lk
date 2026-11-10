import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

type Tone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: Tone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (title: string, options?: { tone?: Tone; description?: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = { success: CheckCircle2, error: TriangleAlert, info: Info };
const ICON_COLOR = { success: 'text-success', error: 'text-danger', info: 'text-brand' };

let nextId = 1;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback<ToastContextValue['toast']>(
    (title, options) => {
      const id = nextId++;
      setToasts((t) => [...t.slice(-3), { id, title, tone: options?.tone ?? 'success', description: options?.description }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[300] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-overlay"
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${ICON_COLOR[t.tone]}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fg">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-muted">{t.description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="-m-1 rounded-sm p-1 text-muted hover:text-fg">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx.toast;
}
