import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  ChevronDown, CircleHelp, CreditCard, Compass, Mail, MapPin, MessageSquare, Phone, RotateCcw, Search, ShieldCheck, Ticket, UserCog,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Card, EmptyState, Notice, SectionHeader, container } from '../../components/ui/Primitives';
import { contactRequest } from '../../api/auth';
import { ApiError } from '../../api/client';
import { useMocks } from '../../api/client';
import { useToast } from '../../contexts/ToastContext';
import { useCatalog } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { FaqItem } from '../../types';
import { formatCompact } from '../../utils/format';
import { email, minLength, required, runValidators } from '../../utils/validation';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Page not found');
  return (
    <div className={`${container} py-20`}>
      <EmptyState
        icon={<Compass className="size-5" aria-hidden="true" />}
        as="h1"
        title="We couldn't find that page"
        description="The link may be old, or the seminar is no longer listed."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button to="/">Go home</Button>
            <Button to="/seminars" variant="secondary">Explore seminars</Button>
          </div>
        }
      />
    </div>
  );
};

export const AboutPage: React.FC = () => {
  useDocumentTitle('About us');
  const { listed, organisers, lecturers, tickets } = useCatalog();
  const stats = [
    { label: 'Upcoming seminars', value: listed.length },
    { label: 'Organisers', value: organisers.filter((o) => o.status === 'active').length },
    { label: 'Lecturers', value: lecturers.filter((l) => l.status === 'active').length },
    { label: 'Tickets issued', value: tickets.length },
  ];
  return (
    <div className={`${container} max-w-5xl py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="About EduPass" title="Making exam seminars easy to find and book" description="EduPass brings A/L and O/L seminars, paper classes and revision days into one place, with QR tickets that make entry quick." />
      <Notice tone="warning" className="mb-10">
        Platform statistics reflect live catalogue activity on EduPass.
      </Notice>
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-1 text-3xl font-bold text-fg">{formatCompact(s.value)}</dd>
          </Card>
        ))}
      </dl>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {[
          { icon: Search, title: 'For students', body: 'Search by subject, lecturer or district, compare ticket types, and keep every QR ticket in one place.' },
          { icon: Ticket, title: 'For organisers', body: 'Publish seminars, set ticket types and capacity, follow sales in real time and check attendees in at the door.' },
          { icon: ShieldCheck, title: 'Trust & safety', body: 'Organisers are reviewed before their first listing, and every ticket can only be scanned once.' },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <span className="flex size-11 items-center justify-center rounded-md bg-brand/10 text-brand"><Icon className="size-5" aria-hidden="true" /></span>
            <h2 className="mt-4 text-lg font-semibold text-fg">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TOPICS = [
  { value: 'booking', label: 'A booking or ticket' },
  { value: 'refund', label: 'Refunds' },
  { value: 'organiser', label: 'Listing seminars as an organiser' },
  { value: 'other', label: 'Something else' },
];

export const ContactPage: React.FC = () => {
  useDocumentTitle('Contact us');
  const [params] = useSearchParams();
  const toast = useToast();
  const usingMocks = useMocks();
  const [submitting, setSubmitting] = useState(false);
  const initialTopic = TOPICS.some((t) => t.value === params.get('topic')) ? params.get('topic')! : 'booking';
  const [values, setValues] = useState({ name: '', email: '', topic: initialTopic, message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof values) => (v: string) => setValues({ ...values, [k]: v });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = runValidators(values, { name: [required('Your name')], email: [required('Email'), email], message: [required('Message'), minLength('Message', 20)] });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    void (async () => {
      if (!usingMocks) {
        setSubmitting(true);
        try {
          await contactRequest({
            name: values.name.trim(),
            email: values.email.trim(),
            topic: values.topic,
            message: values.message.trim(),
          });
          setSent(true);
          toast('Message sent', { description: 'Our team will reply within one working day.' });
        } catch (err) {
          toast(err instanceof ApiError ? err.message : 'Could not send message', { tone: 'error' });
        } finally {
          setSubmitting(false);
        }
        return;
      }
      setSent(true);
      toast('Message sent (demo)', { description: 'Nothing was actually sent in this demo build.' });
    })();
  };

  return (
    <div className={`${container} py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="Contact" title="Get in touch" description="Questions about a booking, a refund or listing your seminar? Send us a message." />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="p-5 sm:p-8">
          {sent ? (
            <div role="status" className="py-10 text-center">
              <MessageSquare className="mx-auto size-10 text-success" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold text-fg">Thanks, {values.name.split(' ')[0]}!</h2>
              <p className="mt-2 text-sm text-muted">
                {usingMocks
                  ? `In a live build our team would reply to ${values.email} within one working day. This demo did not send anything.`
                  : `We'll reply to ${values.email} within one working day.`}
              </p>
              <Button variant="secondary" className="mt-6" onClick={() => { setSent(false); setValues({ name: '', email: '', topic: 'booking', message: '' }); }}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
              <Input label="Your name" required autoComplete="name" value={values.name} onValueChange={set('name')} error={errors.name} />
              <Input label="Email" required type="email" autoComplete="email" value={values.email} onValueChange={set('email')} error={errors.email} />
              <Select label="Topic" value={values.topic} onValueChange={set('topic')} options={TOPICS} className="sm:col-span-2" />
              <Textarea label="Message" required rows={6} value={values.message} onValueChange={set('message')} error={errors.message} hint="At least 20 characters. Include your order number if you have one." className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" disabled={submitting}>{submitting ? 'Sending…' : 'Send message'}</Button>
              </div>
            </form>
          )}
        </Card>
        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: usingMocks ? 'support@edupass.demo' : 'support@edupass.lk' },
            { icon: Phone, label: 'Phone', value: usingMocks ? '011 000 0000 (demo)' : '011 7 000 000' },
            { icon: MapPin, label: 'Office', value: 'Colombo, Sri Lanka' },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="flex items-center gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand"><Icon className="size-4.5" aria-hidden="true" /></span>
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="text-sm font-semibold text-fg">{value}</p>
              </div>
            </Card>
          ))}
          <Card className="p-5">
            <p className="text-sm font-semibold text-fg">Looking for a quick answer?</p>
            <p className="mt-1 text-sm text-muted">Most questions are answered in the FAQ.</p>
            <Button to="/faq" variant="secondary" size="sm" className="mt-3">Read the FAQ</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const FaqList: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
      {items.map((f) => {
        const isOpen = open === f.id;
        return (
          <li key={f.id}>
            <h3>
              <button type="button" aria-expanded={isOpen} aria-controls={`${f.id}-panel`} onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-fg hover:bg-surface-2 sm:text-base">
                {f.question}
                <ChevronDown className={`size-5 shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </h3>
            {isOpen && (
              <div id={`${f.id}-panel`} className="px-5 pb-5 text-sm leading-relaxed text-muted">{f.answer}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export const FaqPage: React.FC = () => {
  useDocumentTitle('FAQ');
  const { faqs } = useCatalog();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<string>('All');
  const groups = ['All', ...new Set(faqs.map((f) => f.group))];
  const visible = faqs.filter((f) => (group === 'All' || f.group === group) && `${f.question} ${f.answer}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className={`${container} max-w-4xl py-10 sm:py-14`}>
      <SectionHeader as="h1" eyebrow="FAQ" title="Frequently asked questions" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input label="Search questions" hideLabel type="search" placeholder="Search questions…" value={q} onValueChange={setQ} className="flex-1" leading={<Search className="size-4" aria-hidden="true" />} />
        <Select label="Topic" hideLabel value={group} onValueChange={setGroup} options={groups.map((g) => ({ value: g, label: g === 'All' ? 'All topics' : g }))} className="sm:w-48" />
      </div>
      {visible.length ? (
        <FaqList key={group + q} items={visible} />
      ) : (
        <EmptyState icon={<CircleHelp className="size-5" aria-hidden="true" />} title="No questions match" description="Try other words, or contact us directly." action={<Button to="/contact" size="sm">Contact us</Button>} />
      )}
    </div>
  );
};

const HELP_TOPICS = [
  { icon: Ticket, title: 'Booking & tickets', body: 'Booking, attendee names, QR codes and entry.', group: 'Tickets' },
  { icon: CreditCard, title: 'Payments', body: 'Payment methods, booking fees and receipts.', group: 'Payments' },
  { icon: RotateCcw, title: 'Refunds & cancellations', body: 'How refunds work and when they arrive.', group: 'Payments' },
  { icon: UserCog, title: 'Your account', body: 'Passwords, profile details and notifications.', group: 'Account' },
  { icon: Compass, title: 'For organisers', body: 'Listing seminars, ticket types and check-in.', group: 'Organisers' },
  { icon: ShieldCheck, title: 'Safety & policies', body: 'Terms, privacy and how we review organisers.', group: 'Booking' },
] as const;

export const HelpCenterPage: React.FC = () => {
  useDocumentTitle('Help centre');
  const { faqs } = useCatalog();
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  const results = q.trim() ? faqs.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(q.toLowerCase())) : topic ? faqs.filter((f) => f.group === topic) : [];
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">Help centre</p>
        <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">How can we help?</h1>
        <Input label="Search help articles" hideLabel type="search" placeholder="e.g. refund, QR code, password" value={q} onValueChange={(v) => { setQ(v); setTopic(null); }} className="mt-6" leading={<Search className="size-4" aria-hidden="true" />} />
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HELP_TOPICS.map(({ icon: Icon, title, body, group }) => (
          <li key={title}>
            <button type="button" aria-pressed={topic === group && !q} onClick={() => { setTopic(group); setQ(''); }} className={`flex h-full w-full gap-4 rounded-lg border bg-surface p-5 text-left transition-colors hover:border-brand/40 ${topic === group && !q ? 'border-brand' : 'border-line'}`}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand"><Icon className="size-5" aria-hidden="true" /></span>
              <span>
                <span className="block font-semibold text-fg">{title}</span>
                <span className="mt-1 block text-sm text-muted">{body}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {(q.trim() || topic) && (
        <section aria-live="polite" className="mx-auto mt-10 max-w-3xl">
          <h2 className="mb-4 text-lg font-bold text-fg">{results.length} {results.length === 1 ? 'article' : 'articles'}</h2>
          {results.length ? <FaqList key={q + topic} items={results} /> : <EmptyState icon={<CircleHelp className="size-5" aria-hidden="true" />} title="No articles found" description="Our team can help directly." action={<Button to="/contact" size="sm">Contact support</Button>} />}
        </section>
      )}
      <Card className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-between gap-4 p-6 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-semibold text-fg">Still need help?</p>
          <p className="text-sm text-muted">Send us a message and we'll get back to you.</p>
        </div>
        <Button to="/contact">Contact support</Button>
      </Card>
    </div>
  );
};

interface LegalSection {
  heading: string;
  body: string[];
}

const LegalPage: React.FC<{ title: string; intro: string; sections: LegalSection[] }> = ({ title, intro, sections }) => {
  useDocumentTitle(title);
  return (
    <div className={`${container} max-w-3xl py-10 sm:py-14`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">Legal</p>
      <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{title}</h1>
      <p className="mt-3 text-muted">{intro}</p>
      <Notice tone="warning" className="mt-6">
        <strong>Template text for the demo build.</strong> This page is a placeholder and has not been reviewed by a lawyer. Replace it with reviewed policy text before any real launch.
      </Notice>
      <nav aria-label="On this page" className="mt-8 rounded-lg border border-line bg-surface p-5">
        <p className="text-sm font-semibold text-fg">On this page</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-brand">
          {sections.map((s, i) => (
            <li key={s.heading}><a href={`#section-${i + 1}`} className="hover:underline">{s.heading}</a></li>
          ))}
        </ol>
      </nav>
      <div className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <section key={s.heading} id={`section-${i + 1}`} aria-labelledby={`h-${i + 1}`} className="scroll-mt-24">
            <h2 id={`h-${i + 1}`} className="text-xl font-bold text-fg">{i + 1}. {s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-muted">{p}</p>
            ))}
          </section>
        ))}
      </div>
      <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
        Questions about this policy? <Link to="/contact" className="font-semibold text-brand hover:underline">Contact us</Link>.
      </p>
    </div>
  );
};

