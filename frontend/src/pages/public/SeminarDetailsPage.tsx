import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  BadgeCheck, Calendar, CheckCircle2, Clock, Globe, Languages, Link2, MapPin, ShoppingCart, Star, Ticket, TriangleAlert,
} from 'lucide-react';
import { SeminarCover } from '../../components/SeminarCover';
import { FavoriteButton, SeminarGrid } from '../../components/SeminarCard';
import { Button } from '../../components/ui/Button';
import { QuantityStepper } from '../../components/ui/Field';
import { Avatar, Badge, Card, Notice, ProgressBar, container } from '../../components/ui/Primitives';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { calcFee } from '../../data/mock';
import { useCatalog, capacityOf, isUpcoming, seatsLeft, soldOf } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Seminar } from '../../types';
import { formatLongDate, formatTime } from '../../utils/date';
import { MODE_LABELS, formatLKR } from '../../utils/format';
import { NotFoundPage } from './InfoPages';

/** Ticket type picker with live totals. Shared by the public page and the organiser preview. */
export const TicketSelector: React.FC<{ seminar: Seminar; preview?: boolean }> = ({ seminar, preview }) => {
  const { add, maxPerOrder, items } = useCart();
  const { settings } = useCatalog();
  const toast = useToast();
  const navigate = useNavigate();
  const [qty, setQty] = useState<Record<string, number>>({});

  const bookable = seminar.status === 'published' && isUpcoming(seminar);
  const inCartElsewhere = items.filter((i) => !seminar.ticketTypes.some((t) => t.id === i.ticketTypeId)).reduce((n, i) => n + i.quantity, 0);
  const selected = seminar.ticketTypes.reduce((n, t) => n + (qty[t.id] ?? 0), 0);
  const subtotal = seminar.ticketTypes.reduce((n, t) => n + (qty[t.id] ?? 0) * t.price, 0);
  const fee = calcFee(subtotal, settings.bookingFeePercent);
  const room = maxPerOrder - inCartElsewhere;

  const addAll = (thenCheckout: boolean) => {
    if (preview) {
      toast('Preview only', { description: 'Booking is disabled in the organiser preview.', tone: 'info' });
      return;
    }
    let message = '';
    for (const t of seminar.ticketTypes) {
      const n = qty[t.id] ?? 0;
      if (n > 0) message = add({ seminarId: seminar.id, ticketTypeId: t.id, quantity: n }).message;
    }
    setQty({});
    toast(message || 'Added to cart', { description: `${selected} ${selected === 1 ? 'ticket' : 'tickets'} for ${seminar.title}` });
    if (thenCheckout) navigate('/cart');
  };

  return (
    <Card className="overflow-hidden" id="tickets">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-bold text-fg">Select tickets</h2>
        <p className="text-sm text-muted">Up to {maxPerOrder} tickets per order · prices in LKR</p>
      </div>
      {!bookable && (
        <div className="p-5">
          <Notice tone={seminar.status === 'cancelled' ? 'danger' : 'warning'} icon={<TriangleAlert className="size-4 text-warning" aria-hidden="true" />}>
            {seminar.status === 'cancelled'
              ? 'This seminar was cancelled by the organiser. Existing bookings are refunded automatically.'
              : seminar.status === 'draft'
                ? 'This seminar is a draft and is not on sale yet.'
                : 'This seminar has already taken place. Booking is closed.'}
          </Notice>
        </div>
      )}
      <ul className="divide-y divide-line">
        {seminar.ticketTypes.map((t) => {
          const left = t.capacity - t.sold;
          const n = qty[t.id] ?? 0;
          const max = Math.max(0, Math.min(left, room - (selected - n)));
          return (
            <li key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-fg">{t.name}</p>
                <p className="mt-0.5 text-sm text-muted">{t.description}</p>
                <p className="mt-1.5 text-sm">
                  <span className="font-bold text-fg">{formatLKR(t.price)}</span>
                  <span className={`ml-2 text-xs font-semibold ${left <= 0 ? 'text-danger' : left < 20 ? 'text-warning' : 'text-muted'}`}>
                    {left <= 0 ? 'Sold out' : `${left} left`}
                  </span>
                </p>
              </div>
              {bookable && left > 0 && (
                <QuantityStepper label={`${t.name} quantity`} value={n} max={max} onChange={(v) => setQty({ ...qty, [t.id]: v })} />
              )}
            </li>
          );
        })}
      </ul>
      {bookable && (
        <div className="space-y-3 border-t border-line bg-surface-2/40 px-5 py-4">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd className="tabular-nums">{formatLKR(subtotal)}</dd></div>
            <div className="flex justify-between text-muted"><dt>Booking fee ({settings.bookingFeePercent}%)</dt><dd className="tabular-nums">{formatLKR(fee)}</dd></div>
            <div className="flex justify-between text-base font-bold text-fg"><dt>Total</dt><dd className="tabular-nums">{formatLKR(subtotal + fee)}</dd></div>
          </dl>
          {room <= 0 && <p className="text-xs font-semibold text-warning">Your cart already holds the {maxPerOrder}-ticket maximum.</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" disabled={!selected} onClick={() => addAll(false)}>
              <ShoppingCart className="size-4" aria-hidden="true" />
              Add to cart
            </Button>
            <Button disabled={!selected} onClick={() => addAll(true)}>
              <Ticket className="size-4" aria-hidden="true" />
              Book now
            </Button>
          </div>
          <p className="text-center text-xs text-muted">Demo checkout — no payment is taken.</p>
        </div>
      )}
    </Card>
  );
};

export const SeminarDetailsPage: React.FC = () => {
  const { slug } = useParams();
  const catalog = useCatalog();
  const seminar = slug ? catalog.seminarBySlug(slug) : undefined;
  useDocumentTitle(seminar?.title ?? 'Seminar');
  if (!seminar || seminar.status === 'draft') return <NotFoundPage />;
  return (
    <div className={`${container} py-8 sm:py-12`}>
      <SeminarDetailView seminar={seminar} />
    </div>
  );
};

/** The full seminar page body; `preview` disables booking (organiser preview). */
export const SeminarDetailView: React.FC<{ seminar: Seminar; preview?: boolean }> = ({ seminar, preview }) => {
  const catalog = useCatalog();
  const toast = useToast();

  const lecturer = catalog.lecturerById.get(seminar.lecturerId);
  const organiser = catalog.organiserById.get(seminar.organiserId);
  const category = catalog.categoryById.get(seminar.categoryId);
  const related = catalog.listed.filter((s) => s.id !== seminar.id && (s.subject === seminar.subject || s.categoryId === seminar.categoryId)).slice(0, 4);
  const left = seatsLeft(seminar);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Link copied');
    } catch {
      toast('Could not copy the link', { tone: 'error', description: window.location.href });
    }
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link to="/seminars" className="hover:text-fg">Seminars</Link></li>
          <li aria-hidden="true">/</li>
          {category && (
            <>
              <li><Link to={`/categories/${category.slug}`} className="hover:text-fg">{category.name}</Link></li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li aria-current="page" className="truncate font-semibold text-fg">{seminar.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 space-y-8">
          <SeminarCover seminar={seminar} className="aspect-video w-full rounded-lg sm:aspect-[2.2/1]" priority />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {category && <Badge>{category.name}</Badge>}
              <Badge tone="neutral">{seminar.level}</Badge>
              <Badge tone="neutral">{MODE_LABELS[seminar.mode]}</Badge>
              {seminar.status === 'cancelled' && <Badge tone="danger">Cancelled</Badge>}
              {!isUpcoming(seminar) && seminar.status === 'published' && <Badge tone="neutral">Past event</Badge>}
            </div>
            <div className="mt-3 flex items-start justify-between gap-4">
              {/* In the organiser preview the dashboard header owns the h1 */}
              {React.createElement(preview ? 'h2' : 'h1', { className: 'text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl' }, seminar.title)}
              <div className="flex shrink-0 gap-2">
                <FavoriteButton seminar={seminar} variant="secondary" />
                <Button variant="secondary" size="sm" onClick={copyLink} className="size-10 px-0" aria-label="Copy link to this seminar">
                  <Link2 className="size-4.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{seminar.summary}</p>
          </div>

          <dl className="grid gap-4 rounded-lg border border-line bg-surface p-5 sm:grid-cols-2">
            {[
              { icon: Calendar, label: 'Date', value: formatLongDate(seminar.startsAt) },
              { icon: Clock, label: 'Time', value: `${formatTime(seminar.startsAt)} · ${seminar.durationHours} hours` },
              { icon: seminar.mode === 'online' ? Globe : MapPin, label: 'Venue', value: seminar.venue },
              { icon: Languages, label: 'Medium', value: seminar.language },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="text-sm font-semibold text-fg">{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <section aria-labelledby="about-title">
            <h2 id="about-title" className="text-xl font-bold text-fg">About this seminar</h2>
            <p className="mt-3 leading-relaxed text-muted">{seminar.description}</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {seminar.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 text-sm text-fg">
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-success" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="agenda-title">
            <h2 id="agenda-title" className="text-xl font-bold text-fg">Agenda</h2>
            <ol className="mt-4 space-y-0 border-l border-line pl-5">
              {seminar.agenda.map((a) => (
                <li key={a.time + a.title} className="relative pb-5 last:pb-0">
                  <span aria-hidden="true" className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-brand" />
                  <p className="text-xs font-semibold tabular-nums text-muted">{a.time}</p>
                  <p className="text-sm font-semibold text-fg">{a.title}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {lecturer && (
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Lecturer</p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={lecturer.name} size="lg" />
                  <div className="min-w-0">
                    <Link to={`/lecturers/${lecturer.id}`} className="font-semibold text-fg hover:text-brand">{lecturer.name}</Link>
                    <p className="text-sm text-muted">{lecturer.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <Star className="size-3.5 fill-current text-warning" aria-hidden="true" /> {lecturer.rating} · {lecturer.yearsTeaching} years teaching
                    </p>
                  </div>
                </div>
              </Card>
            )}
            {organiser && (
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Organised by</p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={organiser.name} size="lg" />
                  <div className="min-w-0">
                    <Link to={`/organisers/${organiser.slug}`} className="font-semibold text-fg hover:text-brand">{organiser.name}</Link>
                    <p className="text-sm text-muted">{organiser.type} · {organiser.city}</p>
                    {organiser.verified && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-success">
                        <BadgeCheck className="size-3.5" aria-hidden="true" /> Reviewed organiser
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 rounded-lg border border-line bg-surface p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-fg">{left > 0 ? `${left} seats left` : 'Sold out'}</span>
              <span className="text-muted">{soldOf(seminar)} / {capacityOf(seminar)} booked</span>
            </div>
            <ProgressBar value={soldOf(seminar)} max={capacityOf(seminar)} label="Seats booked" className="mt-2" />
          </div>
          <TicketSelector seminar={seminar} preview={preview} />
        </div>
      </div>

      {!preview && related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-16">
          <h2 id="related-title" className="mb-6 text-2xl font-bold tracking-tight text-fg">You might also like</h2>
          <SeminarGrid seminars={related} />
        </section>
      )}
    </>
  );
};
