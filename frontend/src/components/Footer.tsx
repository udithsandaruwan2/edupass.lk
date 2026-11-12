import React, { useState } from 'react';
import { Link } from 'react-router';
import { Mail } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { email as emailRule } from '../utils/validation';
import { container } from './ui/Primitives';
import { Button } from './ui/Button';
import { Logo } from './Navbar';

const LINK_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'All seminars', to: '/seminars' },
      { label: 'Upcoming', to: '/upcoming' },
      { label: 'Featured', to: '/featured' },
      { label: 'Categories', to: '/categories' },
      { label: 'Syllabus resources', to: '/#syllabus' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Lecturers', to: '/lecturers' },
      { label: 'Organisers', to: '/organisers' },
      { label: 'List your seminar', to: '/register/organiser' },
      { label: 'About EduPass', to: '/about' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Help centre', to: '/help' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & conditions', to: '/terms' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Refund policy', to: '/refunds' },
    ],
  },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = emailRule(email);
    setError(msg);
    if (msg) return;
    setEmail('');
    toast('Thanks for subscribing', { description: 'We will email product updates when available.' });
  };

  return (
    <footer className="border-t border-line bg-surface/40">
      <div className={`${container} space-y-12 py-12 sm:py-16`}>
        <section aria-labelledby="newsletter-title" className="grid items-center gap-6 rounded-lg border border-line bg-surface p-6 sm:p-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <h2 id="newsletter-title" className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
              New seminars in your inbox
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              One email a week with newly listed seminars and paper classes. Unsubscribe any time.
            </p>
          </div>
          <form onSubmit={subscribe} noValidate className="flex min-w-0 flex-col gap-2">
            <div className="flex min-w-0 gap-2">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'newsletter-error' : undefined}
                placeholder="Student or parent email"
                className={`h-11 min-w-0 flex-1 rounded-md border bg-page px-4 text-sm text-fg placeholder:text-muted transition-colors focus-visible:border-brand ${error ? 'border-danger' : 'border-line'}`}
              />
              <Button type="submit">
                <Mail className="size-4" aria-hidden="true" />
                Subscribe
              </Button>
            </div>
            {error && <p id="newsletter-error" className="text-xs font-semibold text-danger">{error}</p>}
          </form>
        </section>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-8">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Discover and book A/L and O/L seminars, paper classes and revision workshops across Sri Lanka.
            </p>
          </div>

          {LINK_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-semibold text-fg">{col.title}</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="rounded-sm transition-colors hover:text-fg">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EduPass.</p>
          <p>Academic seminar tickets for Sri Lanka.</p>
        </div>
      </div>
    </footer>
  );
};
