import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCatalog } from '../../hooks/useCatalog';
import type { Seminar, Ticket } from '../../types';

export interface TicketView extends Ticket {
  seminar: Seminar;
  typeName: string;
  upcoming: boolean;
}

/** The signed-in student's orders and tickets, joined to seminars. */
export function useStudent() {
  const { user } = useAuth();
  const catalog = useCatalog();
  return useMemo(() => {
    const id = user?.id ?? '';
    const now = Date.now();
    const profile = catalog.students.find((s) => s.id === id);
    const orders = catalog.orders.filter((o) => o.studentId === id);
    const tickets: TicketView[] = catalog.tickets
      .filter((t) => t.studentId === id)
      .flatMap((t) => {
        const seminar = catalog.seminarById.get(t.seminarId);
        return seminar ? [{ ...t, seminar, typeName: catalog.ticketTypeName(t.seminarId, t.ticketTypeId), upcoming: new Date(seminar.startsAt).getTime() > now }] : [];
      })
      .sort((a, b) => a.seminar.startsAt.localeCompare(b.seminar.startsAt));
    const refunds = catalog.refunds.filter((r) => r.studentId === id);
    return { id, profile, orders, tickets, refunds, catalog };
  }, [user, catalog]);
}
