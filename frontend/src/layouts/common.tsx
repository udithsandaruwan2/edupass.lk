import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { FlaskConical } from 'lucide-react';
import { ROLE_LABEL, useAuth } from '../contexts/AuthContext';
import type { Role } from '../types';
import { Button } from '../components/ui/Button';
import { Card, Skeleton } from '../components/ui/Primitives';

/** Persistent strip that marks the whole build as a demonstration. */
export const DemoBanner: React.FC = () => (
  <div className="border-b border-warning/30 bg-warning/10 px-4 py-1.5 text-center text-xs font-semibold text-fg">
    <FlaskConical className="mr-1.5 inline size-3.5 align-[-2px] text-warning" aria-hidden="true" />
    Demo build: all seminars, people and bookings are sample data. No real payments or tickets.
  </div>
);

/** Scrolls to top on page change, or to the #hash target when present. */
export const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

/** Simulated route guard: sends guests to log in, and offers a role switch on mismatch. */
export const RequireRole: React.FC<{ role: Role; children: React.ReactNode }> = ({ role, children }) => {
  const { user, switchRole } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (user.role !== role) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-fg">This area is for {ROLE_LABEL[role]} accounts</h1>
          <p className="mt-2 text-sm text-muted">
            You are signed in as a {ROLE_LABEL[user.role].toLowerCase()}. In this demo you can switch roles instantly — there are no real permissions.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={() => switchRole(role)}>Switch to {ROLE_LABEL[role]} demo</Button>
            <Button to="/" variant="secondary">Back to site</Button>
          </div>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
};

/** Placeholder shown inside a layout while a lazily loaded page chunk arrives. */
export const PageFallback: React.FC = () => (
  <div className="mx-auto max-w-3xl space-y-4 px-4 py-16" role="status" aria-label="Loading page">
    <Skeleton className="h-9 w-1/2" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-64" />
  </div>
);
