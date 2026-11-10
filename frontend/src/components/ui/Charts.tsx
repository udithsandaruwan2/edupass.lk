import React, { useId, useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { formatCompact } from '../../utils/format';
import { Card } from './Primitives';

export interface Datum {
  label: string;
  value: number;
}

const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];

/** Rounds an axis maximum up to a clean step (1/2/2.5/5 × 10^n). */
function niceMax(max: number) {
  if (max <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const f = max / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

interface ChartCardProps {
  title: string;
  description?: string;
  /** Rows shown in the accessible table view */
  table: { headers: string[]; rows: (string | number)[][] };
  children: React.ReactNode;
  className?: string;
  legend?: { label: string; color: string }[];
}

/** Card frame with a chart / table toggle so every chart has a non-visual equivalent. */
export const ChartCard: React.FC<ChartCardProps> = ({ title, description, table, children, className = '', legend }) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const id = useId();
  return (
    <Card className={`flex min-w-0 flex-col ${className}`} aria-labelledby={id}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <h2 id={id} className="text-base font-semibold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        <div className="flex rounded-md border border-line p-0.5" role="group" aria-label={`${title} view`}>
          {(['chart', 'table'] as const).map((v) => {
            const Icon = v === 'chart' ? BarChart3 : Table2;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`inline-flex h-7 items-center gap-1 rounded-sm px-2 text-xs font-semibold ${view === v ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'}`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {v === 'chart' ? 'Chart' : 'Table'}
              </button>
            );
          })}
        </div>
      </div>
      {legend && view === 'chart' && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 px-5 pt-3 text-xs text-muted" aria-label="Legend">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: l.color }} aria-hidden="true" />
              {l.label}
            </li>
          ))}
        </ul>
      )}
      <div className="min-w-0 flex-1 p-5 pt-3">
        {view === 'chart' ? (
          children
        ) : (
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                  {table.headers.map((h, i) => (
                    <th key={h} scope="col" className={`py-2 pr-3 font-semibold ${i > 0 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, ri) => (
                  <tr key={ri} className="border-b border-line last:border-0">
                    {r.map((c, i) => (
                      <td key={i} className={`py-2 pr-3 text-fg ${i > 0 ? 'text-right tabular-nums' : ''}`}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

interface TooltipState {
  /** px, or a CSS length such as "40%" */
  x: number | string;
  y: number | string;
  label: string;
  lines: string[];
}

const Tooltip: React.FC<{ tip: TooltipState | null }> = ({ tip }) =>
  tip ? (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-overlay"
      style={{ left: tip.x, top: tip.y, marginTop: -8 }}
    >
      <p className="font-semibold text-fg">{tip.label}</p>
      {tip.lines.map((l) => (
        <p key={l} className="text-muted">{l}</p>
      ))}
    </div>
  ) : null;

const W = 640;
const H = 240;
const PAD = { top: 12, right: 12, bottom: 28, left: 48 };

function Axis({ max, format }: { max: number; format: (n: number) => string }) {
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const innerH = H - PAD.top - PAD.bottom;
  return (
    <g>
      {ticks.map((t) => {
        const y = PAD.top + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="var(--grid)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--text-secondary)">
              {format(t)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Vertical column chart for one series (or up to 4 grouped series). */
export const BarChart: React.FC<{
  data: { label: string; values: number[] }[];
  seriesNames: string[];
  format?: (n: number) => string;
  ariaLabel: string;
}> = ({ data, seriesNames, format = formatCompact, ariaLabel }) => {
  const [tip, setTip] = useState<TooltipState | null>(null);
  const max = niceMax(Math.max(0, ...data.flatMap((d) => d.values)));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const band = innerW / Math.max(1, data.length);
  const groups = seriesNames.length;
  const barW = Math.min(24, (band * 0.7) / groups - 2);

  return (
    <div className="relative" onMouseLeave={() => setTip(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
        <Axis max={max} format={format} />
        {data.map((d, i) => {
          const cx = PAD.left + band * i + band / 2;
          const groupW = groups * barW + (groups - 1) * 2;
          return (
            <g key={d.label}>
              {d.values.map((v, s) => {
                const h = (v / max) * innerH;
                const x = cx - groupW / 2 + s * (barW + 2);
                const y = PAD.top + innerH - h;
                const r = Math.min(4, h, barW / 2);
                // Rounded data end, square at the baseline
                const base = PAD.top + innerH;
                const path = h > 0
                  ? `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + barW - r}Q${x + barW},${y} ${x + barW},${y + r}V${base}Z`
                  : '';
                return <path key={s} d={path} fill={SERIES[s]} />;
              })}
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--text-secondary)">{d.label}</text>
              {/* Hit target spans the whole band */}
              <rect
                x={cx - band / 2}
                y={PAD.top}
                width={band}
                height={innerH}
                fill="transparent"
                onMouseEnter={(e) => {
                  const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setTip({
                    x: (cx / W) * box.width,
                    y: ((PAD.top + innerH - (Math.max(...d.values) / max) * innerH) / H) * box.height,
                    label: d.label,
                    lines: d.values.map((v, s) => `${groups > 1 ? `${seriesNames[s]}: ` : ''}${format(v)}`),
                  });
                }}
              />
            </g>
          );
        })}
      </svg>
      <Tooltip tip={tip} />
    </div>
  );
};

/** Single-series line with a light area wash and a crosshair tooltip. */
export const AreaChart: React.FC<{ data: Datum[]; format?: (n: number) => string; ariaLabel: string; seriesName: string }> = ({
  data,
  format = formatCompact,
  ariaLabel,
  seriesName,
}) => {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  const pts = data.map((d, i) => ({ x: PAD.left + i * step, y: PAD.top + innerH - (d.value / max) * innerH }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join('');
  const area = pts.length ? `${line}L${pts[pts.length - 1]!.x},${PAD.top + innerH}L${pts[0]!.x},${PAD.top + innerH}Z` : '';
  const last = pts[pts.length - 1];

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round((x - PAD.left) / (step || 1));
    setActive(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel} onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
        <Axis max={max} format={format} />
        <path d={area} fill="var(--series-1)" opacity={0.1} />
        <path d={line} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) =>
          i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? (
            <text key={d.label} x={pts[i]!.x} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--text-secondary)">{d.label}</text>
          ) : null,
        )}
        {last && <circle cx={last.x} cy={last.y} r={4} fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} />}
        {active !== null && pts[active] && (
          <g>
            <line x1={pts[active].x} x2={pts[active].x} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--text-secondary)" strokeWidth={1} />
            <circle cx={pts[active].x} cy={pts[active].y} r={5} fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {active !== null && data[active] && (
        <Tooltip
          tip={{
            x: `${(pts[active]!.x / W) * 100}%`,
            y: `${(pts[active]!.y / H) * 100}%`,
            label: data[active].label,
            lines: [`${seriesName}: ${format(data[active].value)}`],
          }}
        />
      )}
    </div>
  );
};

/** Donut for a part-to-whole split of up to 4 slices, with a labelled legend. */
export const DonutChart: React.FC<{ data: Datum[]; format?: (n: number) => string; ariaLabel: string; centerLabel: string }> = ({
  data,
  format = formatCompact,
  ariaLabel,
  centerLabel,
}) => {
  const [active, setActive] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 70;
  const C = 2 * Math.PI * R;
  const GAP = data.length > 1 ? 2 : 0;
  const lengths = data.map((d) => (total ? (d.value / total) * C : 0));
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 180 180" className="size-44 shrink-0" role="img" aria-label={ariaLabel}>
        <g transform="rotate(-90 90 90)">
          {data.map((d, i) => (
              <circle
                key={d.label}
                cx={90}
                cy={90}
                r={R}
                fill="none"
                stroke={SERIES[i % SERIES.length]}
                strokeWidth={active === i ? 22 : 18}
                strokeDasharray={`${Math.max(0, lengths[i]! - GAP)} ${C}`}
                strokeDashoffset={-offsets[i]!}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
          ))}
        </g>
        <text x={90} y={86} textAnchor="middle" fontSize={22} fontWeight={700} fill="var(--text-primary)">
          {format(active !== null ? data[active]!.value : total)}
        </text>
        <text x={90} y={106} textAnchor="middle" fontSize={11} fill="var(--text-secondary)">
          {active !== null ? data[active]!.label : centerLabel}
        </text>
      </svg>
      <ul className="w-full min-w-0 space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3" onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
            <span className="flex min-w-0 items-center gap-2 text-fg">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} aria-hidden="true" />
              <span className="truncate">{d.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted">
              {format(d.value)} · {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Tiny trend line for stat tiles (decorative; the value beside it carries the meaning). */
export const Sparkline: React.FC<{ values: number[] }> = ({ values }) => {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-24" aria-hidden="true" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--series-1)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
};
