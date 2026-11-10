import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, Megaphone, Pencil, Plus, Save, Send, Trash2 } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../../api/billing';
import { ApiError } from '../../api/client';
import { SeminarCover } from '../../components/SeminarCover';
import { Button, IconButton } from '../../components/ui/Button';
import { ConfirmDialog, Modal } from '../../components/ui/Dialog';
import { Input, Select, Switch, Textarea } from '../../components/ui/Field';
import { Avatar, Badge, Card, CardHeader, EmptyState, Notice } from '../../components/ui/Primitives';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { DEFAULT_SETTINGS } from '../../data/mock/content';
import { useCatalog } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import type { Banner, FaqItem, Notification, PlatformSettings, Role } from '../../types';
import { formatDateTime, relativeTime } from '../../utils/date';
import { makeId } from '../../utils/random';
import { email, required, runValidators } from '../../utils/validation';

const FAQ_GROUPS: FaqItem['group'][] = ['Booking', 'Tickets', 'Payments', 'Organisers', 'Account'];

export const ContentManagementPage: React.FC = () => {
  useDocumentTitle('Content management');
  const { data, update, upsert, remove } = useData();
  const toast = useToast();
  const [announcement, setAnnouncement] = useState(data.announcement);
  const [editing, setEditing] = useState<FaqItem | 'new' | null>(null);
  const [faq, setFaq] = useState({ group: 'Booking' as FaqItem['group'], question: '', answer: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<FaqItem | null>(null);

  const open = (f: FaqItem | 'new') => {
    setEditing(f);
    setErrors({});
    setFaq(f === 'new' ? { group: 'Booking', question: '', answer: '' } : { group: f.group, question: f.question, answer: f.answer });
  };
  const saveFaq = () => {
    const errs = runValidators(faq, { question: [required('Question')], answer: [required('Answer')] }) as Record<string, string>;
    setErrors(errs);
    if (Object.keys(errs).length || !editing) return;
    upsert('faqs', { id: editing === 'new' ? makeId('faq').toLowerCase() : editing.id, ...faq });
    toast('FAQ saved');
    setEditing(null);
  };

  return (
    <>
      <PageHeader title="Content management" description="Site-wide announcement and help content." actions={<Button to="/faq" variant="secondary"><Eye className="size-4" aria-hidden="true" />View FAQ page</Button>} />
      <Card>
        <CardHeader title="Announcement bar" description="Shown at the top of every public page" />
        <div className="space-y-4 p-5">
          <Textarea label="Message" rows={2} value={announcement.message} onValueChange={(m) => setAnnouncement({ ...announcement, message: m })} error={announcement.message.trim() ? undefined : 'Message is required'} />
          <Switch label="Show announcement" checked={announcement.active} onChange={(active) => setAnnouncement({ ...announcement, active })} />
          {announcement.active && announcement.message.trim() && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Preview</p>
              <div className="rounded-md bg-brand-solid px-4 py-2 text-center text-sm font-semibold text-on-brand">{announcement.message}</div>
            </div>
          )}
          <div className="flex justify-end">
            <Button disabled={!announcement.message.trim()} onClick={() => { update('announcement', announcement); toast('Announcement updated'); }}><Save className="size-4" aria-hidden="true" />Save announcement</Button>
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="FAQ & help articles" description={`${data.faqs.length} entries, shown on the FAQ, Help Centre and student support pages`} actions={<Button size="sm" onClick={() => open('new')}><Plus className="size-4" aria-hidden="true" />Add question</Button>} />
        <ul className="divide-y divide-line">
          {data.faqs.map((f) => (
            <li key={f.id} className="flex items-start gap-4 px-5 py-4">
              <Badge tone="neutral" className="mt-0.5 shrink-0">{f.group}</Badge>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">{f.question}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">{f.answer}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <IconButton label={`Edit: ${f.question}`} onClick={() => open(f)}><Pencil className="size-4" aria-hidden="true" /></IconButton>
                <IconButton label={`Delete: ${f.question}`} onClick={() => setDeleting(f)}><Trash2 className="size-4" aria-hidden="true" /></IconButton>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add question' : 'Edit question'} footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveFaq}>Save</Button></>}>
        <div className="grid gap-4">
          <Select label="Topic" value={faq.group} onValueChange={(g) => setFaq({ ...faq, group: g as FaqItem['group'] })} options={FAQ_GROUPS.map((g) => ({ value: g, label: g }))} />
          <Input label="Question" required value={faq.question} onValueChange={(q) => setFaq({ ...faq, question: q })} error={errors.question} />
          <Textarea label="Answer" required rows={5} value={faq.answer} onValueChange={(a) => setFaq({ ...faq, answer: a })} error={errors.answer} />
        </div>
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Delete this question?" description={deleting?.question ?? ''} confirmLabel="Delete" onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) remove('faqs', deleting.id); setDeleting(null); toast('Question deleted', { tone: 'info' }); }} />
    </>
  );
};

export const BannerManagementPage: React.FC = () => {
  useDocumentTitle('Homepage banners');
  const c = useCatalog();
  const { update } = useData();
  const toast = useToast();
  const [editing, setEditing] = useState<Banner | 'new' | null>(null);
  const [v, setV] = useState({ seminarId: '', headline: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const banners = [...c.banners].sort((a, b) => a.order - b.order);
  const save = (list: Banner[]) => update('banners', list.map((b, i) => ({ ...b, order: i + 1 })));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...banners];
    [next[i], next[i + dir]] = [next[i + dir]!, next[i]!];
    save(next);
  };
  const open = (b: Banner | 'new') => {
    setEditing(b);
    setErrors({});
    setV(b === 'new' ? { seminarId: c.listed[0]?.id ?? '', headline: '' } : { seminarId: b.seminarId, headline: b.headline });
  };
  const submit = () => {
    const errs = runValidators(v, { seminarId: [required('Seminar')], headline: [required('Headline')] }) as Record<string, string>;
    setErrors(errs);
    if (Object.keys(errs).length || !editing) return;
    save(editing === 'new' ? [...banners, { id: makeId('ban').toLowerCase(), active: true, order: banners.length + 1, ...v }] : banners.map((b) => (b.id === editing.id ? { ...b, ...v } : b)));
    toast('Banner saved');
    setEditing(null);
  };

  return (
    <>
      <PageHeader title="Homepage banner management" description="Featured slides in the homepage carousel. Only active banners for seminars on sale are shown." actions={<><Button to="/" variant="secondary"><Eye className="size-4" aria-hidden="true" />View homepage</Button><Button onClick={() => open('new')}><Plus className="size-4" aria-hidden="true" />Add banner</Button></>} />
      {banners.length === 0 ? (
        <EmptyState icon={<Megaphone className="size-5" aria-hidden="true" />} title="No banners" description="The homepage carousel is hidden until you add one." />
      ) : (
        <ol className="space-y-3">
          {banners.map((b, i) => {
            const s = c.seminarById.get(b.seminarId);
            const live = s && c.listed.includes(s);
            return (
              <li key={b.id}>
                <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <span className="hidden w-6 text-center text-sm font-bold text-muted sm:block">{i + 1}</span>
                  {s && <SeminarCover seminar={s} compact className="aspect-[5/2] w-full shrink-0 rounded-md sm:w-40" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-fg">{s?.title ?? 'Missing seminar'}</p>
                    <p className="text-sm text-muted">{b.headline}</p>
                    {!live && <p className="mt-1 text-xs font-semibold text-warning">Hidden: seminar is not currently on sale</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    <label className="mr-2 flex items-center gap-2 text-sm text-fg">
                      <input type="checkbox" checked={b.active} onChange={(e) => { save(banners.map((x) => (x.id === b.id ? { ...x, active: e.target.checked } : x))); toast(e.target.checked ? 'Banner activated' : 'Banner hidden', { tone: 'info' }); }} className="size-4 accent-[var(--brand-solid)]" />
                      Active
                    </label>
                    <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" aria-hidden="true" /></IconButton>
                    <IconButton label="Move down" disabled={i === banners.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" aria-hidden="true" /></IconButton>
                    <IconButton label="Edit banner" onClick={() => open(b)}><Pencil className="size-4" aria-hidden="true" /></IconButton>
                    <IconButton label="Delete banner" onClick={() => { save(banners.filter((x) => x.id !== b.id)); toast('Banner removed', { tone: 'info' }); }}><Trash2 className="size-4" aria-hidden="true" /></IconButton>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add banner' : 'Edit banner'} footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={submit}>Save</Button></>}>
        <div className="grid gap-4">
          <Select label="Seminar" value={v.seminarId} onValueChange={(id) => setV({ ...v, seminarId: id })} error={errors.seminarId} options={c.listed.map((s) => ({ value: s.id, label: s.title }))} />
          <Input label="Headline" required value={v.headline} onValueChange={(h) => setV({ ...v, headline: h })} error={errors.headline} hint="One line shown under the seminar title" />
        </div>
      </Modal>
    </>
  );
};

export const NotificationsManagementPage: React.FC = () => {
  useDocumentTitle('Notifications management');
  const { data, setData, remove } = useData();
  const toast = useToast();
  const [v, setV] = useState({ audience: 'student' as Role | 'all', title: '', body: '', link: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('');

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = runValidators(v, { title: [required('Title')], body: [required('Message')] }) as Record<string, string>;
    if (v.link && !v.link.startsWith('/')) errs.link = 'Use an in-app path such as /seminars';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const roles: Role[] = v.audience === 'all' ? ['student', 'organiser', 'admin'] : [v.audience];
    const created: Notification[] = roles.map((audience) => ({ id: makeId('ntf'), audience, title: v.title.trim(), body: v.body.trim(), link: v.link || undefined, read: false, createdAt: new Date().toISOString() }));
    setData((d) => ({ ...d, notifications: [...created, ...d.notifications] }));
    toast('Notification sent (demo)', { description: `Delivered to the ${v.audience === 'all' ? 'all-roles' : v.audience} inbox in this browser.` });
    setV({ ...v, title: '', body: '', link: '' });
  };
  const list = data.notifications.filter((n) => !filter || n.audience === filter);

  return (
    <>
      <PageHeader title="Notifications management" description="Send in-app notifications to students, organisers or admins." />
      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader title="Compose" />
          <form onSubmit={send} noValidate className="grid gap-4 p-5">
            <Select label="Audience" value={v.audience} onValueChange={(a) => setV({ ...v, audience: a as Role | 'all' })} options={[{ value: 'student', label: 'All students' }, { value: 'organiser', label: 'All organisers' }, { value: 'admin', label: 'Admins' }, { value: 'all', label: 'Everyone' }]} />
            <Input label="Title" required value={v.title} onValueChange={(t) => setV({ ...v, title: t })} error={errors.title} />
            <Textarea label="Message" required rows={4} value={v.body} onValueChange={(b) => setV({ ...v, body: b })} error={errors.body} />
            <Input label="Link (optional)" value={v.link} onValueChange={(l) => setV({ ...v, link: l })} error={errors.link} placeholder="/seminars" />
            <Notice>Demo: no email, SMS or push is sent. The message appears in the in-app inbox of the selected role.</Notice>
            <Button type="submit"><Send className="size-4" aria-hidden="true" />Send notification</Button>
          </form>
        </Card>
        <Card>
          <CardHeader title="Sent & system notifications" actions={<Select label="Audience filter" hideLabel value={filter} onValueChange={setFilter} options={[{ value: '', label: 'All audiences' }, { value: 'student', label: 'Students' }, { value: 'organiser', label: 'Organisers' }, { value: 'admin', label: 'Admins' }]} className="w-40" />} />
          <ul className="divide-y divide-line">
            {list.slice(0, 30).map((n) => (
              <li key={n.id} className="flex items-start gap-3 px-5 py-3">
                <Badge tone="neutral" className="mt-0.5 shrink-0 capitalize">{n.audience}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-fg">{n.title}</p>
                  <p className="text-sm text-muted">{n.body}</p>
                  <p className="text-xs text-muted" title={formatDateTime(n.createdAt)}>{relativeTime(n.createdAt)} · {n.read ? 'read' : 'unread'}</p>
                </div>
                <IconButton label={`Delete: ${n.title}`} onClick={() => { remove('notifications', n.id); toast('Notification deleted', { tone: 'info' }); }}><Trash2 className="size-4" aria-hidden="true" /></IconButton>
              </li>
            ))}
            {list.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted">No notifications.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
};

export const PlatformSettingsPage: React.FC = () => {
  useDocumentTitle('Platform settings');
  const { user, usingMocks } = useAuth();
  const { data, update, resetDemo } = useData();
  const toast = useToast();
  const [v, setV] = useState<PlatformSettings>(data.settings);
  const [ticketCommissionPercent, setTicketCommissionPercent] = useState(5);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (usingMocks || !user?.accessToken) return;
    let cancelled = false;
    void getAdminSettings(user.accessToken).then((s) => {
      if (!cancelled) setTicketCommissionPercent(s.ticketCommissionPercent);
    });
    return () => {
      cancelled = true;
    };
  }, [usingMocks, user?.accessToken]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v.platformName.trim()) errs.platformName = 'Required';
    const em = email(v.supportEmail);
    if (em) errs.supportEmail = em;
    if (!(v.bookingFeePercent >= 0 && v.bookingFeePercent <= 20)) errs.bookingFeePercent = 'Between 0 and 20';
    if (!(Number.isInteger(v.maxTicketsPerOrder) && v.maxTicketsPerOrder >= 1 && v.maxTicketsPerOrder <= 20)) errs.maxTicketsPerOrder = 'Whole number 1–20';
    if (!(ticketCommissionPercent >= 0 && ticketCommissionPercent <= 100)) errs.ticketCommissionPercent = 'Between 0 and 100';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    update('settings', v);
    void (async () => {
      if (!usingMocks && user?.accessToken) {
        try {
          await updateAdminSettings(user.accessToken, { ticketCommissionPercent });
          toast('Platform settings saved', {
            description: 'Ticket commission % applies to the next checkout snapshot.',
          });
          return;
        } catch (err) {
          toast(err instanceof ApiError ? err.message : 'Could not save API settings', { tone: 'error' });
          return;
        }
      }
      toast('Platform settings saved', { description: 'Fees and limits apply to new carts and checkouts immediately.' });
    })();
  };
  return (
    <>
      <PageHeader title="Platform settings" />
      <form onSubmit={save} noValidate className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="General" />
          <div className="grid gap-4 p-5">
            <Input label="Platform name" value={v.platformName} onValueChange={(x) => setV({ ...v, platformName: x })} error={errors.platformName} />
            <Input label="Support email" type="email" value={v.supportEmail} onValueChange={(x) => setV({ ...v, supportEmail: x })} error={errors.supportEmail} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Bookings" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Input label="Booking fee (%)" type="number" min={0} max={20} step={0.5} value={String(v.bookingFeePercent)} onValueChange={(x) => setV({ ...v, bookingFeePercent: Number(x) })} error={errors.bookingFeePercent} />
            <Input label="Max tickets per order" type="number" min={1} max={20} value={String(v.maxTicketsPerOrder)} onValueChange={(x) => setV({ ...v, maxTicketsPerOrder: Number(x) })} error={errors.maxTicketsPerOrder} />
            <Input
              label="Ticket commission (%)"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={String(ticketCommissionPercent)}
              onValueChange={(x) => setTicketCommissionPercent(Number(x))}
              error={errors.ticketCommissionPercent}
              hint={!usingMocks ? 'Saved to Nest PlatformSettings — snapshotted on next order' : 'Demo local only unless mocks are off'}
              className="sm:col-span-2"
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Policies" />
          <div className="divide-y divide-line px-5">
            <Switch label="Require approval for new organisers" description="New organisers can only publish after review" checked={v.requireOrganiserApproval} onChange={(x) => setV({ ...v, requireOrganiserApproval: x })} />
            <Switch label="Maintenance mode" description="In a live build this would pause new bookings" checked={v.maintenanceMode} onChange={(x) => setV({ ...v, maintenanceMode: x })} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Demo data" />
          <div className="space-y-4 p-5">
            <Notice>All data lives in this browser's storage. Resetting restores the original sample dataset for every role.</Notice>
            <Button variant="danger" onClick={() => setConfirmReset(true)}>Reset demo data</Button>
          </div>
        </Card>
        <div className="flex justify-end xl:col-span-2">
          <Button type="submit" size="lg"><Save className="size-4" aria-hidden="true" />Save settings</Button>
        </div>
      </form>
      <ConfirmDialog open={confirmReset} title="Reset all demo data?" description="Seminars, bookings, tickets, users and content return to the original sample data." confirmLabel="Reset" onCancel={() => setConfirmReset(false)} onConfirm={() => { resetDemo(); setConfirmReset(false); setV(DEFAULT_SETTINGS); toast('Demo data reset'); }} />
    </>
  );
};

export const AdminProfilePage: React.FC = () => {
  useDocumentTitle('Admin profile');
  const { user, login } = useAuth();
  const toast = useToast();
  const [v, setV] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!user) return null;
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = runValidators(v, { name: [required('Name')], email: [required('Email'), email] }) as Record<string, string>;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    login({ ...user, ...v });
    toast('Profile saved');
  };
  return (
    <>
      <PageHeader title="Admin profile" />
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="h-fit p-6 text-center">
          <Avatar name={v.name || 'Admin'} size="xl" className="mx-auto" />
          <p className="mt-3 font-semibold text-fg">{user.name}</p>
          <Badge className="mt-2">Super admin (demo)</Badge>
        </Card>
        <Card>
          <CardHeader title="Details" />
          <form onSubmit={save} noValidate className="grid gap-4 p-5 sm:grid-cols-2">
            <Input label="Name" value={v.name} onValueChange={(x) => setV({ ...v, name: x })} error={errors.name} />
            <Input label="Email" type="email" value={v.email} onValueChange={(x) => setV({ ...v, email: x })} error={errors.email} />
            <Notice className="sm:col-span-2">Admin permissions are simulated. In a live build, roles would be enforced by the server.</Notice>
            <div className="flex justify-end sm:col-span-2"><Button type="submit"><Save className="size-4" aria-hidden="true" />Save</Button></div>
          </form>
        </Card>
      </div>
    </>
  );
};
