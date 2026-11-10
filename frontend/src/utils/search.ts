import type { Category, Lecturer, Organiser, Seminar, SeminarMode } from '../types';

interface Lookups {
  lecturerById: Map<string, Lecturer>;
  organiserById: Map<string, Organiser>;
  categoryById: Map<string, Category>;
}

/** All searchable text for a seminar, lower-cased. */
export function seminarHaystack(s: Seminar, l: Lookups) {
  return [
    s.title, s.subject, s.level, s.venue, s.district, s.mode === 'online' ? 'online stream' : s.mode, s.language,
    l.lecturerById.get(s.lecturerId)?.name, l.organiserById.get(s.organiserId)?.name, l.categoryById.get(s.categoryId)?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Every word of the query must appear somewhere in the seminar's text. */
export function searchSeminars(list: Seminar[], query: string, l: Lookups) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return list;
  return list.filter((s) => {
    const hay = seminarHaystack(s, l);
    return terms.every((t) => hay.includes(t));
  });
}

export interface SeminarFilters {
  q: string;
  category: string;
  district: string;
  mode: '' | SeminarMode;
  level: string;
  minPrice: string;
  maxPrice: string;
  from: string;
  to: string;
  sort: 'date' | 'price-asc' | 'price-desc' | 'popular';
}

export const EMPTY_FILTERS: SeminarFilters = { q: '', category: '', district: '', mode: '', level: '', minPrice: '', maxPrice: '', from: '', to: '', sort: 'date' };

export function filtersFromParams(params: URLSearchParams): SeminarFilters {
  const f = { ...EMPTY_FILTERS };
  for (const key of Object.keys(f) as (keyof SeminarFilters)[]) {
    const v = params.get(key);
    if (v !== null) (f as Record<string, string>)[key] = v;
  }
  return f;
}

export function filtersToParams(f: SeminarFilters) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v && !(k === 'sort' && v === 'date')) p.set(k, v);
  return p;
}

export function activeFilterCount(f: SeminarFilters) {
  return (['category', 'district', 'mode', 'level', 'minPrice', 'maxPrice', 'from', 'to'] as const).filter((k) => f[k]).length;
}

export function applyFilters(list: Seminar[], f: SeminarFilters, l: Lookups & { categoryBySlug?: (slug: string) => Category | undefined }) {
  const minPrice = (s: Seminar) => Math.min(...s.ticketTypes.map((t) => t.price));
  const sold = (s: Seminar) => s.ticketTypes.reduce((n, t) => n + t.sold, 0);
  let out = searchSeminars(list, f.q, l).filter((s) => {
    if (f.category && l.categoryById.get(s.categoryId)?.slug !== f.category) return false;
    if (f.district && s.district !== f.district) return false;
    if (f.mode && s.mode !== f.mode) return false;
    if (f.level && s.level !== f.level) return false;
    const price = minPrice(s);
    if (f.minPrice && price < Number(f.minPrice)) return false;
    if (f.maxPrice && price > Number(f.maxPrice)) return false;
    const day = s.startsAt.slice(0, 10);
    if (f.from && day < f.from) return false;
    if (f.to && day > f.to) return false;
    return true;
  });
  const sorters: Record<SeminarFilters['sort'], (a: Seminar, b: Seminar) => number> = {
    date: (a, b) => a.startsAt.localeCompare(b.startsAt),
    'price-asc': (a, b) => minPrice(a) - minPrice(b),
    'price-desc': (a, b) => minPrice(b) - minPrice(a),
    popular: (a, b) => sold(b) - sold(a),
  };
  out = [...out].sort(sorters[f.sort] ?? sorters.date);
  return out;
}
