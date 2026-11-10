import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { Sparkline } from './Charts';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  /** Signed change vs the named period, e.g. +12 */
  delta?: { value: number; period: string; upIsGood?: boolean };
  trend?: number[];
  hint?: string;
  to?: string;
}

/** KPI tile: label, value, optional delta and sparkline. */
export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, delta, trend, hint, to }) => {
  const good = delta ? (delta.value >= 0) === (delta.upIsGood ?? true) : true;
  const DeltaIcon = delta && delta.value < 0 ? TrendingDown : TrendingUp;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-fg tabular-nums">{value}</p>
      <div className="mt-2 flex min-h-8 items-end justify-between gap-3">
        <div className="min-w-0 text-xs">
          {delta && (
            <span className={`inline-flex items-center gap-1 font-semibold ${good ? 'text-success' : 'text-danger'}`}>
              <DeltaIcon className="size-3.5" aria-hidden="true" />
              {delta.value >= 0 ? '+' : ''}
              {delta.value}% <span className="font-normal text-muted">vs {delta.period}</span>
            </span>
          )}
          {hint && !delta && <span className="text-muted">{hint}</span>}
        </div>
        {trend && <Sparkline values={trend} />}
      </div>
    </>
  );
  const cls = 'block min-w-0 rounded-lg border border-line bg-surface p-5';
  return to ? (
    <Link to={to} className={`${cls} transition-colors hover:border-brand/40`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
};

export const StatGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">{children}</div>
);
