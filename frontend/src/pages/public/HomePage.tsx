import React, { useState } from 'react';
import { useOutletContext } from 'react-router';
import { ArrowRight, CalendarX } from 'lucide-react';
import { CtaBanner } from '../../components/CtaBanner';
import { FeatureBar } from '../../components/FeatureBar';
import { HeroSection } from '../../components/HeroSection';
import { NearbyEvents } from '../../components/NearbyEvents';
import { SeminarGrid } from '../../components/SeminarCard';
import { SyllabusResources } from '../../components/SyllabusResources';
import { Button } from '../../components/ui/Button';
import { EmptyState, FilterChip, SectionHeader, container } from '../../components/ui/Primitives';
import { useCatalog } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { PublicOutletContext } from '../../layouts/PublicLayout';

export const HomePage: React.FC = () => {
  useDocumentTitle('');
  const { openSearch } = useOutletContext<PublicOutletContext>();
  const { listed, banners, seminarById, categories } = useCatalog();
  const [activeCategory, setActiveCategory] = useState('all');

  /** Banner carousel needs seminar IDs that exist in the live catalogue.
   * With mocks off, Nest replaces seminars but banners stay demo-local — fall
   * back to featured/upcoming seminars so the hero card still appears. */
  const slidesFromBanners = banners
    .filter((b) => b.active)
    .sort((a, b) => a.order - b.order)
    .flatMap((banner) => {
      const seminar = seminarById.get(banner.seminarId);
      return seminar && listed.includes(seminar) ? [{ banner, seminar }] : [];
    });
  const slides =
    slidesFromBanners.length > 0
      ? slidesFromBanners
      : listed
          .filter((s) => s.featured)
          .concat(listed.filter((s) => !s.featured))
          .slice(0, 5)
          .map((seminar, order) => ({
            banner: {
              id: `live-${seminar.id}`,
              seminarId: seminar.id,
              headline: seminar.summary,
              active: true,
              order,
            },
            seminar,
          }));
  const usedCategories = categories.filter((c) => listed.some((s) => s.categoryId === c.id));
  const filtered = activeCategory === 'all' ? listed : listed.filter((s) => s.categoryId === activeCategory);
  const activeName = categories.find((c) => c.id === activeCategory)?.name;

  return (
    <>
      <HeroSection slides={slides} onOpenSearch={openSearch} />
      <FeatureBar />

      <section id="seminars" aria-labelledby="seminars-title" className={`${container} py-12 sm:py-16`}>
        <SectionHeader
          id="seminars-title"
          eyebrow="Academic events & seminars"
          title="Top seminars & revision workshops"
          description="Book entry tickets for upcoming A/L & O/L academic events"
          actions={
            <div role="group" aria-label="Filter seminars by category" className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 py-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0">
              <FilterChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} className="snap-start">All</FilterChip>
              {usedCategories.map((cat) => (
                <FilterChip key={cat.id} active={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)} className="snap-start">
                  {cat.name}
                </FilterChip>
              ))}
            </div>
          }
        />
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarX className="size-5" aria-hidden="true" />}
            title={`No ${activeName ?? ''} seminars right now`}
            description="Check back soon or browse all upcoming seminars."
            action={<Button variant="secondary" size="sm" onClick={() => setActiveCategory('all')}>Show all seminars</Button>}
          />
        ) : (
          <SeminarGrid seminars={filtered.slice(0, 8)} />
        )}
        <div className="mt-8 flex justify-center">
          <Button to="/seminars" variant="secondary">
            Explore all {listed.length} seminars
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </section>

      <NearbyEvents events={listed} />
      <SyllabusResources />
      <CtaBanner />
    </>
  );
};
