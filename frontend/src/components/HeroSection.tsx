import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Ticket, ChevronRight, ChevronLeft, MapPin, Calendar, Clock, BadgeCheck, ArrowRight } from 'lucide-react';
import type { Banner, Seminar } from '../types';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useCatalog, fromPrice } from '../hooks/useCatalog';
import { formatDate, formatTime } from '../utils/date';
import { formatAmount } from '../utils/format';
import { Badge, container } from './ui/Primitives';
import { Button, IconButton } from './ui/Button';
import { SeminarCover } from './SeminarCover';

const pad = (n: number) => String(n).padStart(2, '0');

export const HeroSection: React.FC<{ slides: { banner: Banner; seminar: Seminar }[]; onOpenSearch: () => void }> = ({ slides, onOpenSearch }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { lecturerById, organiserById } = useCatalog();

  const isPaused = isHovered || hasFocusWithin || prefersReducedMotion;
  const count = slides.length;

  useEffect(() => {
    if (isPaused || count < 2) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [isPaused, count]);

  const index = count ? currentSlide % count : 0;
  const active = slides[index];
  const goPrev = () => setCurrentSlide((prev) => (prev === 0 ? count - 1 : prev - 1));
  const goNext = () => setCurrentSlide((prev) => (prev + 1) % count);

  return (
    <section aria-labelledby="hero-title" className={`${container} pb-12 pt-8 sm:pb-16 sm:pt-14`}>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
        <div className="max-w-xl">
          <Badge className="mb-5">
            <BadgeCheck className="size-3.5" aria-hidden="true" />
            A/L & O/L seminar tickets
          </Badge>
          <h1 id="hero-title" className="text-4xl font-bold leading-[1.1] tracking-tight text-fg sm:text-5xl xl:text-[3.5rem]">
            Find your next <span className="text-brand">learning experience.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Explore and book admission tickets for A/L & O/L seminars, paper classes and revision workshops across Sri Lanka.
          </p>

          <button
            type="button"
            onClick={onOpenSearch}
            className="group mt-8 flex h-14 w-full items-center gap-3 rounded-lg border border-line bg-surface pl-4 pr-2 text-left shadow-card transition-colors hover:border-brand/50"
          >
            <Search className="size-5 shrink-0 text-brand" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-sm text-muted sm:text-base">Search subject, seminar, lecturer, or location...</span>
            <span className="inline-flex h-10 shrink-0 items-center rounded-md bg-brand-solid px-5 text-sm font-semibold text-on-brand transition-colors group-hover:bg-brand-solid-hover">
              Search
            </span>
          </button>

          <Link to="/seminars" className="mt-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-brand hover:underline">
            Browse all seminars <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {active && (
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured seminars"
            className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface shadow-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setHasFocusWithin(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHasFocusWithin(false);
            }}
          >
            <div className="relative aspect-5/2 w-full bg-surface-2">
              {slides.map(({ banner, seminar }, i) => (
                <div
                  key={banner.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={i !== index}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                >
                  <SeminarCover seminar={seminar} className="size-full" priority={i === 0} />
                </div>
              ))}
            </div>

            {count > 1 && (
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 sm:px-6">
                <div className="flex items-center gap-1.5">
                  {slides.map(({ banner }, i) => (
                    <button
                      key={banner.id}
                      type="button"
                      onClick={() => setCurrentSlide(i)}
                      aria-label={`Show slide ${i + 1}`}
                      aria-current={i === index}
                      className="group flex h-8 min-w-6 items-center justify-center px-1"
                    >
                      <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-brand' : 'w-1.5 bg-line group-hover:bg-muted'}`} />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="mr-2 text-xs font-semibold tabular-nums text-muted">
                    {pad(index + 1)} / {pad(count)}
                  </span>
                  <IconButton label="Previous slide" onClick={goPrev}>
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </IconButton>
                  <IconButton label="Next slide" onClick={goNext}>
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
            )}

            <div className="p-5 sm:p-6" aria-live={isPaused ? 'polite' : 'off'}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge>Featured seminar</Badge>
                {organiserById.get(active.seminar.organiserId)?.verified && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <BadgeCheck className="size-4 text-success" aria-hidden="true" />
                    Reviewed organiser
                  </span>
                )}
              </div>
              <h2 className="mt-3 line-clamp-2 text-xl font-bold leading-snug text-fg sm:text-2xl">{active.seminar.title}</h2>
              <p className="mt-1 text-sm text-muted">{active.banner.headline}</p>
              <p className="mt-1 text-sm font-semibold text-brand">{lecturerById.get(active.seminar.lecturerId)?.name}</p>

              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-[1.4fr_1fr_1fr]">
                {[
                  { icon: MapPin, label: 'Venue', value: active.seminar.venue, wide: true },
                  { icon: Calendar, label: 'Date', value: formatDate(active.seminar.startsAt) },
                  { icon: Clock, label: 'Session time', value: formatTime(active.seminar.startsAt) },
                ].map(({ icon: Icon, label, value, wide }) => (
                  <div key={label} className={`min-w-0 ${wide ? 'col-span-2 sm:col-span-1' : ''}`}>
                    <dt className="flex items-center gap-1.5 text-xs text-muted">
                      <Icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="mt-0.5 pl-5.5 text-sm font-semibold text-fg">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted">Tickets from</p>
                  <p className="text-2xl font-bold tracking-tight text-fg">
                    <span className="mr-1 text-sm font-semibold text-muted">LKR</span>
                    {formatAmount(fromPrice(active.seminar))}
                  </p>
                </div>
                <Button to={`/seminars/${active.seminar.slug}`} size="lg" className="w-full sm:w-auto">
                  <Ticket className="size-5" aria-hidden="true" />
                  Get admission ticket
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
