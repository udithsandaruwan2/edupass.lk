import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  CalendarPlus, CircleDollarSign, Copy, Eye, Gauge, Megaphone, MoreHorizontal, Pencil, ScanLine, Send, Tags, Ticket, Trash2, XCircle, CalendarDays,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { AreaChart, ChartCard } from '../../components/ui/Charts';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ConfirmDialog, Modal } from '../../components/ui/Dialog';
import { Input, Select } from '../../components/ui/Field';
import { MenuItem, Popover } from '../../components/ui/Menu';
import { Card, CardHeader, EmptyState, Notice, ProgressBar } from '../../components/ui/Primitives';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { DEMO_ACCOUNTS } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { isUpcoming } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import type { Seminar, TicketType } from '../../types';
import { changePct, dailyRevenue, monthlySeries, seminarStats, ticketsIn } from '../../utils/analytics';
import { formatDate, formatShortDate, formatTime, relativeTime } from '../../utils/date';
import { formatCompact, formatLKR, formatNumber, slugify } from '../../utils/format';
import { makeId } from '../../utils/random';
import { useOrganiser } from './useOrganiser';

export const OrganiserOverview: React.FC = () => {
  useDocumentTitle('Organiser dashboard');
  const { organiser, seminars, orders, tickets, catalog } = useOrganiser();
  const months = monthlySeries(orders, 6);
  const daily = dailyRevenue(orders, 30);
  const revenue30 = daily.reduce((n, d) => n + d.value, 0);
  const upcoming = seminars.filter((s) => s.status === 'published' && isUpcoming(s));
  const fill = upcoming.length ? Math.round(upcoming.reduce((n, s) => n + seminarStats(s, orders).fill, 0) / upcoming.length) : 0;
  const recent = orders.filter((o) => o.status === 'paid').slice(0, 6);

  return (
    <>
      <PageHeader
        title={organiser?.name ?? 'Organiser'}
        description="Sales, seminars and check-in at a glance."
        actions={
          <>
            <Button to="/organiser/check-in" variant="secondary"><ScanLine className="size-4" aria-hidden="true" />Check-in</Button>
            <Button to="/organiser/seminars/new"><CalendarPlus className="size-4" aria-hidden="true" />Create seminar</Button>
          </>
        }
      />
      {organiser && !organiser.verified && (
        <Notice tone="warning" className="mb-6">Your organiser account is <strong>awaiting review</strong>. You can create drafts now; publishing unlocks once an admin approves you.</Notice>
      )}
      <StatGrid>
        <StatCard label="Revenue (30 days)" value={formatLKR(revenue30)} icon={CircleDollarSign} delta={{ value: changePct(months.map((m) => m.revenue)), period: 'last month' }} trend={months.map((m) => m.revenue)} to="/organiser/revenue" />
        <StatCard label="Tickets sold" value={formatNumber(tickets.filter((t) => t.status !== 'cancelled').length)} icon={Ticket} delta={{ value: changePct(months.map((m) => m.tickets)), period: 'last month' }} trend={months.map((m) => m.tickets)} to="/organiser/attendees" />
        <StatCard label="Upcoming seminars" value={String(upcoming.length)} icon={CalendarDays} hint={`${seminars.filter((s) => s.status === 'draft').length} drafts`} to="/organiser/seminars" />
        <StatCard label="Average fill rate" value={`${fill}%`} icon={Gauge} hint="Upcoming seminars" to="/organiser/performance" />
      </StatGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartCard title="Daily revenue" description="Ticket subtotals, last 30 days (demo data)" table={{ headers: ['Day', 'Revenue'], rows: daily.map((d) => [d.label, formatLKR(d.value)]) }}>
          <AreaChart data={daily} seriesName="Revenue" format={formatCompact} ariaLabel="Line chart of daily revenue over the last 30 days" />
        </ChartCard>
        <Card>
          <CardHeader title="Latest bookings" actions={<Button to="/organiser/bookings" variant="ghost" size="sm">View all</Button>} />
          {recent.length === 0 ? (
            <p className="p-5 text-sm text-muted">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-fg">{o.buyer.name}</span>
                    <span className="block truncate text-muted">{ticketsIn(o)} × {catalog.seminarById.get(o.lines[0]!.seminarId)?.title}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-semibold tabular-nums text-fg">{formatLKR(o.subtotal)}</span>
                    <span className="block text-xs text-muted">{relativeTime(o.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Upcoming seminars" actions={<Button to="/organiser/seminars" variant="ghost" size="sm">Manage</Button>} />
        {upcoming.length === 0 ? (
          <div className="p-5"><EmptyState icon={<CalendarPlus className="size-5" aria-hidden="true" />} title="No upcoming seminars" description="Create your first seminar to start selling tickets." action={<Button to="/organiser/seminars/new" size="sm">Create seminar</Button>} className="border-none" /></div>
        ) : (
          <ul className="divide-y divide-line">
            {upcoming.slice(0, 5).map((s) => {
              const st = seminarStats(s, orders);
              return (
                <li key={s.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_12rem_8rem] sm:items-center">
                  <div className="min-w-0">
                    <Link to={`/organiser/seminars/${s.id}/edit`} className="font-semibold text-fg hover:text-brand">{s.title}</Link>
                    <p className="text-sm text-muted">{formatDate(s.startsAt)} · {formatTime(s.startsAt)} · {s.venue}</p>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted"><span>{st.sold} / {st.capacity}</span><span>{st.fill}%</span></div>
                    <ProgressBar value={st.sold} max={st.capacity} label={`${s.title} seats sold`} />
                  </div>
                  <p className="text-right font-semibold tabular-nums text-fg">{formatLKR(st.revenue)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
};

type ConfirmKind = 'publish' | 'unpublish' | 'cancel' | 'delete';

export const SeminarManagementPage: React.FC = () => {
  useDocumentTitle('Seminar management');
  const { organiser, seminars, orders, tickets } = useOrganiser();
  const { patch, upsert, remove, setData, notify } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; seminar: Seminar } | null>(null);
  const rows = status ? seminars.filter((s) => (status === 'past' ? s.status === 'published' && !isUpcoming(s) : s.status === status)) : seminars;
  const canPublish = Boolean(organiser?.verified);

  const duplicate = (s: Seminar) => {
    const id = makeId('sem').toLowerCase();
    const copy: Seminar = { ...s, id, title: `${s.title} (copy)`, slug: `${slugify(s.title)}-copy-${id.slice(-4)}`, status: 'draft', featured: false, createdAt: new Date().toISOString(), ticketTypes: s.ticketTypes.map((t) => ({ ...t, id: `${id}-${t.id.split('-').pop()}`, sold: 0 })) };
    upsert('seminars', copy);
    toast('Seminar duplicated as a draft');
    navigate(`/organiser/seminars/${id}/edit`);
  };

  const run = () => {
    if (!confirm) return;
    const { kind, seminar: s } = confirm;
    if (kind === 'publish') { patch('seminars', s.id, { status: 'published' }); toast('Seminar published (demo)', { description: 'It now appears on the public site.' }); }
    if (kind === 'unpublish') { patch('seminars', s.id, { status: 'draft' }); toast('Seminar moved back to draft', { tone: 'info' }); }
    if (kind === 'delete') { remove('seminars', s.id); toast('Draft deleted', { tone: 'info' }); }
    if (kind === 'cancel') {
      const cancelledAt = new Date().toISOString();
      // Cancelling refunds every paid order and voids its tickets
      setData((d) => ({
        ...d,
        seminars: d.seminars.map((x) => (x.id === s.id ? { ...x, status: 'cancelled' } : x)),
        orders: d.orders.map((o) => (o.status === 'paid' && o.lines.some((l) => l.seminarId === s.id) ? { ...o, status: 'refunded' } : o)),
        tickets: d.tickets.map((t) => (t.seminarId === s.id && t.status === 'valid' ? { ...t, status: 'cancelled', checkedInAt: undefined } : t)),
      }));
      if (tickets.some((t) => t.seminarId === s.id && t.studentId === DEMO_ACCOUNTS.student.id)) {
        notify('student', 'Seminar cancelled', `${s.title} was cancelled. Your booking has been refunded (demo).`, '/student/history');
      }
      notify('admin', 'Seminar cancelled', `${organiser?.name} cancelled ${s.title} on ${formatDate(cancelledAt)}.`, '/admin/seminars');
      toast('Seminar cancelled', { description: 'All bookings were refunded (simulated).', tone: 'info' });
    }
    setConfirm(null);
  };

  const columns: Column<Seminar>[] = [
    {
      key: 'title',
      header: 'Seminar',
      sortValue: (s) => s.title,
      render: (s) => (
        <div className="min-w-0">
          <Link to={`/organiser/seminars/${s.id}/edit`} className="font-semibold text-fg hover:text-brand">{s.title}</Link>
          <p className="text-xs text-muted">{s.subject} · {s.venue}</p>
        </div>
      ),
    },
    { key: 'date', header: 'Date', sortValue: (s) => s.startsAt, render: (s) => <span className="whitespace-nowrap">{formatShortDate(s.startsAt)}</span>, hideBelow: 'md' },
    { key: 'status', header: 'Status', sortValue: (s) => s.status, render: (s) => <StatusBadge status={s.status === 'published' && !isUpcoming(s) ? 'completed' : s.status} /> },
    {
      key: 'sales',
      header: 'Sold',
      sortValue: (s) => seminarStats(s, orders).fill,
      hideBelow: 'sm',
      render: (s) => {
        const st = seminarStats(s, orders);
        return (
          <div className="w-32">
            <p className="mb-1 text-xs text-muted">{st.sold} / {st.capacity}</p>
            <ProgressBar value={st.sold} max={st.capacity} label={`${s.title} seats sold`} />
          </div>
        );
      },
    },
    { key: 'revenue', header: 'Revenue', align: 'right', sortValue: (s) => seminarStats(s, orders).revenue, render: (s) => formatLKR(seminarStats(s, orders).revenue), hideBelow: 'lg' },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <Popover
          className="w-52 p-1.5"
          trigger={(p) => (
            <button type="button" {...p} aria-label={`Actions for ${s.title}`} className="inline-flex size-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg">
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </button>
          )}
        >
          {(close) => (
            <>
              <MenuItem icon={<Eye className="size-4" aria-hidden="true" />} onClick={() => { close(); navigate(`/organiser/seminars/${s.id}/preview`); }}>Preview</MenuItem>
              <MenuItem icon={<Pencil className="size-4" aria-hidden="true" />} onClick={() => { close(); navigate(`/organiser/seminars/${s.id}/edit`); }}>Edit</MenuItem>
              <MenuItem icon={<Tags className="size-4" aria-hidden="true" />} onClick={() => { close(); navigate(`/organiser/tickets?seminar=${s.id}`); }}>Tickets & pricing</MenuItem>
              <MenuItem icon={<Copy className="size-4" aria-hidden="true" />} onClick={() => { close(); duplicate(s); }}>Duplicate</MenuItem>
              {s.status === 'draft' && (
                <MenuItem icon={<Send className="size-4" aria-hidden="true" />} disabled={!canPublish} onClick={() => { close(); setConfirm({ kind: 'publish', seminar: s }); }} className="disabled:opacity-50">Publish</MenuItem>
              )}
              {s.status === 'published' && isUpcoming(s) && (
                <>
                  {s.ticketTypes.every((t) => t.sold === 0) && <MenuItem icon={<Megaphone className="size-4" aria-hidden="true" />} onClick={() => { close(); setConfirm({ kind: 'unpublish', seminar: s }); }}>Unpublish</MenuItem>}
                  <MenuItem tone="danger" icon={<XCircle className="size-4" aria-hidden="true" />} onClick={() => { close(); setConfirm({ kind: 'cancel', seminar: s }); }}>Cancel seminar</MenuItem>
                </>
              )}
              {s.status === 'draft' && (
                <MenuItem tone="danger" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => { close(); setConfirm({ kind: 'delete', seminar: s }); }}>Delete draft</MenuItem>
              )}
            </>
          )}
        </Popover>
      ),
    },
  ];

  const copy: Record<ConfirmKind, { title: string; body: string; label: string; tone: 'danger' | 'primary' }> = {
    publish: { title: 'Publish this seminar?', body: 'It will appear on the public site and tickets go on sale immediately. (Simulated — nothing leaves this browser.)', label: 'Publish', tone: 'primary' },
    unpublish: { title: 'Move back to draft?', body: 'The seminar will be hidden from the public site.', label: 'Unpublish', tone: 'primary' },
    cancel: { title: 'Cancel this seminar?', body: 'Every paid booking will be refunded and all tickets voided. This cannot be undone.', label: 'Cancel seminar', tone: 'danger' },
    delete: { title: 'Delete this draft?', body: 'The draft and its ticket setup will be removed.', label: 'Delete draft', tone: 'danger' },
  };

  return (
    <>
      <PageHeader title="Seminar management" description={`${seminars.length} seminars`} actions={<Button to="/organiser/seminars/new"><CalendarPlus className="size-4" aria-hidden="true" />Create seminar</Button>} />
      {!canPublish && <Notice tone="warning" className="mb-4">Publishing is disabled until an admin approves your organiser account.</Notice>}
      <Card>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(s) => s.id}
          caption="Seminars"
          searchText={(s) => `${s.title} ${s.subject} ${s.venue}`}
          searchPlaceholder="Search seminars"
          initialSort={{ key: 'date', dir: 'asc' }}
          exportName="edupass-seminars"
          emptyTitle="No seminars yet"
          emptyDescription="Create a seminar to get started."
          toolbar={
            <Select label="Status" hideLabel value={status} onValueChange={setStatus} className="w-40" options={[{ value: '', label: 'All statuses' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }, { value: 'past', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]} />
          }
        />
      </Card>
      {confirm && (
        <ConfirmDialog open title={copy[confirm.kind].title} description={<><strong className="text-fg">{confirm.seminar.title}</strong><br />{copy[confirm.kind].body}</>} confirmLabel={copy[confirm.kind].label} tone={copy[confirm.kind].tone} onCancel={() => setConfirm(null)} onConfirm={run} />
      )}
    </>
  );
};

/** Ticket types editor for one seminar. */
export const TicketTypesPage: React.FC = () => {
  useDocumentTitle('Ticket types & pricing');
  const { seminars } = useOrganiser();
  const { patch } = useData();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const editable = seminars.filter((s) => s.status !== 'cancelled' && (s.status === 'draft' || isUpcoming(s)));
  const seminarId = params.get('seminar') ?? editable[0]?.id ?? '';
  const seminar = seminars.find((s) => s.id === seminarId);
  const [draft, setDraft] = useState<TicketType[] | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const types = draft ?? seminar?.ticketTypes ?? [];
  const dirty = draft !== null;

  const update = (id: string, changes: Partial<TicketType>) => setDraft(types.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  const save = () => {
    if (!seminar) return;
    const errs: Record<string, string> = {};
    for (const t of types) {
      if (!t.name.trim()) errs[`${t.id}-name`] = 'Name is required';
      if (!(t.price >= 0)) errs[`${t.id}-price`] = 'Price must be 0 or more';
      if (!(t.capacity >= t.sold) || t.capacity < 1) errs[`${t.id}-capacity`] = `At least ${Math.max(1, t.sold)} (already sold)`;
    }
    if (!types.length) errs.none = 'Add at least one ticket type';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    patch('seminars', seminar.id, { ticketTypes: types });
    setDraft(null);
    toast('Ticket types saved');
  };

  if (!seminars.length) {
    return (
      <>
        <PageHeader title="Ticket types & pricing" />
        <EmptyState icon={<Tags className="size-5" aria-hidden="true" />} title="No seminars yet" description="Create a seminar first, then set up its tickets." action={<Button to="/organiser/seminars/new" size="sm">Create seminar</Button>} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Ticket types & pricing" description="Set prices, capacity and descriptions for each ticket type." />
      <Card className="mb-6 p-5">
        <Select
          label="Seminar"
          value={seminarId}
          onValueChange={(id) => { setParams({ seminar: id }); setDraft(null); setErrors({}); }}
          options={editable.map((s) => ({ value: s.id, label: `${s.title} — ${formatShortDate(s.startsAt)}${s.status === 'draft' ? ' (draft)' : ''}` }))}
          className="max-w-xl"
        />
      </Card>
      {seminar && (
        <Card>
          <CardHeader title={seminar.title} description={`${types.length} ticket types · ${formatNumber(types.reduce((n, t) => n + t.capacity, 0))} seats`} actions={<Button variant="secondary" size="sm" onClick={() => setAdding(true)}>Add ticket type</Button>} />
          {errors.none && <p className="px-5 pt-4 text-sm font-semibold text-danger">{errors.none}</p>}
          <ul className="divide-y divide-line">
            {types.map((t) => (
              <li key={t.id} className="grid gap-4 p-5 md:grid-cols-[minmax(0,1.3fr)_9rem_9rem_auto] md:items-start">
                <div className="space-y-3">
                  <Input label="Name" value={t.name} onValueChange={(v) => update(t.id, { name: v })} error={errors[`${t.id}-name`]} />
                  <Input label="Description" value={t.description} onValueChange={(v) => update(t.id, { description: v })} />
                </div>
                <Input label="Price (LKR)" type="number" min={0} value={String(t.price)} onValueChange={(v) => update(t.id, { price: Number(v) })} error={errors[`${t.id}-price`]} />
                <Input label="Capacity" type="number" min={Math.max(1, t.sold)} value={String(t.capacity)} onValueChange={(v) => update(t.id, { capacity: Number(v) })} error={errors[`${t.id}-capacity`]} hint={`${t.sold} sold`} />
                <div className="md:pt-7">
                  <Button variant="ghost" size="sm" disabled={t.sold > 0} title={t.sold > 0 ? 'Ticket types with sales cannot be removed' : undefined} onClick={() => setDraft(types.filter((x) => x.id !== t.id))} aria-label={`Remove ${t.name}`}>
                    <Trash2 className="size-4" aria-hidden="true" />Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2 border-t border-line p-4">
            <Button variant="secondary" disabled={!dirty} onClick={() => { setDraft(null); setErrors({}); }}>Discard changes</Button>
            <Button disabled={!dirty} onClick={save}>Save ticket types</Button>
          </div>
        </Card>
      )}
      <AddTicketTypeModal
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={(t) => { setDraft([...types, { ...t, id: `${seminarId}-${makeId('tt').slice(-4).toLowerCase()}` }]); setAdding(false); }}
      />
    </>
  );
};

const AddTicketTypeModal: React.FC<{ open: boolean; onClose: () => void; onAdd: (t: Omit<TicketType, 'id'>) => void }> = ({ open, onClose, onAdd }) => {
  const [v, setV] = useState({ name: '', description: '', price: '1500', capacity: '50' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = () => {
    const errs: Record<string, string> = {};
    if (!v.name.trim()) errs.name = 'Name is required';
    if (!(Number(v.price) >= 0) || v.price === '') errs.price = 'Enter a price';
    if (!(Number(v.capacity) >= 1)) errs.capacity = 'At least 1';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onAdd({ name: v.name.trim(), description: v.description, price: Number(v.price), capacity: Number(v.capacity), sold: 0 });
    setV({ name: '', description: '', price: '1500', capacity: '50' });
  };
  return (
    <Modal open={open} onClose={onClose} title="Add ticket type" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>Add</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" required value={v.name} onValueChange={(x) => setV({ ...v, name: x })} error={errors.name} placeholder="e.g. Early bird" className="sm:col-span-2" />
        <Input label="Description" value={v.description} onValueChange={(x) => setV({ ...v, description: x })} className="sm:col-span-2" />
        <Input label="Price (LKR)" type="number" min={0} value={v.price} onValueChange={(x) => setV({ ...v, price: x })} error={errors.price} />
        <Input label="Capacity" type="number" min={1} value={v.capacity} onValueChange={(x) => setV({ ...v, capacity: x })} error={errors.capacity} />
      </div>
    </Modal>
  );
};

interface AvailabilityRow {
  seminar: Seminar;
  type: TicketType;
}

export const TicketAvailabilityPage: React.FC = () => {
  useDocumentTitle('Ticket availability');
  const { seminars } = useOrganiser();
  const { patch } = useData();
  const toast = useToast();
  const [editing, setEditing] = useState<AvailabilityRow | null>(null);
  const [cap, setCap] = useState('');
  const rows: AvailabilityRow[] = seminars.filter((s) => s.status === 'published' && isUpcoming(s)).flatMap((seminar) => seminar.ticketTypes.map((type) => ({ seminar, type })));
  const left = (r: AvailabilityRow) => r.type.capacity - r.type.sold;
  const state = (r: AvailabilityRow) => (left(r) <= 0 ? 'Sold out' : left(r) / r.type.capacity < 0.15 ? 'Selling fast' : 'On sale');

  const columns: Column<AvailabilityRow>[] = [
    { key: 'seminar', header: 'Seminar', sortValue: (r) => r.seminar.title, render: (r) => <div><p className="font-semibold text-fg">{r.seminar.title}</p><p className="text-xs text-muted">{formatShortDate(r.seminar.startsAt)}</p></div> },
    { key: 'type', header: 'Ticket type', sortValue: (r) => r.type.name, render: (r) => r.type.name },
    { key: 'sold', header: 'Sold', align: 'right', sortValue: (r) => r.type.sold, render: (r) => formatNumber(r.type.sold), hideBelow: 'sm' },
    { key: 'cap', header: 'Capacity', align: 'right', sortValue: (r) => r.type.capacity, render: (r) => formatNumber(r.type.capacity), hideBelow: 'sm' },
    { key: 'left', header: 'Left', align: 'right', sortValue: left, render: (r) => <span className={left(r) <= 0 ? 'font-semibold text-danger' : ''}>{formatNumber(left(r))}</span> },
    { key: 'bar', header: 'Filled', hideBelow: 'md', sortValue: (r) => r.type.sold / r.type.capacity, render: (r) => <div className="w-28"><ProgressBar value={r.type.sold} max={r.type.capacity} label={`${r.type.name} filled`} /></div> },
    { key: 'state', header: 'Status', sortValue: state, render: (r) => <span className={`text-xs font-semibold ${state(r) === 'Sold out' ? 'text-danger' : state(r) === 'Selling fast' ? 'text-warning' : 'text-success'}`}>{state(r)}</span> },
    { key: 'edit', header: 'Capacity', align: 'right', render: (r) => <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setCap(String(r.type.capacity)); }}>Adjust</Button> },
  ];

  const save = () => {
    if (!editing) return;
    const n = Number(cap);
    if (!(n >= editing.type.sold) || n < 1) return;
    patch('seminars', editing.seminar.id, { ticketTypes: editing.seminar.ticketTypes.map((t) => (t.id === editing.type.id ? { ...t, capacity: n } : t)) });
    toast('Capacity updated');
    setEditing(null);
  };
  const capError = editing && (!(Number(cap) >= editing.type.sold) || Number(cap) < 1) ? `Must be at least ${Math.max(1, editing.type.sold)}` : undefined;

  return (
    <>
      <PageHeader title="Ticket availability" description="Live seat counts for every ticket type on sale." />
      <Card>
        <DataTable rows={rows} columns={columns} rowKey={(r) => r.type.id} caption="Ticket availability" searchText={(r) => `${r.seminar.title} ${r.type.name}`} initialSort={{ key: 'left', dir: 'asc' }} exportName="edupass-availability" emptyTitle="Nothing on sale" emptyDescription="Publish a seminar to see availability here." />
      </Card>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Adjust capacity" description={editing ? `${editing.seminar.title} · ${editing.type.name}` : undefined} size="sm" footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} disabled={Boolean(capError)}>Save</Button></>}>
        <Input label="Capacity" type="number" min={editing?.type.sold ?? 1} value={cap} onValueChange={setCap} error={capError} hint={editing ? `${editing.type.sold} already sold` : undefined} />
      </Modal>
    </>
  );
};
