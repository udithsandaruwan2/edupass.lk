import React, { useState } from 'react';
import { Check, CircleDollarSign, CreditCard, RotateCcw, TriangleAlert, Wallet, X } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Field';
import { Card, Notice } from '../../components/ui/Primitives';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { Tabs } from '../../components/ui/Tabs';
import { DEMO_ACCOUNTS } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useCatalog } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import type { Order, RefundRequest, Ticket } from '../../types';
import { ticketsIn } from '../../utils/analytics';
import { formatDate, formatDateTime } from '../../utils/date';
import { PAYMENT_LABELS, formatLKR, formatNumber } from '../../utils/format';

const STATUS_OPTIONS = [{ value: '', label: 'All statuses' }, { value: 'paid', label: 'Paid' }, { value: 'refunded', label: 'Refunded' }, { value: 'failed', label: 'Failed' }];

export const AdminBookingsPage: React.FC = () => {
  useDocumentTitle('Booking management');
  const c = useCatalog();
  const [status, setStatus] = useState('');
  const rows = c.orders.filter((o) => !status || o.status === status);
  const title = (o: Order) => c.seminarById.get(o.lines[0]!.seminarId)?.title ?? '';
  const columns: Column<Order>[] = [
    { key: 'id', header: 'Order', sortValue: (o) => o.id, render: (o) => <span className="font-mono text-xs font-semibold">{o.id}</span> },
    { key: 'buyer', header: 'Student', sortValue: (o) => o.buyer.name, render: (o) => <div><p className="font-semibold text-fg">{o.buyer.name}</p><p className="text-xs text-muted">{o.buyer.email}</p></div> },
    { key: 'seminar', header: 'Seminar', sortValue: title, render: (o) => <span className="line-clamp-1">{title(o)}</span>, hideBelow: 'md' },
    { key: 'org', header: 'Organiser', sortValue: (o) => c.organiserById.get(c.seminarById.get(o.lines[0]!.seminarId)?.organiserId ?? '')?.name ?? '', render: (o) => c.organiserById.get(c.seminarById.get(o.lines[0]!.seminarId)?.organiserId ?? '')?.name, hideBelow: 'lg' },
    { key: 'qty', header: 'Tickets', align: 'right', sortValue: ticketsIn, render: ticketsIn, hideBelow: 'sm' },
    { key: 'total', header: 'Total', align: 'right', sortValue: (o) => o.total, render: (o) => formatLKR(o.total) },
    { key: 'date', header: 'Date', sortValue: (o) => o.createdAt, render: (o) => formatDate(o.createdAt), hideBelow: 'lg' },
    { key: 'status', header: 'Status', sortValue: (o) => o.status, render: (o) => <StatusBadge status={o.status} /> },
  ];
  return (
    <>
      <PageHeader title="Booking management" description={`${formatNumber(c.orders.length)} orders across the platform (demo)`} />
      <Card>
        <DataTable rows={rows} columns={columns} rowKey={(o) => o.id} caption="All bookings" searchText={(o) => `${o.id} ${o.buyer.name} ${o.buyer.email} ${title(o)}`} searchPlaceholder="Order, student or seminar" initialSort={{ key: 'date', dir: 'desc' }} exportName="edupass-all-bookings" pageSize={15}
          toolbar={<Select label="Status" hideLabel value={status} onValueChange={setStatus} options={STATUS_OPTIONS} className="w-40" />} />
      </Card>
    </>
  );
};

export const AdminTicketsPage: React.FC = () => {
  useDocumentTitle('Ticket management');
  const c = useCatalog();
  const { patch } = useData();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [voiding, setVoiding] = useState<Ticket | null>(null);
  const rows = c.tickets.filter((t) => !status || t.status === status);
  const columns: Column<Ticket>[] = [
    { key: 'code', header: 'Code', sortValue: (t) => t.code, render: (t) => <span className="font-mono text-xs font-semibold">{t.code}</span> },
    { key: 'holder', header: 'Holder', sortValue: (t) => t.holderName, render: (t) => t.holderName },
    { key: 'seminar', header: 'Seminar', sortValue: (t) => c.seminarById.get(t.seminarId)?.title ?? '', render: (t) => <span className="line-clamp-1">{c.seminarById.get(t.seminarId)?.title}</span>, hideBelow: 'md' },
    { key: 'type', header: 'Type', sortValue: (t) => c.ticketTypeName(t.seminarId, t.ticketTypeId), render: (t) => c.ticketTypeName(t.seminarId, t.ticketTypeId), hideBelow: 'lg' },
    { key: 'order', header: 'Order', sortValue: (t) => t.orderId, render: (t) => <span className="font-mono text-xs">{t.orderId}</span>, hideBelow: 'lg' },
    { key: 'status', header: 'Status', sortValue: (t) => t.status, render: (t) => <StatusBadge status={t.status} /> },
    {
      key: 'act',
      header: 'Action',
      align: 'right',
      render: (t) =>
        t.status === 'valid' ? (
          <Button variant="ghost" size="sm" onClick={() => setVoiding(t)}>Void</Button>
        ) : t.status === 'cancelled' && c.orders.find((o) => o.id === t.orderId)?.status === 'paid' ? (
          <Button variant="ghost" size="sm" onClick={() => { patch('tickets', t.id, { status: 'valid' }); toast('Ticket restored'); }}>Restore</Button>
        ) : null,
    },
  ];
  return (
    <>
      <PageHeader title="Ticket management" description={`${formatNumber(c.tickets.length)} tickets issued (demo)`} />
      <Card>
        <DataTable rows={rows} columns={columns} rowKey={(t) => t.id} caption="Tickets" searchText={(t) => `${t.code} ${t.holderName} ${t.orderId}`} searchPlaceholder="Code, holder or order" initialSort={{ key: 'holder', dir: 'asc' }} exportName="edupass-tickets" pageSize={15}
          toolbar={<Select label="Status" hideLabel value={status} onValueChange={setStatus} options={[{ value: '', label: 'All statuses' }, { value: 'valid', label: 'Valid' }, { value: 'checked_in', label: 'Checked in' }, { value: 'cancelled', label: 'Cancelled' }]} className="w-40" />} />
      </Card>
      <ConfirmDialog open={Boolean(voiding)} title="Void this ticket?" description={`${voiding?.code ?? ''} (${voiding?.holderName ?? ''}) will be rejected at check-in. The order is not refunded automatically.`} confirmLabel="Void ticket" onCancel={() => setVoiding(null)} onConfirm={() => { if (voiding) patch('tickets', voiding.id, { status: 'cancelled' }); setVoiding(null); toast('Ticket voided', { tone: 'info' }); }} />
    </>
  );
};

