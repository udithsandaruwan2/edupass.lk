import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import {
  ArrowRight, ChevronDown, GraduationCap, LayoutDashboard, LogIn, LogOut, Menu, Moon, Search, ShoppingCart, Sun, User, X,
} from 'lucide-react';
import { ROLE_HOME, ROLE_LABEL, useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCatalog, fromPrice } from '../hooks/useCatalog';
import { formatShortDate } from '../utils/date';
import { formatLKR } from '../utils/format';
import { categoryIcon } from './icons';
import { SeminarCover } from './SeminarCover';
import { Button, IconButton } from './ui/Button';
import { Popover, MenuItem } from './ui/Menu';
import { Avatar, Badge, container } from './ui/Primitives';

const NAV_LINKS = [
  { to: '/seminars', label: 'Explore' },
  { to: '/upcoming', label: 'Upcoming' },
  { to: '/featured', label: 'Featured' },
  { to: '/lecturers', label: 'Lecturers' },
  { to: '/help', label: 'Help' },
];

const navItemClasses = (active: boolean) =>
  `relative flex h-full items-center gap-1 px-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${
    active ? 'text-fg after:bg-brand' : 'text-muted hover:text-fg after:bg-transparent'
  }`;

export const Logo: React.FC = () => (
  <span className="flex items-center gap-2.5">
    <span className="flex size-9 items-center justify-center rounded-md bg-brand-mark text-[#111214]">
      <GraduationCap className="size-5" aria-hidden="true" />
    </span>
    <span className="flex flex-col">
      <span className="text-lg font-bold leading-none tracking-tight text-fg">
        Edu<span className="text-brand">Pass</span>
      </span>
      <span className="mt-1 hidden text-xs font-semibold uppercase leading-none tracking-wider text-muted sm:block">
        Academic Ticketing
      </span>
    </span>
  </span>
);

const UserMenu: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) {
    return (
      <Button to="/login" variant="secondary" size="sm" className="ml-1">
        <LogIn className="size-4" aria-hidden="true" />
        Log in
      </Button>
    );
  }
  return (
    <Popover
      className="w-60 p-1.5"
      trigger={(p) => (
        <button type="button" {...p} aria-label={`Account menu for ${user.name}`} className="ml-1 flex items-center gap-2 rounded-full p-0.5 hover:bg-surface-2">
          <Avatar name={user.name} size="sm" />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="border-b border-line px-3 pb-2.5 pt-1.5">
            <p className="truncate text-sm font-semibold text-fg">{user.name}</p>
            <p className="truncate text-xs text-muted">{ROLE_LABEL[user.role]}</p>
          </div>
          <div className="pt-1.5">
            <MenuItem icon={<LayoutDashboard className="size-4" aria-hidden="true" />} onClick={() => { close(); navigate(ROLE_HOME[user.role]); }}>
              My dashboard
            </MenuItem>
            <MenuItem icon={<LogOut className="size-4" aria-hidden="true" />} onClick={() => { close(); navigate('/logout'); }}>
              Log out
            </MenuItem>
          </div>
        </>
      )}
    </Popover>
  );
};

