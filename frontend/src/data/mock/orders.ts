// DEMO DATA — generated bookings. Nothing here is a real purchase.
import type { Order, OrderLine, PaymentMethod, Seminar, Student, Ticket } from '../../types';
import { createRandom, makeId } from '../../utils/random';
import { DEMO_STUDENT } from './people';

export const BOOKING_FEE_PERCENT = 3;

export const calcFee = (subtotal: number, percent = BOOKING_FEE_PERCENT) => Math.round((subtotal * percent) / 100);

const METHODS: PaymentMethod[] = ['card', 'card', 'card', 'bank_transfer', 'ez_cash', 'koko'];

export function makeTickets(order: Order, holderName: string, rand: () => number = Math.random): Ticket[] {
  if (order.status !== 'paid' && order.status !== 'refunded') return [];
  return order.lines.flatMap((line) =>
    Array.from({ length: line.quantity }, () => {
      const code = makeId('EDP', rand, 8);
      return {
        id: code.replace('EDP-', 'tkt-'),
        code,
        orderId: order.id,
        studentId: order.studentId,
        seminarId: line.seminarId,
        ticketTypeId: line.ticketTypeId,
        holderName,
        status: order.status === 'refunded' ? 'cancelled' : 'valid',
      } satisfies Ticket;
    }),
  );
}

function orderFor(student: Student, lines: OrderLine[], createdAt: string, status: Order['status'], method: PaymentMethod, rand: () => number): Order {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const fee = calcFee(subtotal);
  return {
    id: makeId('ORD', rand),
    studentId: student.id,
    lines,
    subtotal,
    fee,
    total: subtotal + fee,
    status,
    paymentMethod: method,
    buyer: { name: student.name, email: student.email, phone: student.phone },
    createdAt,
  };
}

/**
 * Generates bookings for every listed seminar and writes the resulting
 * `sold` counts back onto each ticket type so inventory and orders agree.
 */
export function generateOrders(seminars: Seminar[], students: Student[]) {
  const r = createRandom(42);
  const now = Date.now();
  const others = students.filter((s) => s.id !== DEMO_STUDENT.id);
  const orders: Order[] = [];
  const tickets: Ticket[] = [];

  for (const sem of seminars) {
    if (sem.status === 'draft') continue;
    const start = new Date(sem.startsAt).getTime();
    const opened = new Date(sem.createdAt).getTime();
    const salesEnd = Math.min(start, now);
    const isPast = start < now;
    for (const type of sem.ticketTypes) {
      const target = Math.round(type.capacity * (isPast ? 0.6 + r.next() * 0.3 : 0.25 + r.next() * 0.45));
      // `booked` counts every attempted seat; only paid orders consume inventory
      for (let booked = 0; booked < target; ) {
        const qty = Math.min(r.int(1, 3), target - booked);
        booked += qty;
        const student = r.pick(others);
        const createdAt = new Date(opened + r.next() * (salesEnd - opened)).toISOString();
        const failed = r.chance(0.04);
        const status: Order['status'] = sem.status === 'cancelled' ? 'refunded' : failed ? 'failed' : r.chance(0.015) ? 'refunded' : 'paid';
        const order = orderFor(student, [{ seminarId: sem.id, ticketTypeId: type.id, quantity: qty, unitPrice: type.price }], createdAt, status, r.pick(METHODS), r.next);
        orders.push(order);
        const issued = makeTickets(order, student.name, r.next);
        if (isPast) for (const t of issued) if (t.status === 'valid' && r.chance(0.88)) Object.assign(t, { status: 'checked_in', checkedInAt: sem.startsAt });
        tickets.push(...issued);
        if (status === 'paid') type.sold += qty;
      }
    }
  }

  // The demo student's own bookings
  const mine: [string, string, number, number, Order['status']][] = [
    ['sem-econ-system', 'sem-econ-system-std', 2, -6, 'paid'],
    ['sem-bs-target', 'sem-bs-target-onl', 1, -3, 'paid'],
    ['sem-econ-past', 'sem-econ-past-std', 1, -30, 'paid'],
    ['sem-bs-past', 'sem-bs-past-onl', 1, -60, 'paid'],
    ['sem-cancelled', 'sem-cancelled-std', 1, -10, 'refunded'],
  ];
  for (const [semId, typeId, qty, daysAgo, status] of mine) {
    const sem = seminars.find((s) => s.id === semId)!;
    const type = sem.ticketTypes.find((t) => t.id === typeId)!;
    const order = orderFor(DEMO_STUDENT, [{ seminarId: semId, ticketTypeId: typeId, quantity: qty, unitPrice: type.price }], new Date(now + daysAgo * 86400000).toISOString(), status, 'card', r.next);
    orders.push(order);
    const issued = makeTickets(order, DEMO_STUDENT.name, r.next);
    if (new Date(sem.startsAt).getTime() < now) for (const t of issued) Object.assign(t, { status: 'checked_in', checkedInAt: sem.startsAt });
    tickets.push(...issued);
    if (status === 'paid') type.sold += qty;
  }

  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { orders, tickets };
}
