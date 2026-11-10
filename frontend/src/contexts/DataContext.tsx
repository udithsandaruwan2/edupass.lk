import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMocks } from '../api/client';
import { listCategoriesApi, listPublicSeminars } from '../api/seminars';
import { buildDemoData, calcFee, makeTickets, type DemoData } from '../data/mock';
import { readStorage, writeStorage } from '../hooks/usePersistentState';
import type { CartItem, Notification, Order, PaymentMethod, Role, Seminar, Ticket } from '../types';
import { makeId } from '../utils/random';

const STORAGE_KEY = 'edupass-demo-data-v1';

type Collections = { [K in keyof DemoData as DemoData[K] extends { id: string }[] ? K : never]: DemoData[K] };
type CollectionKey = keyof Collections;
type ItemOf<K extends CollectionKey> = Collections[K][number];

export interface CheckoutInput {
  studentId: string;
  items: CartItem[];
  buyer: Order['buyer'];
  attendees: string[];
  paymentMethod: PaymentMethod;
  /** The demo lets the user choose whether the simulated payment succeeds */
  outcome: 'success' | 'failure';
}

interface DataContextValue {
  data: DemoData;
  setData: React.Dispatch<React.SetStateAction<DemoData>>;
  upsert: <K extends CollectionKey>(key: K, item: ItemOf<K>) => void;
  patch: <K extends CollectionKey>(key: K, id: string, changes: Partial<ItemOf<K>>) => void;
  remove: <K extends CollectionKey>(key: K, id: string) => void;
  update: <K extends keyof DemoData>(key: K, value: DemoData[K]) => void;
  placeOrder: (input: CheckoutInput) => Order;
  checkIn: (code: string, seminarId?: string) => { ok: boolean; message: string; ticket?: Ticket };
  notify: (audience: Role, title: string, body: string, link?: string) => void;
  resetDemo: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DemoData>(() => readStorage(STORAGE_KEY, buildDemoData));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (useMocks()) writeStorage(STORAGE_KEY, data);
  }, [data]);

  /** When mocks are off, hydrate public catalogue from Nest. */
  useEffect(() => {
    if (useMocks()) return;
    let cancelled = false;
    void (async () => {
      try {
        const [seminars, categories] = await Promise.all([
          listPublicSeminars(),
          listCategoriesApi(),
        ]);
        if (cancelled) return;
        setData((d) => ({
          ...d,
          seminars,
          categories: categories.length ? categories : d.categories,
        }));
      } catch {
        // Keep local demo snapshot if API is unreachable during UI tests.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upsert = useCallback(<K extends CollectionKey>(key: K, item: ItemOf<K>) => {
    setData((d) => {
      const list = d[key] as ItemOf<K>[];
      const exists = list.some((x) => x.id === item.id);
      return { ...d, [key]: exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list] };
    });
  }, []);

  const patch = useCallback(<K extends CollectionKey>(key: K, id: string, changes: Partial<ItemOf<K>>) => {
    setData((d) => ({ ...d, [key]: (d[key] as ItemOf<K>[]).map((x) => (x.id === id ? { ...x, ...changes } : x)) }));
  }, []);

  const remove = useCallback(<K extends CollectionKey>(key: K, id: string) => {
    setData((d) => ({ ...d, [key]: (d[key] as ItemOf<K>[]).filter((x) => x.id !== id) }));
  }, []);

  const update = useCallback(<K extends keyof DemoData>(key: K, value: DemoData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  }, []);

  const notify = useCallback((audience: Role, title: string, body: string, link?: string) => {
    const n: Notification = { id: makeId('ntf'), audience, title, body, link, read: false, createdAt: new Date().toISOString() };
    setData((d) => ({ ...d, notifications: [n, ...d.notifications] }));
  }, []);

  const placeOrder = useCallback((input: CheckoutInput): Order => {
    const lines = input.items.map((item) => {
      const sem = data.seminars.find((s) => s.id === item.seminarId);
      const type = sem?.ticketTypes.find((t) => t.id === item.ticketTypeId);
      if (!sem || !type) throw new Error('A cart item is no longer available');
      return { seminarId: item.seminarId, ticketTypeId: item.ticketTypeId, quantity: item.quantity, unitPrice: type.price };
    });
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const fee = calcFee(subtotal, data.settings.bookingFeePercent);
    const order: Order = {
      id: makeId('ORD'),
      studentId: input.studentId,
      lines,
      subtotal,
      fee,
      total: subtotal + fee,
      status: input.outcome === 'success' ? 'paid' : 'failed',
      paymentMethod: input.paymentMethod,
      buyer: input.buyer,
      createdAt: new Date().toISOString(),
    };
    const tickets = makeTickets(order, input.buyer.name).map((t, i) => ({ ...t, holderName: input.attendees[i]?.trim() || input.buyer.name }));

    setData((d) => {
      const seminars: Seminar[] =
        order.status === 'paid'
          ? d.seminars.map((s) => ({
              ...s,
              ticketTypes: s.ticketTypes.map((t) => {
                const qty = lines.filter((l) => l.ticketTypeId === t.id).reduce((n, l) => n + l.quantity, 0);
                return qty ? { ...t, sold: t.sold + qty } : t;
              }),
            }))
          : d.seminars;
      const n: Notification =
        order.status === 'paid'
          ? { id: makeId('ntf'), audience: 'student', title: 'Booking confirmed (demo)', body: `Order ${order.id}: ${tickets.length} ticket${tickets.length === 1 ? '' : 's'} added to My Tickets.`, createdAt: order.createdAt, read: false, link: '/student/tickets' }
          : { id: makeId('ntf'), audience: 'student', title: 'Payment failed (demo)', body: `Order ${order.id} was not completed. No tickets were issued.`, createdAt: order.createdAt, read: false, link: '/cart' };
      return { ...d, seminars, orders: [order, ...d.orders], tickets: [...tickets, ...d.tickets], notifications: [n, ...d.notifications] };
    });
    return order;
  }, [data.seminars, data.settings.bookingFeePercent]);

  const checkIn = useCallback((rawCode: string, seminarId?: string) => {
    // Accept either the printed code or the full QR payload
    const code = rawCode.trim().toUpperCase().replace(/^EDUPASS-DEMO:/, '');
    const ticket = data.tickets.find((t) => t.code === code);
    if (!ticket) return { ok: false, message: `No ticket found with code ${code || '(empty)'}.` };
    if (seminarId && ticket.seminarId !== seminarId) return { ok: false, message: 'This ticket is for a different seminar.', ticket };
    if (ticket.status === 'cancelled') return { ok: false, message: 'This ticket was cancelled or refunded.', ticket };
    if (ticket.status === 'checked_in') return { ok: false, message: 'Already checked in — this ticket cannot be used twice.', ticket };
    const checkedInAt = new Date().toISOString();
    setData((d) => ({ ...d, tickets: d.tickets.map((t) => (t.id === ticket.id ? { ...t, status: 'checked_in', checkedInAt } : t)) }));
    return { ok: true, message: `${ticket.holderName} checked in.`, ticket: { ...ticket, status: 'checked_in' as const, checkedInAt } };
  }, [data.tickets]);

  const resetDemo = useCallback(() => setData(buildDemoData()), []);

  const value = useMemo(
    () => ({ data, setData, upsert, patch, remove, update, placeOrder, checkIn, notify, resetDemo }),
    [data, upsert, patch, remove, update, placeOrder, checkIn, notify, resetDemo],
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
