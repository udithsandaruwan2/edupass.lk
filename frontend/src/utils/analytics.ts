import type { Order, Seminar } from '../types';
import { lastMonths, monthKey } from './date';

export const paidOrders = (orders: Order[]) => orders.filter((o) => o.status === 'paid');

export const ticketsIn = (o: Order) => o.lines.reduce((n, l) => n + l.quantity, 0);

/** Revenue (subtotal, excluding booking fees) and tickets per month for the last n months. */
export function monthlySeries(orders: Order[], months = 6) {
  const buckets = lastMonths(months).map((m) => ({ ...m, revenue: 0, tickets: 0, orders: 0 }));
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const o of paidOrders(orders)) {
    const i = index.get(monthKey(o.createdAt));
    if (i === undefined) continue;
    buckets[i]!.revenue += o.subtotal;
    buckets[i]!.tickets += ticketsIn(o);
    buckets[i]!.orders += 1;
  }
  return buckets;
}

/** Daily revenue for the last n days (for trend lines). */
export function dailyRevenue(orders: Order[], days = 30) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const out = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { date: d, label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), value: 0 };
  });
  for (const o of paidOrders(orders)) {
    const t = new Date(o.createdAt).getTime();
    const i = Math.floor((t - start.getTime()) / 86400000);
    if (i >= 0 && i < days) out[i]!.value += o.subtotal;
  }
  return out;
}

/** Percentage change between the last two values of a series. */
export function changePct(series: number[]) {
  const a = series[series.length - 2] ?? 0;
  const b = series[series.length - 1] ?? 0;
  if (!a) return b ? 100 : 0;
  return Math.round(((b - a) / a) * 100);
}

/** Groups order revenue by a key derived from the order's seminar; keeps the top n and folds the rest into "Other". */
export function revenueBy(orders: Order[], seminarById: Map<string, Seminar>, keyOf: (s: Seminar) => string, top = 4) {
  const totals = new Map<string, number>();
  for (const o of paidOrders(orders)) {
    for (const l of o.lines) {
      const s = seminarById.get(l.seminarId);
      if (!s) continue;
      const k = keyOf(s);
      totals.set(k, (totals.get(k) ?? 0) + l.unitPrice * l.quantity);
    }
  }
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, top - 1).map(([label, value]) => ({ label, value }));
  const rest = sorted.slice(top - 1).reduce((s, [, v]) => s + v, 0);
  if (sorted.length <= top) return sorted.map(([label, value]) => ({ label, value }));
  return [...head, { label: 'Other', value: rest }];
}

export function seminarStats(s: Seminar, orders: Order[]) {
  const mine = paidOrders(orders).filter((o) => o.lines.some((l) => l.seminarId === s.id));
  const revenue = mine.reduce((n, o) => n + o.lines.filter((l) => l.seminarId === s.id).reduce((m, l) => m + l.unitPrice * l.quantity, 0), 0);
  const capacity = s.ticketTypes.reduce((n, t) => n + t.capacity, 0);
  const sold = s.ticketTypes.reduce((n, t) => n + t.sold, 0);
  return { revenue, capacity, sold, orders: mine.length, fill: capacity ? Math.round((sold / capacity) * 100) : 0 };
}
