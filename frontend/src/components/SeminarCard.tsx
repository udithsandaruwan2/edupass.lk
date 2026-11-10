import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, Calendar, Heart, MapPin, Users } from 'lucide-react';
import type { Seminar } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { useToast } from '../contexts/ToastContext';
import { useCatalog, fromPrice, seatsLeft } from '../hooks/useCatalog';
import { formatDate, formatTime } from '../utils/date';
import { MODE_LABELS, formatAmount } from '../utils/format';
import { Badge } from './ui/Primitives';
import { IconButton } from './ui/Button';
import { buttonClasses } from './ui/buttonClasses';
import { SeminarCover } from './SeminarCover';

export const FavoriteButton: React.FC<{ seminar: Seminar; variant?: 'overlay' | 'secondary'; className?: string }> = ({ seminar, variant = 'overlay', className = '' }) => {
  const { isFavorite, toggle } = useFavorites();
  const toast = useToast();
  const saved = isFavorite(seminar.id);
  return (
    <IconButton
      label={saved ? `Remove ${seminar.title} from saved` : `Save ${seminar.title}`}
      aria-pressed={saved}
      variant={variant}
      onClick={() => toast(toggle(seminar.id) ? 'Saved to your favourites' : 'Removed from favourites', { tone: 'info' })}
      className={`rounded-full ${className}`}
    >
      <Heart aria-hidden="true" className={`size-4.5 transition-colors ${saved ? 'fill-[#F87171] text-[#F87171]' : ''}`} />
    </IconButton>
  );
};

export const SeminarCard: React.FC<{ seminar: Seminar }> = ({ seminar }) => {
  const { lecturerById, categoryById } = useCatalog();
  const lecturer = lecturerById.get(seminar.lecturerId);
  const category = categoryById.get(seminar.categoryId);
  const left = seatsLeft(seminar);
  const soldOut = left <= 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-brand/40 hover:shadow-card">
      <div className="relative">
        <SeminarCover seminar={seminar} className="aspect-video w-full" />
        {category && (
          <Badge tone="overlay" className="absolute right-14 top-3 max-w-[50%] truncate">
            {category.name}
          </Badge>
        )}
        <FavoriteButton seminar={seminar} className="absolute right-3 top-3 z-10 size-9" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="truncate text-sm font-semibold text-brand">{lecturer?.name ?? 'Guest lecturer'}</p>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2lh] text-lg font-semibold leading-snug text-fg">
          {/* Stretched link: the whole card is clickable, the heart stays its own control */}
          <Link to={`/seminars/${seminar.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-[var(--ring)]">
            {seminar.title}
          </Link>
        </h3>

        <ul className="mb-5 mt-3 space-y-1.5 text-sm text-muted">
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{seminar.venue}</span>
          </li>
          <li className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" aria-hidden="true" />
            <span>{formatDate(seminar.startsAt)} · {formatTime(seminar.startsAt)}</span>
          </li>
          <li className="flex items-center gap-2">
            <Users className="size-4 shrink-0" aria-hidden="true" />
            <span>
              {MODE_LABELS[seminar.mode]} ·{' '}
              <span className={soldOut ? 'font-semibold text-danger' : left < 40 ? 'font-semibold text-warning' : ''}>
                {soldOut ? 'Sold out' : `${left} seats left`}
              </span>
            </span>
          </li>
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="min-w-0 text-lg font-bold tracking-tight text-fg">
            <span className="mr-1 text-xs font-semibold text-muted">from LKR</span>
            {formatAmount(fromPrice(seminar))}
          </p>
          <span aria-hidden="true" className={buttonClasses('primary', 'sm')}>
            {soldOut ? 'Details' : 'Book'}
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
};

export const SeminarGrid: React.FC<{ seminars: Seminar[] }> = ({ seminars }) => (
  <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
    {seminars.map((s) => (
      <li key={s.id} className="flex">
        <div className="flex w-full flex-col [&>article]:flex-1">
          <SeminarCard seminar={s} />
        </div>
      </li>
    ))}
  </ul>
);
