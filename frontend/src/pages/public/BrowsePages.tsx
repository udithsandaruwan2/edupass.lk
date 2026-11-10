import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowRight, CalendarDays, Search, Sparkles } from 'lucide-react';
import { FilterPanel, SeminarBrowser } from '../../components/SeminarBrowser';
import { SeminarGrid } from '../../components/SeminarCard';
import { categoryIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { Card, EmptyState, SectionHeader, container } from '../../components/ui/Primitives';
import { useCatalog } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { applyFilters, EMPTY_FILTERS, filtersToParams, type SeminarFilters } from '../../utils/search';
import { NotFoundPage } from './InfoPages';

export const ExplorePage: React.FC = () => {
  useDocumentTitle('Explore seminars');
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <SectionHeader
        as="h1"
        eyebrow="Explore"
        title="All upcoming seminars"
        description="Filter by subject, location, format, price and date. Your filters stay in the link, so you can share them."
        actions={
          <Button to="/seminars/filters" variant="secondary" size="sm">
            Advanced filters
          </Button>
        }
      />
      <SeminarBrowser />
    </div>
  );
};

export const SearchResultsPage: React.FC = () => {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  useDocumentTitle(q ? `Search: ${q}` : 'Search');
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="Search results" title={q ? `Results for “${q}”` : 'Search seminars'} description="Matching seminar titles, subjects, lecturers, organisers and venues." />
      <SeminarBrowser />
    </div>
  );
};

/** Full-page advanced filter form; applies by navigating to Explore with the filters in the URL. */
export const AdvancedFiltersPage: React.FC = () => {
  useDocumentTitle('Advanced filters');
  const catalog = useCatalog();
  const navigate = useNavigate();
  const [f, setF] = useState<SeminarFilters>({ ...EMPTY_FILTERS });
  const districts = [...new Set(catalog.listed.map((s) => s.district))].sort();
  const preview = applyFilters(catalog.listed, f, catalog).length;

  return (
    <div className={`${container} max-w-3xl py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="Explore" title="Advanced filters" description="Combine any filters, then see the matching seminars." />
      <Card className="p-5 sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/seminars?${filtersToParams(f).toString()}`);
          }}
        >
          <label htmlFor="adv-q" className="mb-1.5 block text-sm font-semibold text-fg">Keywords</label>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input id="adv-q" type="search" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="e.g. Economics Nugegoda" className="h-11 w-full rounded-md border border-line bg-page pl-9 pr-3 text-sm text-fg placeholder:text-muted focus-visible:border-brand" />
          </div>
          <FilterPanel value={f} onChange={setF} districts={districts} />
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={() => setF({ ...EMPTY_FILTERS })}>Reset</Button>
            <Button type="submit" size="lg" disabled={preview === 0}>
              Show {preview} {preview === 1 ? 'seminar' : 'seminars'}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export const CategoriesPage: React.FC = () => {
  useDocumentTitle('Categories');
  const { categories, listed } = useCatalog();
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="Browse" title="Seminar categories" description="From full-syllabus revision days to focused target workshops." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const Icon = categoryIcon(cat.icon);
          const count = listed.filter((s) => s.categoryId === cat.id).length;
          return (
            <li key={cat.id}>
              <Link to={`/categories/${cat.slug}`} className="group flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-colors hover:border-brand/40">
                <span className="flex size-11 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-fg">{cat.name}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{cat.description}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  {count} upcoming {count === 1 ? 'seminar' : 'seminars'}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const CategoryPage: React.FC = () => {
  const { slug } = useParams();
  const { categories } = useCatalog();
  const cat = categories.find((c) => c.slug === slug);
  useDocumentTitle(cat?.name ?? 'Category');
  if (!cat) return <NotFoundPage />;
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <Link to="/categories" className="mb-3 inline-flex text-sm font-semibold text-brand hover:underline">← All categories</Link>
      <SectionHeader as="h1" eyebrow="Category" title={cat.name} description={cat.description} />
      <SeminarBrowser locked={{ category: cat.slug }} />
    </div>
  );
};

export const FeaturedPage: React.FC = () => {
  useDocumentTitle('Featured seminars');
  const { listed } = useCatalog();
  const featured = listed.filter((s) => s.featured);
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="Editor's picks" title="Featured seminars" description="Hand-picked sessions with strong reviews and high demand." />
      {featured.length ? (
        <SeminarGrid seminars={featured} />
      ) : (
        <EmptyState icon={<Sparkles className="size-5" aria-hidden="true" />} title="No featured seminars yet" description="Check back soon." action={<Button to="/seminars" variant="secondary" size="sm">Explore all</Button>} />
      )}
    </div>
  );
};

export const UpcomingPage: React.FC = () => {
  useDocumentTitle('Upcoming seminars');
  const { listed } = useCatalog();
  const groups = new Map<string, typeof listed>();
  for (const s of listed) {
    const key = new Date(s.startsAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="Calendar" title="Upcoming seminars" description="Every listed seminar, month by month." />
      {listed.length === 0 && (
        <EmptyState icon={<CalendarDays className="size-5" aria-hidden="true" />} title="Nothing scheduled" description="New seminars are added every week." />
      )}
      <div className="space-y-12">
        {[...groups.entries()].map(([month, items]) => (
          <section key={month} aria-labelledby={`m-${month}`}>
            <h2 id={`m-${month}`} className="mb-5 flex items-center gap-3 text-lg font-bold text-fg">
              <CalendarDays className="size-5 text-brand" aria-hidden="true" />
              {month}
              <span className="text-sm font-semibold text-muted">· {items.length}</span>
            </h2>
            <SeminarGrid seminars={items} />
          </section>
        ))}
      </div>
    </div>
  );
};
