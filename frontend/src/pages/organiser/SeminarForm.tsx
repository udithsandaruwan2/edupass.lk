import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Eye, Plus, Save, Send, Trash2 } from 'lucide-react';
import { ApiError } from '../../api/client';
import { createSeminarApi, publishSeminarApi, updateSeminarApi } from '../../api/seminars';
import { Button, IconButton } from '../../components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '../../components/ui/Field';
import { Card, CardHeader, Notice } from '../../components/ui/Primitives';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../layouts/DashboardLayout';
import { NotFoundPage } from '../public/InfoPages';
import { SeminarDetailView } from '../public/SeminarDetailsPage';
import type { CheckInMode, Seminar, TicketType } from '../../types';
import { MODE_LABELS, slugify } from '../../utils/format';
import { makeId } from '../../utils/random';
import { useOrganiser } from './useOrganiser';

const CHECK_IN_OPTIONS: { value: CheckInMode; label: string }[] = [
  { value: 'qr_gate', label: 'QR gate (physical)' },
  { value: 'join_link', label: 'Join link (online)' },
  { value: 'both', label: 'QR gate + join link' },
];

const SUBJECTS = ['Economics', 'Business Studies', 'Accounting', 'Combined Maths', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'ICT'];
const DISTRICTS = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Kurunegala', 'Online'];

interface FormState {
  title: string;
  subject: string;
  level: Seminar['level'];
  categoryId: string;
  lecturerId: string;
  mode: Seminar['mode'];
  venue: string;
  district: string;
  date: string;
  time: string;
  durationHours: string;
  language: Seminar['language'];
  summary: string;
  description: string;
  highlights: string[];
  agenda: { time: string; title: string }[];
  ticketTypes: TicketType[];
  featured: boolean;
  checkInMode: CheckInMode;
  streamJoinUrl: string;
}

function toForm(s: Seminar): FormState {
  const d = new Date(s.startsAt);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    title: s.title, subject: s.subject, level: s.level, categoryId: s.categoryId, lecturerId: s.lecturerId, mode: s.mode, venue: s.venue, district: s.district,
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    durationHours: String(s.durationHours), language: s.language, summary: s.summary, description: s.description, highlights: s.highlights, agenda: s.agenda,
    ticketTypes: s.ticketTypes, featured: s.featured, checkInMode: s.checkInMode ?? 'qr_gate',
    streamJoinUrl: s.streamJoinUrl ?? '',
  };
}

const today = () => new Date().toISOString().slice(0, 10);

