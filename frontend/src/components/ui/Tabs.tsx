import React, { useId, useRef } from 'react';

interface TabsProps<T extends string> {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
}

/** WAI-ARIA tablist with arrow-key navigation. Pair with <TabPanel>. */
export function Tabs<T extends string>({ tabs, value, onChange, label, className = '' }: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (index + dir + tabs.length) % tabs.length;
    onChange(tabs[next]!.id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={`no-scrollbar flex gap-1 overflow-x-auto border-b border-line ${className}`}>
      {tabs.map((tab, i) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${baseId}-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`relative -mb-px inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-semibold transition-colors ${
              selected ? 'border-brand text-fg' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`rounded-full px-1.5 text-xs tabular-nums ${selected ? 'bg-brand/12 text-brand-strong' : 'bg-surface-2 text-muted'}`}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
