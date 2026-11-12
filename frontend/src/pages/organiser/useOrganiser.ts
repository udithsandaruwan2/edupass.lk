import { useEffect, useMemo, useState } from 'react';
import {
  listOrganiserOrdersRequest,
  mapApiOrderStatus,
  mapApiPaymentMethod,
  type ApiOrder,
} from '../../api/commerce';
import { listOrganiserLecturers } from '../../api/lecturers';
import { listOrganiserSeminars } from '../../api/seminars';
import { useAuth } from '../../contexts/AuthContext';
import { useCatalog } from '../../hooks/useCatalog';
import type { Lecturer, Order, Seminar } from '../../types';

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

/** The signed-in organiser's seminars, orders and tickets. */
export function useOrganiser() {
  const { user, usingMocks } = useAuth();
  const catalog = useCatalog();
  const [apiSeminars, setApiSeminars] = useState<Seminar[] | null>(null);
  const [apiOrders, setApiOrders] = useState<Order[] | null>(null);
  const [apiLecturers, setApiLecturers] = useState<Lecturer[] | null>(null);

  const refreshOrganiserData = () => {
    if (usingMocks || !user?.accessToken || !user.organisationId) return;
    void Promise.all([
      listOrganiserSeminars(user.organisationId, user.accessToken),
      listOrganiserOrdersRequest(user.accessToken, user.organisationId),
      listOrganiserLecturers(user.accessToken, user.organisationId),
    ])
      .then(([seminars, orders, lecturers]) => {
        setApiSeminars(seminars);
        setApiOrders(orders.map(mapOrder));
        setApiLecturers(lecturers);
      })
      .catch(() => {
        setApiSeminars([]);
        setApiOrders([]);
        setApiLecturers([]);
      });
  };

  useEffect(() => {
    if (usingMocks || !user?.accessToken || !user.organisationId) {
      setApiSeminars(null);
      setApiOrders(null);
      setApiLecturers(null);
      return;
    }
    refreshOrganiserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const orders = usingMocks
      ? catalog.orders.filter((o) => o.lines.some((l) => ids.has(l.seminarId)))
      : (apiOrders ?? []);
    const tickets = catalog.tickets.filter((t) => ids.has(t.seminarId));
    const lecturers = usingMocks
      ? catalog.lecturers.filter((l) => l.organiserId === mockOrgId || l.organiserId === id)
      : (apiLecturers ?? []);
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
      refreshOrganiserData,
      usingApi: !usingMocks,
      seminarsLoading: !usingMocks && apiSeminars === null && Boolean(user?.accessToken),
    };
  }, [user, catalog, apiSeminars, apiOrders, apiLecturers, usingMocks]);
}
