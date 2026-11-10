import React from 'react';
import { Check } from 'lucide-react';

/** Horizontal progress steps for multi-step flows such as checkout. */
export const Stepper: React.FC<{ steps: string[]; current: number }> = ({ steps, current }) => (
  <ol className="flex items-center gap-2 text-sm" aria-label="Progress">
    {steps.map((step, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <li key={step} className="flex min-w-0 flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              done ? 'bg-success text-white dark:text-[#111214]' : active ? 'bg-brand-solid text-on-brand' : 'border border-line text-muted'
            }`}
          >
            {done ? <Check className="size-4" aria-hidden="true" /> : i + 1}
          </span>
          <span className={`hidden truncate font-semibold sm:inline ${active ? 'text-fg' : 'text-muted'}`}>
            {step}
            {done && <span className="sr-only"> (completed)</span>}
          </span>
          {i < steps.length - 1 && <span aria-hidden="true" className={`h-px min-w-4 flex-1 ${done ? 'bg-success' : 'bg-line'}`} />}
        </li>
      );
    })}
  </ol>
);
