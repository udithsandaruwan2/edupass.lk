import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  CalendarCheck, CalendarClock, CircleDollarSign, ClipboardList, Download, Eye, Heart, History, RotateCcw, Star, Ticket,
} from 'lucide-react';
import { SeminarCover } from '../../components/SeminarCover';
import { SeminarGrid } from '../../components/SeminarCard';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { BarChart, ChartCard } from '../../components/ui/Charts';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Dialog';
import { Select, Textarea } from '../../components/ui/Field';
import { Card, CardHeader, EmptyState, Notice } from '../../components/ui/Primitives';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { Tabs } from '../../components/ui/Tabs';
import { useData } from '../../contexts/DataContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import type { Order, RefundRequest } from '../../types';
import { monthlySeries } from '../../utils/analytics';
import { downloadFile } from '../../utils/csv';
import { daysUntil, formatDate, formatDateTime, formatLongDate, formatTime } from '../../utils/date';
import { PAYMENT_LABELS, formatCompact, formatLKR } from '../../utils/format';
import { makeId } from '../../utils/random';
import { useStudent, type TicketView } from './useStudent';

const REFUND_WINDOW_HOURS = 72;

export const StudentOverview: React.FC = () => {
  useDocumentTitle('Student dashboard');
  const { profile, orders, tickets, catalog } = useStudent();
  const { ids } = useFavorites();
  const upcoming = tickets.filter((t) => t.upcoming && t.status === 'valid');
  const next = upcoming[0];
  const paid = orders.filter((o) => o.status === 'paid');
  const spent = paid.reduce((n, o) => n + o.total, 0);
  const months = monthlySeries(orders, 6);
  const recommended = catalog.listed.filter((s) => !tickets.some((t) => t.seminarId === s.id) && (profile?.stream === 'Commerce' ? ['Economics', 'Business Studies', 'Accounting'].includes(s.subject) : true)).slice(0, 3);

  return (
    <>
      <PageHeader title={`Hi, ${profile?.name.split(' ')[0] ?? 'there'}`} description="Here's what's coming up for your exam prep." actions={<Button to="/seminars">Find seminars</Button>} />
      <StatGrid>
        <StatCard label="Upcoming tickets" value={String(upcoming.length)} icon={Ticket} hint={next ? `Next in ${daysUntil(next.seminar.startsAt)} days` : 'No upcoming seminars'} to="/student/tickets" />
        <StatCard label="Bookings" value={String(orders.length)} icon={ClipboardList} hint={`${paid.length} paid`} to="/student/bookings" />
        <StatCard label="Saved seminars" value={String(ids.length)} icon={Heart} hint="Your shortlist" to="/student/saved" />
        <StatCard label="Total spent" value={formatLKR(spent)} icon={CircleDollarSign} hint="Demo amounts" to="/student/history" />
      </StatGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Next seminar" />
          {next ? (
            <div className="flex flex-col gap-5 p-5 sm:flex-row">
              <SeminarCover seminar={next.seminar} className="aspect-video w-full shrink-0 rounded-md sm:w-56" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand">In {daysUntil(next.seminar.startsAt)} days</p>
                <h2 className="mt-1 text-lg font-bold text-fg">{next.seminar.title}</h2>
                <p className="mt-1 text-sm text-muted">{formatLongDate(next.seminar.startsAt)} · {formatTime(next.seminar.startsAt)}</p>
                <p className="text-sm text-muted">{next.seminar.venue}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button to={`/student/tickets/${next.id}`} size="sm"><Ticket className="size-4" aria-hidden="true" />Show QR ticket</Button>
                  <Button to={`/seminars/${next.seminar.slug}`} variant="secondary" size="sm">Seminar details</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState icon={<CalendarClock className="size-5" aria-hidden="true" />} title="Nothing booked yet" description="Book a seminar and your ticket will show here." action={<Button to="/seminars" size="sm">Explore seminars</Button>} className="border-none" />
            </div>
          )}
        </Card>
        <ChartCard
          title="Spending by month"
          description="Ticket subtotals, last 6 months"
          table={{ headers: ['Month', 'Spent (LKR)', 'Tickets'], rows: months.map((m) => [m.label, formatLKR(m.revenue), m.tickets]) }}
        >
          <BarChart data={months.map((m) => ({ label: m.label, values: [m.revenue] }))} seriesNames={['Spent']} ariaLabel="Column chart of your ticket spending over the last 6 months" format={formatCompact} />
        </ChartCard>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent bookings" actions={<Button to="/student/bookings" variant="ghost" size="sm">View all</Button>} />
        <OrdersTable orders={orders.slice(0, 5)} compact />
      </Card>

      {recommended.length > 0 && (
        <section className="mt-8" aria-labelledby="rec">
          <h2 id="rec" className="mb-4 text-lg font-bold text-fg">Recommended for your {profile?.stream ?? ''} stream</h2>
          <SeminarGrid seminars={recommended} />
        </section>
      )}
    </>
  );
};

