import React, { useEffect, useId, useRef, useState } from 'react';

interface PopoverProps {
  /** Renders the trigger; spread the props onto a button */
  trigger: (props: { 'aria-expanded': boolean; 'aria-controls': string; onClick: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

/** Disclosure popover that closes on outside click, Escape, or selection. */
export const Popover: React.FC<PopoverProps> = ({ trigger, children, align = 'right', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ 'aria-expanded': open, 'aria-controls': id, onClick: () => setOpen((o) => !o) })}
      {open && (
        <div
          id={id}
          className={`absolute top-full z-50 mt-2 animate-pop-in rounded-lg border border-line bg-surface shadow-overlay ${align === 'right' ? 'right-0' : 'left-0'} ${className}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

export const MenuItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode; tone?: 'danger' }> = ({
  icon,
  tone,
  className = '',
  children,
  ...rest
}) => (
  <button
    type="button"
    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-surface-2 ${tone === 'danger' ? 'text-danger' : 'text-fg'} ${className}`}
    {...rest}
  >
    {icon}
    {children}
  </button>
);
