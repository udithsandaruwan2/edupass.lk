import React, { useMemo, useState } from 'react';
import { CircleDollarSign, Gauge, Percent, ReceiptText, Ticket, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BarChart, ChartCard, DonutChart } from '../../components/ui/Charts';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Input, Select } from '../../components/ui/Field';
import { Card, CardHeader, EmptyState, ProgressBar } from '../../components/ui/Primitives';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { isUpcoming } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import type { Seminar } from '../../types';
import { changePct, monthlySeries, paidOrders, revenueBy, seminarStats, ticketsIn } from '../../utils/analytics';
import { downloadFile, toCsv } from '../../utils/csv';
import { formatShortDate } from '../../utils/date';
import { PAYMENT_LABELS, formatCompact, formatLKR, formatNumber } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganiser } from './useOrganiser';

export const RevenueAnalyticsPage: React.FC = () => {
  useDocumentTitle('Revenue analytics');
  const { user } = useAuth();
  const { orders, catalog, seminars, usingApi } = useOrganiser();
  const [range, setRange] = useState('6');
  const months = monthlySeries(orders, Number(range));
  const paid = paidOrders(orders);
  const gross = paid.reduce((n, o) => n + o.subtotal, 0);
  const ratePct = user?.commissionPercent ?? 5;
  const commission = Math.round(gross * (ratePct / 100));
  const bySubject = revenueBy(orders, catalog.seminarById, (s) => s.subject, 4);
  const methods = Object.entries(
    paid.reduce<Record<string, number>>((acc, o) => ({ ...acc, [PAYMENT_LABELS[o.paymentMethod]]: (acc[PAYMENT_LABELS[o.paymentMethod]] ?? 0) + o.subtotal }), {}),
  ).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const ticketTypeRevenue = seminars.flatMap((s) => s.ticketTypes.map((t) => ({ seminar: s, type: t, revenue: t.price * t.sold })));

  return (
    <>
      <PageHeader
        title="Revenue analytics"
        description={usingApi ? 'Earnings from your paid ticket orders after platform commission.' : 'Mock earnings estimate from local orders.'}
        actions={<Select label="Range" hideLabel value={range} onValueChange={setRange} options={[{ value: '3', label: 'Last 3 months' }, { value: '6', label: 'Last 6 months' }, { value: '12', label: 'Last 12 months' }]} className="w-44" />}
      />
      <StatGrid>
        <StatCard label="Gross ticket sales" value={formatLKR(gross)} icon={CircleDollarSign} delta={{ value: changePct(months.map((m) => m.revenue)), period: 'last month' }} trend={months.map((m) => m.revenue)} />
        <StatCard label={`Platform commission (${ratePct}%)`} value={formatLKR(commission)} icon={Percent} hint="From your plan / platform settings" />
        <StatCard label="Net payout" value={formatLKR(gross - commission)} icon={ReceiptText} hint="Before bank charges" />
        <StatCard label="Paid orders" value={formatNumber(paid.length)} icon={Ticket} hint={`Avg ${formatLKR(paid.length ? Math.round(gross / paid.length) : 0)}`} />
      </StatGrid>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartCard title="Revenue by month" description="Ticket subtotals" table={{ headers: ['Month', 'Revenue', 'Tickets', 'Orders'], rows: months.map((m) => [m.label, formatLKR(m.revenue), m.tickets, m.orders]) }}>
          <BarChart data={months.map((m) => ({ label: m.label, values: [m.revenue] }))} seriesNames={['Revenue']} ariaLabel="Column chart of monthly revenue" />
        </ChartCard>
        <ChartCard title="Revenue by subject" table={{ headers: ['Subject', 'Revenue'], rows: bySubject.map((d) => [d.label, formatLKR(d.value)]) }}>
          <DonutChart data={bySubject} centerLabel="Total" ariaLabel="Donut chart of revenue split by subject" />
        </ChartCard>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="By payment method" />
          <ul className="space-y-4 p-5">
            {methods.map((m) => (
              <li key={m.label}>
                <div className="mb-1 flex justify-between text-sm"><span className="text-fg">{m.label}</span><span className="tabular-nums text-muted">{formatLKR(m.value)}</span></div>
                <ProgressBar value={m.value} max={gross} label={`${m.label} share`} />
              </li>
            ))}
            {methods.length === 0 && <li className="text-sm text-muted">No paid orders yet.</li>}
          </ul>
        </Card>
        <Card>
          <CardHeader title="By ticket type" />
          <DataTable
            rows={ticketTypeRevenue}
            rowKey={(r) => r.type.id}
            caption="Revenue by ticket type"
            pageSize={6}
            initialSort={{ key: 'rev', dir: 'desc' }}
            columns={[
              { key: 'name', header: 'Ticket', sortValue: (r) => r.type.name, render: (r) => <div><p className="font-semibold text-fg">{r.type.name}</p><p className="text-xs text-muted">{r.seminar.title}</p></div> },
              { key: 'sold', header: 'Sold', align: 'right', sortValue: (r) => r.type.sold, render: (r) => formatNumber(r.type.sold) },
              { key: 'rev', header: 'Revenue', align: 'right', sortValue: (r) => r.revenue, render: (r) => formatLKR(r.revenue) },
            ]}
          />
        </Card>
      </div>
    </>
  );
};

