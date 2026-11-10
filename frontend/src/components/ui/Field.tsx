import React, { useId } from 'react';
import { ChevronDown, Minus, Plus } from 'lucide-react';

const controlBase =
  'w-full min-w-0 rounded-md border bg-page px-3.5 text-sm text-fg placeholder:text-muted transition-colors focus-visible:border-brand disabled:opacity-60';

const borderFor = (error?: string) => (error ? 'border-danger' : 'border-line');

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  /** Visually hide the label (it stays available to screen readers) */
  hideLabel?: boolean;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => React.ReactNode;
}

/** Label + control + hint/error, wired with ids for screen readers. */
export const Field: React.FC<FieldProps> = ({ label, error, hint, required, className = '', hideLabel, children }) => {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'mb-1.5 block text-sm font-semibold text-fg'}>
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-danger">{error}</p>
      )}
    </div>
  );
};

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  onValueChange?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  leading?: React.ReactNode;
};

export const Input: React.FC<InputProps> = ({ label, error, hint, hideLabel, required, className = '', onValueChange, onChange, leading, ...rest }) => (
  <Field label={label} error={error} hint={hint} required={required} hideLabel={hideLabel} className={className}>
    {(a11y) => (
      <div className="relative">
        {leading && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">{leading}</span>}
        <input
          {...a11y}
          required={required}
          onChange={(e) => {
            onChange?.(e);
            onValueChange?.(e.target.value);
          }}
          className={`${controlBase} h-11 ${borderFor(error)} ${leading ? 'pl-10' : ''}`}
          {...rest}
        />
      </div>
    )}
  </Field>
);

type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  label: string;
  error?: string;
  hint?: string;
  onValueChange?: (value: string) => void;
};

export const Textarea: React.FC<TextareaProps> = ({ label, error, hint, required, className = '', onValueChange, rows = 4, ...rest }) => (
  <Field label={label} error={error} hint={hint} required={required} className={className}>
    {(a11y) => (
      <textarea
        {...a11y}
        rows={rows}
        required={required}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={`${controlBase} py-2.5 leading-relaxed ${borderFor(error)}`}
        {...rest}
      />
    )}
  </Field>
);

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  options: { value: string; label: string }[];
  onValueChange?: (value: string) => void;
};

export const Select: React.FC<SelectProps> = ({ label, error, hint, hideLabel, required, className = '', options, onValueChange, ...rest }) => (
  <Field label={label} error={error} hint={hint} required={required} hideLabel={hideLabel} className={className}>
    {(a11y) => (
      <div className="relative">
        <select
          {...a11y}
          required={required}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={`${controlBase} h-11 appearance-none pr-10 ${borderFor(error)}`}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
    )}
  </Field>
);

export const Checkbox: React.FC<{ label: React.ReactNode; checked: boolean; onChange: (checked: boolean) => void; description?: string; error?: string; className?: string }> = ({
  label,
  checked,
  onChange,
  description,
  error,
  className = '',
}) => {
  const id = useId();
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-4.5 shrink-0 accent-[var(--brand-solid)]"
        />
        <label htmlFor={id} className="text-sm text-fg">
          {label}
          {description && <span className="block text-xs text-muted">{description}</span>}
        </label>
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
};

export const Switch: React.FC<{ label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, description, checked, onChange }) => {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-semibold text-fg">{label}</p>
        {description && <p id={`${id}-desc`} className="text-sm text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-brand-solid' : 'bg-line'}`}
      >
        <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
};

export const QuantityStepper: React.FC<{ value: number; min?: number; max: number; onChange: (n: number) => void; label: string }> = ({ value, min = 0, max, onChange, label }) => (
  <div className="inline-flex items-center rounded-md border border-line bg-page" role="group" aria-label={label}>
    <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="flex size-10 items-center justify-center text-fg disabled:opacity-40">
      <Minus className="size-4" aria-hidden="true" />
    </button>
    <output aria-live="polite" className="w-8 text-center text-sm font-bold tabular-nums text-fg">{value}</output>
    <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="flex size-10 items-center justify-center text-fg disabled:opacity-40">
      <Plus className="size-4" aria-hidden="true" />
    </button>
  </div>
);

/** Selectable card used for radio groups (payment methods, account types). */
export const RadioCard: React.FC<{
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ name, value, checked, onChange, title, description, icon, disabled }) => (
  <label
    className={`flex items-start gap-3 rounded-lg border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--ring)] ${
      disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'
    } ${checked ? 'border-brand bg-brand/6' : 'border-line bg-surface hover:border-brand/40'}`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={() => onChange(value)}
      className="sr-only"
    />
    {icon && <span className={`mt-0.5 shrink-0 ${checked ? 'text-brand' : 'text-muted'}`}>{icon}</span>}
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-fg">{title}</span>
      {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
    </span>
    <span aria-hidden="true" className={`mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-brand' : 'border-line'}`}>
      {checked && <span className="size-2 rounded-full bg-brand" />}
    </span>
  </label>
);