export const SeminarFormPage: React.FC = () => {
  const { seminarId } = useParams();
  const { organiser, seminars, lecturers, catalog, usingApi, refreshSeminars, seminarsLoading } = useOrganiser();
  const { user } = useAuth();
  const existing = seminarId ? seminars.find((s) => s.id === seminarId) : undefined;
  useDocumentTitle(existing ? `Edit ${existing.title}` : 'Create seminar');
  const { upsert } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const [id] = useState(() => existing?.id ?? makeId('sem').toLowerCase());
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState<FormState>(() =>
    existing
      ? toForm(existing)
      : {
          title: '', subject: 'Economics', level: 'A/L', categoryId: catalog.categories[0]?.id ?? '', lecturerId: lecturers.find((l) => l.status === 'active')?.id ?? '', mode: 'physical',
          venue: '', district: 'Colombo', date: '', time: '08:30', durationHours: '4', language: 'Sinhala', summary: '', description: '',
          highlights: ['Timed model paper with answer walkthrough'], agenda: [{ time: '08:30', title: 'Registration & QR check-in' }],
          ticketTypes: [{ id: `${id}-std`, name: 'Standard seat', description: 'General admission', price: 1500, capacity: 100, sold: 0 }], featured: false,
          checkInMode: 'qr_gate',
          streamJoinUrl: '',
        },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (seminarId && !existing) {
    if (usingApi && seminarsLoading) return <Notice tone="warning">Loading seminar…</Notice>;
    return <NotFoundPage />;
  }
  const locked = existing && existing.status !== 'draft' && existing.ticketTypes.some((t) => t.sold > 0);
  const canPublish = Boolean(organiser?.verified) || usingApi;
  const set = <K extends keyof FormState>(k: K) => (v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  const validate = (publish: boolean) => {
    const e: Record<string, string> = {};
    if (f.title.trim().length < 8) e.title = 'Use a descriptive title (8+ characters)';
    if (!f.venue.trim()) e.venue = f.mode === 'online' ? 'Enter the stream platform' : 'Venue is required';
    if (!f.date) e.date = 'Choose a date';
    else if (!existing && f.date < today()) e.date = 'Date must be in the future';
    if (!f.time) e.time = 'Choose a start time';
    if (!(Number(f.durationHours) > 0 && Number(f.durationHours) <= 12)) e.durationHours = 'Between 1 and 12 hours';
    if (f.summary.trim().length < 20) e.summary = 'Write a short summary (20+ characters)';
    if (!usingApi && !f.lecturerId) e.lecturerId = 'Choose a lecturer';
    if (!f.ticketTypes.length) e.tickets = 'Add at least one ticket type';
    if (publish && !f.checkInMode) e.checkInMode = 'Choose how attendance will be taken';
    f.ticketTypes.forEach((t, i) => {
      if (!t.name.trim()) e[`t${i}name`] = 'Required';
      if (!(t.price >= 0)) e[`t${i}price`] = 'Invalid';
      if (!(t.capacity >= Math.max(1, t.sold))) e[`t${i}cap`] = `Min ${Math.max(1, t.sold)}`;
    });
    setErrors(e);
    if (Object.keys(e).length) {
      toast('Please fix the highlighted fields', { tone: 'error' });
      return false;
    }
    return true;
  };

  const build = (status: Seminar['status']): Seminar => ({
    id,
    slug: existing?.slug ?? `${slugify(f.title)}-${id.slice(-4)}`,
    title: f.title.trim(),
    subject: f.subject,
    level: f.level,
    categoryId: f.categoryId,
    lecturerId: f.lecturerId,
    organiserId: organiser!.id,
    mode: f.mode,
    venue: f.venue.trim(),
    district: f.mode === 'online' ? 'Online' : f.district,
    startsAt: new Date(`${f.date}T${f.time}`).toISOString(),
    durationHours: Number(f.durationHours),
    summary: f.summary.trim(),
    description: f.description.trim() || f.summary.trim(),
    highlights: f.highlights.filter((h) => h.trim()),
    agenda: f.agenda.filter((a) => a.title.trim()),
    ticketTypes: f.ticketTypes,
    status,
    checkInMode: f.checkInMode,
    streamJoinUrl: f.streamJoinUrl.trim() || undefined,
    featured: f.featured,
    language: f.language,
    image: existing?.image,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  });

  const writeInput = () => ({
    organisationId: user?.organisationId ?? organiser!.id,
    title: f.title.trim(),
    subject: f.subject,
    level: f.level,
    categoryId: f.categoryId || undefined,
    lecturerProfileId: f.lecturerId || undefined,
    mode: f.mode,
    venue: f.venue.trim(),
    district: f.mode === 'online' ? 'Online' : f.district,
    startsAt: new Date(`${f.date}T${f.time}`).toISOString(),
    durationHours: Number(f.durationHours),
    summary: f.summary.trim(),
    description: f.description.trim() || f.summary.trim(),
    highlights: f.highlights.filter((h) => h.trim()),
    agenda: f.agenda.filter((a) => a.title.trim()),
    checkInMode: f.checkInMode,
    streamJoinUrl: f.streamJoinUrl.trim() || undefined,
    featured: f.featured,
    language: f.language,
    ticketTypes: f.ticketTypes.map((t) => ({
      name: t.name,
      description: t.description,
      price: t.price,
      capacity: t.capacity,
    })),
  });

  const save = async (publish: boolean) => {
    if (!validate(publish)) return;
    if (!usingApi) {
      const status = publish ? 'published' : existing?.status === 'published' ? 'published' : 'draft';
      upsert('seminars', build(status));
      toast(publish ? 'Seminar published (demo)' : existing ? 'Changes saved' : 'Draft saved', { description: publish ? 'It is now visible on the public site.' : undefined });
      navigate('/organiser/seminars');
      return;
    }
    if (!user?.accessToken || !user.organisationId) {
      toast('Sign in again to save seminars', { tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      const input = writeInput();
      let saved = existing
        ? await updateSeminarApi(existing.id, user.organisationId, input, user.accessToken)
        : await createSeminarApi(input, user.accessToken);
      if (publish && saved.status !== 'published') {
        saved = await publishSeminarApi(saved.id, user.organisationId, f.checkInMode, user.accessToken);
      }
      upsert('seminars', saved);
      refreshSeminars((prev) => {
        const list = prev ?? [];
        const exists = list.some((s) => s.id === saved.id);
        return exists ? list.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...list];
      });
      toast(publish ? 'Seminar published' : existing ? 'Changes saved' : 'Draft saved', {
        description: publish ? 'It is now visible on the public catalogue.' : undefined,
      });
      navigate('/organiser/seminars');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save seminar';
      toast(message, { tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateType = (i: number, changes: Partial<TicketType>) => set('ticketTypes')(f.ticketTypes.map((t, j) => (j === i ? { ...t, ...changes } : t)));

  return (
    <>
      <PageHeader
        title={existing ? 'Edit seminar' : 'Create seminar'}
        back={{ to: '/organiser/seminars', label: 'Seminars' }}
        actions={existing && <Button to={`/organiser/seminars/${existing.id}/preview`} variant="secondary"><Eye className="size-4" aria-hidden="true" />Preview</Button>}
      />
      {locked && <Notice tone="warning" className="mb-6">Tickets have been sold for this seminar. Students will be notified of any date or venue change in a live build.</Notice>}
      <form onSubmit={(e) => { e.preventDefault(); void save(false); }} noValidate className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader title="Basics" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Input label="Seminar title" required value={f.title} onValueChange={set('title')} error={errors.title} className="sm:col-span-2" placeholder="e.g. Economics Full-System Revision Day" />
              <Select label="Subject" value={f.subject} onValueChange={set('subject')} options={SUBJECTS.map((s) => ({ value: s, label: s }))} />
              <Select label="Exam level" value={f.level} onValueChange={(v) => set('level')(v as Seminar['level'])} options={[{ value: 'A/L', label: 'G.C.E. A/L' }, { value: 'O/L', label: 'G.C.E. O/L' }]} />
              <Select label="Category" value={f.categoryId} onValueChange={set('categoryId')} options={catalog.categories.map((c) => ({ value: c.id, label: c.name }))} />
              <Select label="Lecturer" value={f.lecturerId} onValueChange={set('lecturerId')} error={errors.lecturerId} options={lecturers.length ? lecturers.map((l) => ({ value: l.id, label: `${l.name}${l.status === 'invited' ? ' (invited)' : ''}` })) : [{ value: '', label: 'Add a lecturer first' }]} />
              <Select label="Medium" value={f.language} onValueChange={(v) => set('language')(v as Seminar['language'])} options={['Sinhala', 'English', 'Tamil'].map((x) => ({ value: x, label: x }))} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Schedule & venue" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Select label="Format" value={f.mode} onValueChange={(v) => set('mode')(v as Seminar['mode'])} options={Object.entries(MODE_LABELS).map(([value, label]) => ({ value, label }))} />
              {f.mode !== 'online' && <Select label="District" value={f.district} onValueChange={set('district')} options={DISTRICTS.filter((d) => d !== 'Online').map((d) => ({ value: d, label: d }))} />}
              <Input label={f.mode === 'online' ? 'Stream platform' : 'Venue'} required value={f.venue} onValueChange={set('venue')} error={errors.venue} className="sm:col-span-2" placeholder={f.mode === 'online' ? 'Online live hall' : 'Hall name, city'} />
              {f.mode !== 'physical' && (
                <Input
                  label="Stream join URL (optional)"
                  value={f.streamJoinUrl}
                  onValueChange={set('streamJoinUrl')}
                  className="sm:col-span-2"
                  placeholder="https://meet.example.com/room"
                  hint="Shown on the student ticket for online/hybrid seminars."
                />
              )}
              <Input label="Date" required type="date" min={existing ? undefined : today()} value={f.date} onValueChange={set('date')} error={errors.date} />
              <Input label="Start time" required type="time" value={f.time} onValueChange={set('time')} error={errors.time} />
              <Input label="Duration (hours)" type="number" min={1} max={12} value={f.durationHours} onValueChange={set('durationHours')} error={errors.durationHours} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Description" />
            <div className="grid gap-4 p-5">
              <Textarea label="Short summary" required rows={2} value={f.summary} onValueChange={set('summary')} error={errors.summary} hint="Shown on seminar cards and at the top of the page" />
              <Textarea label="Full description" rows={5} value={f.description} onValueChange={set('description')} />
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-fg">Highlights</legend>
                <div className="space-y-2">
                  {f.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <Input label={`Highlight ${i + 1}`} hideLabel value={h} onValueChange={(v) => set('highlights')(f.highlights.map((x, j) => (j === i ? v : x)))} className="flex-1" />
                      <IconButton label={`Remove highlight ${i + 1}`} onClick={() => set('highlights')(f.highlights.filter((_, j) => j !== i))}><Trash2 className="size-4" aria-hidden="true" /></IconButton>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => set('highlights')([...f.highlights, ''])}><Plus className="size-4" aria-hidden="true" />Add highlight</Button>
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-fg">Agenda</legend>
                <div className="space-y-2">
                  {f.agenda.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <Input label={`Agenda ${i + 1} time`} hideLabel type="time" value={a.time} onValueChange={(v) => set('agenda')(f.agenda.map((x, j) => (j === i ? { ...x, time: v } : x)))} className="w-32 shrink-0" />
                      <Input label={`Agenda ${i + 1} item`} hideLabel value={a.title} onValueChange={(v) => set('agenda')(f.agenda.map((x, j) => (j === i ? { ...x, title: v } : x)))} className="flex-1" />
                      <IconButton label={`Remove agenda item ${i + 1}`} onClick={() => set('agenda')(f.agenda.filter((_, j) => j !== i))}><Trash2 className="size-4" aria-hidden="true" /></IconButton>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => set('agenda')([...f.agenda, { time: '', title: '' }])}><Plus className="size-4" aria-hidden="true" />Add agenda item</Button>
                </div>
              </fieldset>
            </div>
          </Card>

          <Card>
            <CardHeader title="Ticket types" description="Prices in LKR. You can fine-tune these later under Ticket types & pricing." />
            {errors.tickets && <p className="px-5 pt-4 text-sm font-semibold text-danger">{errors.tickets}</p>}
            <ul className="divide-y divide-line">
              {f.ticketTypes.map((t, i) => (
                <li key={t.id} className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_8rem_8rem_auto] sm:items-start">
                  <Input label="Name" value={t.name} onValueChange={(v) => updateType(i, { name: v })} error={errors[`t${i}name`]} />
                  <Input label="Price" type="number" min={0} value={String(t.price)} onValueChange={(v) => updateType(i, { price: Number(v) })} error={errors[`t${i}price`]} />
                  <Input label="Capacity" type="number" min={1} value={String(t.capacity)} onValueChange={(v) => updateType(i, { capacity: Number(v) })} error={errors[`t${i}cap`]} hint={t.sold ? `${t.sold} sold` : undefined} />
                  <div className="sm:pt-7">
                    <IconButton label={`Remove ${t.name || 'ticket type'}`} disabled={t.sold > 0} onClick={() => set('ticketTypes')(f.ticketTypes.filter((_, j) => j !== i))}><Trash2 className="size-4" aria-hidden="true" /></IconButton>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-4">
              <Button variant="ghost" size="sm" onClick={() => set('ticketTypes')([...f.ticketTypes, { id: `${id}-${makeId('tt').slice(-4).toLowerCase()}`, name: '', description: '', price: 1000, capacity: 50, sold: 0 }])}>
                <Plus className="size-4" aria-hidden="true" />Add ticket type
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-fg">Publishing</h2>
            <p className="mt-1 text-sm text-muted">
              Status: <span className="font-semibold text-fg">{existing?.status ?? 'new draft'}</span>
            </p>
            <Select
              className="mt-4"
              label="Check-in mode"
              value={f.checkInMode}
              onValueChange={(v) => set('checkInMode')(v as CheckInMode)}
              error={errors.checkInMode}
              options={CHECK_IN_OPTIONS}
              hint="Required before publishing (QR gate, join link, or both)"
            />
            <Checkbox className="mt-4" label="Request a featured placement" description="Admins review featured requests" checked={f.featured} onChange={set('featured')} />
            {!canPublish && <Notice tone="warning" className="mt-4">Publishing unlocks once an admin approves your organiser account.</Notice>}
            <div className="mt-5 grid gap-2">
              <Button type="submit" variant="secondary" disabled={saving}><Save className="size-4" aria-hidden="true" />{existing?.status === 'published' ? 'Save changes' : 'Save as draft'}</Button>
              {existing?.status !== 'published' && (
                <Button onClick={() => void save(true)} disabled={!canPublish || saving}><Send className="size-4" aria-hidden="true" />{usingApi ? 'Save & publish' : 'Save & publish (demo)'}</Button>
              )}
            </div>
          </Card>
        </div>
      </form>
    </>
  );
};

export const SeminarPreviewPage: React.FC = () => {
  const { seminarId } = useParams();
  const { seminars } = useOrganiser();
  const seminar = seminars.find((s) => s.id === seminarId);
  useDocumentTitle(seminar ? `Preview: ${seminar.title}` : 'Preview');
  if (!seminar) return <NotFoundPage />;
  return (
    <>
      <PageHeader
        title="Seminar preview"
        description="This is how students see the seminar page. Booking is disabled in preview."
        back={{ to: '/organiser/seminars', label: 'Seminars' }}
        actions={
          <>
            <Button to={`/organiser/seminars/${seminar.id}/edit`} variant="secondary">Edit</Button>
            {seminar.status === 'published' && <Button to={`/seminars/${seminar.slug}`}>Open public page</Button>}
          </>
        }
      />
      <Notice tone="warning" className="mb-6">Preview · status <strong>{seminar.status}</strong></Notice>
      <SeminarDetailView seminar={seminar} preview />
    </>
  );
};