interface ReportRow {
  seminar: Seminar;
  orders: number;
  tickets: number;
  revenue: number;
  refunded: number;
}

export const SalesReportsPage: React.FC = () => {
  useDocumentTitle('Sales reports');
  const { orders, seminars, organiser } = useOrganiser();
  const d = new Date();
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  const [from, setFrom] = useState(iso(new Date(d.getFullYear(), d.getMonth() - 2, 1)));
  const [to, setTo] = useState(iso(d));
  const inRange = useMemo(() => orders.filter((o) => o.createdAt.slice(0, 10) >= from && o.createdAt.slice(0, 10) <= to), [orders, from, to]);
  const rows: ReportRow[] = seminars
    .map((s) => {
      const mine = inRange.filter((o) => o.lines.some((l) => l.seminarId === s.id));
      const p = mine.filter((o) => o.status === 'paid');
      return { seminar: s, orders: p.length, tickets: p.reduce((n, o) => n + ticketsIn(o), 0), revenue: p.reduce((n, o) => n + o.subtotal, 0), refunded: mine.filter((o) => o.status === 'refunded').reduce((n, o) => n + o.subtotal, 0) };
    })
    .filter((r) => r.orders || r.refunded);
  const total = rows.reduce((t, r) => ({ orders: t.orders + r.orders, tickets: t.tickets + r.tickets, revenue: t.revenue + r.revenue, refunded: t.refunded + r.refunded }), { orders: 0, tickets: 0, revenue: 0, refunded: 0 });
  const invalid = from > to;

  const exportReport = () => {
    downloadFile(
      `edupass-sales-${from}-to-${to}.csv`,
      toCsv(['Seminar', 'Date', 'Paid orders', 'Tickets', 'Revenue (LKR)', 'Refunded (LKR)'], [...rows.map((r) => [r.seminar.title, r.seminar.startsAt.slice(0, 10), r.orders, r.tickets, r.revenue, r.refunded]), ['TOTAL', '', total.orders, total.tickets, total.revenue, total.refunded]]),
    );
  };

  const columns: Column<ReportRow>[] = [
    { key: 's', header: 'Seminar', sortValue: (r) => r.seminar.title, render: (r) => <div><p className="font-semibold text-fg">{r.seminar.title}</p><p className="text-xs text-muted">{formatShortDate(r.seminar.startsAt)}</p></div> },
    { key: 'o', header: 'Orders', align: 'right', sortValue: (r) => r.orders, render: (r) => formatNumber(r.orders), hideBelow: 'sm' },
    { key: 't', header: 'Tickets', align: 'right', sortValue: (r) => r.tickets, render: (r) => formatNumber(r.tickets) },
    { key: 'r', header: 'Revenue', align: 'right', sortValue: (r) => r.revenue, render: (r) => formatLKR(r.revenue) },
    { key: 'f', header: 'Refunded', align: 'right', sortValue: (r) => r.refunded, render: (r) => formatLKR(r.refunded), hideBelow: 'md' },
  ];

  return (
    <>
      <PageHeader title="Sales reports" description={`${organiser?.name ?? ''} · choose a period and export.`} actions={<Button onClick={exportReport} disabled={invalid || !rows.length}>Export report (CSV)</Button>} />
      <Card className="mb-6 grid gap-4 p-5 sm:grid-cols-[12rem_12rem_minmax(0,1fr)] sm:items-end">
        <Input label="From" type="date" value={from} max={to} onValueChange={setFrom} />
        <Input label="To" type="date" value={to} min={from} onValueChange={setTo} error={invalid ? 'End date is before start date' : undefined} />
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div><dt className="text-muted">Orders</dt><dd className="text-lg font-bold text-fg">{formatNumber(total.orders)}</dd></div>
          <div><dt className="text-muted">Tickets</dt><dd className="text-lg font-bold text-fg">{formatNumber(total.tickets)}</dd></div>
          <div><dt className="text-muted">Revenue</dt><dd className="text-lg font-bold text-fg">{formatCompact(total.revenue)}</dd></div>
        </dl>
      </Card>
      <Card>
        <DataTable rows={invalid ? [] : rows} columns={columns} rowKey={(r) => r.seminar.id} caption="Sales by seminar" initialSort={{ key: 'r', dir: 'desc' }} emptyTitle="No sales in this period" emptyDescription="Try a wider date range." />
      </Card>
    </>
  );
};

