import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Search, SearchX, X } from 'lucide-react';
import { useCatalog, fromPrice } from '../hooks/useCatalog';
import { formatShortDate } from '../utils/date';
import { formatLKR } from '../utils/format';
import { searchSeminars } from '../utils/search';
import { Dialog } from './ui/Dialog';
import { IconButton } from './ui/Button';
import { EmptyState } from './ui/Primitives';
import { SeminarCover } from './SeminarCover';

const POPULAR_SEARCHES = ['Economics', 'Combined Maths', 'Physics', 'Online', 'Kandy', 'O/L'];

export const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const catalog = useCatalog();
  const navigate = useNavigate();
  const results = query.trim() ? searchSeminars(catalog.listed, query, catalog) : catalog.listed;

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} labelledBy="search-title" initialFocusRef={inputRef} className="flex max-h-[84vh] max-w-2xl flex-col">
      <h2 id="search-title" className="sr-only">Search seminars</h2>

      <form onSubmit={submit} role="search" className="flex items-center gap-3 border-b border-line py-2 pl-4 pr-2 transition-shadow has-[input:focus-visible]:shadow-[inset_0_-2px_0_var(--ring)] sm:pl-5">
        <Search className="size-5 shrink-0 text-brand" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search seminars, lecturers, subjects or locations"
          aria-controls="search-results"
          placeholder="Search subjects, lecturers, locations…"
          className="h-12 w-full min-w-0 bg-transparent text-base font-semibold text-fg placeholder:font-normal placeholder:text-muted focus-visible:outline-none sm:text-lg"
        />
        <IconButton label="Close search" onClick={onClose}>
          <X className="size-5" aria-hidden="true" />
        </IconButton>
      </form>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Popular searches</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                aria-pressed={query === tag}
                className={`h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
                  query === tag ? 'border-transparent bg-brand-solid text-on-brand' : 'border-line bg-surface-2 text-fg hover:border-brand/40'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div id="search-results">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted" aria-live="polite">
            {query.trim() ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'Upcoming seminars'}
          </h3>
          {results.length === 0 ? (
            <EmptyState
              icon={<SearchX className="size-5" aria-hidden="true" />}
              title="No matching seminars"
              description="Try a subject, a lecturer's name, or a district such as Kandy."
              className="py-10"
            />
          ) : (
            <ul className="-mx-2 space-y-0.5">
              {results.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => go(`/seminars/${item.slug}`)} className="flex w-full items-center gap-3.5 rounded-md p-2 text-left transition-colors hover:bg-surface-2">
                    <SeminarCover seminar={item} compact className="size-14 shrink-0 rounded-sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-fg sm:text-base">{item.title}</span>
                      <span className="block truncate text-sm text-muted">
                        {catalog.lecturerById.get(item.lecturerId)?.name} · {formatShortDate(item.startsAt)} · {item.venue}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-sm font-bold text-fg sm:block">{formatLKR(fromPrice(item))}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && results.length > 0 && (
            <button type="button" onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              See all {results.length} results <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs text-muted sm:px-5">
        <span>
          <kbd className="rounded-sm border border-line bg-surface-2 px-1.5 py-0.5 font-sans font-semibold text-fg">Enter</kbd> to see all ·{' '}
          <kbd className="rounded-sm border border-line bg-surface-2 px-1.5 py-0.5 font-sans font-semibold text-fg">Esc</kbd> to close
        </span>
      </div>
    </Dialog>
  );
};
