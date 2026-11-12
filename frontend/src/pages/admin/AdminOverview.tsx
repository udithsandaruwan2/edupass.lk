import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BookOpenCheck, Building2, CircleDollarSign, ClipboardList, Download, GraduationCap, Landmark, Percent, RotateCcw, Ticket } from 'lucide-react';
import {
  listAdminPlatformFees,
  listAdminSubscriptionInvoices,
  type ApiPlatformFeeLine,
  type ApiPlatformFeesResponse,
  type ApiSubscriptionInvoice,
} from '../../api/billing';
import { ApiError } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { AreaChart, BarChart, ChartCard, DonutChart } from '../../components/ui/Charts';
import { DataTable } from '../../components/ui/DataTable';
import { Select } from '../../components/ui/Field';
import { Card, CardHeader, Notice } from '../../components/ui/Primitives';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { useCatalog, isUpcoming } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import { changePct, dailyRevenue, monthlySeries, paidOrders, revenueBy, seminarStats } from '../../utils/analytics';
import { downloadFile, toCsv } from '../../utils/csv';
import { formatDateTime, lastMonths, monthKey, relativeTime } from '../../utils/date';
import { formatCompact, formatLKR, formatNumber } from '../../utils/format';

/** Mock-mode estimate only — live revenue uses PlatformFeeLine rows from Nest. */
const COMMISSION = 0.05;
const platformRevenue = (o: { fee: number; subtotal: number }) => o.fee + Math.round(o.subtotal * COMMISSION);

