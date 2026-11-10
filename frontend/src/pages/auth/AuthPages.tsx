import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Building2, CheckCircle2, Eye, EyeOff, GraduationCap, KeyRound, LogOut, MailCheck, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Checkbox, Input, Select } from '../../components/ui/Field';
import { Card, Notice } from '../../components/ui/Primitives';
import { Tabs } from '../../components/ui/Tabs';
import { DEMO_ACCOUNTS, ROLE_HOME, ROLE_LABEL, useAuth, type DemoUser } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Organiser, Role, Student } from '../../types';
import { safeNext } from '../../utils/navigation';
import { slugify } from '../../utils/format';
import { makeId } from '../../utils/random';
import { email, minLength, password, phone, required, runValidators } from '../../utils/validation';

export const DEMO_OTP = '246810';

const AuthHeader: React.FC<{ title: string; description?: React.ReactNode; icon?: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="mb-6">
    {icon && <span className="mb-4 flex size-11 items-center justify-center rounded-md bg-brand/10 text-brand">{icon}</span>}
    <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{title}</h1>
    {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
  </div>
);

const PasswordInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string; hint?: string }> = ({ label, value, onChange, error, autoComplete, hint }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input label={label} type={show ? 'text' : 'password'} value={value} onValueChange={onChange} error={error} autoComplete={autoComplete} hint={hint} required />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-[30px] flex size-8 items-center justify-center rounded-sm text-muted hover:text-fg">
        {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  useDocumentTitle('Log in');
  const { login, loginWithPassword, usingMocks } = useAuth();
  const { data } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>('student');
  const [values, setValues] = useState({
    email: usingMocks ? DEMO_ACCOUNTS.student.email : 'student@edupass.lk',
    password: usingMocks ? 'demo1234' : 'Password123!',
  });
  const [errors, setErrors] = useState<Partial<Record<'email' | 'password', string>>>({});
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const pickRole = (r: Role) => {
    setRole(r);
    setValues({
      email: usingMocks ? DEMO_ACCOUNTS[r].email : values.email,
      password: usingMocks ? 'demo1234' : values.password,
    });
    setErrors({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = runValidators(values, { email: [required('Email'), email], password: [required('Password'), minLength('Password', 8)] });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (!usingMocks) {
      setSubmitting(true);
      try {
        const session = await loginWithPassword(values.email, values.password);
        navigate(safeNext(params.get('next'), ROLE_HOME[session.role]), { replace: true });
      } catch (err) {
        toast('Sign-in failed', {
          tone: 'error',
          description: err instanceof Error ? err.message : 'Try again',
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    let user: DemoUser = DEMO_ACCOUNTS[role];
    const emailLc = values.email.toLowerCase();
    if (role === 'student') {
      const s = data.students.find((x) => x.email.toLowerCase() === emailLc);
      if (s) user = { role, id: s.id, name: s.name, email: s.email };
    } else if (role === 'organiser') {
      const o = data.organisers.find((x) => x.email.toLowerCase() === emailLc);
      if (o) user = { role, id: o.id, name: o.name, email: o.email };
    }
    login(user);
    navigate(safeNext(params.get('next'), ROLE_HOME[role]), { replace: true });
  };

  return (
    <>
      <AuthHeader title="Welcome back" description={<>New to EduPass? <Link to="/register" className="font-semibold text-brand hover:underline">Create an account</Link></>} />
      {usingMocks && (
        <Tabs label="Account type" value={role} onChange={pickRole} tabs={(['student', 'organiser', 'admin'] as Role[]).map((r) => ({ id: r, label: ROLE_LABEL[r] }))} className="mb-6" />
      )}
      <Notice tone="info" className="mb-5">
        {usingMocks ? (
          <><strong>Demo sign-in.</strong> Any password of 8+ characters works; nothing is checked or sent.</>
        ) : (
          <><strong>API sign-in.</strong> Use seeded accounts (e.g. student@edupass.lk / Password123!).</>
        )}
      </Notice>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" required value={values.email} onValueChange={(v) => setValues({ ...values, email: v })} error={errors.email} />
        <PasswordInput label="Password" autoComplete="current-password" value={values.password} onChange={(v) => setValues({ ...values, password: v })} error={errors.password} />
        <div className="flex items-center justify-between gap-3">
          <Checkbox label="Remember me" checked={remember} onChange={setRemember} />
          <Link to="/forgot-password" className="text-sm font-semibold text-brand hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : usingMocks ? `Log in as ${ROLE_LABEL[role].toLowerCase()}` : 'Log in'}
        </Button>
      </form>
      {usingMocks && (
        <p className="mt-6 text-center text-sm text-muted">
          Or <Link to={`/select-account${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`} className="font-semibold text-brand hover:underline">choose a demo account</Link>
        </p>
      )}
    </>
  );
};

export const SelectAccountPage: React.FC = () => {
  useDocumentTitle('Choose an account');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const icons = { student: GraduationCap, organiser: Building2, admin: ShieldCheck };
  const blurbs = { student: 'Book seminars, manage tickets and favourites.', organiser: 'Lumina Academy — manage seminars, sales and check-in.', admin: 'Oversee users, seminars, payments and content.' };
  return (
    <>
      <AuthHeader title="Choose a demo account" description="Switch between the three sample accounts at any time. There are no real permissions in this demo." />
      <ul className="space-y-3">
        {(Object.keys(DEMO_ACCOUNTS) as Role[]).map((r) => {
          const Icon = icons[r];
          const acc = DEMO_ACCOUNTS[r];
          return (
            <li key={r}>
              <button
                type="button"
                onClick={() => {
                  login(acc);
                  navigate(r === 'student' ? safeNext(params.get('next'), ROLE_HOME[r]) : ROLE_HOME[r]);
                }}
                className={`flex w-full items-center gap-4 rounded-lg border bg-surface p-4 text-left transition-colors hover:border-brand/50 ${user?.role === r ? 'border-brand' : 'border-line'}`}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand"><Icon className="size-5" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-fg">{ROLE_LABEL[r]} · {acc.name}</span>
                  <span className="block text-sm text-muted">{blurbs[r]}</span>
                </span>
                {user?.role === r && <span className="text-xs font-semibold text-brand">Current</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-center text-sm text-muted"><Link to="/login" className="font-semibold text-brand hover:underline">Back to log in</Link></p>
    </>
  );
};

const DISTRICTS = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Kurunegala', 'Anuradhapura', 'Jaffna', 'Other'];
const STREAMS = ['Commerce', 'Physical Science', 'Biological Science', 'Arts', 'Technology', 'O/L'];

export const RegisterStudentPage: React.FC = () => {
  useDocumentTitle('Create a student account');
  const { upsert, data } = useData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const year = new Date().getFullYear();
  const [v, setV] = useState({ name: '', email: '', phone: '', school: '', district: 'Colombo', stream: 'Commerce', examYear: String(year + 1), password: '', confirm: '' });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof v) => (x: string) => setV({ ...v, [k]: x });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = runValidators(v, { name: [required('Full name')], email: [required('Email'), email], phone: [required('Mobile number'), phone], school: [required('School')], password: [password] });
    if (v.confirm !== v.password) errs.confirm = 'Passwords do not match';
    if (data.students.some((s) => s.email.toLowerCase() === v.email.toLowerCase())) errs.email = 'An account with this email already exists';
    if (!agree) errs.agree = 'Please accept the terms';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const student: Student = { id: makeId('stu'), name: v.name.trim(), email: v.email.trim(), phone: v.phone, school: v.school, district: v.district, stream: v.stream, examYear: Number(v.examYear), status: 'active', joinedAt: new Date().toISOString() };
    upsert('students', student);
    const pending: DemoUser = { role: 'student', id: student.id, name: student.name, email: student.email };
    navigate('/verify-otp', { state: { purpose: 'register', user: pending, next: safeNext(params.get('next'), '/student') } });
  };

  return (
    <>
      <AuthHeader title="Create a student account" description={<>Already registered? <Link to="/login" className="font-semibold text-brand hover:underline">Log in</Link> · <Link to="/register/organiser" className="font-semibold text-brand hover:underline">Register as organiser</Link></>} />
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" required autoComplete="name" value={v.name} onValueChange={set('name')} error={errors.name} className="sm:col-span-2" />
        <Input label="Email" required type="email" autoComplete="email" value={v.email} onValueChange={set('email')} error={errors.email} />
        <Input label="Mobile number" required type="tel" autoComplete="tel" value={v.phone} onValueChange={set('phone')} error={errors.phone} />
        <Input label="School" required value={v.school} onValueChange={set('school')} error={errors.school} className="sm:col-span-2" />
        <Select label="District" value={v.district} onValueChange={set('district')} options={DISTRICTS.map((d) => ({ value: d, label: d }))} />
        <Select label="Stream" value={v.stream} onValueChange={set('stream')} options={STREAMS.map((d) => ({ value: d, label: d }))} />
        <Select label="Exam year" value={v.examYear} onValueChange={set('examYear')} options={[0, 1, 2].map((i) => ({ value: String(year + i), label: String(year + i) }))} className="sm:col-span-2" />
        <PasswordInput label="Password" autoComplete="new-password" value={v.password} onChange={set('password')} error={errors.password} hint="8+ characters with a letter and a number" />
        <PasswordInput label="Confirm password" autoComplete="new-password" value={v.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Checkbox className="sm:col-span-2" checked={agree} onChange={setAgree} error={errors.agree} label={<>I agree to the <Link to="/terms" className="font-semibold text-brand hover:underline">Terms</Link> and <Link to="/privacy" className="font-semibold text-brand hover:underline">Privacy Policy</Link></>} />
        <Button type="submit" size="lg" className="w-full sm:col-span-2">Create account</Button>
      </form>
    </>
  );
};

export const RegisterOrganiserPage: React.FC = () => {
  useDocumentTitle('Register as an organiser');
  const { upsert, notify } = useData();
  const navigate = useNavigate();
  const [v, setV] = useState({ orgName: '', type: 'Institute', city: '', contact: '', email: '', phone: '', password: '' });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof v) => (x: string) => setV({ ...v, [k]: x });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = runValidators(v, { orgName: [required('Organisation name')], city: [required('City')], contact: [required('Contact person')], email: [required('Email'), email], phone: [required('Phone'), phone], password: [password] });
    if (!agree) errs.agree = 'Please accept the organiser terms';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const org: Organiser = { id: makeId('org'), slug: slugify(v.orgName), name: v.orgName.trim(), type: v.type as Organiser['type'], city: v.city, about: `${v.orgName} is a new organiser on EduPass.`, email: v.email, phone: v.phone, verified: false, status: 'pending', joinedAt: new Date().toISOString() };
    upsert('organisers', org);
    notify('admin', 'Organiser awaiting approval', `${org.name} registered and needs verification.`, '/admin/organisers');
    navigate('/verify-otp', { state: { purpose: 'register', user: { role: 'organiser', id: org.id, name: v.contact, email: v.email } satisfies DemoUser, next: '/organiser' } });
  };

  return (
    <>
      <AuthHeader title="List your seminars on EduPass" description={<>Registering as a student? <Link to="/register" className="font-semibold text-brand hover:underline">Student sign-up</Link></>} />
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Organisation or lecturer name" required value={v.orgName} onValueChange={set('orgName')} error={errors.orgName} className="sm:col-span-2" />
        <Select label="Organiser type" value={v.type} onValueChange={set('type')} options={['Institute', 'Independent lecturer', 'School society'].map((x) => ({ value: x, label: x }))} />
        <Input label="City" required value={v.city} onValueChange={set('city')} error={errors.city} />
        <Input label="Contact person" required autoComplete="name" value={v.contact} onValueChange={set('contact')} error={errors.contact} className="sm:col-span-2" />
        <Input label="Work email" required type="email" autoComplete="email" value={v.email} onValueChange={set('email')} error={errors.email} />
        <Input label="Phone" required type="tel" autoComplete="tel" value={v.phone} onValueChange={set('phone')} error={errors.phone} />
        <div className="sm:col-span-2">
          <PasswordInput label="Password" autoComplete="new-password" value={v.password} onChange={set('password')} error={errors.password} hint="8+ characters with a letter and a number" />
        </div>
        <Notice className="sm:col-span-2">New organisers are reviewed by an admin before their first seminar goes live. You can set up seminars as drafts straight away.</Notice>
        <Checkbox className="sm:col-span-2" checked={agree} onChange={setAgree} error={errors.agree} label={<>I agree to the <Link to="/terms" className="font-semibold text-brand hover:underline">organiser terms</Link></>} />
        <Button type="submit" size="lg" className="w-full sm:col-span-2">Create organiser account</Button>
      </form>
    </>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  useDocumentTitle('Forgot password');
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = required('Email')(value) ?? email(value);
    setError(msg);
    if (!msg) navigate('/verify-otp', { state: { purpose: 'reset', email: value } });
  };
  return (
    <>
      <AuthHeader icon={<KeyRound className="size-5" aria-hidden="true" />} title="Forgot your password?" description="Enter your account email and we'll send a 6-digit code to reset it." />
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" required value={value} onValueChange={setValue} error={error ?? undefined} />
        <Button type="submit" size="lg" className="w-full">Send reset code</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted"><Link to="/login" className="font-semibold text-brand hover:underline">Back to log in</Link></p>
    </>
  );
};

interface OtpState {
  purpose: 'register' | 'reset';
  user?: DemoUser;
  next?: string;
  email?: string;
}

export const VerifyOtpPage: React.FC = () => {
  useDocumentTitle('Verify your email');
  const location = useLocation();
  const state = (location.state ?? { purpose: 'reset' }) as OtpState;
  const target = state.user?.email ?? state.email ?? 'your email';
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const setAt = (i: number, raw: string) => {
    const chars = raw.replace(/\D/g, '');
    if (chars.length > 1) {
      // Paste: spread digits across boxes
      const next = [...digits];
      chars.slice(0, 6 - i).split('').forEach((c, j) => (next[i + j] = c));
      setDigits(next);
      refs.current[Math.min(5, i + chars.length)]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = chars;
    setDigits(next);
    if (chars && i < 5) refs.current[i + 1]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) return setError('Enter all 6 digits');
    if (code !== DEMO_OTP) return setError('That code is not correct. The demo code is shown above.');
    if (state.purpose === 'register' && state.user) {
      login(state.user);
      toast('Email verified', { description: 'Your demo account is ready.' });
      navigate(state.next ?? ROLE_HOME[state.user.role], { replace: true });
    } else {
      navigate('/reset-password', { state: { email: state.email }, replace: true });
    }
  };

  return (
    <>
      <AuthHeader icon={<MailCheck className="size-5" aria-hidden="true" />} title="Check your email" description={<>We sent a 6-digit code to <span className="font-semibold text-fg">{target}</span>.</>} />
      <Notice tone="warning" className="mb-5">No email is sent in this demo. Use code <strong className="tracking-widest">{DEMO_OTP}</strong>.</Notice>
      <form onSubmit={submit} noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-fg">Verification code</legend>
          <div className="flex justify-between gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={d}
                onChange={(e) => setAt(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus();
                }}
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${i + 1}`}
                aria-invalid={Boolean(error)}
                maxLength={6}
                className={`h-14 w-full min-w-0 rounded-md border bg-page text-center text-xl font-bold text-fg focus-visible:border-brand ${error ? 'border-danger' : 'border-line'}`}
              />
            ))}
          </div>
        </fieldset>
        {error && <p role="alert" className="mt-2 text-xs font-semibold text-danger">{error}</p>}
        <Button type="submit" size="lg" className="mt-6 w-full">Verify</Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Didn't get it?{' '}
        <button type="button" disabled={cooldown > 0} onClick={() => { setCooldown(30); toast('Code resent (demo)', { tone: 'info', description: `Use ${DEMO_OTP}.` }); }} className="font-semibold text-brand hover:underline disabled:text-muted disabled:no-underline">
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </p>
    </>
  );
};

export const ResetPasswordPage: React.FC = () => {
  useDocumentTitle('Reset password');
  const navigate = useNavigate();
  const [v, setV] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = runValidators(v, { password: [password] });
    if (v.confirm !== v.password) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (!Object.keys(errs).length) setDone(true);
  };
  if (done) {
    return (
      <div role="status" className="text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-fg">Password updated</h1>
        <p className="mt-2 text-sm text-muted">In this demo nothing was stored — log in with any demo account.</p>
        <Button className="mt-6 w-full" size="lg" onClick={() => navigate('/login')}>Back to log in</Button>
      </div>
    );
  }
  return (
    <>
      <AuthHeader icon={<KeyRound className="size-5" aria-hidden="true" />} title="Set a new password" />
      <form onSubmit={submit} noValidate className="space-y-4">
        <PasswordInput label="New password" autoComplete="new-password" value={v.password} onChange={(x) => setV({ ...v, password: x })} error={errors.password} hint="8+ characters with a letter and a number" />
        <PasswordInput label="Confirm new password" autoComplete="new-password" value={v.confirm} onChange={(x) => setV({ ...v, confirm: x })} error={errors.confirm} />
        <Button type="submit" size="lg" className="w-full">Update password</Button>
      </form>
    </>
  );
};

export const LogoutPage: React.FC = () => {
  useDocumentTitle('Log out');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-fg">You're signed out</h1>
        <div className="mt-6 flex justify-center gap-2">
          <Button to="/login">Log in</Button>
          <Button to="/" variant="secondary">Home</Button>
        </div>
      </div>
    );
  }
  return (
    <Card className="p-8 text-center">
      <LogOut className="mx-auto size-10 text-brand" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold text-fg">Log out of EduPass?</h1>
      <p className="mt-2 text-sm text-muted">
        You're signed in as <span className="font-semibold text-fg">{user.name}</span> ({ROLE_LABEL[user.role].toLowerCase()}). Your demo cart and saved seminars stay on this device.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        <Button
          onClick={() => {
            logout();
            navigate('/', { replace: true });
          }}
        >
          Log out
        </Button>
      </div>
    </Card>
  );
};