export const TermsPage: React.FC = () => (
  <LegalPage
    title="Terms and conditions"
    intro="These terms describe how EduPass, students and organisers work together when tickets are booked through the platform."
    sections={[
      { heading: 'Who we are', body: ['EduPass is a marketplace that lets organisers list academic seminars and lets students book tickets for them. The organiser is responsible for running each seminar.'] },
      { heading: 'Your account', body: ['You must give accurate details when you register and keep your password private. Students under 18 should have a parent or guardian’s permission.'] },
      { heading: 'Booking tickets', body: ['A booking is confirmed once payment succeeds and a ticket appears in My Tickets. Each ticket admits one person and can be scanned once.', 'Organisers may refuse entry if a ticket has already been used or was obtained fraudulently.'] },
      { heading: 'Prices and fees', body: ['Prices are shown in Sri Lankan rupees and include any taxes stated on the seminar page. A booking fee is shown before you pay.'] },
      { heading: 'Changes and cancellations', body: ['If an organiser cancels a seminar you receive a full refund. If the date, time or venue changes significantly, you may request a refund under the Refund Policy.'] },
      { heading: 'Organiser responsibilities', body: ['Organisers must describe seminars accurately, hold any permissions required for the venue, and honour every valid ticket.'] },
      { heading: 'Liability', body: ['EduPass is not responsible for the content or delivery of seminars beyond what the law requires.'] },
    ]}
  />
);

