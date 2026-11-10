import React from 'react';

/** Shared page container: one max width and gutter for every section. */
export const container = 'mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8';

export type BadgeTone = 'brand' | 'neutral' | 'overlay' | 'success' | 'warning' | 'danger';

const badgeTones: Record<BadgeTone, string> = {
  brand: 'bg-brand/10 text-brand-strong',
  neutral: 'bg-surface-2 text-muted',
  overlay: 'bg-black/65 text-white backdrop-blur-sm',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/12 text-danger',
};

export const Badge: React.FC<{ tone?: BadgeTone; className?: string; children: React.ReactNode }> = ({
  tone = 'brand',
  className = '',
  children,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-semibold ${badgeTones[tone]} ${className}`}
  >
    {children}
  </span>
);

interface SectionHeaderProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  as?: 'h1' | 'h2';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ id, eyebrow, title, description, actions, as: Heading = 'h2' }) => (
  <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="max-w-2xl">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>}
      <Heading id={id} className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        {title}
      </Heading>
      {description && <p className="mt-2 text-sm text-muted sm:text-base">{description}</p>}
    </div>
    {actions && <div className="min-w-0">{actions}</div>}
  </div>
);

interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  children: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({ active, className = '', children, ...rest }) => (
  <button
    type="button"
    aria-pressed={active}
    className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-150 ${
      active
        ? 'bg-brand-solid text-on-brand'
        : 'border border-line bg-surface text-muted hover:border-brand/40 hover:text-fg'
    } ${className}`}
    {...rest}
  >
    {children}
  </button>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  /** Use 'h1' when the empty state is the whole page */
  as?: 'p' | 'h1' | 'h2';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '', as: Title = 'p' }) => (
  <div
    role="status"
    className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 py-12 text-center ${className}`}
  >
    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted">{icon}</div>
    <Title className="text-base font-semibold text-fg">{title}</Title>
    <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Card: React.FC<{ className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div className={`rounded-lg border border-line bg-surface ${className}`} {...rest}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode; id?: string }> = ({
  title,
  description,
  actions,
  id,
}) => (
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
    <div className="min-w-0">
      <h2 id={id} className="text-base font-semibold text-fg">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-md bg-surface-2 ${className}`} />
);

export const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({ name, size = 'md', className = '' }) => {
  const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg', xl: 'size-20 text-2xl' };
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand/12 font-bold text-brand-strong ${sizes[size]} ${className}`}>
      {letters}
    </span>
  );
};

/** A flat notice strip, e.g. "this action is simulated". */
export const Notice: React.FC<{ tone?: 'info' | 'warning' | 'danger' | 'success'; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  tone = 'info',
  icon,
  children,
  className = '',
}) => {
  const tones = {
    info: 'border-brand/30 bg-brand/8',
    warning: 'border-warning/40 bg-warning/10',
    danger: 'border-danger/40 bg-danger/10',
    success: 'border-success/40 bg-success/10',
  };
  return (
    <div className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm text-fg ${tones[tone]} ${className}`}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; label: string; className?: string }> = ({ value, max, label, className = '' }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const tone = pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-brand-solid';
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-surface-2 ${className}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
};
