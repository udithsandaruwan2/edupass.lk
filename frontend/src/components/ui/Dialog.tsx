import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { Button, IconButton } from './Button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  /** Element to focus when the dialog opens (defaults to the panel). */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  /** 'center' = modal; 'right' = side drawer */
  placement?: 'top' | 'center' | 'right';
  children: React.ReactNode;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: role="dialog", focus trap, Escape to close, background
 * scroll lock, backdrop click to close, and focus returned to the trigger.
 */
export const Dialog: React.FC<DialogProps> = ({ open, onClose, labelledBy, initialFocusRef, className = '', placement = 'top', children }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    (initialFocusRef?.current ?? panelRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      previouslyFocused?.focus?.();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const wrapper = {
    top: 'items-start justify-center p-4 pt-[8vh] sm:pt-24',
    center: 'items-center justify-center p-4',
    right: 'items-stretch justify-end',
  }[placement];
  const panel = placement === 'right' ? 'h-full w-full max-w-md animate-fade-in overflow-y-auto border-l' : 'w-full animate-pop-in rounded-lg border';

  return (
    <div className={`fixed inset-0 z-[100] flex ${wrapper}`}>
      <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`relative border-line bg-surface shadow-overlay ${panel} ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

/** Titled modal with body and footer, the standard form/detail dialog. */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  placement?: 'center' | 'right';
  children: React.ReactNode;
}> = ({ open, onClose, title, description, footer, size = 'md', placement = 'center', children }) => {
  const titleId = useId();
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };
  return (
    <Dialog open={open} onClose={onClose} labelledBy={titleId} placement={placement} className={`flex max-h-[90vh] flex-col ${placement === 'right' ? 'max-h-none' : widths[size]}`}>
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-bold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-1">
          <X className="size-5" aria-hidden="true" />
        </IconButton>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>}
    </Dialog>
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, description, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onCancel }) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant={tone} onClick={onConfirm}>{confirmLabel}</Button>
      </>
    }
  >
    <div className="text-sm leading-relaxed text-muted">{description}</div>
  </Modal>
);
