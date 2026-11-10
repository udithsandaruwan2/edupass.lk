import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Inbox, Search } from 'lucide-react';
import { downloadFile, toCsv } from '../../utils/csv';
import { Button, IconButton } from './Button';
import { EmptyState } from './Primitives';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Enables sorting on this column */
  sortValue?: (row: T) => string | number;
  /** Plain value for CSV export (defaults to sortValue) */
  exportValue?: (row: T) => string | number;
  align?: 'left' | 'right';
  className?: string;
  /** Hide below this breakpoint to keep small screens readable */
  hideBelow?: 'sm' | 'md' | 'lg';
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Text used by the search box; omit to hide search */
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  /** Extra filter controls rendered beside the search box */
  toolbar?: React.ReactNode;
  pageSize?: number;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  emptyTitle?: string;
  emptyDescription?: string;
  /** File name for "Export CSV"; omit to hide the button */
  exportName?: string;
  caption: string;
  onRowClick?: (row: T) => void;
}

const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' };

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = 'Search…',
  toolbar,
  pageSize = 10,
  initialSort,
  emptyTitle = 'Nothing to show',
  emptyDescription = 'Try a different search or filter.',
  exportName,
  caption,
  onRowClick,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : rows;
    const col = sort && columns.find((c) => c.key === sort.key);
    if (col?.sortValue) {
      const get = col.sortValue;
      list = [...list].sort((a, b) => {
        const va = get(a);
        const vb = get(b);
        const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return sort!.dir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [rows, query, searchText, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };

  const exportCsv = () => {
    const cols = columns.filter((c) => c.exportValue || c.sortValue);
    const csv = toCsv(
      cols.map((c) => c.header),
      filtered.map((r) => cols.map((c) => (c.exportValue ?? c.sortValue)!(r))),
    );
    downloadFile(`${exportName}.csv`, csv);
  };

  return (
    <div className="min-w-0">
      {(searchText || toolbar || exportName) && (
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:flex-wrap sm:items-end">
          {searchText && (
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={`Search ${caption.toLowerCase()}`}
                className="h-10 w-full rounded-md border border-line bg-page pl-9 pr-3 text-sm text-fg placeholder:text-muted focus-visible:border-brand"
              />
            </div>
          )}
          {toolbar && <div className="flex flex-wrap items-end gap-3">{toolbar}</div>}
          {exportName && (
            <Button variant="secondary" size="sm" onClick={exportCsv} className="sm:ml-auto" disabled={filtered.length === 0}>
              <Download className="size-4" aria-hidden="true" />
              Export CSV
            </Button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="p-4">
          <EmptyState icon={<Inbox className="size-5" aria-hidden="true" />} title={emptyTitle} description={emptyDescription} className="border-none" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-line bg-surface-2/50">
                {columns.map((col) => {
                  const active = sort?.key === col.key;
                  const SortIcon = active ? (sort!.dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                      className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted ${col.align === 'right' ? 'text-right' : ''} ${col.hideBelow ? HIDE[col.hideBelow] : ''}`}
                    >
                      {col.sortValue ? (
                        <button type="button" onClick={() => toggleSort(col.key)} className={`inline-flex items-center gap-1 rounded-sm uppercase hover:text-fg ${active ? 'text-fg' : ''}`}>
                          {col.header}
                          <SortIcon className="size-3.5" aria-hidden="true" />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-line last:border-b-0 ${onRowClick ? 'cursor-pointer hover:bg-surface-2/60' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 align-middle text-fg ${col.align === 'right' ? 'text-right tabular-nums' : ''} ${col.hideBelow ? HIDE[col.hideBelow] : ''} ${col.className ?? ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > pageSize && (
        <nav aria-label={`${caption} pages`} className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted">
          <span>
            {current * pageSize + 1}–{Math.min(filtered.length, (current + 1) * pageSize)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <IconButton label="Previous page" onClick={() => setPage(current - 1)} disabled={current === 0}>
              <ChevronLeft className="size-4" aria-hidden="true" />
            </IconButton>
            <span className="px-2 tabular-nums">
              Page {current + 1} / {pageCount}
            </span>
            <IconButton label="Next page" onClick={() => setPage(current + 1)} disabled={current >= pageCount - 1}>
              <ChevronRight className="size-4" aria-hidden="true" />
            </IconButton>
          </div>
        </nav>
      )}
    </div>
  );
}
