import React, { Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SearchModal } from '../components/SearchModal';
import { useData } from '../contexts/DataContext';
import { PageFallback } from './common';

export interface PublicOutletContext {
  openSearch: () => void;
}

export const PublicLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { data } = useData();

  // "/" or Ctrl/Cmd+K opens search from anywhere on the public site
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest('input, textarea, select, [contenteditable="true"]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-brand-solid focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-brand"
      >
        Skip to content
      </a>
      {data.announcement.active && (
        <div className="bg-brand-solid px-4 py-2 text-center text-sm font-semibold text-on-brand">{data.announcement.message}</div>
      )}
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet context={{ openSearch: () => setSearchOpen(true) } satisfies PublicOutletContext} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};
