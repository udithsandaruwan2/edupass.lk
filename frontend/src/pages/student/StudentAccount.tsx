import React, { useState } from 'react';
import { LifeBuoy, Save } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { Input, Select, Switch, Textarea } from '../../components/ui/Field';
import { Avatar, Card, CardHeader, Notice } from '../../components/ui/Primitives';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePersistentState } from '../../hooks/usePersistentState';
import { PageHeader } from '../../layouts/DashboardLayout';
import { FaqList } from '../public/InfoPages';
import { formatDate, formatDateTime } from '../../utils/date';
import { makeId } from '../../utils/random';
import { email, minLength, password, phone, required, runValidators } from '../../utils/validation';
import { useStudent } from './useStudent';

export const StudentProfilePage: React.FC = () => {
  useDocumentTitle('Profile');
  const { profile } = useStudent();
  const { patch } = useData();
  const { login, user } = useAuth();
  const toast = useToast();
  const [v, setV] = useState({ name: profile?.name ?? '', email: profile?.email ?? '', phone: profile?.phone ?? '', school: profile?.school ?? '', district: profile?.district ?? 'Colombo', stream: profile?.stream ?? 'Commerce', examYear: String(profile?.examYear ?? new Date().getFullYear()) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!profile) return null;
  const set = (k: keyof typeof v) => (x: string) => setV({ ...v, [k]: x });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = runValidators(v, { name: [required('Name')], email: [required('Email'), email], phone: [phone], school: [required('School')] });
    setErrors(errs as Record<string, string>);
    if (Object.keys(errs).length) return;
    patch('students', profile.id, { ...v, examYear: Number(v.examYear) });
    if (user) login({ ...user, name: v.name, email: v.email });
    toast('Profile saved');
  };

  return (
    <>
      <PageHeader title="Personal profile" description="Organisers see your name on tickets and attendee lists." />
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="h-fit p-6 text-center">
          <Avatar name={v.name || profile.name} size="xl" className="mx-auto" />
          <p className="mt-3 font-semibold text-fg">{profile.name}</p>
          <p className="text-sm text-muted">{profile.school}</p>
          <p className="mt-3 text-xs text-muted">Member since {formatDate(profile.joinedAt)}</p>
          <div className="mt-2"><StatusBadge status={profile.status} /></div>
        </Card>
        <Card>
          <CardHeader title="Details" />
          <form onSubmit={save} noValidate className="grid gap-4 p-5 sm:grid-cols-2">
            <Input label="Full name" required value={v.name} onValueChange={set('name')} error={errors.name} className="sm:col-span-2" />
            <Input label="Email" required type="email" value={v.email} onValueChange={set('email')} error={errors.email} />
            <Input label="Mobile number" type="tel" value={v.phone} onValueChange={set('phone')} error={errors.phone} />
            <Input label="School" required value={v.school} onValueChange={set('school')} error={errors.school} className="sm:col-span-2" />
            <Select label="District" value={v.district} onValueChange={set('district')} options={['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Kurunegala', 'Other'].map((d) => ({ value: d, label: d }))} />
            <Select label="Stream" value={v.stream} onValueChange={set('stream')} options={['Commerce', 'Physical Science', 'Biological Science', 'Arts', 'Technology', 'O/L'].map((d) => ({ value: d, label: d }))} />
            <Input label="Exam year" type="number" value={v.examYear} onValueChange={set('examYear')} />
            <div className="flex items-end justify-end sm:col-span-2">
              <Button type="submit"><Save className="size-4" aria-hidden="true" />Save changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

interface Prefs {
  emailBookings: boolean;
  emailReminders: boolean;
  smsReminders: boolean;
  newsletter: boolean;
  language: string;
}

/** Account settings shared by students and organisers (preferences are stored per role). */
export const AccountSettingsPage: React.FC<{ role: 'student' | 'organiser' }> = ({ role }) => {
  useDocumentTitle('Settings');
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { logout, usingMocks } = useAuth();
  const { resetDemo } = useData();
  const [prefs, setPrefs] = usePersistentState<Prefs>(`edupass-prefs-${role}`, () => ({ emailBookings: true, emailReminders: true, smsReminders: false, newsletter: false, language: 'en' }));
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<null | 'delete' | 'reset'>(null);
  const toggle = (k: keyof Prefs) => (val: boolean) => {
    setPrefs({ ...prefs, [k]: val });
    toast('Preference saved', { tone: 'info' });
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = runValidators(pw, { current: [required('Current password'), minLength('Current password', 8)], next: [password] });
    if (pw.confirm !== pw.next) errs.confirm = 'Passwords do not match';
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setPw({ current: '', next: '', confirm: '' });
    toast(usingMocks ? 'Password updated (demo)' : 'Password change requested', {
      description: usingMocks
        ? 'Nothing is stored in mock mode.'
        : 'Use forgot-password if you need a reset link by email.',
    });
  };

  return (
    <>
      <PageHeader title="Account settings" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Notifications" description="Choose how we keep you updated." />
          <div className="divide-y divide-line px-5">
            <Switch label="Booking confirmations by email" checked={prefs.emailBookings} onChange={toggle('emailBookings')} />
            <Switch label="Seminar reminders by email" description="24 hours before each seminar" checked={prefs.emailReminders} onChange={toggle('emailReminders')} />
            <Switch label="SMS reminders" checked={prefs.smsReminders} onChange={toggle('smsReminders')} />
            <Switch label="Weekly new-seminar newsletter" checked={prefs.newsletter} onChange={toggle('newsletter')} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Appearance & language" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Select label="Theme" value={theme} onValueChange={(t) => { setTheme(t as 'light' | 'dark'); toast('Theme updated', { tone: 'info' }); }} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} hint="Saved on this device" />
            <Select label="Language" value={prefs.language} onValueChange={(language) => { setPrefs({ ...prefs, language }); toast('Language preference saved', { tone: 'info' }); }} options={[{ value: 'en', label: 'English' }, { value: 'si', label: 'සිංහල (Sinhala)' }, { value: 'ta', label: 'தமிழ் (Tamil)' }]} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Change password" />
          <form onSubmit={changePassword} noValidate className="grid gap-4 p-5">
            <Input label="Current password" type="password" autoComplete="current-password" value={pw.current} onValueChange={(x) => setPw({ ...pw, current: x })} error={pwErrors.current} />
            <Input label="New password" type="password" autoComplete="new-password" value={pw.next} onValueChange={(x) => setPw({ ...pw, next: x })} error={pwErrors.next} hint="8+ characters with a letter and a number" />
            <Input label="Confirm new password" type="password" autoComplete="new-password" value={pw.confirm} onValueChange={(x) => setPw({ ...pw, confirm: x })} error={pwErrors.confirm} />
            <div className="flex justify-end"><Button type="submit">Update password</Button></div>
          </form>
        </Card>
        <Card>
          <CardHeader title="Account" />
          <div className="space-y-4 p-5">
            {usingMocks ? (
              <Notice>Mock mode stores bookings and cart in this browser only.</Notice>
            ) : (
              <Notice>Your account data is stored securely on EduPass servers.</Notice>
            )}
            <div className="flex flex-wrap gap-2">
              {usingMocks && (
                <Button variant="secondary" onClick={() => setConfirm('reset')}>Reset mock data</Button>
              )}
              <Button variant="danger" onClick={() => setConfirm('delete')}>Sign out &amp; leave</Button>
            </div>
          </div>
        </Card>
      </div>
      <ConfirmDialog
        open={confirm === 'reset'}
        title="Reset mock data?"
        description="Restores the original sample seminars and bookings on this device."
        confirmLabel="Reset data"
        onCancel={() => setConfirm(null)}
        onConfirm={() => { resetDemo(); setConfirm(null); toast('Mock data reset'); }}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title="Sign out?"
        description="You will be signed out of this device. Contact support to permanently close an account."
        confirmLabel="Sign out"
        onCancel={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); logout(); toast('Signed out', { tone: 'info' }); }}
      />
    </>
  );
};

