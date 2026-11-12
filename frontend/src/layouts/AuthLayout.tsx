import React, { Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import { BadgeCheck, QrCode, Ticket } from 'lucide-react';
import { Logo } from '../components/Navbar';
import { PageFallback } from './common';

const POINTS = [
  { icon: Ticket, text: 'Book seminars, paper classes and revision days in a few taps' },
  { icon: QrCode, text: 'Every ticket has its own QR code for fast entry' },
  { icon: BadgeCheck, text: 'Organisers are reviewed before their first listing goes live' },
];

export const AuthLayout: React.FC = () => (
  <div className="flex min-h-screen flex-col bg-page text-fg">
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-surface p-10 lg:flex">
        <Link to="/" className="w-fit rounded-md" aria-label="EduPass home">
          <Logo />
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-fg">
            Your next seminar is <span className="text-brand">one ticket away.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-muted">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="pt-2">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted">Secure sign-in for students, organisers, and platform admins.</p>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-40 size-[28rem] rounded-full bg-brand/8 blur-3xl" />
      </aside>
      <main id="main" className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <Link to="/" className="mb-8 rounded-md lg:hidden" aria-label="EduPass home">
          <Logo />
        </Link>
        <div className="w-full max-w-md">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  </div>
);
