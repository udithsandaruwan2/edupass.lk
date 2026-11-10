import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { CalendarPlus, Download, Heart, Printer, Ticket, TriangleAlert, Video } from 'lucide-react';
import { SeminarGrid } from '../../components/SeminarCard';
import { StatusBadge } from '../../components/StatusBadge';
import { TicketQR } from '../../components/TicketQR';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Card, EmptyState, Notice } from '../../components/ui/Primitives';
import { Tabs } from '../../components/ui/Tabs';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useToast } from '../../contexts/ToastContext';
import { useCatalog } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import { NotFoundPage } from '../public/InfoPages';
import { downloadFile } from '../../utils/csv';
import { formatDateTime, formatLongDate, formatTime } from '../../utils/date';
import { toIcs } from '../../utils/ics';
import { useStudent, type TicketView } from './useStudent';

const TicketCard: React.FC<{ t: TicketView }> = ({ t }) => (
  <Card className="flex h-full flex-col overflow-hidden">
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-line p-4">
      <div className="min-w-0">
        <p className="truncate font-semibold text-fg">{t.seminar.title}</p>
        <p className="text-sm text-muted">{formatLongDate(t.seminar.startsAt)}</p>
      </div>
      <StatusBadge status={t.status} />
    </div>
    <div className="flex flex-1 items-center gap-4 p-4">
      <TicketQR code={t.code} size={72} className="p-1.5" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-fg">{t.holderName}</p>
        <p className="text-muted">{t.typeName}</p>
        <p className="mt-1 font-mono text-xs text-muted">{t.code}</p>
      </div>
    </div>
    <div className="border-t border-line p-3">
      <Button to={`/student/tickets/${t.id}`} variant="secondary" size="sm" className="w-full">Open ticket</Button>
    </div>
  </Card>
);