interface SupportRequest {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'open';
}

export const SupportPage: React.FC = () => {
  useDocumentTitle('Help & support');
  const { catalog, orders } = useStudent();
  const toast = useToast();
  const [requests, setRequests] = usePersistentState<SupportRequest[]>('edupass-demo-support', () => []);
  const [v, setV] = useState({ subject: '', order: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = runValidators(v, { subject: [required('Subject')], message: [required('Message'), minLength('Message', 20)] });
    setErrors(errs as Record<string, string>);
    if (Object.keys(errs).length) return;
    setRequests([{ id: makeId('SUP'), subject: v.subject, message: v.order ? `[${v.order}] ${v.message}` : v.message, createdAt: new Date().toISOString(), status: 'open' }, ...requests]);
    setV({ subject: '', order: '', message: '' });
    toast('Support request recorded', { description: 'Our team will follow up by email.' });
  };
  return (
    <>
      <PageHeader title="Help & support" description="Answers to common questions, or send a request to our team." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="faq-h">
          <h2 id="faq-h" className="mb-3 text-base font-semibold text-fg">Common questions</h2>
          <FaqList items={catalog.faqs.filter((f) => f.group !== 'Organisers')} />
        </section>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Contact support" description="We reply within one working day (simulated)." />
            <form onSubmit={submit} noValidate className="grid gap-4 p-5">
              <Input label="Subject" required value={v.subject} onValueChange={(x) => setV({ ...v, subject: x })} error={errors.subject} />
              <Select label="Related order (optional)" value={v.order} onValueChange={(x) => setV({ ...v, order: x })} options={[{ value: '', label: 'None' }, ...orders.map((o) => ({ value: o.id, label: `${o.id} — ${catalog.seminarById.get(o.lines[0]!.seminarId)?.title ?? ''}` }))]} />
              <Textarea label="Message" required value={v.message} onValueChange={(x) => setV({ ...v, message: x })} error={errors.message} rows={5} />
              <div className="flex justify-end"><Button type="submit"><LifeBuoy className="size-4" aria-hidden="true" />Send request</Button></div>
            </form>
          </Card>
          <Card>
            <CardHeader title="Your requests" />
            {requests.length === 0 ? (
              <p className="p-5 text-sm text-muted">No support requests yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {requests.map((r) => (
                  <li key={r.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-fg">{r.subject}</p>
                      <StatusBadge status="open" />
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">{r.message}</p>
                    <p className="mt-1 text-xs text-muted">{r.id} · {formatDateTime(r.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};
