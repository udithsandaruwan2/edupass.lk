import React, { useState } from 'react';
import { Link } from 'react-router';
import { MapPin, Calendar, MapPinOff } from 'lucide-react';
import type { Seminar } from '../types';
import { fromPrice } from '../hooks/useCatalog';
import { formatShortDate, formatTime } from '../utils/date';
import { MODE_LABELS, formatAmount } from '../utils/format';
import { Badge, EmptyState, FilterChip, SectionHeader, container } from './ui/Primitives';
import { Button } from './ui/Button';
import { SeminarCover } from './SeminarCover';

const ALL = 'All locations';

export const NearbyEvents: React.FC<{ events: Seminar[] }> = ({ events }) => {
  const [selected, setSelected] = useState(ALL);
  // Locations come from the data, so every chip has at least one match
  const districts = [...new Set(events.map((e) => e.district))].sort((a, b) => (a === 'Online' ? 1 : b === 'Online' ? -1 : a.localeCompare(b)));
  const filtered = selected === ALL ? events : events.filter((e) => e.district === selected);

  return (
    <section id="near-you" aria-labelledby="near-you-title" className={`${container} py-12 sm:py-16`}>
      <SectionHeader
        id="near-you-title"
        eyebrow="Location based search"
        title="Workshops near you"
        description="Find physical exam halls and online revision workshops in your district"
        actions={
          <div role="group" aria-label="Filter workshops by location" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0">
            {[ALL, ...districts].map((loc) => (
              <FilterChip key={loc} active={selected === loc} onClick={() => setSelected(loc)}>
                {loc !== ALL && <MapPin className="size-3.5" aria-hidden="true" />}
                {loc === 'Online' ? 'Online stream' : loc}
              </FilterChip>
            ))}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MapPinOff className="size-5" aria-hidden="true" />}
          title={`No workshops listed for ${selected}`}
          description="Try another location or browse everything."
          action={<Button variant="secondary" size="sm" onClick={() => setSelected(ALL)}>Show all locations</Button>}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.slice(0, 6).map((event) => (
            <li key={event.id}>
              <article className="group relative flex h-full gap-4 rounded-lg border border-line bg-surface p-3 transition-[border-color,box-shadow] duration-200 hover:border-brand/40 hover:shadow-card sm:p-4">
                <SeminarCover seminar={event} compact className="aspect-4/3 w-24 shrink-0 self-start rounded-md sm:w-32" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Badge>{event.subject}</Badge>
                    <span className="text-xs text-muted">{MODE_LABELS[event.mode]}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-fg">
                    <Link to={`/seminars/${event.slug}`} className="after:absolute after:inset-0 after:rounded-lg">
                      {event.title}
                    </Link>
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                    <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{event.venue}</span>
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-3">
                    <span className="flex items-center gap-1.5 text-sm text-muted">
                      <Calendar className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
                      {formatShortDate(event.startsAt)} · {formatTime(event.startsAt)}
                    </span>
                    <span className="text-base font-bold text-fg">
                      <span className="mr-1 text-xs font-semibold text-muted">LKR</span>
                      {formatAmount(fromPrice(event))}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
      {filtered.length > 6 && (
        <div className="mt-6 text-center">
          <Button to={selected === ALL ? '/seminars' : `/seminars?district=${encodeURIComponent(selected)}`} variant="secondary">
            See all {filtered.length} in {selected === ALL ? 'every location' : selected}
          </Button>
        </div>
      )}
    </section>
  );
};