export const EventPerformancePage: React.FC = () => {
  useDocumentTitle('Event performance');
  const { seminars, orders, tickets } = useOrganiser();
  const live = seminars.filter((s) => s.status === 'published');
  const stats = live.map((s) => {
    const st = seminarStats(s, orders);
    const mine = tickets.filter((t) => t.seminarId === s.id && t.status !== 'cancelled');
    const attended = mine.filter((t) => t.status === 'checked_in').length;
    const potential = s.ticketTypes.reduce((n, t) => n + t.price * t.capacity, 0);
    return { s, ...st, attendance: mine.length ? Math.round((attended / mine.length) * 100) : 0, potential, upcoming: isUpcoming(s) };
  });
  const past = stats.filter((x) => !x.upcoming);
  const avgFill = stats.length ? Math.round(stats.reduce((n, x) => n + x.fill, 0) / stats.length) : 0;
  const avgAttend = past.length ? Math.round(past.reduce((n, x) => n + x.attendance, 0) / past.length) : 0;
  const top = [...stats].sort((a, b) => b.revenue - a.revenue)[0];

  if (!live.length) {
    return (
      <>
        <PageHeader title="Event performance" />
        <EmptyState icon={<Gauge className="size-5" aria-hidden="true" />} title="No published seminars" description="Performance appears once tickets start selling." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Event performance" description="How each published seminar is selling and how many attendees turned up." />
      <StatGrid>
        <StatCard label="Average fill rate" value={`${avgFill}%`} icon={Gauge} hint="All published seminars" />
        <StatCard label="Attendance rate" value={`${avgAttend}%`} icon={UserCheck} hint="Checked in, past seminars" />
        <StatCard label="Top earner" value={top ? formatCompact(top.revenue) : '—'} icon={CircleDollarSign} hint={top?.s.title} />
        <StatCard label="Seats sold" value={formatNumber(stats.reduce((n, x) => n + x.sold, 0))} icon={Ticket} hint={`of ${formatNumber(stats.reduce((n, x) => n + x.capacity, 0))}`} />
      </StatGrid>
      <ChartCard className="mt-6" title="Fill rate by seminar" description="Percent of seats sold" table={{ headers: ['Seminar', 'Fill %', 'Attendance %'], rows: stats.map((x) => [x.s.title, `${x.fill}%`, x.upcoming ? '—' : `${x.attendance}%`]) }}>
        <BarChart data={stats.map((x) => ({ label: x.s.subject.split(' ')[0]!.slice(0, 9), values: [x.fill] }))} seriesNames={['Fill rate']} format={(n) => `${Math.round(n)}%`} ariaLabel="Column chart of fill rate per seminar" />
      </ChartCard>
      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((x) => (
          <li key={x.s.id}>
            <Card className="h-full p-5">
              <p className="font-semibold text-fg">{x.s.title}</p>
              <p className="text-xs text-muted">{formatShortDate(x.s.startsAt)} · {x.upcoming ? 'Upcoming' : 'Completed'}</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <div className="mb-1 flex justify-between"><dt className="text-muted">Seats sold</dt><dd className="font-semibold text-fg">{x.sold}/{x.capacity} · {x.fill}%</dd></div>
                  <ProgressBar value={x.sold} max={x.capacity} label="Seats sold" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between"><dt className="text-muted">Revenue vs potential</dt><dd className="font-semibold text-fg">{formatCompact(x.revenue)} / {formatCompact(x.potential)}</dd></div>
                  <ProgressBar value={x.revenue} max={x.potential} label="Revenue vs potential" />
                </div>
                {!x.upcoming && (
                  <div className="flex justify-between"><dt className="text-muted">Attendance</dt><dd className="font-semibold text-fg">{x.attendance}%</dd></div>
                )}
              </dl>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
};
