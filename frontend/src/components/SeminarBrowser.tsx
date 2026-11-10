import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { SearchX, SlidersHorizontal, X } from 'lucide-react';
import type { Seminar } from '../types';
import { useCatalog } from '../hooks/useCatalog';
import { activeFilterCount, applyFilters, EMPTY_FILTERS, filtersFromParams, filtersToParams, type SeminarFilters } from '../utils/search';
import { MODE_LABELS } from '../utils/format';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Field';
import { Modal } from './ui/Dialog';
import { EmptyState } from './ui/Primitives';
import { SeminarGrid } from './SeminarCard';

interface FilterPanelProps {
  value: SeminarFilters;
  onChange: (f: SeminarFilters) => void;
  /** Filters locked by the page (e.g. a category page) are hidden */
  locked?: Partial<Record<keyof SeminarFilters, true>>;
  districts: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ value, onChange, locked = {}, districts }) => {
  const { categories } = useCatalog();
  const set = (k: keyof SeminarFilters) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      {!locked.category && (
        <Select label="Category" value={value.category} onValueChange={set('category')} options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]} />
      )}
      <Select label="Location" value={value.district} onValueChange={set('district')} options={[{ value: '', label: 'Any location' }, ...districts.map((d) => ({ value: d, label: d === 'Online' ? 'Online stream' : d }))]} />
      <Select label="Format" value={value.mode} onValueChange={set('mode')} options={[{ value: '', label: 'Any format' }, ...Object.entries(MODE_LABELS).map(([v, l]) => ({ value: v, label: l }))]} />
      <Select label="Exam level" value={value.level} onValueChange={set('level')} options={[{ value: '', label: 'A/L and O/L' }, { value: 'A/L', label: 'G.C.E. A/L' }, { value: 'O/L', label: 'G.C.E. O/L' }]} />
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-fg">Price (LKR)</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input label="Minimum price" hideLabel type="number" min={0} inputMode="numeric" placeholder="Min" value={value.minPrice} onValueChange={set('minPrice')} />
          <Input label="Maximum price" hideLabel type="number" min={0} inputMode="numeric" placeholder="Max" value={value.maxPrice} onValueChange={set('maxPrice')} />
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-fg">Date range</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input label="From date" hideLabel type="date" value={value.from} onValueChange={set('from')} />
          <Input label="To date" hideLabel type="date" value={value.to} min={value.from || undefined} onValueChange={set('to')} />
        </div>
      </fieldset>
    </div>
  );
};

interface SeminarBrowserProps {
  /** Seminars to browse (defaults to all upcoming published seminars) */
  source?: Seminar[];
  locked?: Partial<SeminarFilters>;
  showSearch?: boolean;
}

/** Filterable, sortable seminar grid with filters kept in the URL. */
export const SeminarBrowser: React.FC<SeminarBrowserProps> = ({ source, locked = {}, showSearch = true }) => {
  const catalog = useCatalog();
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const paramKey = params.toString();
  const lockedKey = JSON.stringify(locked);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the serialised inputs
  const filters = useMemo(() => ({ ...filtersFromParams(new URLSearchParams(paramKey)), ...(JSON.parse(lockedKey) as Partial<SeminarFilters>) }), [paramKey, lockedKey]);
  const list = source ?? catalog.listed;
  const districts = useMemo(() => [...new Set(list.map((s) => s.district))].sort(), [list]);
  const results = useMemo(() => applyFilters(list, filters, catalog), [list, filters, catalog]);
  const lockedKeys = Object.fromEntries(Object.keys(locked).map((k) => [k, true])) as Partial<Record<keyof SeminarFilters, true>>;
  const count = activeFilterCount(filters) - Object.keys(locked).filter((k) => k !== 'q' && k !== 'sort').length;

  const update = (f: SeminarFilters) => {
    const next = filtersToParams(f);
    for (const k of Object.keys(locked)) next.delete(k);
    setParams(next, { replace: true });
  };
  const clear = () => update({ ...EMPTY_FILTERS, q: filters.q });

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside aria-labelledby="filters-title" className="hidden lg:block">
        <div className="sticky top-24 rounded-lg border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="filters-title" className="text-base font-semibold text-fg">Filters</h2>
            {count > 0 && (
              <button type="button" onClick={clear} className="text-sm font-semibold text-brand hover:underline">Clear all</button>
            )}
          </div>
          <FilterPanel value={filters} onChange={update} locked={lockedKeys} districts={districts} />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            {showSearch && (
              <Input
                label="Search seminars"
                hideLabel
                type="search"
                placeholder="Search subject, lecturer, venue…"
                value={filters.q}
                onValueChange={(q) => update({ ...filters, q })}
                className="min-w-0 flex-1 sm:max-w-sm"
              />
            )}
            <Button variant="secondary" onClick={() => setDrawer(true)} className="lg:hidden">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filters{count > 0 ? ` (${count})` : ''}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <p className="whitespace-nowrap text-sm text-muted" aria-live="polite">
              {results.length} {results.length === 1 ? 'seminar' : 'seminars'}
            </p>
            <Select
              label="Sort by"
              hideLabel
              value={filters.sort}
              onValueChange={(sort) => update({ ...filters, sort: sort as SeminarFilters['sort'] })}
              options={[
                { value: 'date', label: 'Soonest first' },
                { value: 'price-asc', label: 'Price: low to high' },
                { value: 'price-desc', label: 'Price: high to low' },
                { value: 'popular', label: 'Most booked' },
              ]}
              className="w-48"
            />
          </div>
        </div>

        {count > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {(['category', 'district', 'mode', 'level', 'minPrice', 'maxPrice', 'from', 'to'] as const)
              .filter((k) => filters[k] && !(k in locked))
              .map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => update({ ...filters, [k]: '' })}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-fg hover:border-brand/40"
                >
                  <span className="text-muted">{k === 'minPrice' ? 'Min' : k === 'maxPrice' ? 'Max' : k === 'district' ? 'Location' : k[0]!.toUpperCase() + k.slice(1)}:</span>
                  {k === 'category' ? catalog.categories.find((c) => c.slug === filters[k])?.name : k === 'mode' ? MODE_LABELS[filters.mode as keyof typeof MODE_LABELS] : filters[k]}
                  <X className="size-3.5" aria-label="Remove filter" />
                </button>
              ))}
          </div>
        )}

        {results.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" aria-hidden="true" />}
            title="No seminars match these filters"
            description="Try removing a filter or searching for a broader subject."
            action={<Button variant="secondary" size="sm" onClick={() => update({ ...EMPTY_FILTERS })}>Reset search & filters</Button>}
          />
        ) : (
          <SeminarGrid seminars={results} />
        )}
      </div>

      <Modal
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Filters"
        placement="right"
        footer={
          <>
            <Button variant="secondary" onClick={clear}>Clear all</Button>
            <Button onClick={() => setDrawer(false)}>Show {results.length} results</Button>
          </>
        }
      >
        <FilterPanel value={filters} onChange={update} locked={lockedKeys} districts={districts} />
      </Modal>
    </div>
  );
};
