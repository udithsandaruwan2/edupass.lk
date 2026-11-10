import { useEffect, useMemo, useState } from 'react';
import { listOrganiserSeminars } from '../../api/seminars';
import { useAuth } from '../../contexts/AuthContext';
import { useCatalog } from '../../hooks/useCatalog';
import type { Seminar } from '../../types';

/** The signed-in organiser's seminars, orders and tickets. */
export function useOrganiser() {
  const { user, usingMocks } = useAuth();
  const catalog = useCatalog();
  const [apiSeminars, setApiSeminars] = useState<Seminar[] | null>(null);

  useEffect(() => {
    if (usingMocks || !user?.accessToken || !user.organisationId) {
      setApiSeminars(null);
      return;
    }
    let cancelled = false;
    void listOrganiserSeminars(user.organisationId, user.accessToken)
      .then((rows) => {
        if (!cancelled) setApiSeminars(rows);
      })
      .catch(() => {
        if (!cancelled) setApiSeminars([]);
      });
    return () => {
      cancelled = true;
    };
  }, [usingMocks, user?.accessToken, user?.organisationId]);

  return useMemo(() => {
    const id = user?.organisationId ?? user?.id ?? '';
    const mockOrgId = user?.id ?? '';
    const seminars = (
      apiSeminars ??
      catalog.seminars.filter((s) => s.organiserId === mockOrgId)
    ).slice().sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const organiser =
      catalog.organiserById.get(mockOrgId) ??
      (user
        ? {
            id,
            name: user.name,
            slug: id,
            type: 'Independent lecturer' as const,
            city: '',
            about: '',
            email: user.email,
            phone: '',
            verified: true,
            status: 'active' as const,
            joinedAt: new Date().toISOString(),
          }
        : undefined);
    const ids = new Set(seminars.map((s) => s.id));
    const orders = catalog.orders.filter((o) => o.lines.some((l) => ids.has(l.seminarId)));
    const tickets = catalog.tickets.filter((t) => ids.has(t.seminarId));
    const lecturers = catalog.lecturers.filter(
      (l) => l.organiserId === mockOrgId || l.organiserId === id,
    );
    const refunds = catalog.refunds.filter((r) => orders.some((o) => o.id === r.orderId));
    return {
      id,
      organiser,
      seminars,
      orders,
      tickets,
      lecturers,
      refunds,
      catalog,
      refreshSeminars: setApiSeminars,
      usingApi: !usingMocks,
      seminarsLoading: !usingMocks && apiSeminars === null && Boolean(user?.accessToken),
    };
  }, [user, catalog, apiSeminars, usingMocks]);
}