/** Payment transaction ids are derived from order ids; there is no real gateway. */
const txnId = (o: Order) => o.id.replace('ORD', 'PAY');

export const PaymentRecordsPage: React.FC = () => {
  useDocumentTitle('Payment records');
  const c = useCatalog();
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const rows = c.orders.filter((o) => (!method || o.paymentMethod === method) && (!status || o.status === status));
  const paid = c.orders.filter((o) => o.status === 'paid');
  const failed = c.orders.filter((o) => o.status === 'failed');
  const columns: Column<Order>[] = [
    { key: 'txn', header: 'Transaction', sortValue: txnId, render: (o) => <span className="font-mono text-xs font-semibold">{txnId(o)}</span> },
    { key: 'order', header: 'Order', sortValue: (o) => o.id, render: (o) => <span className="font-mono text-xs">{o.id}</span>, hideBelow: 'lg' },
    { key: 'method', header: 'Method', sortValue: (o) => o.paymentMethod, render: (o) => PAYMENT_LABELS[o.paymentMethod], hideBelow: 'md' },
    { key: 'amount', header: 'Amount', align: 'right', sortValue: (o) => o.total, render: (o) => formatLKR(o.total) },
    { key: 'fee', header: 'Booking fee', align: 'right', sortValue: (o) => o.fee, render: (o) => formatLKR(o.fee), hideBelow: 'sm' },
    { key: 'date', header: 'Date', sortValue: (o) => o.createdAt, render: (o) => formatDateTime(o.createdAt), hideBelow: 'lg' },
    { key: 'status', header: 'Status', sortValue: (o) => o.status, render: (o) => <StatusBadge status={o.status} /> },
  ];
  return (
    <>
      <PageHeader title="Payment records" description="Simulated payment transactions. No gateway is connected." />
      <Notice tone="warning" icon={<TriangleAlert className="size-4 text-warning" aria-hidden="true" />} className="mb-6">Demo records only — these are not real payments and contain no card data.</Notice>
      <StatGrid>
        <StatCard label="Successful payments" value={formatNumber(paid.length)} icon={CreditCard} />
        <StatCard label="Collected (incl. fees)" value={formatLKR(paid.reduce((n, o) => n + o.total, 0))} icon={CircleDollarSign} />
        <StatCard label="Declined" value={formatNumber(failed.length)} icon={X} hint={`${c.orders.length ? ((failed.length / c.orders.length) * 100).toFixed(1) : 0}% of attempts`} />
        <StatCard label="Instalment plans" value={formatNumber(paid.filter((o) => o.paymentMethod === 'koko').length)} icon={Wallet} />
      </StatGrid>
      <Card className="mt-6">
        <DataTable rows={rows} columns={columns} rowKey={(o) => o.id} caption="Payment records" searchText={(o) => `${txnId(o)} ${o.id} ${o.buyer.email}`} searchPlaceholder="Transaction, order or email" initialSort={{ key: 'date', dir: 'desc' }} exportName="edupass-payments" pageSize={15}
          toolbar={
            <>
              <Select label="Method" hideLabel value={method} onValueChange={setMethod} options={[{ value: '', label: 'All methods' }, ...Object.entries(PAYMENT_LABELS).map(([value, label]) => ({ value, label }))]} className="w-48" />
              <Select label="Status" hideLabel value={status} onValueChange={setStatus} options={STATUS_OPTIONS} className="w-40" />
            </>
          } />
      </Card>
    </>
  );
};

