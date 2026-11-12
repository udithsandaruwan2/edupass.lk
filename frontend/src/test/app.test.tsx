import { act, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Providers } from '../contexts/Providers';
import { useData } from '../contexts/DataContext';
import { buildDemoData } from '../data/mock';
import { NAV } from '../layouts/DashboardLayout';
import type { Role } from '../types';
import { renderApp } from './render';

const seed = buildDemoData();
const upcoming = seed.seminars.find((s) => s.id === 'sem-cmaths-paper')!;

describe('booking journey', () => {
  it('goes from seminar details to a confirmed QR ticket', async () => {
    const user = userEvent.setup();
    renderApp(`/seminars/${upcoming.slug}`);

    expect(await screen.findByRole('heading', { level: 1, name: upcoming.title })).toBeInTheDocument();

    // Select 2 standard tickets; totals update
    const increase = screen.getByRole('button', { name: 'Increase Standard seat quantity' });
    await user.click(increase);
    await user.click(increase);
    const price = upcoming.ticketTypes.find((t) => t.name === 'Standard seat')!.price;
    const subtotal = (price * 2).toLocaleString('en-LK', { minimumFractionDigits: 2 });
    expect(screen.getAllByText(`LKR ${subtotal}`).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /book now/i }));

    // Cart
    expect(await screen.findByRole('heading', { name: 'Your cart' }, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('2 tickets · up to 6 per order')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /checkout/i }));

    // Not signed in: continue as the mock student
    await user.click(await screen.findByRole('button', { name: 'Continue as mock student' }));

    // Details are prefilled; terms must be accepted
    await user.click(await screen.findByRole('button', { name: 'Continue to payment' }));
    expect(await screen.findByText('Please accept the terms to continue')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /I agree/i }));
    await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

    // Bank transfer is the live method; card is disabled
    expect(await screen.findByRole('heading', { name: 'Payment method' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /bank transfer/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /card/i })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /pay lkr/i }));

    // Simulated processing, then confirmation with 2 tickets
    expect(await screen.findByRole('heading', { name: 'Booking confirmed' }, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your tickets (2)' })).toBeInTheDocument();
    expect(screen.getAllByTitle(/QR code for ticket EDP-/)).toHaveLength(2);

    // Inventory and cart were updated
    const stored = JSON.parse(localStorage.getItem('edupass-demo-data-v1')!);
    const std = stored.seminars.find((s: { id: string }) => s.id === upcoming.id).ticketTypes.find((t: { name: string }) => t.name === 'Standard seat');
    expect(std.sold).toBe(upcoming.ticketTypes.find((t) => t.name === 'Standard seat')!.sold + 2);
    expect(JSON.parse(localStorage.getItem('edupass-demo-cart')!)).toEqual([]);
  }, 15000);

  it('shows the failure screen and keeps the cart when the demo payment is declined', async () => {
    const user = userEvent.setup();
    localStorage.setItem('edupass-demo-cart', JSON.stringify([{ seminarId: upcoming.id, ticketTypeId: upcoming.ticketTypes[0]!.id, quantity: 1 }]));
    renderApp('/checkout', 'student');
    await user.click(await screen.findByRole('checkbox', { name: /I agree/i }));
    await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
    await user.click(await screen.findByRole('radio', { name: /bank transfer/i }));
    await user.click(screen.getByRole('radio', { name: 'Payment is declined' }));
    await user.click(screen.getByRole('button', { name: /pay lkr/i }));
    expect(await screen.findByRole('heading', { name: 'Payment declined' }, { timeout: 4000 })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('edupass-demo-cart')!)).toHaveLength(1);
  }, 15000);
});

describe('check-in', () => {
  it('admits a valid ticket once and rejects the second scan', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <Providers>{children}</Providers>
      </MemoryRouter>
    );
    const { result } = renderHook(() => useData(), { wrapper });
    const ticket = result.current.data.tickets.find((t) => t.status === 'valid')!;
    let first!: ReturnType<typeof result.current.checkIn>;
    act(() => {
      first = result.current.checkIn(`EDUPASS-DEMO:${ticket.code}`);
    });
    expect(first.ok).toBe(true);
    const second = result.current.checkIn(ticket.code.toLowerCase());
    expect(second.ok).toBe(false);
    expect(second.message).toMatch(/already checked in/i);
    expect(result.current.checkIn('EDP-NOPE').ok).toBe(false);
    const other = result.current.data.tickets.find((t) => t.status === 'valid' && t.seminarId !== ticket.seminarId)!;
    expect(result.current.checkIn(other.code, ticket.seminarId).message).toMatch(/different seminar/i);
  });
});

describe('access & roles', () => {
  it('redirects guests from dashboards to login', async () => {
    renderApp('/student/tickets');
    expect(await screen.findByRole('heading', { name: 'Welcome back' }, { timeout: 4000 })).toBeInTheDocument();
  });

  it('offers a role switch when the role does not match', async () => {
    const user = userEvent.setup();
    renderApp('/admin', 'student');
    await user.click(await screen.findByRole('button', { name: 'Switch to Admin' }, { timeout: 4000 }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Admin overview' }, { timeout: 4000 })).toBeInTheDocument();
  });

  it('logs in from the login form and lands on the organiser dashboard', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.click(await screen.findByRole('tab', { name: 'Organiser' }));
    await user.click(screen.getByRole('button', { name: 'Log in as organiser' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Lumina Academy' }, { timeout: 4000 })).toBeInTheDocument();
  });
});

describe('every route renders', () => {
  const publicRoutes = [
    '/', '/seminars', '/seminars/filters', `/seminars/${upcoming.slug}`, '/search?q=maths', '/categories', '/categories/paper-class', '/featured',
    '/upcoming', '/lecturers', '/lecturers/lec-dilan', '/organisers', '/organisers/lumina-academy', '/about', '/contact', '/faq', '/help',
    '/terms', '/privacy', '/refunds', '/cart', '/does-not-exist',
  ];
  const authRoutes = ['/login', '/register', '/register/organiser', '/forgot-password', '/verify-otp', '/reset-password', '/select-account', '/logout'];

  it.each(publicRoutes)('public %s', async (path) => {
    renderApp(path);
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 4000 })).toBeInTheDocument();
  });

  it.each(authRoutes)('auth %s', async (path) => {
    renderApp(path);
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 4000 })).toBeInTheDocument();
  });

  const dashboardRoutes = (Object.keys(NAV) as Role[]).flatMap((role) =>
    NAV[role].flatMap((s) => s.items.map((i) => [role, i.to] as const)).filter(([, to]) => to.startsWith(`/${role}`)),
  );
  const extra: (readonly [Role, string])[] = [
    ['student', `/student/tickets/${seed.tickets.find((t) => t.studentId === 'stu-demo')!.id}`],
    ['organiser', '/organiser/seminars/sem-econ-system/edit'],
    ['organiser', '/organiser/seminars/sem-econ-system/preview'],
  ];

  it.each([...dashboardRoutes, ...extra])('%s %s', async (role, path) => {
    renderApp(path, role);
    const main = await screen.findByRole('main', {}, { timeout: 4000 });
    expect(await within(main).findByRole('heading', { level: 1 }, { timeout: 4000 })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/couldn't find that page/i)).not.toBeInTheDocument());
  });
});
