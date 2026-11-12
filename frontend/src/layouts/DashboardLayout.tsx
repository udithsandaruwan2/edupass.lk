import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  BadgeDollarSign, BadgePercent, BarChart3, Bell, BookOpenCheck, CalendarCheck, CalendarClock, CalendarPlus, CircleHelp, ClipboardList,
  CreditCard, FileBarChart, FileText, FolderTree, Gauge, Heart, History, Image, LayoutDashboard, LifeBuoy, LogOut, Menu,
  Moon, Megaphone, PieChart, ReceiptText, RotateCcw, ScanLine, Settings, ShoppingCart, Sun, Tags, Ticket, TicketCheck,
  TrendingUp, User, UserCog, Users, UsersRound, Wallet, Warehouse, X, type LucideIcon,
} from 'lucide-react';
import { DEMO_ACCOUNTS, ROLE_HOME, ROLE_LABEL, hasEntitlement, useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Role } from '../types';
import { relativeTime } from '../utils/date';
import { Logo } from '../components/Navbar';
import { IconButton } from '../components/ui/Button';
import { MenuItem, Popover } from '../components/ui/Menu';
import { Avatar } from '../components/ui/Primitives';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV: Record<Role, { title: string; items: NavItem[] }[]> = {
  student: [
    { title: '', items: [{ to: '/student', label: 'Overview', icon: LayoutDashboard, end: true }] },
    {
      title: 'Bookings',
      items: [
        { to: '/student/bookings', label: 'My bookings', icon: ClipboardList },
        { to: '/student/upcoming', label: 'Upcoming seminars', icon: CalendarClock },
        { to: '/student/past', label: 'Past seminars', icon: CalendarCheck },
        { to: '/student/history', label: 'Booking history', icon: History },
      ],
    },
    {
      title: 'Tickets',
      items: [
        { to: '/student/tickets', label: 'My tickets', icon: Ticket },
        { to: '/student/class-fees', label: 'My class fees', icon: Wallet },
        { to: '/student/learning', label: 'Class learning', icon: FileText },
        { to: '/student/saved', label: 'Saved seminars', icon: Heart },
        { to: '/cart', label: 'Cart & checkout', icon: ShoppingCart },
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/student/notifications', label: 'Notifications', icon: Bell },
        { to: '/student/profile', label: 'Profile', icon: User },
        { to: '/student/settings', label: 'Settings', icon: Settings },
        { to: '/student/support', label: 'Help & support', icon: LifeBuoy },
      ],
    },
  ],
  organiser: [
    { title: '', items: [{ to: '/organiser', label: 'Overview', icon: LayoutDashboard, end: true }] },
    {
      title: 'Seminars',
      items: [
        { to: '/organiser/seminars', label: 'Seminar management', icon: BookOpenCheck, end: true },
        { to: '/organiser/seminars/new', label: 'Create seminar', icon: CalendarPlus },
        { to: '/organiser/tickets', label: 'Ticket types & pricing', icon: Tags },
        { to: '/organiser/availability', label: 'Ticket availability', icon: Warehouse },
      ],
    },
    {
      title: 'Attendance',
      items: [
        { to: '/organiser/bookings', label: 'Bookings', icon: ClipboardList },
        { to: '/organiser/attendees', label: 'Attendees', icon: UsersRound },
        { to: '/organiser/check-in', label: 'QR check-in', icon: ScanLine },
      ],
    },
    {
      title: 'Insights',
      items: [
        { to: '/organiser/revenue', label: 'Revenue analytics', icon: TrendingUp },
        { to: '/organiser/reports', label: 'Sales reports', icon: FileBarChart },
        { to: '/organiser/performance', label: 'Event performance', icon: Gauge },
      ],
    },
    {
      title: 'Organisation',
      items: [
        { to: '/organiser/lecturers', label: 'Lecturers', icon: Users },
        { to: '/organiser/notifications', label: 'Notifications', icon: Bell },
        { to: '/organiser/profile', label: 'Organiser profile', icon: User },
        { to: '/organiser/settings', label: 'Settings', icon: Settings },
      ],
    },
    {
      title: 'Institute',
      items: [
        { to: '/organiser/classes', label: 'Classes', icon: BookOpenCheck },
        { to: '/organiser/roster', label: 'Roster', icon: UsersRound },
        { to: '/organiser/class-attendance', label: 'Class attendance', icon: ClipboardList },
        { to: '/organiser/fees', label: 'Class fees', icon: ReceiptText },
        { to: '/organiser/lms', label: 'LMS', icon: FileText },
        { to: '/organiser/plan', label: 'Plan & usage', icon: BadgePercent },
        { to: '/organiser/staff', label: 'Staff', icon: UserCog },
      ],
    },
  ],
  lecturer: [
    { title: '', items: [{ to: '/lecturer', label: 'Overview', icon: LayoutDashboard, end: true }] },
    {
      title: 'Institute',
      items: [
        { to: '/lecturer/classes', label: 'Classes', icon: BookOpenCheck },
        { to: '/lecturer/lms', label: 'LMS modules', icon: FileText },
      ],
    },
    {
      title: 'Account',
      items: [
        { to: '/lecturer/settings', label: 'Settings', icon: Settings },
      ],
    },
  ],
  scanner: [
    {
      title: '',
      items: [{ to: '/organiser/check-in', label: 'QR check-in', icon: ScanLine, end: true }],
    },
  ],
  admin: [
    {
      title: '',
      items: [
        { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
        { to: '/admin/revenue', label: 'Revenue overview', icon: PieChart },
      ],
    },
    {
      title: 'People',
      items: [
        { to: '/admin/users', label: 'User management', icon: UserCog },
        { to: '/admin/organisers', label: 'Organisers', icon: Users },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        { to: '/admin/seminars', label: 'Seminars', icon: BookOpenCheck },
        { to: '/admin/categories', label: 'Categories', icon: FolderTree },
      ],
    },
    {
      title: 'Sales',
      items: [
        { to: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
        { to: '/admin/tickets', label: 'Tickets', icon: TicketCheck },
        { to: '/admin/payments', label: 'Payment records', icon: CreditCard },
        { to: '/admin/refunds', label: 'Refund requests', icon: RotateCcw },
      ],
    },
    {
      title: 'Content',
      items: [
        { to: '/admin/content', label: 'Content & FAQ', icon: FileText },
        { to: '/admin/banners', label: 'Homepage banners', icon: Image },
        { to: '/admin/notifications', label: 'Notifications', icon: Megaphone },
      ],
    },
    {
      title: 'Platform',
      items: [
        { to: '/admin/reports', label: 'Reports & analytics', icon: BarChart3 },
        { to: '/admin/plans', label: 'Subscription plans', icon: BadgeDollarSign },
        { to: '/admin/settings', label: 'Platform settings', icon: Settings },
        { to: '/admin/profile', label: 'Admin profile', icon: User },
      ],
    },
  ],
};

const ROLE_ICONS: Record<Role, LucideIcon> = {
  student: Ticket,
  organiser: BadgeDollarSign,
  admin: ReceiptText,
  lecturer: Users,
  scanner: ScanLine,
};

const INSTITUTE_NAV_TITLE = 'Institute';

function navForRole(role: Role, showInstitute: boolean) {
  if (role === 'scanner') return NAV.scanner;
  if (role === 'lecturer') return NAV.lecturer;
  if (role !== 'organiser') return NAV[role];
  return NAV.organiser.filter((section) => section.title !== INSTITUTE_NAV_TITLE || showInstitute);
}

const Sidebar: React.FC<{ role: Role; onNavigate?: () => void }> = ({ role, onNavigate }) => {
  const { user, usingMocks } = useAuth();
  // API sessions always carry entitlements; mock demo organisers omit them → show institute for local demo only
  const showInstitute =
    role === 'organiser' &&
    (user?.entitlements ? hasEntitlement(user, 'INSTITUTE') : usingMocks);
  const sections = navForRole(role, showInstitute);

  return (
    <nav aria-label={`${ROLE_LABEL[role]} dashboard`} className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {sections.map((section, i) => (
        <div key={section.title || i}>
          {section.title && <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">{section.title}</p>}
          <ul className="space-y-0.5">
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-brand/10 text-brand-strong' : 'text-muted hover:bg-surface-2 hover:text-fg'
                    }`
                  }
                >
                  <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

const NotificationsMenu: React.FC<{ role: Role }> = ({ role }) => {
  const { data, setData } = useData();
  const navigate = useNavigate();
  const mine = data.notifications.filter((n) => n.audience === role);
  const unread = mine.filter((n) => !n.read).length;
  const markAll = () => setData((d) => ({ ...d, notifications: d.notifications.map((n) => (n.audience === role ? { ...n, read: true } : n)) }));

  return (
    <Popover
      className="w-[min(22rem,calc(100vw-2rem))]"
      trigger={(p) => (
        <button type="button" {...p} aria-label={`Notifications, ${unread} unread`} title="Notifications" className="relative inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg">
          <Bell className="size-4.5" aria-hidden="true" />
          {unread > 0 && <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-page" />}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-fg">Notifications</p>
            <button type="button" onClick={markAll} disabled={!unread} className="text-xs font-semibold text-brand hover:underline disabled:text-muted disabled:no-underline">
              Mark all read
            </button>
          </div>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto">
            {mine.slice(0, 5).map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    setData((d) => ({ ...d, notifications: d.notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x)) }));
                    close();
                    if (n.link) navigate(n.link);
                  }}
                  className="flex w-full gap-3 px-4 py-3 text-left hover:bg-surface-2"
                >
                  <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-brand'}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-fg">
                      {n.title}
                      {!n.read && <span className="sr-only"> (unread)</span>}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">{n.body}</span>
                    <span className="mt-1 block text-xs text-muted">{relativeTime(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
            {mine.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">You're all caught up.</li>}
          </ul>
          <div className="border-t border-line p-2">
            <MenuItem onClick={() => { close(); navigate(`/${role}/notifications`); }} className="justify-center text-brand">
              View all notifications
            </MenuItem>
          </div>
        </div>
      )}
    </Popover>
  );
};

/** Mock-only role switcher for offline UI demos. Hidden in API / production mode. */
export const RoleSwitcher: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { user, switchRole, usingMocks } = useAuth();
  const navigate = useNavigate();
  if (!usingMocks) return null;
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="role-switch" className={compact ? 'sr-only' : 'hidden text-xs font-semibold text-muted xl:block'}>
        Mock role
      </label>
      <select
        id="role-switch"
        value={user?.role}
        onChange={(e) => {
          const role = e.target.value as Role;
          switchRole(role);
          navigate(ROLE_HOME[role]);
        }}
        className="h-9 rounded-md border border-line bg-surface px-2 text-sm font-semibold text-fg"
      >
        {(Object.keys(DEMO_ACCOUNTS) as Role[]).map((r) => (
          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
        ))}
      </select>
    </div>
  );
};

export const DashboardLayout: React.FC<{ role: Role }> = ({ role: layoutRole }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const role = user?.role === 'scanner' ? 'scanner' : layoutRole;
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const RoleIcon = ROLE_ICONS[role];

  useEffect(() => setDrawerOpen(false), [location.pathname]);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <div className="min-h-screen bg-page text-fg">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-brand-solid focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-brand">
        Skip to content
      </a>
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
          <div className="flex h-16 items-center border-b border-line px-5">
            <Link to="/" className="rounded-md" aria-label="EduPass home">
              <Logo />
            </Link>
          </div>
          <Sidebar role={role} />
          <div className="border-t border-line p-3">
            <Link to="/" className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-fg">
              <CircleHelp className="size-4.5" aria-hidden="true" />
              Back to public site
            </Link>
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard navigation">
            <div className="absolute inset-0 animate-fade-in bg-black/60" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <div className="relative flex h-full w-72 max-w-[85vw] animate-fade-in flex-col border-r border-line bg-surface">
              <div className="flex h-16 items-center justify-between border-b border-line px-4">
                <Logo />
                <IconButton label="Close navigation" onClick={() => setDrawerOpen(false)}>
                  <X className="size-5" aria-hidden="true" />
                </IconButton>
              </div>
              <Sidebar role={role} onNavigate={() => setDrawerOpen(false)} />
              <div className="border-t border-line p-3">
                <RoleSwitcher />
              </div>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-page/85 px-4 backdrop-blur-md sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <IconButton label="Open navigation" onClick={() => setDrawerOpen(true)} className="lg:hidden" aria-expanded={drawerOpen}>
                <Menu className="size-5" aria-hidden="true" />
              </IconButton>
              <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-fg">
                <RoleIcon className="size-4 shrink-0 text-brand" aria-hidden="true" />
                <span className="truncate">{ROLE_LABEL[role]} dashboard</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="hidden sm:block">
                <RoleSwitcher />
              </div>
              <NotificationsMenu role={role} />
              <IconButton label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle}>
                <ThemeIcon className="size-4.5" aria-hidden="true" />
              </IconButton>
              <Popover
                className="w-60 p-1.5"
                trigger={(p) => (
                  <button type="button" {...p} aria-label={`Account menu for ${user?.name}`} className="ml-1 rounded-full p-0.5 hover:bg-surface-2">
                    <Avatar name={user?.name ?? '?'} size="sm" />
                  </button>
                )}
              >
                {(close) => (
                  <>
                    <div className="border-b border-line px-3 pb-2.5 pt-1.5">
                      <p className="truncate text-sm font-semibold text-fg">{user?.name}</p>
                      <p className="truncate text-xs text-muted">{user?.email}</p>
                    </div>
                    <div className="pt-1.5">
                      <MenuItem icon={<User className="size-4" aria-hidden="true" />} onClick={() => { close(); navigate(`/${role}/profile`); }}>Profile</MenuItem>
                      {role !== 'admin' && (
                        <MenuItem icon={<Settings className="size-4" aria-hidden="true" />} onClick={() => { close(); navigate(`/${role}/settings`); }}>Settings</MenuItem>
                      )}
                      <MenuItem icon={<LogOut className="size-4" aria-hidden="true" />} onClick={() => { close(); navigate('/logout'); }}>Log out</MenuItem>
                    </div>
                  </>
                )}
              </Popover>
            </div>
          </header>
          <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export const PageHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode; back?: { to: string; label: string } }> = ({ title, description, actions, back }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {back && (
        <Link to={back.to} className="mb-2 inline-flex text-sm font-semibold text-brand hover:underline">
          ← {back.label}
        </Link>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted sm:text-base">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
);