export const RefundRequestsPage: React.FC = () => {
  useDocumentTitle('Refund requests');
  const c = useCatalog();
  const { setData, notify } = useData();
  const toast = useToast();
  const [tab, setTab] = useState<'open' | 'approved' | 'rejected'>('open');
  const [deciding, setDeciding] = useState<{ r: RefundRequest; approve: boolean } | null>(null);
  const rows = c.refunds.filter((r) => r.status === tab);
  const orderOf = (r: RefundRequest) => c.orders.find((o) => o.id === r.orderId);

  const decide = () => {
    if (!deciding) return;
    const { r, approve } = deciding;
    const order = orderOf(r);
    setData((d) => ({
      ...d,
      refunds: d.refunds.map((x) => (x.id === r.id ? { ...x, status: approve ? 'approved' : 'rejected' } : x)),
      ...(approve && order
        ? {
            orders: d.orders.map((o) => (o.id === order.id ? { ...o, status: 'refunded' as const } : o)),
            tickets: d.tickets.map((t) => (t.orderId === order.id && t.status === 'valid' ? { ...t, status: 'cancelled' as const } : t)),
            // Seats go back on sale
            seminars: d.seminars.map((s) => ({ ...s, ticketTypes: s.ticketTypes.map((tt) => { const line = order.lines.find((l) => l.ticketTypeId === tt.id); return line ? { ...tt, sold: Math.max(0, tt.sold - line.quantity) } : tt; }) })),
          }
        : {}),
    }));
    if (r.studentId === DEMO_ACCOUNTS.student.id) {
      notify('student', approve ? 'Refund approved (demo)' : 'Refund request declined', `Order ${r.orderId}: ${approve ? `${formatLKR(r.amount)} refunded.` : 'see the Refund Policy for details.'}`, '/student/history');
    }
    toast(approve ? 'Refund approved' : 'Refund rejected', { tone: approve ? 'success' : 'info', description: approve ? 'Order refunded and tickets voided (simulated).' : undefined });
    setDeciding(null);
  };

  const columns: Column<RefundRequest>[] = [
    { key: 'order', header: 'Order', sortValue: (r) => r.orderId, render: (r) => <span className="font-mono text-xs font-semibold">{r.orderId}</span> },
    { key: 'student', header: 'Student', sortValue: (r) => c.studentById.get(r.studentId)?.name ?? '', render: (r) => c.studentById.get(r.studentId)?.name },
    { key: 'seminar', header: 'Seminar', sortValue: (r) => c.seminarById.get(orderOf(r)?.lines[0]?.seminarId ?? '')?.title ?? '', render: (r) => <span className="line-clamp-1">{c.seminarById.get(orderOf(r)?.lines[0]?.seminarId ?? '')?.title}</span>, hideBelow: 'lg' },
    { key: 'reason', header: 'Reason', sortValue: (r) => r.reason, render: (r) => <span className="line-clamp-2 text-muted">{r.reason}</span>, hideBelow: 'md' },
    { key: 'amount', header: 'Amount', align: 'right', sortValue: (r) => r.amount, render: (r) => formatLKR(r.amount) },
    { key: 'date', header: 'Requested', sortValue: (r) => r.createdAt, render: (r) => formatDate(r.createdAt), hideBelow: 'sm' },
    {
      key: 'act',
      header: tab === 'open' ? 'Decision' : 'Status',
      align: 'right',
      render: (r) =>
        r.status === 'open' ? (
          <div className="flex justify-end gap-1">
            <Button size="sm" onClick={() => setDeciding({ r, approve: true })}><Check className="size-4" aria-hidden="true" />Approve</Button>
            <Button variant="ghost" size="sm" onClick={() => setDeciding({ r, approve: false })}>Reject</Button>
          </div>
        ) : (
          <StatusBadge status={r.status} />
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Refund requests" description="Approving refunds the order, voids its tickets and returns the seats (simulated)." />
      <Card>
        <Tabs label="Refund status" value={tab} onChange={setTab} className="px-3" tabs={(['open', 'approved', 'rejected'] as const).map((s) => ({ id: s, label: s[0]!.toUpperCase() + s.slice(1), count: c.refunds.filter((r) => r.status === s).length }))} />
        <DataTable key={tab} rows={rows} columns={columns} rowKey={(r) => r.id} caption="Refund requests" initialSort={{ key: 'date', dir: 'desc' }} emptyTitle={`No ${tab} requests`} emptyDescription="Refund requests from students appear here." />
      </Card>
      {deciding && (
        <ConfirmDialog
          open
          tone={deciding.approve ? 'primary' : 'danger'}
          title={deciding.approve ? 'Approve refund?' : 'Reject refund?'}
          description={<><span className="flex items-center gap-2 font-semibold text-fg"><RotateCcw className="size-4" aria-hidden="true" />{formatLKR(deciding.r.amount)} · {deciding.r.orderId}</span><span className="mt-2 block">{deciding.r.reason}</span></>}
          confirmLabel={deciding.approve ? 'Approve refund' : 'Reject'}
          onCancel={() => setDeciding(null)}
          onConfirm={decide}
        />
      )}
    </>
  );
};