export const Navbar: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { count } = useCart();
  const { user } = useAuth();
  const { categories, listed } = useCatalog();
  const location = useLocation();

  // Close menus on navigation
  useEffect(() => {
    setIsMenuOpen(false);
    setMegaOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaOpen(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const ThemeIcon = theme === 'dark' ? Sun : Moon;
  const themeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  const cartLabel = `Cart, ${count} ${count === 1 ? 'ticket' : 'tickets'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/85 backdrop-blur-md supports-[backdrop-filter]:bg-page/75">
      <div className={container}>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="shrink-0 rounded-md" aria-label="EduPass home">
            <Logo />
          </Link>

          {/* Desktop navigation; the mega menu renders inside this wrapper so the pointer can travel into it */}
          <div className="hidden h-16 xl:flex" onMouseLeave={() => setMegaOpen(false)}>
            <nav aria-label="Main" className="flex h-full items-stretch">
              <button
                type="button"
                aria-expanded={megaOpen}
                aria-controls="mega-seminars"
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => setMegaOpen((o) => !o)}
                className={navItemClasses(megaOpen || location.pathname.startsWith('/categories'))}
              >
                Categories
                <ChevronDown aria-hidden="true" className={`size-4 transition-transform duration-200 ${megaOpen ? 'rotate-180 text-brand' : ''}`} />
              </button>
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} onMouseEnter={() => setMegaOpen(false)} className={({ isActive }) => navItemClasses(isActive)}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {megaOpen && (
              <div id="mega-seminars" className="absolute inset-x-0 top-[calc(100%-2px)] pt-2">
                <div className="mx-auto w-full max-w-6xl px-8">
                  <div className="grid animate-pop-in grid-cols-12 gap-6 rounded-lg border border-line bg-surface p-6 shadow-overlay">
                    <div className="col-span-5 border-r border-line pr-5">
                      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted">Browse by category</p>
                      <ul className="grid grid-cols-1 gap-0.5">
                        {categories.map((cat) => {
                          const Icon = categoryIcon(cat.icon);
                          return (
                            <li key={cat.id}>
                              <Link to={`/categories/${cat.slug}`} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-2">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand/10 text-brand">
                                  <Icon className="size-4" aria-hidden="true" />
                                </span>
                                {cat.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="col-span-7">
                      <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-fg">Coming up next</h2>
                        <Link to="/upcoming" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                          All upcoming <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      </div>
                      <ul className="space-y-1">
                        {listed.slice(0, 4).map((sem) => (
                          <li key={sem.id}>
                            <Link to={`/seminars/${sem.slug}`} className="flex items-center justify-between gap-4 rounded-md p-2.5 transition-colors hover:bg-surface-2">
                              <span className="flex min-w-0 items-center gap-3">
                                <SeminarCover seminar={sem} compact className="size-12 shrink-0 rounded-sm" />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-fg">{sem.title}</span>
                                  <span className="block truncate text-xs text-muted">{formatShortDate(sem.startsAt)} · {sem.venue}</span>
                                </span>
                              </span>
                              <span className="shrink-0 text-sm font-bold text-fg">{formatLKR(fromPrice(sem))}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop utilities */}
          <div className="hidden items-center gap-1 xl:flex">
            <button
              type="button"
              onClick={onOpenSearch}
              className="mr-1 flex h-10 w-40 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-brand/50 hover:text-fg 2xl:w-56"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span>Search seminars…</span>
            </button>
            <IconButton label={themeLabel} onClick={toggle}>
              <ThemeIcon className="size-4.5" aria-hidden="true" />
            </IconButton>
            <Link to="/cart" aria-label={cartLabel} title={cartLabel} className="relative inline-flex size-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg">
              <ShoppingCart className="size-4.5" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-brand-solid px-1 text-xs font-bold leading-4.5 text-on-brand" aria-hidden="true">
                  {count}
                </span>
              )}
            </Link>
            <UserMenu />
          </div>

          {/* Mobile utilities */}
          <div className="flex items-center gap-1 xl:hidden">
            <IconButton label="Search seminars" onClick={onOpenSearch} className="size-11">
              <Search className="size-5" aria-hidden="true" />
            </IconButton>
            <Link to="/cart" aria-label={cartLabel} className="relative inline-flex size-11 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg">
              <ShoppingCart className="size-5" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute right-1 top-1 flex min-w-4.5 items-center justify-center rounded-full bg-brand-solid px-1 text-xs font-bold leading-4.5 text-on-brand" aria-hidden="true">
                  {count}
                </span>
              )}
            </Link>
            <IconButton
              label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="size-11 text-fg"
            >
              {isMenuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
            </IconButton>
          </div>
        </div>

        {isMenuOpen && (
          <div id="mobile-menu" className="max-h-[calc(100dvh-4rem)] animate-pop-in space-y-4 overflow-y-auto border-t border-line py-4 xl:hidden">
            <nav aria-label="Mobile" className="grid gap-0.5">
              {[{ to: '/categories', label: 'Categories' }, ...NAV_LINKS, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `flex h-12 items-center rounded-md px-3 text-base font-semibold transition-colors hover:bg-surface-2 ${isActive ? 'text-brand' : 'text-fg'}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <Button variant="secondary" size="sm" onClick={toggle}>
                <ThemeIcon className="size-4" aria-hidden="true" />
                {theme === 'dark' ? 'Light theme' : 'Dark theme'}
              </Button>
              {user ? (
                <div className="flex gap-2">
                  <Button to={ROLE_HOME[user.role]} size="sm">
                    <User className="size-4" aria-hidden="true" />
                    Dashboard
                  </Button>
                  <Button to="/logout" variant="secondary" size="sm">Log out</Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button to="/login" variant="secondary" size="sm">Log in</Button>
                  <Button to="/register" size="sm">Sign up</Button>
                </div>
              )}
            </div>
            {user && <Badge tone="neutral">Signed in as {ROLE_LABEL[user.role]}</Badge>}
          </div>
        )}
      </div>
    </header>
  );
};