export const PrivacyPage: React.FC = () => (
  <LegalPage
    title="Privacy policy"
    intro="This policy explains what personal information EduPass collects and how it is used."
    sections={[
      { heading: 'Information we collect', body: ['Account details (name, email, phone, school and exam year), booking history, and technical data such as device type.'] },
      { heading: 'How we use it', body: ['To issue and verify tickets, send booking messages, provide support and prevent fraud. Marketing emails are only sent if you opt in.'] },
      { heading: 'Sharing with organisers', body: ['The organiser of a seminar you book receives the attendee name and ticket details needed for check-in.'] },
      { heading: 'Payments', body: ['Card details are handled by the payment provider and are never stored by EduPass.'] },
      { heading: 'Your choices', body: ['You can update your details, change notification settings or ask for your account to be deleted from Account Settings.'] },
      { heading: 'Retention', body: ['Booking records are kept for as long as required for accounting and legal purposes.'] },
    ]}
  />
);

export const RefundPolicyPage: React.FC = () => (
  <LegalPage
    title="Refund policy"
    intro="When and how ticket refunds are issued."
    sections={[
      { heading: 'Cancelled seminars', body: ['If the organiser cancels, every ticket is refunded in full, including the booking fee, automatically.'] },
      { heading: 'Rescheduled seminars', body: ['If the date changes, you can keep your ticket for the new date or request a refund within 7 days of the change.'] },
      { heading: 'Requesting a refund', body: ['You can request a refund from My Bookings up to 72 hours before the seminar starts. Requests are reviewed by the organiser and EduPass.'] },
      { heading: 'Non-refundable cases', body: ['Tickets that have been checked in, and requests made less than 72 hours before the start, are not normally refundable.'] },
      { heading: 'Timing', body: ['Approved refunds are returned to the original payment method. Banks usually take 5–10 working days to show the refund.'] },
    ]}
  />
);