export const AdminOverview: React.FC = () => {
  useDocumentTitle('Admin overview');
  const c = useCatalog();
  const months = monthlySeries(c.orders, 6);
  const paid = paidOrders(c.orders);
  const studentsByMonth = lastMonths(6).map((m) => c.students.filter((s) => monthKey(s.joinedAt) === m.key).length);
  const pendingOrgs = c.organisers.filter((o) => o.status === 'pending');
  const openRefunds = c.refunds.filter((r) => r.status === 'open');

  return (
    <>
      <PageHeader title="Admin overview" description="Platform health across students, organisers and sales." />
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <StatCard label="Total students" value={formatNumber(c.students.length)} icon={GraduationCap} delta={{ value: changePct(studentsByMonth), period: 'last month' }} trend={studentsByMonth} to="/admin/users" />
        <StatCard label="Total organisers" value={formatNumber(c.organisers.length)} icon={Building2} hint={`${pendingOrgs.length} awaiting approval`} to="/admin/organisers" />
        <StatCard label="Total seminars" value={formatNumber(c.seminars.length)} icon={BookOpenCheck} hint={`${c.listed.length} on sale`} to="/admin/seminars" />
        <StatCard label="Total bookings" value={formatNumber(c.orders.length)} icon={ClipboardList} delta={{ value: changePct(months.map((m) => m.orders)), period: 'last month' }} trend={months.map((m) => m.orders)} to="/admin/bookings" />
        <StatCard label="Platform revenue" value={formatLKR(paid.reduce((n, o) => n + platformRevenue(o), 0))} icon={CircleDollarSign} hint="Fees + 5% commission" to="/admin/revenue" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartCard title="Tickets sold per month" table={{ headers: ['Month', 'Tickets', 'Orders'], rows: months.map((m) => [m.label, m.tickets, m.orders]) }}>
          <BarChart data={months.map((m) => ({ label: m.label, values: [m.tickets] }))} seriesNames={['Tickets']} ariaLabel="Column chart of tickets sold per month" />
        </ChartCard>
        <Card>
          <CardHeader title="Needs attention" />
          <ul className="divide-y divide-line">
            {pendingOrgs.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="min-w-0"><span className="block font-semibold text-fg">{o.name}</span><span className="text-muted">Organiser awaiting approval · {relativeTime(o.joinedAt)}</span></span>
                <Button to="/admin/organisers" variant="secondary" size="sm">Review</Button>
              </li>
            ))}
            {openRefunds.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="min-w-0"><span className="block font-semibold text-fg">Refund {formatLKR(r.amount)}</span><span className="text-muted">{r.orderId} · {relativeTime(r.createdAt)}</span></span>
                <Button to="/admin/refunds" variant="secondary" size="sm">Review</Button>
              </li>
            ))}
            {pendingOrgs.length + openRefunds.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted">Nothing needs attention.</li>}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent bookings" actions={<Button to="/admin/bookings" variant="ghost" size="sm">All bookings</Button>} />
        <ul className="divide-y divide-line">
          {c.orders.slice(0, 6).map((o) => (
            <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 text-sm sm:grid-cols-[8rem_minmax(0,1fr)_8rem_6rem]">
              <span className="hidden font-mono text-xs font-semibold text-fg sm:block">{o.id}</span>
              <span className="min-w-0 truncate"><span className="font-semibold text-fg">{o.buyer.name}</span> <span className="text-muted">· {c.seminarById.get(o.lines[0]!.seminarId)?.title}</span></span>
              <span className="text-right tabular-nums text-fg">{formatLKR(o.total)}</span>
              <span className="hidden justify-self-end sm:block"><StatusBadge status={o.status} /></span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
};

export const RevenueOverviewPage: React.FC = () => {
  useDocumentTitle('Revenue overview');
  const { user, usingMocks } = useAuth();
  const c = useCatalog();
  const [fees, setFees] = useState<ApiPlatformFeesResponse | null>(null);
  const [subs, setSubs] = useState<ApiSubscriptionInvoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usingMocks || !user?.accessToken) return;
    let cancelled = false;
    void Promise.all([
      listAdminPlatformFees(user.accessToken),
      listAdminSubscriptionInvoices(user.accessToken),
    ])
      .then(([feeRows, subRows]) => {
        if (cancelled) return;
        setFees(feeRows);
        setSubs(subRows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load revenue');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [usingMocks, user?.accessToken]);

  const byOrg = useMemo(() => {
    if (!fees) return [];
    const map = new Map<string, { name: string; slug: string; fee: number; gmv: number; lines: number }>();
    for (const line of fees.lines.filter((l) => l.status === 'ACTIVE')) {
      const cur = map.get(line.organisationId) ?? {
        name: line.organisationName,
        slug: line.organisationSlug,
        fee: 0,
        gmv: 0,
        lines: 0,
      };
      cur.fee += line.feeAmountLkr;
      cur.gmv += line.ticketSubtotalLkr;
      cur.lines += 1;
      map.set(line.organisationId, cur);
    }
    return [...map.entries()].map(([id, v]) => ({ id, ...v }));
  }, [fees]);

  if (!usingMocks) {
    return (
      <>
        <PageHeader
          title="Platform fee revenue"
          description="Ticket commission lines from approved bank slips (PlatformFeeLine). Subscription invoices listed separately."
        />
        {error && <Notice tone="danger" className="mb-6">{error}</Notice>}
        <StatGrid>
          <StatCard label="Active commission" value={formatLKR(fees?.summary.activeFeeLkr ?? 0)} icon={Percent} hint={`${fees?.summary.activeCount ?? 0} fee lines`} />
          <StatCard label="Ticket GMV (fee base)" value={formatLKR(fees?.summary.activeTicketSubtotalLkr ?? 0)} icon={Landmark} hint="Subtotals on active lines" />
          <StatCard label="Voided commission" value={formatLKR(fees?.summary.voidedFeeLkr ?? 0)} icon={RotateCcw} hint="Refunded / voided lines" />
          <StatCard
            label="Plan invoices paid"
            value={formatLKR(subs.filter((s) => s.status === 'PAID').reduce((n, s) => n + s.amountLkr, 0))}
            icon={CircleDollarSign}
            hint={`${subs.length} subscription invoices`}
          />
        </StatGrid>
        <Card className="mt-6">
          <CardHeader title="Fee lines" description="Newest 200 platform commission rows" />
          <DataTable
            rows={fees?.lines ?? []}
            rowKey={(r: ApiPlatformFeeLine) => r.id}
            caption="Platform fee lines"
            searchText={(r) => `${r.orderId} ${r.organisationName}`}
            searchPlaceholder="Order or organiser"
            initialSort={{ key: 'created', dir: 'desc' }}
            exportName="edupass-platform-fees"
            pageSize={15}
            columns={[
              { key: 'created', header: 'When', sortValue: (r) => r.createdAt, render: (r) => formatDateTime(r.createdAt), hideBelow: 'md' },
              { key: 'org', header: 'Organiser', sortValue: (r) => r.organisationName, render: (r) => r.organisationName },
              { key: 'order', header: 'Order', sortValue: (r) => r.orderId, render: (r) => <span className="font-mono text-xs">{r.orderId.slice(0, 10)}…</span> },
              { key: 'pct', header: '%', align: 'right', sortValue: (r) => r.commissionPercent, render: (r) => `${r.commissionPercent}%`, hideBelow: 'sm' },
              { key: 'gmv', header: 'Ticket subtotal', align: 'right', sortValue: (r) => r.ticketSubtotalLkr, render: (r) => formatLKR(r.ticketSubtotalLkr) },
              { key: 'fee', header: 'Fee', align: 'right', sortValue: (r) => r.feeAmountLkr, render: (r) => formatLKR(r.feeAmountLkr) },
              { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadge status={r.status === 'ACTIVE' ? 'paid' : 'refunded'} /> },
            ]}
          />
        </Card>
        <Card className="mt-6">
          <CardHeader title="By organiser (active fees)" />
          <DataTable
            rows={byOrg}
            rowKey={(r) => r.id}
            caption="Platform fees by organiser"
            initialSort={{ key: 'fee', dir: 'desc' }}
            exportName="edupass-fees-by-organiser"
            columns={[
              { key: 'org', header: 'Organiser', sortValue: (r) => r.name, render: (r) => r.name },
              { key: 'lines', header: 'Lines', align: 'right', sortValue: (r) => r.lines, render: (r) => formatNumber(r.lines), hideBelow: 'sm' },
              { key: 'gmv', header: 'Ticket subtotal', align: 'right', sortValue: (r) => r.gmv, render: (r) => formatLKR(r.gmv) },
              { key: 'fee', header: 'Commission', align: 'right', sortValue: (r) => r.fee, render: (r) => formatLKR(r.fee) },
            ]}
          />
        </Card>
        <Card className="mt-6">
          <CardHeader title="Subscription invoices" description="Institute plan upgrades billed to the platform bank account" />
          <DataTable
            rows={subs}
            rowKey={(r) => r.id}
            caption="Platform subscription invoices"
            initialSort={{ key: 'created', dir: 'desc' }}
            exportName="edupass-subscription-invoices"
            columns={[
              { key: 'created', header: 'When', sortValue: (r) => r.createdAt, render: (r) => formatDateTime(r.createdAt), hideBelow: 'md' },
              { key: 'org', header: 'Organisation', sortValue: (r) => r.organisationName, render: (r) => r.organisationName },
              { key: 'plan', header: 'Plan', sortValue: (r) => r.planCode, render: (r) => r.planCode },
              { key: 'amount', header: 'Amount', align: 'right', sortValue: (r) => r.amountLkr, render: (r) => formatLKR(r.amountLkr) },
              { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => r.status },
            ]}
          />
        </Card>
      </>
    );
  }

  const months = monthlySeries(c.orders, 6);
  const daily = dailyRevenue(c.orders, 30);
  const paid = paidOrders(c.orders);
  const gmv = paid.reduce((n, o) => n + o.subtotal, 0);
  const bookingFees = paid.reduce((n, o) => n + o.fee, 0);
  const commission = Math.round(gmv * COMMISSION);
  const refunded = c.orders.filter((o) => o.status === 'refunded').reduce((n, o) => n + o.total, 0);
  const byCategory = revenueBy(c.orders, c.seminarById, (s) => c.categoryById.get(s.categoryId)?.name ?? 'Other', 4);
  const byOrganiser = c.organisers.map((org) => {
    const mine = paid.filter((o) => c.seminarById.get(o.lines[0]!.seminarId)?.organiserId === org.id);
    return { org, orders: mine.length, gmv: mine.reduce((n, o) => n + o.subtotal, 0), platform: mine.reduce((n, o) => n + platformRevenue(o), 0) };
  });

  return (
    <>
      <PageHeader title="Revenue overview" description="Mock estimate — turn off VITE_USE_MOCKS for live PlatformFeeLine revenue." />
      <Notice tone="info" className="mb-6">Mock mode estimates platform take as booking fees + 5% of ticket subtotals.</Notice>
      <StatGrid>
        <StatCard label="Gross ticket sales" value={formatLKR(gmv)} icon={Landmark} delta={{ value: changePct(months.map((m) => m.revenue)), period: 'last month' }} trend={months.map((m) => m.revenue)} />
        <StatCard label="Booking fees" value={formatLKR(bookingFees)} icon={Ticket} hint="Charged to students" />
        <StatCard label="Commission (5%)" value={formatLKR(commission)} icon={Percent} hint="Mock estimate" />
        <StatCard label="Refunded" value={formatLKR(refunded)} icon={RotateCcw} hint="Including booking fees" />
      </StatGrid>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartCard title="Daily gross sales" description="Last 30 days" table={{ headers: ['Day', 'Sales'], rows: daily.map((d) => [d.label, formatLKR(d.value)]) }}>
          <AreaChart data={daily} seriesName="Gross sales" ariaLabel="Line chart of daily gross ticket sales" />
        </ChartCard>
        <ChartCard title="Sales by category" table={{ headers: ['Category', 'Sales'], rows: byCategory.map((d) => [d.label, formatLKR(d.value)]) }}>
          <DonutChart data={byCategory} centerLabel="GMV" format={formatCompact} ariaLabel="Donut chart of gross sales by category" />
        </ChartCard>
      </div>
      <Card className="mt-6">
        <CardHeader title="By organiser" />
        <DataTable
          rows={byOrganiser}
          rowKey={(r) => r.org.id}
          caption="Revenue by organiser"
          initialSort={{ key: 'gmv', dir: 'desc' }}
          exportName="edupass-revenue-by-organiser"
          columns={[
            { key: 'org', header: 'Organiser', sortValue: (r) => r.org.name, render: (r) => <Link to={`/organisers/${r.org.slug}`} className="font-semibold text-fg hover:text-brand">{r.org.name}</Link> },
            { key: 'orders', header: 'Paid orders', align: 'right', sortValue: (r) => r.orders, render: (r) => formatNumber(r.orders), hideBelow: 'sm' },
            { key: 'gmv', header: 'Gross sales', align: 'right', sortValue: (r) => r.gmv, render: (r) => formatLKR(r.gmv) },
            { key: 'platform', header: 'Platform revenue', align: 'right', sortValue: (r) => r.platform, render: (r) => formatLKR(r.platform), hideBelow: 'md' },
          ]}
        />
      </Card>
    </>
  );
};

export const ReportsPage: React.FC = () => {
  useDocumentTitle('Reports & analytics');
  const c = useCatalog();
  const [months, setMonths] = useState('6');
  const series = monthlySeries(c.orders, Number(months));
  const byDistrict = Object.entries(c.students.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.district]: (acc[s.district] ?? 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1]);
  const districtData = [...byDistrict.slice(0, 3).map(([label, value]) => ({ label, value })), { label: 'Other', value: byDistrict.slice(3).reduce((n, [, v]) => n + v, 0) }];
  const top = c.seminars.filter((s) => s.status === 'published').map((s) => ({ s, ...seminarStats(s, c.orders) }));
  const failed = c.orders.filter((o) => o.status === 'failed').length;

  const exports: { label: string; run: () => void }[] = [
    { label: 'Monthly sales', run: () => downloadFile('edupass-monthly-sales.csv', toCsv(['Month', 'Orders', 'Tickets', 'Revenue (LKR)'], series.map((m) => [m.label, m.orders, m.tickets, m.revenue]))) },
    { label: 'Seminar performance', run: () => downloadFile('edupass-seminar-performance.csv', toCsv(['Seminar', 'Date', 'Sold', 'Capacity', 'Fill %', 'Revenue'], top.map((t) => [t.s.title, t.s.startsAt.slice(0, 10), t.sold, t.capacity, t.fill, t.revenue]))) },
    { label: 'Students by district', run: () => downloadFile('edupass-students-by-district.csv', toCsv(['District', 'Students'], byDistrict)) },
  ];

  return (
    <>
      <PageHeader title="Reports & analytics" description="Platform-wide trends from live bookings and catalogue data." actions={<Select label="Period" hideLabel value={months} onValueChange={setMonths} options={[{ value: '3', label: 'Last 3 months' }, { value: '6', label: 'Last 6 months' }, { value: '12', label: 'Last 12 months' }]} className="w-44" />} />
      <StatGrid>
        <StatCard label="Orders in period" value={formatNumber(series.reduce((n, m) => n + m.orders, 0))} icon={ClipboardList} />
        <StatCard label="Tickets in period" value={formatNumber(series.reduce((n, m) => n + m.tickets, 0))} icon={Ticket} />
        <StatCard label="Payment success rate" value={`${c.orders.length ? Math.round(((c.orders.length - failed) / c.orders.length) * 100) : 0}%`} icon={CircleDollarSign} hint={`${failed} declined`} />
        <StatCard label="Live seminars" value={String(c.seminars.filter((s) => s.status === 'published' && isUpcoming(s)).length)} icon={BookOpenCheck} />
      </StatGrid>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartCard title="Revenue by month" table={{ headers: ['Month', 'Revenue', 'Orders', 'Tickets'], rows: series.map((m) => [m.label, formatLKR(m.revenue), m.orders, m.tickets]) }}>
          <BarChart data={series.map((m) => ({ label: m.label, values: [m.revenue] }))} seriesNames={['Revenue']} ariaLabel="Column chart of revenue by month" />
        </ChartCard>
        <ChartCard title="Students by district" table={{ headers: ['District', 'Students'], rows: byDistrict }}>
          <DonutChart data={districtData} centerLabel="Students" ariaLabel="Donut chart of students by district" />
        </ChartCard>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Seminar leaderboard" />
          <DataTable
            rows={top}
            rowKey={(t) => t.s.id}
            caption="Seminar leaderboard"
            pageSize={8}
            initialSort={{ key: 'rev', dir: 'desc' }}
            columns={[
              { key: 's', header: 'Seminar', sortValue: (t) => t.s.title, render: (t) => <span className="font-semibold text-fg">{t.s.title}</span> },
              { key: 'fill', header: 'Fill', align: 'right', sortValue: (t) => t.fill, render: (t) => `${t.fill}%`, hideBelow: 'sm' },
              { key: 'sold', header: 'Tickets', align: 'right', sortValue: (t) => t.sold, render: (t) => formatNumber(t.sold), hideBelow: 'sm' },
              { key: 'rev', header: 'Revenue', align: 'right', sortValue: (t) => t.revenue, render: (t) => formatLKR(t.revenue) },
            ]}
          />
        </Card>
        <Card>
          <CardHeader title="Export reports" description="CSV files generated in your browser" />
          <ul className="divide-y divide-line">
            {exports.map((e) => (
              <li key={e.label} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="text-sm font-semibold text-fg">{e.label}</span>
                <Button variant="secondary" size="sm" onClick={e.run}><Download className="size-4" aria-hidden="true" />CSV</Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <p className="mt-6 text-xs text-muted">Revenue = ticket subtotals of paid orders, excluding booking fees.</p>
    </>
  );
};