/** Receipt as a plain text download (demo). */
function downloadReceipt(order: Order, title: (id: string) => string) {
  const lines = order.lines.map((l) => `  ${l.quantity} x ${title(l.seminarId)} @ ${formatLKR(l.unitPrice)}`).join('\n');
  downloadFile(
    `receipt-${order.id}.txt`,
    `EduPass — DEMO RECEIPT (not a tax invoice)\n\nOrder: ${order.id}\nDate: ${formatDateTime(order.createdAt)}\nStatus: ${order.status}\nPaid with: ${PAYMENT_LABELS[order.paymentMethod]}\n\n${lines}\n\nSubtotal: ${formatLKR(order.subtotal)}\nBooking fee: ${formatLKR(order.fee)}\nTotal: ${formatLKR(order.total)}\n\nNo money was charged. This receipt was generated by a demonstration build.\n`,
    'text/plain;charset=utf-8',
  );
}

const OrdersTable: React.FC<{ orders: Order[]; compact?: boolean }> = ({ orders, compact }) => {
  const { catalog, refunds } = useStudent();
  const { upsert, notify } = useData();
  const toast = useToast();
  const [detail, setDetail] = useState<Order | null>(null);
  const [refundFor, setRefundFor] = useState<Order | null>(null);
  const [reason, setReason] = useState('Exam timetable clash');
  const [note, setNote] = useState('');
  const title = (id: string) => catalog.seminarById.get(id)?.title ?? 'Seminar';

  const refundable = (o: Order) => {
    if (o.status !== 'paid' || refunds.some((r) => r.orderId === o.id)) return false;
    const sem = catalog.seminarById.get(o.lines[0]!.seminarId);
    return sem ? (new Date(sem.startsAt).getTime() - Date.now()) / 3600000 > REFUND_WINDOW_HOURS : false;
  };

  const submitRefund = () => {
    if (!refundFor) return;
    const req: RefundRequest = { id: makeId('ref'), orderId: refundFor.id, studentId: refundFor.studentId, amount: refundFor.total, reason: note ? `${reason}: ${note}` : reason, status: 'open', createdAt: new Date().toISOString() };
    upsert('refunds', req);
    notify('admin', 'New refund request', `Order ${refundFor.id} — ${formatLKR(refundFor.total)}.`, '/admin/refunds');
    notify('organiser', 'New refund request', `A student asked for a refund on ${title(refundFor.lines[0]!.seminarId)}.`, '/organiser/bookings');
    toast('Refund requested (demo)', { description: 'The organiser and EduPass will review it.' });
    setRefundFor(null);
    setNote('');
  };

  const columns: Column<Order>[] = [
    { key: 'id', header: 'Order', render: (o) => <span className="font-mono text-xs font-semibold">{o.id}</span>, sortValue: (o) => o.id },
    { key: 'seminar', header: 'Seminar', render: (o) => <span className="line-clamp-1">{title(o.lines[0]!.seminarId)}</span>, sortValue: (o) => title(o.lines[0]!.seminarId) },
    { key: 'date', header: 'Booked', render: (o) => formatDate(o.createdAt), sortValue: (o) => o.createdAt, hideBelow: 'md' },
    { key: 'qty', header: 'Tickets', render: (o) => o.lines.reduce((n, l) => n + l.quantity, 0), align: 'right', hideBelow: 'sm', sortValue: (o) => o.lines.reduce((n, l) => n + l.quantity, 0) },
    { key: 'total', header: 'Total', render: (o) => formatLKR(o.total), align: 'right', sortValue: (o) => o.total },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={refunds.find((r) => r.orderId === o.id && r.status === 'open') ? 'pending' : o.status} />, sortValue: (o) => o.status },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (o) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetail(o)} aria-label={`View order ${o.id}`}><Eye className="size-4" aria-hidden="true" /></Button>
          {!compact && refundable(o) && (
            <Button variant="ghost" size="sm" onClick={() => setRefundFor(o)}><RotateCcw className="size-4" aria-hidden="true" />Refund</Button>
          )}
        </div>
      ),
    },
  ];

  const detailTickets = detail ? catalog.tickets.filter((t) => t.orderId === detail.id) : [];
  return (
    <>
      <DataTable
        rows={orders}
        columns={columns}
        rowKey={(o) => o.id}
        caption="Bookings"
        searchText={compact ? undefined : (o) => `${o.id} ${o.lines.map((l) => title(l.seminarId)).join(' ')}`}
        searchPlaceholder="Search order or seminar"
        initialSort={{ key: 'date', dir: 'desc' }}
        pageSize={compact ? 5 : 10}
        emptyTitle="No bookings"
        emptyDescription="Your bookings will appear here."
      />
      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={`Order ${detail?.id ?? ''}`}
        description={detail ? `Booked ${formatDateTime(detail.createdAt)}` : undefined}
        footer={
          detail && (
            <>
              <Button variant="secondary" onClick={() => downloadReceipt(detail, title)}><Download className="size-4" aria-hidden="true" />Receipt (demo)</Button>
              <Button onClick={() => setDetail(null)}>Close</Button>
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted">Status</span><StatusBadge status={detail.status} /></div>
            <div className="flex items-center justify-between"><span className="text-muted">Payment</span><span className="text-fg">{PAYMENT_LABELS[detail.paymentMethod]}</span></div>
            <ul className="divide-y divide-line rounded-md border border-line">
              {detail.lines.map((l) => (
                <li key={l.ticketTypeId} className="flex justify-between gap-3 p-3">
                  <span className="text-fg">{l.quantity} × {catalog.ticketTypeName(l.seminarId, l.ticketTypeId)} — {title(l.seminarId)}</span>
                  <span className="shrink-0 tabular-nums text-fg">{formatLKR(l.unitPrice * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1">
              <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd>{formatLKR(detail.subtotal)}</dd></div>
              <div className="flex justify-between text-muted"><dt>Booking fee</dt><dd>{formatLKR(detail.fee)}</dd></div>
              <div className="flex justify-between font-bold text-fg"><dt>Total</dt><dd>{formatLKR(detail.total)}</dd></div>
            </dl>
            {detailTickets.length > 0 && (
              <div>
                <p className="mb-2 font-semibold text-fg">Tickets</p>
                <ul className="space-y-1">
                  {detailTickets.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2">
                      <Link to={`/student/tickets/${t.id}`} className="font-mono text-xs font-semibold text-brand hover:underline">{t.code}</Link>
                      <StatusBadge status={t.status} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={Boolean(refundFor)}
        onClose={() => setRefundFor(null)}
        title="Request a refund"
        description={refundFor ? `Order ${refundFor.id} · ${formatLKR(refundFor.total)}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRefundFor(null)}>Cancel</Button>
            <Button onClick={submitRefund}>Submit request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Notice>Refunds can be requested up to {REFUND_WINDOW_HOURS} hours before the seminar. See the <Link to="/refunds" className="font-semibold text-brand hover:underline">Refund Policy</Link>.</Notice>
          <Select label="Reason" value={reason} onValueChange={setReason} options={['Exam timetable clash', 'Booked the wrong ticket', 'Unable to attend', 'Other'].map((r) => ({ value: r, label: r }))} />
          <Textarea label="Details (optional)" value={note} onValueChange={setNote} rows={3} />
        </div>
      </Modal>
    </>
  );
};

export const MyBookingsPage: React.FC = () => {
  useDocumentTitle('My bookings');
  const { orders } = useStudent();
  const [tab, setTab] = useState<'all' | Order['status']>('all');
  const counts = useMemo(() => ({ paid: orders.filter((o) => o.status === 'paid').length, refunded: orders.filter((o) => o.status === 'refunded').length, failed: orders.filter((o) => o.status === 'failed').length }), [orders]);
  const rows = tab === 'all' ? orders : orders.filter((o) => o.status === tab);
  return (
    <>
      <PageHeader title="My bookings" description="Every order you've placed, with receipts and refund requests." />
      <Card>
        <Tabs label="Filter bookings" value={tab} onChange={setTab} className="px-3" tabs={[{ id: 'all', label: 'All', count: orders.length }, { id: 'paid', label: 'Paid', count: counts.paid }, { id: 'refunded', label: 'Refunded', count: counts.refunded }, { id: 'failed', label: 'Failed', count: counts.failed }]} />
        <OrdersTable key={tab} orders={rows} />
      </Card>
    </>
  );
};

const SeminarTicketList: React.FC<{ tickets: TicketView[]; past?: boolean }> = ({ tickets, past }) => {
  const toast = useToast();
  // Group tickets by seminar
  const groups = [...new Map(tickets.map((t) => [t.seminarId, tickets.filter((x) => x.seminarId === t.seminarId)])).values()];
  return (
    <ul className="space-y-4">
      {groups.map((group) => {
        const s = group[0]!.seminar;
        return (
          <li key={s.id}>
            <Card className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center">
              <SeminarCover seminar={s} compact className="aspect-video w-full shrink-0 rounded-md sm:w-40" />
              <div className="min-w-0 flex-1">
                <Link to={`/seminars/${s.slug}`} className="font-semibold text-fg hover:text-brand">{s.title}</Link>
                <p className="text-sm text-muted">{formatLongDate(s.startsAt)} · {formatTime(s.startsAt)}</p>
                <p className="text-sm text-muted">{s.venue}</p>
                <p className="mt-1 text-xs font-semibold text-muted">{group.length} {group.length === 1 ? 'ticket' : 'tickets'} · {group.map((t) => t.holderName).join(', ')}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                {past ? (
                  <>
                    <StatusBadge status={group.some((t) => t.status === 'checked_in') ? 'checked_in' : 'completed'} />
                    <Button variant="secondary" size="sm" onClick={() => toast('Thanks for your rating (demo)', { tone: 'info' })}>
                      <Star className="size-4" aria-hidden="true" />Rate seminar
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-brand">In {daysUntil(s.startsAt)} days</span>
                    <Button to={`/student/tickets/${group[0]!.id}`} size="sm"><Ticket className="size-4" aria-hidden="true" />Show ticket</Button>
                  </>
                )}
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
};

export const UpcomingSeminarsPage: React.FC = () => {
  useDocumentTitle('Upcoming seminars');
  const { tickets } = useStudent();
  const upcoming = tickets.filter((t) => t.upcoming && t.status === 'valid');
  return (
    <>
      <PageHeader title="Upcoming seminars" description="Seminars you hold valid tickets for." />
      {upcoming.length ? (
        <SeminarTicketList tickets={upcoming} />
      ) : (
        <EmptyState icon={<CalendarClock className="size-5" aria-hidden="true" />} title="No upcoming seminars" description="Book a seminar to see it here." action={<Button to="/seminars" size="sm">Explore seminars</Button>} />
      )}
    </>
  );
};

export const PastSeminarsPage: React.FC = () => {
  useDocumentTitle('Past seminars');
  const { tickets } = useStudent();
  const past = tickets.filter((t) => !t.upcoming && t.status !== 'cancelled').reverse();
  return (
    <>
      <PageHeader title="Past seminars" description="Seminars you've attended or held tickets for." />
      {past.length ? (
        <SeminarTicketList tickets={past} past />
      ) : (
        <EmptyState icon={<CalendarCheck className="size-5" aria-hidden="true" />} title="No past seminars yet" description="Seminars you attend will be listed here." />
      )}
    </>
  );
};

export const BookingHistoryPage: React.FC = () => {
  useDocumentTitle('Booking history');
  const { orders, refunds, catalog } = useStudent();
  const title = (id: string) => catalog.seminarById.get(id)?.title ?? 'Seminar';
  const events = [
    ...orders.map((o) => ({ at: o.createdAt, kind: o.status, label: o.status === 'failed' ? 'Payment declined' : o.status === 'refunded' ? 'Booking refunded' : 'Booking confirmed', detail: `${o.id} · ${title(o.lines[0]!.seminarId)} · ${formatLKR(o.total)}` })),
    ...refunds.map((r) => ({ at: r.createdAt, kind: r.status, label: `Refund request ${r.status}`, detail: `${r.orderId} · ${r.reason}` })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <PageHeader title="Booking history" description="A timeline of every booking, payment and refund on your account." />
      {events.length === 0 ? (
        <EmptyState icon={<History className="size-5" aria-hidden="true" />} title="No history yet" description="Your booking activity will appear here." />
      ) : (
        <Card className="p-5 sm:p-6">
          <ol className="relative space-y-6 border-l border-line pl-6">
            {events.map((e, i) => (
              <li key={i} className="relative">
                <span aria-hidden="true" className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-surface bg-brand" />
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-fg">{e.label}</p>
                  <StatusBadge status={e.kind} />
                </div>
                <p className="mt-0.5 text-sm text-muted">{e.detail}</p>
                <time className="text-xs text-muted" dateTime={e.at}>{formatDateTime(e.at)}</time>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </>
  );
};
