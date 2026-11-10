import React, { useState } from 'react';
import { ExternalLink, Pencil, Save, Star, Trash2, UserPlus } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ConfirmDialog, Modal } from '../../components/ui/Dialog';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Avatar, Badge, Card, CardHeader, Notice } from '../../components/ui/Primitives';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePersistentState } from '../../hooks/usePersistentState';
import { PageHeader } from '../../layouts/DashboardLayout';
import { AccountSettingsPage } from '../student/StudentAccount';
import type { Lecturer, Organiser } from '../../types';
import { makeId } from '../../utils/random';
import { email, phone, required, runValidators } from '../../utils/validation';
import { useOrganiser } from './useOrganiser';

const EMPTY_LECTURER = { name: '', title: '', subjects: '', email: '', bio: '' };

export const LecturerManagementPage: React.FC = () => {
  useDocumentTitle('Lecturers');
  const { id, lecturers, seminars } = useOrganiser();
  const { upsert, remove } = useData();
  const toast = useToast();
  const [editing, setEditing] = useState<Lecturer | 'new' | null>(null);
  const [v, setV] = useState(EMPTY_LECTURER);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [removing, setRemoving] = useState<Lecturer | null>(null);
  const count = (l: Lecturer) => seminars.filter((s) => s.lecturerId === l.id).length;

  const open = (l: Lecturer | 'new') => {
    setEditing(l);
    setErrors({});
    setV(l === 'new' ? EMPTY_LECTURER : { name: l.name, title: l.title, subjects: l.subjects.join(', '), email: '', bio: l.bio });
  };

  const save = () => {
    const errs: Record<string, string> = runValidators(v, { name: [required('Name')], subjects: [required('At least one subject')] });
    if (editing === 'new') {
      const e = required('Email')(v.email) ?? email(v.email);
      if (e) errs.email = e;
    }
    setErrors(errs);
    if (Object.keys(errs).length || !editing) return;
    const base: Lecturer = editing === 'new'
      ? { id: makeId('lec').toLowerCase(), organiserId: id, rating: 0, studentsTaught: 0, yearsTeaching: 0, qualifications: [], status: 'invited', name: '', title: '', subjects: [], bio: '' }
      : editing;
    upsert('lecturers', { ...base, name: v.name.trim(), title: v.title.trim(), subjects: v.subjects.split(',').map((s) => s.trim()).filter(Boolean), bio: v.bio.trim() || base.bio });
    toast(editing === 'new' ? 'Invitation sent (demo)' : 'Lecturer updated', { description: editing === 'new' ? `No email was sent to ${v.email}.` : undefined });
    setEditing(null);
  };

  const columns: Column<Lecturer>[] = [
    { key: 'name', header: 'Lecturer', sortValue: (l) => l.name, render: (l) => <div className="flex items-center gap-3"><Avatar name={l.name} size="sm" /><div><p className="font-semibold text-fg">{l.name}</p><p className="text-xs text-muted">{l.title}</p></div></div> },
    { key: 'subjects', header: 'Subjects', sortValue: (l) => l.subjects.join(), render: (l) => <div className="flex flex-wrap gap-1">{l.subjects.map((s) => <Badge key={s} tone="neutral">{s}</Badge>)}</div>, hideBelow: 'md' },
    { key: 'rating', header: 'Rating', align: 'right', sortValue: (l) => l.rating, render: (l) => (l.rating ? <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-current text-warning" aria-hidden="true" />{l.rating}</span> : '—'), hideBelow: 'sm' },
    { key: 'seminars', header: 'Seminars', align: 'right', sortValue: count, render: count, hideBelow: 'sm' },
    { key: 'status', header: 'Status', sortValue: (l) => l.status, render: (l) => <StatusBadge status={l.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (l) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => open(l)} aria-label={`Edit ${l.name}`}><Pencil className="size-4" aria-hidden="true" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setRemoving(l)} disabled={count(l) > 0} title={count(l) > 0 ? 'Assigned to seminars' : undefined} aria-label={`Remove ${l.name}`}><Trash2 className="size-4" aria-hidden="true" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Lecturer management" description="Lecturers who can be assigned to your seminars." actions={<Button onClick={() => open('new')}><UserPlus className="size-4" aria-hidden="true" />Invite lecturer</Button>} />
      <Card>
        <DataTable rows={lecturers} columns={columns} rowKey={(l) => l.id} caption="Lecturers" searchText={(l) => `${l.name} ${l.subjects.join(' ')}`} initialSort={{ key: 'name', dir: 'asc' }} emptyTitle="No lecturers yet" emptyDescription="Invite a lecturer to assign them to seminars." />
      </Card>
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Invite a lecturer' : 'Edit lecturer'}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>{editing === 'new' ? 'Send invite (demo)' : 'Save'}</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" required value={v.name} onValueChange={(x) => setV({ ...v, name: x })} error={errors.name} />
          <Input label="Qualification / title" value={v.title} onValueChange={(x) => setV({ ...v, title: x })} placeholder="BSc (Hons)" />
          <Input label="Subjects" required value={v.subjects} onValueChange={(x) => setV({ ...v, subjects: x })} error={errors.subjects} hint="Separate with commas" className="sm:col-span-2" />
          {editing === 'new' && <Input label="Email for the invitation" required type="email" value={v.email} onValueChange={(x) => setV({ ...v, email: x })} error={errors.email} className="sm:col-span-2" />}
          <Textarea label="Short bio" value={v.bio} onValueChange={(x) => setV({ ...v, bio: x })} rows={3} className="sm:col-span-2" />
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove lecturer?"
        description={`${removing?.name ?? ''} will no longer be available for your seminars.`}
        confirmLabel="Remove"
        onCancel={() => setRemoving(null)}
        onConfirm={() => { if (removing) remove('lecturers', removing.id); setRemoving(null); toast('Lecturer removed', { tone: 'info' }); }}
      />
    </>
  );
};

export const OrganiserProfileSettingsPage: React.FC = () => {
  useDocumentTitle('Organiser profile');
  const { organiser } = useOrganiser();
  const { patch } = useData();
  const toast = useToast();
  const [v, setV] = useState({ name: organiser?.name ?? '', type: organiser?.type ?? 'Institute', city: organiser?.city ?? '', about: organiser?.about ?? '', email: organiser?.email ?? '', phone: organiser?.phone ?? '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!organiser) return null;
  const set = (k: keyof typeof v) => (x: string) => setV({ ...v, [k]: x });
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = runValidators(v, { name: [required('Name')], city: [required('City')], email: [required('Email'), email], phone: [phone] });
    setErrors(errs as Record<string, string>);
    if (Object.keys(errs).length) return;
    patch('organisers', organiser.id, { ...v, type: v.type as Organiser['type'] });
    toast('Organiser profile saved');
  };
  return (
    <>
      <PageHeader
        title="Organiser profile"
        description="This information appears on your public organiser page."
        actions={organiser.status === 'active' && <Button to={`/organisers/${organiser.slug}`} variant="secondary"><ExternalLink className="size-4" aria-hidden="true" />View public page</Button>}
      />
      {!organiser.verified && <Notice tone="warning" className="mb-6">Your profile is awaiting admin review and is not public yet.</Notice>}
      <Card>
        <CardHeader title="Public details" actions={<StatusBadge status={organiser.status === 'pending' ? 'pending' : organiser.status} />} />
        <form onSubmit={save} noValidate className="grid gap-4 p-5 sm:grid-cols-2">
          <Input label="Organisation name" required value={v.name} onValueChange={set('name')} error={errors.name} className="sm:col-span-2" />
          <Select label="Type" value={v.type} onValueChange={set('type')} options={['Institute', 'Independent lecturer', 'School society'].map((x) => ({ value: x, label: x }))} />
          <Input label="City" required value={v.city} onValueChange={set('city')} error={errors.city} />
          <Textarea label="About" value={v.about} onValueChange={set('about')} rows={4} className="sm:col-span-2" />
          <Input label="Public email" required type="email" value={v.email} onValueChange={set('email')} error={errors.email} />
          <Input label="Phone" type="tel" value={v.phone} onValueChange={set('phone')} error={errors.phone} />
          <div className="flex justify-end sm:col-span-2"><Button type="submit"><Save className="size-4" aria-hidden="true" />Save profile</Button></div>
        </form>
      </Card>
    </>
  );
};

export const OrganiserSettingsPage: React.FC = () => {
  const toast = useToast();
  const [payout, setPayout] = usePersistentState('edupass-demo-payout', () => ({ bank: 'Demo Bank', branch: 'Nugegoda', account: '', holder: '' }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = runValidators(payout, { bank: [required('Bank')], holder: [required('Account holder')] });
    if (!/^\d{8,16}$/.test(payout.account)) errs.account = 'Enter 8–16 digits';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    toast('Payout details saved (demo)', { description: 'Stored in this browser only. Never enter real bank details.' });
  };
  return (
    <>
      <AccountSettingsPage role="organiser" />
      <Card className="mt-6">
        <CardHeader title="Payout account" description="Where ticket revenue would be paid. Demo only — do not enter real details." />
        <form onSubmit={save} noValidate className="grid gap-4 p-5 sm:grid-cols-2">
          <Input label="Bank" value={payout.bank} onValueChange={(x) => setPayout({ ...payout, bank: x })} error={errors.bank} />
          <Input label="Branch" value={payout.branch} onValueChange={(x) => setPayout({ ...payout, branch: x })} />
          <Input label="Account number" inputMode="numeric" value={payout.account} onValueChange={(x) => setPayout({ ...payout, account: x.replace(/\D/g, '') })} error={errors.account} />
          <Input label="Account holder" value={payout.holder} onValueChange={(x) => setPayout({ ...payout, holder: x })} error={errors.holder} />
          <div className="flex justify-end sm:col-span-2"><Button type="submit">Save payout details</Button></div>
        </form>
      </Card>
    </>
  );
};
