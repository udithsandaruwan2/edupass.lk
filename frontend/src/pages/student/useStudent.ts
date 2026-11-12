import { useEffect, useMemo, useState } from 'react';
import {
  listStudentOrdersRequest,
  listStudentTicketsRequest,
  mapApiOrderStatus,
  mapApiPaymentMethod,
  mapApiTicketStatusToUi,
  type ApiOrder,
  type ApiTicket,
} from '../../api/commerce';
import { useAuth } from '../../contexts/AuthContext';
import { useCatalog } from '../../hooks/useCatalog';
import type { Order, Seminar, Ticket } from '../../types';

export interface TicketView extends Ticket {
  seminar: Seminar;
  typeName: string;
  upcoming: boolean;
}

function mapOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    studentId: o.studentUserId,
    lines: o.lines.map((l) => ({
      seminarId: l.seminarId,
      ticketTypeId: l.ticketTypeId,
      quantity: l.quantity,
      unitPrice: l.unitPriceLkr,
    })),
    subtotal: o.subtotalLkr,
    fee: o.bookingFeeLkr,
    total: o.totalLkr,
    status: mapApiOrderStatus(o.status),
    paymentMethod: mapApiPaymentMethod(o.paymentMethod),
    buyer: o.buyer,
    createdAt: o.createdAt,
  };
}

function mapTicket(t: ApiTicket): Ticket {
  return {
    id: t.id,
    code: t.code,
    orderId: t.orderId,
    studentId: t.studentUserId,
    seminarId: t.seminarId,
    ticketTypeId: t.ticketTypeId,
    holderName: t.holderName,
    status: mapApiTicketStatusToUi(t.status),
    checkedInAt: t.checkedInAt ?? undefined,
  };
}

/** The signed-in student's orders and tickets, joined to seminars. */
export function useStudent() {
  const { user, usingMocks } = useAuth();
  const catalog = useCatalog();
  const [apiOrders, setApiOrders] = useState<Order[] | null>(null);
  const [apiTickets, setApiTickets] = useState<Ticket[] | null>(null);

  useEffect(() => {
    if (usingMocks || !user?.accessToken || user.role !== 'student') {
      setApiOrders(null);
      setApiTickets(null);
      return;
    }
    let cancelled = false;
    void Promise.all([
      listStudentOrdersRequest(user.accessToken),
      listStudentTicketsRequest(user.accessToken),
    ])
      .then(([orders, tickets]) => {
        if (cancelled) return;
        setApiOrders(orders.map(mapOrder));
        setApiTickets(tickets.map(mapTicket));
      })
      .catch(() => {
        if (cancelled) return;
        setApiOrders([]);
        setApiTickets([]);
      });
    return () => {
      cancelled = true;
    };
  }, [usingMocks, user?.accessToken, user?.role]);

  return useMemo(() => {
    const id = user?.id ?? '';
    const now = Date.now();
    const profile = catalog.students.find((s) => s.id === id);
    const orders = usingMocks
      ? catalog.orders.filter((o) => o.studentId === id)
      : (apiOrders ?? []);
    const rawTickets = usingMocks
      ? catalog.tickets.filter((t) => t.studentId === id)
      : (apiTickets ?? []);
    const tickets: TicketView[] = rawTickets
      .flatMap((t) => {
        const seminar = catalog.seminarById.get(t.seminarId);
        return seminar
          ? [
              {
                ...t,
                seminar,
                typeName: catalog.ticketTypeName(t.seminarId, t.ticketTypeId),
                upcoming: new Date(seminar.startsAt).getTime() > now,
              },
            ]
          : [];
      })
      .sort((a, b) => a.seminar.startsAt.localeCompare(b.seminar.startsAt));
    const refunds = catalog.refunds.filter((r) => r.studentId === id);
    return {
      id,
      profile,
      orders,
      tickets,
      refunds,
      catalog,
      loading: !usingMocks && (apiOrders === null || apiTickets === null),
    };
  }, [user, catalog, usingMocks, apiOrders, apiTickets]);
}