export const MyTicketsPage: React.FC = () => {
  useDocumentTitle('My tickets');
  const { tickets } = useStudent();
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [q, setQ] = useState('');
  const groups = {
    upcoming: tickets.filter((t) => t.upcoming && t.status === 'valid'),
    past: tickets.filter((t) => !t.upcoming && t.status !== 'cancelled'),
    cancelled: tickets.filter((t) => t.status === 'cancelled'),
  };
  const visible = groups[tab].filter((t) => `${t.seminar.title} ${t.code} ${t.holderName}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="My tickets" description="Show the QR code at the entrance. Each code can be scanned once." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Tabs label="Ticket status" value={tab} onChange={setTab} tabs={[{ id: 'upcoming', label: 'Upcoming', count: groups.upcoming.length }, { id: 'past', label: 'Past', count: groups.past.length }, { id: 'cancelled', label: 'Cancelled', count: groups.cancelled.length }]} />
        <Input label="Search tickets" hideLabel type="search" placeholder="Seminar, code or name" value={q} onValueChange={setQ} className="sm:w-64" />
      </div>
      {visible.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => <li key={t.id}><TicketCard t={t} /></li>)}
        </ul>
      ) : (
        <EmptyState icon={<Ticket className="size-5" aria-hidden="true" />} title={q ? 'No tickets match' : `No ${tab} tickets`} description={tab === 'upcoming' ? 'Book a seminar to get a QR ticket.' : 'Nothing here yet.'} action={tab === 'upcoming' ? <Button to="/seminars" size="sm">Explore seminars</Button> : undefined} />
      )}
    </>
  );
};

export const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams();
  const { tickets } = useStudent();
  const { organiserById, orders } = useCatalog();
  const toast = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const t = tickets.find((x) => x.id === ticketId);
  useDocumentTitle(t ? `Ticket ${t.code}` : 'Ticket');
  if (!t) return <NotFoundPage />;
  const org = organiserById.get(t.seminar.organiserId);
  const order = orders.find((o) => o.id === t.orderId);

  const download = () => {
    const svg = qrRef.current?.querySelector('svg')?.outerHTML ?? '';
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EduPass demo ticket ${esc(t.code)}</title>
<style>body{font-family:system-ui,sans-serif;background:#f3f4f6;margin:0;padding:24px;color:#172033}.t{max-width:420px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb}.h{background:#c2410c;color:#fff;padding:16px 20px}.b{padding:20px;text-align:center}.d{border-top:1px dashed #e5e7eb;padding:16px 20px;font-size:14px}.d p{margin:4px 0}.w{background:#fef3c7;color:#92400e;font-size:12px;padding:10px 20px;font-weight:600}</style></head>
<body><div class="t"><div class="h"><strong>EduPass</strong> · Admission ticket</div><div class="w">DEMO TICKET — not valid for entry to any real event.</div><div class="b">${svg}<p style="font-family:monospace">${esc(t.code)}</p></div>
<div class="d"><p><strong>${esc(t.seminar.title)}</strong></p><p>${esc(formatLongDate(t.seminar.startsAt))} · ${esc(formatTime(t.seminar.startsAt))}</p><p>${esc(t.seminar.venue)}</p><p>Holder: ${esc(t.holderName)}</p><p>Ticket: ${esc(t.typeName)}</p></div></div></body></html>`;
    downloadFile(`edupass-demo-ticket-${t.code}.html`, html, 'text/html;charset=utf-8');
    toast('Demo ticket downloaded', { description: 'Open the file to view or print it.' });
  };

  const addToCalendar = () => {
    downloadFile(
      `${t.seminar.slug}.ics`,
      toIcs({ uid: t.id, title: t.seminar.title, start: t.seminar.startsAt, hours: t.seminar.durationHours, location: t.seminar.venue, description: `EduPass demo ticket ${t.code}` }),
      'text/calendar;charset=utf-8',
    );
  };

  return (
    <>
      <PageHeader title="Ticket" back={{ to: '/student/tickets', label: 'My tickets' }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <Card className="print-area overflow-hidden">
          <div className="bg-brand-solid px-5 py-4 text-on-brand">
            <p className="text-xs font-semibold uppercase tracking-wider">EduPass admission ticket</p>
            <p className="mt-1 text-lg font-bold leading-snug">{t.seminar.title}</p>
          </div>
          <div className="flex flex-col items-center gap-3 p-6">
            {t.status === 'cancelled' ? (
              <Notice tone="danger" icon={<TriangleAlert className="size-4 text-danger" aria-hidden="true" />}>This ticket was cancelled and cannot be used.</Notice>
            ) : (
              <div ref={qrRef} className={t.status === 'checked_in' ? 'opacity-40' : ''}>
                <TicketQR code={t.code} size={200} />
              </div>
            )}
            <p className="font-mono text-sm font-semibold tracking-wider text-fg">{t.code}</p>
            <StatusBadge status={t.status} />
            {t.checkedInAt && <p className="text-xs text-muted">Checked in {formatDateTime(t.checkedInAt)}</p>}
          </div>
          <dl className="grid grid-cols-2 gap-4 border-t border-dashed border-line p-5 text-sm">
            <div><dt className="text-xs text-muted">Date</dt><dd className="font-semibold text-fg">{formatLongDate(t.seminar.startsAt)}</dd></div>
            <div><dt className="text-xs text-muted">Time</dt><dd className="font-semibold text-fg">{formatTime(t.seminar.startsAt)}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-muted">Venue</dt><dd className="font-semibold text-fg">{t.seminar.venue}</dd></div>
            <div><dt className="text-xs text-muted">Holder</dt><dd className="font-semibold text-fg">{t.holderName}</dd></div>
            <div><dt className="text-xs text-muted">Ticket type</dt><dd className="font-semibold text-fg">{t.typeName}</dd></div>
          </dl>
          <p className="border-t border-line bg-warning/10 px-5 py-3 text-xs font-semibold text-fg">Demo ticket — not valid for entry to any real event.</p>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-fg">Ticket actions</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <Button variant="secondary" onClick={download} disabled={t.status === 'cancelled'}><Download className="size-4" aria-hidden="true" />Download (demo)</Button>
              <Button variant="secondary" onClick={() => window.print()} disabled={t.status === 'cancelled'}><Printer className="size-4" aria-hidden="true" />Print</Button>
              <Button variant="secondary" onClick={addToCalendar}><CalendarPlus className="size-4" aria-hidden="true" />Add to calendar</Button>
            </div>
            {t.seminar.streamJoinUrl && t.seminar.mode !== 'physical' && t.status !== 'cancelled' ? (
              <div className="mt-4">
                <Button
                  href={t.seminar.streamJoinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  className="w-full"
                >
                  <Video className="size-4" aria-hidden="true" />
                  Join live stream
                </Button>
                <p className="mt-2 text-xs text-muted">Link provided by the organiser. Prefer joining near the start time.</p>
              </div>
            ) : null}
          </Card>
          <Card className="p-5 text-sm">
            <h2 className="text-base font-semibold text-fg">At the entrance</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
              <li>Arrive 30 minutes early and bring your school ID.</li>
              <li>Show this QR code on your phone at full brightness, or a printed copy.</li>
              <li>Each ticket can be scanned once. Don't share screenshots.</li>
              {t.seminar.mode !== 'physical' && <li>Online access unlocks 30 minutes before the start time.</li>}
            </ul>
          </Card>
          <Card className="p-5 text-sm">
            <h2 className="text-base font-semibold text-fg">Booking</h2>
            <dl className="mt-3 space-y-1.5">
              <div className="flex justify-between gap-3"><dt className="text-muted">Order</dt><dd className="font-mono text-xs font-semibold text-fg">{t.orderId}</dd></div>
              {order && <div className="flex justify-between gap-3"><dt className="text-muted">Booked</dt><dd className="text-fg">{formatDateTime(order.createdAt)}</dd></div>}
              {org && <div className="flex justify-between gap-3"><dt className="text-muted">Organiser</dt><dd><Link to={`/organisers/${org.slug}`} className="font-semibold text-brand hover:underline">{org.name}</Link></dd></div>}
            </dl>
            <Button to={`/seminars/${t.seminar.slug}`} variant="ghost" size="sm" className="mt-3">Seminar details</Button>
          </Card>
        </div>
      </div>
    </>
  );
};

export const SavedSeminarsPage: React.FC = () => {
  useDocumentTitle('Saved seminars');
  const { ids } = useFavorites();
  const { seminarById } = useCatalog();
  const saved = ids.flatMap((id) => {
    const s = seminarById.get(id);
    return s && s.status === 'published' ? [s] : [];
  });
  return (
    <>
      <PageHeader title="Saved seminars" description="Your shortlist. Tap the heart on any seminar to add or remove it." />
      {saved.length ? (
        <SeminarGrid seminars={saved} />
      ) : (
        <EmptyState icon={<Heart className="size-5" aria-hidden="true" />} title="No saved seminars" description="Save seminars you're interested in to compare them later." action={<Button to="/seminars" size="sm">Explore seminars</Button>} />
      )}
    </>
  );
};
