import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ClipboardList, ScanLine, UserCheck, Users, XCircle } from 'lucide-react';
import {
  attendanceRequest,
  checkInRequest,
  mapApiTicketStatus,
} from '../../api/check-in';
import { ApiError } from '../../api/client';
import {
  listPendingSlipsRequest,
  reviewSlipRequest,
  type PendingSlip,
} from '../../api/commerce';
import { CameraQrScanner } from '../../components/CameraQrScanner';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Dialog';
import { Input, Select } from '../../components/ui/Field';
import { Card, CardHeader, EmptyState, Notice, ProgressBar } from '../../components/ui/Primitives';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { isUpcoming } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import type { Order, Ticket } from '../../types';
import { ticketsIn } from '../../utils/analytics';
import { formatDate, formatDateTime, formatShortDate, formatTime } from '../../utils/date';
import { PAYMENT_LABELS, formatLKR, formatNumber } from '../../utils/format';
import { useOrganiser } from './useOrganiser';

const seminarOptions = (seminars: { id: string; title: string; startsAt: string }[]) => [
  { value: '', label: 'All seminars' },
  ...seminars.map((s) => ({ value: s.id, label: `${s.title} — ${formatShortDate(s.startsAt)}` })),
];

export const OrganiserBookingsPage: React.FC = () => {
  useDocumentTitle('Bookings');
  const { seminars, orders, refunds, catalog, usingApi } = useOrganiser();
  const { user } = useAuth();
  const toast = useToast();
  const [seminarId, setSeminarId] = useState('');
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState<Order | null>(null);
  const [pendingSlips, setPendingSlips] = useState<PendingSlip[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const title = (id: string) => catalog.seminarById.get(id)?.title ?? '';
  const rows = orders.filter((o) => (!seminarId || o.lines.some((l) => l.seminarId === seminarId)) && (!status || o.status === status));
  const paid = rows.filter((o) => o.status === 'paid');
  const openRefunds = refunds.filter((r) => r.status === 'open');

  const refreshSlips = () => {
    if (!usingApi || !user?.accessToken || !user.organisationId) return;
    void listPendingSlipsRequest(user.accessToken, user.organisationId)
      .then(setPendingSlips)
      .catch(() => setPendingSlips([]));
  };

  useEffect(() => {
    refreshSlips();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when org/token ready
  }, [usingApi, user?.accessToken, user?.organisationId]);

  const review = async (slipId: string, action: 'approve' | 'reject') => {
    if (!user?.accessToken || !user.organisationId) return;
    try {
      await reviewSlipRequest(
        user.accessToken,
        user.organisationId,
        slipId,
        action,
        action === 'reject' ? rejectReason : undefined,
      );
      toast(action === 'approve' ? 'Slip approved — tickets issued' : 'Slip rejected', {
        tone: action === 'approve' ? 'success' : 'error',
      });
      setRejectingId(null);
      setRejectReason('');
      refreshSlips();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not review slip', { tone: 'error' });
    }
  };

  const columns: Column<Order>[] = [
    { key: 'id', header: 'Order', sortValue: (o) => o.id, render: (o) => <span className="font-mono text-xs font-semibold">{o.id}</span> },
    { key: 'buyer', header: 'Student', sortValue: (o) => o.buyer.name, exportValue: (o) => `${o.buyer.name} <${o.buyer.email}>`, render: (o) => <div><p className="font-semibold text-fg">{o.buyer.name}</p><p className="text-xs text-muted">{o.buyer.email}</p></div> },
    { key: 'seminar', header: 'Seminar', sortValue: (o) => title(o.lines[0]!.seminarId), render: (o) => <span className="line-clamp-1">{title(o.lines[0]!.seminarId)}</span>, hideBelow: 'md' },
    { key: 'qty', header: 'Tickets', align: 'right', sortValue: ticketsIn, render: ticketsIn, hideBelow: 'sm' },
    { key: 'total', header: 'Amount', align: 'right', sortValue: (o) => o.subtotal, render: (o) => formatLKR(o.subtotal) },
    { key: 'date', header: 'Booked', sortValue: (o) => o.createdAt, render: (o) => formatDate(o.createdAt), hideBelow: 'lg' },
    { key: 'status', header: 'Status', sortValue: (o) => o.status, render: (o) => <StatusBadge status={o.status} /> },
    { key: 'view', header: 'Details', align: 'right', render: (o) => <Button variant="ghost" size="sm" onClick={() => setDetail(o)}>View</Button> },
  ];

  return (
    <>
      <PageHeader title="Booking management" description="Every order placed for your seminars." />
      <StatGrid>
        <StatCard label="Orders" value={formatNumber(rows.length)} icon={ClipboardList} hint="Matching the filters" />
        <StatCard label="Paid revenue" value={formatLKR(paid.reduce((n, o) => n + o.subtotal, 0))} icon={CheckCircle2} hint="Excludes booking fees" />
        <StatCard label="Tickets" value={formatNumber(paid.reduce((n, o) => n + ticketsIn(o), 0))} icon={Users} hint="From paid orders" />
        <StatCard label="Open refund requests" value={String(openRefunds.length)} icon={XCircle} hint="Reviewed by EduPass admins" />
      </StatGrid>
      {usingApi && pendingSlips.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Pending bank slips" description="Approve to issue tickets and record the platform fee." />
          <ul className="divide-y divide-line">
            {pendingSlips.map((s) => (
              <li key={s.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-fg">{s.order.buyer.name} · {formatLKR(s.order.totalLkr)}</p>
                  <p className="text-muted">Ref {s.slipReference} · fee snapshot {s.order.commissionPercentSnapshot}%</p>
                  {s.note && <p className="text-muted">{s.note}</p>}
                  {rejectingId === s.id && (
                    <Input
                      className="mt-2"
                      label="Rejection reason"
                      value={rejectReason}
                      onValueChange={setRejectReason}
                      placeholder="Unreadable slip / wrong amount"
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void review(s.id, 'approve')}>Approve</Button>
                  {rejectingId === s.id ? (
                    <Button size="sm" variant="secondary" onClick={() => void review(s.id, 'reject')} disabled={rejectReason.trim().length < 3}>
                      Confirm reject
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setRejectingId(s.id)}>Reject</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Card className="mt-6">
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(o) => o.id}
          caption="Bookings"
          searchText={(o) => `${o.id} ${o.buyer.name} ${o.buyer.email}`}
          searchPlaceholder="Order, name or email"
          initialSort={{ key: 'date', dir: 'desc' }}
          exportName="edupass-bookings"
          toolbar={
            <>
              <Select label="Seminar" hideLabel value={seminarId} onValueChange={setSeminarId} options={seminarOptions(seminars)} className="w-56" />
              <Select label="Status" hideLabel value={status} onValueChange={setStatus} options={[{ value: '', label: 'All statuses' }, { value: 'paid', label: 'Paid' }, { value: 'refunded', label: 'Refunded' }, { value: 'failed', label: 'Failed' }]} className="w-40" />
            </>
          }
        />
      </Card>
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={`Order ${detail?.id ?? ''}`} footer={<Button onClick={() => setDetail(null)}>Close</Button>}>
        {detail && (
          <dl className="space-y-2 text-sm">
            {[
              ['Student', `${detail.buyer.name} · ${detail.buyer.email} · ${detail.buyer.phone}`],
              ['Booked', formatDateTime(detail.createdAt)],
              ['Payment', PAYMENT_LABELS[detail.paymentMethod]],
              ['Status', <StatusBadge key="s" status={detail.status} />],
              ...detail.lines.map((l) => [`${l.quantity} × ${catalog.ticketTypeName(l.seminarId, l.ticketTypeId)}`, `${title(l.seminarId)} · ${formatLKR(l.unitPrice * l.quantity)}`] as const),
              ['Booking fee (kept by EduPass)', formatLKR(detail.fee)],
            ].map(([k, v], i) => (
              <div key={i} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-muted">{k}</dt>
                <dd className="text-fg sm:text-right">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </>
  );
};

export const AttendeesPage: React.FC = () => {
  useDocumentTitle('Attendees');
  const { seminars, tickets, catalog, usingApi } = useOrganiser();
  const { user } = useAuth();
  const { checkIn } = useData();
  const toast = useToast();
  const [seminarId, setSeminarId] = useState('');
  const [status, setStatus] = useState('');
  const [apiTickets, setApiTickets] = useState<Ticket[] | null>(null);

  useEffect(() => {
    if (!usingApi || !user?.accessToken || !user.organisationId || !seminarId) {
      setApiTickets(null);
      return;
    }
    let cancelled = false;
    void attendanceRequest(user.accessToken, seminarId, user.organisationId)
      .then((res) => {
        if (cancelled) return;
        setApiTickets(
          res.tickets.map((t) => ({
            id: t.id,
            code: t.code,
            orderId: t.orderId,
            studentId: t.studentUserId,
            seminarId: t.seminarId,
            ticketTypeId: t.ticketTypeId,
            holderName: t.holderName,
            status: mapApiTicketStatus(t.status),
            checkedInAt: t.checkedInAt ?? undefined,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setApiTickets([]);
      });
    return () => {
      cancelled = true;
    };
  }, [usingApi, user?.accessToken, user?.organisationId, seminarId]);

  const source = usingApi && seminarId && apiTickets ? apiTickets : tickets;
  const rows = source.filter((t) => (!seminarId || t.seminarId === seminarId) && (!status || t.status === status));
  const active = rows.filter((t) => t.status !== 'cancelled');
  const checked = active.filter((t) => t.status === 'checked_in').length;

  const doCheckIn = async (code: string, forSeminarId?: string) => {
    if (usingApi && user?.accessToken && user.organisationId && (forSeminarId || seminarId)) {
      try {
        const r = await checkInRequest(user.accessToken, {
          organisationId: user.organisationId,
          seminarId: forSeminarId || seminarId,
          code,
        });
        toast(r.message, { tone: r.ok ? 'success' : 'error' });
        if (seminarId && user.organisationId) {
          const res = await attendanceRequest(user.accessToken, seminarId, user.organisationId);
          setApiTickets(
            res.tickets.map((t) => ({
              id: t.id,
              code: t.code,
              orderId: t.orderId,
              studentId: t.studentUserId,
              seminarId: t.seminarId,
              ticketTypeId: t.ticketTypeId,
              holderName: t.holderName,
              status: mapApiTicketStatus(t.status),
              checkedInAt: t.checkedInAt ?? undefined,
            })),
          );
        }
      } catch (err) {
        toast(err instanceof ApiError ? err.message : 'Check-in failed', { tone: 'error' });
      }
      return;
    }
    const r = checkIn(code, forSeminarId);
    toast(r.message, { tone: r.ok ? 'success' : 'error' });
  };

  const columns: Column<Ticket>[] = [
    { key: 'name', header: 'Attendee', sortValue: (t) => t.holderName, render: (t) => <span className="font-semibold text-fg">{t.holderName}</span> },
    { key: 'seminar', header: 'Seminar', sortValue: (t) => catalog.seminarById.get(t.seminarId)?.title ?? '', render: (t) => <span className="line-clamp-1">{catalog.seminarById.get(t.seminarId)?.title}</span>, hideBelow: 'md' },
    { key: 'type', header: 'Ticket', sortValue: (t) => catalog.ticketTypeName(t.seminarId, t.ticketTypeId), render: (t) => catalog.ticketTypeName(t.seminarId, t.ticketTypeId), hideBelow: 'sm' },
    { key: 'code', header: 'Code', sortValue: (t) => t.code, render: (t) => <span className="font-mono text-xs">{t.code}</span>, hideBelow: 'lg' },
    { key: 'status', header: 'Status', sortValue: (t) => t.status, render: (t) => <StatusBadge status={t.status} /> },
    { key: 'at', header: 'Checked in', sortValue: (t) => t.checkedInAt ?? '', render: (t) => (t.checkedInAt ? formatTime(t.checkedInAt) : '—'), hideBelow: 'lg' },
    {
      key: 'act',
      header: 'Action',
      align: 'right',
      render: (t) =>
        t.status === 'valid' ? (
          <Button variant="secondary" size="sm" onClick={() => void doCheckIn(t.code, t.seminarId)}>Check in</Button>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader title="Attendee management" description="Everyone holding a ticket for your seminars." actions={<Button to="/organiser/check-in"><ScanLine className="size-4" aria-hidden="true" />Open check-in</Button>} />
      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-fg">{formatNumber(checked)} of {formatNumber(active.length)} checked in</span>
          <span className="text-muted">{active.length ? Math.round((checked / active.length) * 100) : 0}%</span>
        </div>
        <ProgressBar value={checked} max={active.length} label="Attendees checked in" className="mt-2" />
      </Card>
      <Card>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(t) => t.id}
          caption="Attendees"
          searchText={(t) => `${t.holderName} ${t.code}`}
          searchPlaceholder="Name or ticket code"
          initialSort={{ key: 'name', dir: 'asc' }}
          exportName="edupass-attendees"
          pageSize={15}
          toolbar={
            <>
              <Select label="Seminar" hideLabel value={seminarId} onValueChange={setSeminarId} options={seminarOptions(seminars)} className="w-56" />
              <Select label="Status" hideLabel value={status} onValueChange={setStatus} options={[{ value: '', label: 'All statuses' }, { value: 'valid', label: 'Valid' }, { value: 'checked_in', label: 'Checked in' }, { value: 'cancelled', label: 'Cancelled' }]} className="w-40" />
            </>
          }
        />
      </Card>
    </>
  );
};

interface ScanResult {
  ok: boolean;
  message: string;
  ticket?: Ticket;
  at: string;
}

export const CheckInPage: React.FC = () => {
  useDocumentTitle('QR check-in');
  const { seminars, tickets, catalog, usingApi } = useOrganiser();
  const { user } = useAuth();
  const { checkIn } = useData();
  // Default to the soonest upcoming seminar with tickets
  const candidates = seminars.filter((s) => s.status === 'published' && isUpcoming(s));
  const [seminarId, setSeminarId] = useState(candidates[0]?.id ?? seminars[0]?.id ?? '');
  const [code, setCode] = useState('');
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [apiTickets, setApiTickets] = useState<Ticket[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!usingApi || !user?.accessToken || !user.organisationId || !seminarId) {
      setApiTickets(null);
      return;
    }
    let cancelled = false;
    void attendanceRequest(user.accessToken, seminarId, user.organisationId)
      .then((res) => {
        if (cancelled) return;
        setApiTickets(
          res.tickets.map((t) => ({
            id: t.id,
            code: t.code,
            orderId: t.orderId,
            studentId: t.studentUserId,
            seminarId: t.seminarId,
            ticketTypeId: t.ticketTypeId,
            holderName: t.holderName,
            status: mapApiTicketStatus(t.status),
            checkedInAt: t.checkedInAt ?? undefined,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setApiTickets([]);
      });
    return () => {
      cancelled = true;
    };
  }, [usingApi, user?.accessToken, user?.organisationId, seminarId]);

  const mine = (apiTickets ?? tickets).filter((t) => t.seminarId === seminarId && t.status !== 'cancelled');
  const checked = mine.filter((t) => t.status === 'checked_in').length;
  const last = history[0];

  const submit = (value: string) => {
    void (async () => {
      if (usingApi && user?.accessToken && user.organisationId && seminarId) {
        try {
          const r = await checkInRequest(user.accessToken, {
            organisationId: user.organisationId,
            seminarId,
            code: value,
          });
          const ticket: Ticket | undefined = r.ticket
            ? {
                id: r.ticket.id,
                code: r.ticket.code,
                orderId: r.ticket.orderId,
                studentId: r.ticket.studentUserId,
                seminarId: r.ticket.seminarId,
                ticketTypeId: r.ticket.ticketTypeId,
                holderName: r.ticket.holderName,
                status: mapApiTicketStatus(r.ticket.status),
                checkedInAt: r.ticket.checkedInAt ?? undefined,
              }
            : undefined;
          setHistory((h) => [{ ok: r.ok, message: r.message, ticket, at: new Date().toISOString() }, ...h].slice(0, 12));
          const res = await attendanceRequest(user.accessToken, seminarId, user.organisationId);
          setApiTickets(
            res.tickets.map((t) => ({
              id: t.id,
              code: t.code,
              orderId: t.orderId,
              studentId: t.studentUserId,
              seminarId: t.seminarId,
              ticketTypeId: t.ticketTypeId,
              holderName: t.holderName,
              status: mapApiTicketStatus(t.status),
              checkedInAt: t.checkedInAt ?? undefined,
            })),
          );
        } catch (err) {
          setHistory((h) => [
            {
              ok: false,
              message: err instanceof ApiError ? err.message : 'Check-in failed',
              at: new Date().toISOString(),
            },
            ...h,
          ].slice(0, 12));
        }
      } else {
        const r = checkIn(value, seminarId);
        setHistory((h) => [{ ...r, at: new Date().toISOString() }, ...h].slice(0, 12));
      }
      setCode('');
      inputRef.current?.focus();
    })();
  };

  const simulateScan = () => {
    // Pick a random ticket for this seminar (sometimes an already-used one) to exercise both outcomes
    const pool = mine.length ? mine : tickets;
    const t = pool[Math.floor(Math.random() * pool.length)];
    if (t) submit(`EDUPASS-DEMO:${t.code}`);
  };

  if (!seminars.length) {
    return (
      <>
        <PageHeader title="QR ticket check-in" />
        <EmptyState icon={<ScanLine className="size-5" aria-hidden="true" />} title="No seminars to check in" description="Create and publish a seminar first." action={<Button to="/organiser/seminars/new" size="sm">Create seminar</Button>} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="QR ticket check-in" description="Scan or type a ticket code. Each ticket can only be checked in once." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card className="p-5">
            <Select label="Seminar" value={seminarId} onValueChange={(v) => { setSeminarId(v); setHistory([]); }} options={seminars.filter((s) => s.status !== 'draft').map((s) => ({ value: s.id, label: `${s.title} — ${formatShortDate(s.startsAt)}` }))} />
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-fg">{checked} / {mine.length} checked in</span>
              <span className="text-muted">{mine.length - checked} still to arrive</span>
            </div>
            <ProgressBar value={checked} max={mine.length} label="Checked in" className="mt-2" />
          </Card>

          <Card className="p-5">
            <CameraQrScanner
              onCode={(scanned) => {
                setCode(scanned);
                submit(scanned);
              }}
            />
            <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) submit(code); }} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="ticket-code" className="sr-only">Ticket code</label>
              <input ref={inputRef} id="ticket-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="EDP-XXXXXXXX" autoComplete="off" className="h-12 min-w-0 flex-1 rounded-md border border-line bg-page px-4 font-mono text-base uppercase tracking-wider text-fg placeholder:text-muted focus-visible:border-brand" />
              <Button type="submit" size="lg" disabled={!code.trim()}>Check in</Button>
              {!usingApi && (
                <Button variant="secondary" size="lg" onClick={simulateScan}>Simulate scan</Button>
              )}
            </form>
          </Card>

          <div aria-live="assertive">
            {last && (
              <Card className={`flex items-center gap-4 border-2 p-5 ${last.ok ? 'border-success' : 'border-danger'}`}>
                {last.ok ? <CheckCircle2 className="size-12 shrink-0 text-success" aria-hidden="true" /> : <XCircle className="size-12 shrink-0 text-danger" aria-hidden="true" />}
                <div className="min-w-0">
                  <p className={`text-lg font-bold ${last.ok ? 'text-success' : 'text-danger'}`}>{last.ok ? 'Admitted' : 'Not admitted'}</p>
                  <p className="text-sm text-fg">{last.message}</p>
                  {last.ticket && (
                    <p className="text-xs text-muted">
                      {last.ticket.code} · {catalog.ticketTypeName(last.ticket.seminarId, last.ticket.ticketTypeId)} · {catalog.seminarById.get(last.ticket.seminarId)?.title}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader title="Recent scans" />
          {history.length === 0 ? (
            <p className="p-5 text-sm text-muted">Scans from this session appear here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {history.map((h, i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-3 text-sm">
                  {h.ok ? <UserCheck className="mt-0.5 size-4 shrink-0 text-success" aria-label="Admitted" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-label="Rejected" />}
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">{h.ticket?.holderName ?? 'Unknown ticket'}</p>
                    <p className="text-xs text-muted">{h.message}</p>
                  </div>
                  <time className="ml-auto shrink-0 text-xs text-muted">{formatTime(h.at)}</time>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-line p-4">
            <Notice>
              {usingApi
                ? 'Check-ins are recorded server-side with a CheckInEvent audit trail.'
                : 'Check-ins update the attendee list and the student\'s ticket instantly (stored in this browser).'}
            </Notice>
          </div>
        </Card>
      </div>
    </>
  );
};
