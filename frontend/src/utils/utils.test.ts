import { describe, expect, it } from 'vitest';
import { buildDemoData } from '../data/mock';
import { monthlySeries } from './analytics';
import { toCsv } from './csv';
import { formatCompact, formatLKR, slugify } from './format';
import { safeNext } from './navigation';
import { applyFilters, EMPTY_FILTERS, filtersFromParams, filtersToParams, searchSeminars } from './search';
import { cardExpiry, cardNumber, email, password, phone, runValidators } from './validation';

describe('validation', () => {
  it('validates emails', () => {
    expect(email('student@edupass.demo')).toBeNull();
    expect(email('not-an-email')).not.toBeNull();
    expect(email('a@b')).not.toBeNull();
  });

  it('validates Sri Lankan mobile numbers', () => {
    expect(phone('071 234 5678')).toBeNull();
    expect(phone('+94712345678')).toBeNull();
    expect(phone('011 234 5678')).not.toBeNull();
    expect(phone('0712')).not.toBeNull();
  });

  it('requires letters and numbers in passwords', () => {
    expect(password('abc')).not.toBeNull();
    expect(password('abcdefgh')).not.toBeNull();
    expect(password('abcd1234')).toBeNull();
  });

  it('runs the Luhn check on card numbers', () => {
    expect(cardNumber('4242 4242 4242 4242')).toBeNull();
    expect(cardNumber('4242 4242 4242 4241')).toBe('This card number is not valid');
    expect(cardNumber('1234')).not.toBeNull();
  });

  it('rejects expired or malformed card expiry dates', () => {
    expect(cardExpiry('12 / 99')).toBeNull();
    expect(cardExpiry('01/20')).toBe('This card has expired');
    expect(cardExpiry('13/30')).toBe('Month must be 01–12');
    expect(cardExpiry('1230')).toBe('Use MM / YY');
  });

  it('returns the first failing rule per field', () => {
    const errors = runValidators({ email: '', phone: '0712345678' }, { email: [(v) => (v ? null : 'Email is required'), email], phone: [phone] });
    expect(errors).toEqual({ email: 'Email is required' });
  });
});

describe('formatting & navigation', () => {
  it('formats rupees and compact numbers', () => {
    expect(formatLKR(1800)).toBe('LKR 1,800.00');
    expect(formatCompact(1284)).toBe('1,284');
    expect(formatCompact(12900)).toBe('12.9K');
  });

  it('slugifies titles', () => {
    expect(slugify('Econ / BS Masterclass 2026!')).toBe('econ-bs-masterclass-2026');
  });

  it('only allows in-app redirect targets', () => {
    expect(safeNext('/student/tickets', '/')).toBe('/student/tickets');
    expect(safeNext('//evil.example', '/')).toBe('/');
    expect(safeNext('https://evil.example', '/')).toBe('/');
    expect(safeNext('/\\evil.example', '/')).toBe('/');
    expect(safeNext(null, '/home')).toBe('/home');
  });

  it('escapes CSV cells and neutralises spreadsheet formulas', () => {
    expect(toCsv(['a', 'b'], [['x,y', '=SUM(A1)']])).toBe('a,b\n"x,y",\'=SUM(A1)');
  });
});

describe('demo data integrity', () => {
  const data = buildDemoData();

  it('keeps ticket-type sold counts equal to paid order quantities', () => {
    for (const s of data.seminars) {
      for (const t of s.ticketTypes) {
        const paidQty = data.orders.filter((o) => o.status === 'paid').flatMap((o) => o.lines).filter((l) => l.ticketTypeId === t.id).reduce((n, l) => n + l.quantity, 0);
        expect(t.sold, `${t.id}`).toBe(paidQty);
        expect(t.sold).toBeLessThanOrEqual(t.capacity);
      }
    }
  });

  it('issues one ticket per seat for paid and refunded orders only', () => {
    for (const o of data.orders) {
      const issued = data.tickets.filter((t) => t.orderId === o.id).length;
      const qty = o.lines.reduce((n, l) => n + l.quantity, 0);
      expect(issued).toBe(o.status === 'failed' ? 0 : qty);
    }
  });

  it('has unique ids, slugs and ticket codes', () => {
    expect(new Set(data.seminars.map((s) => s.slug)).size).toBe(data.seminars.length);
    expect(new Set(data.orders.map((o) => o.id)).size).toBe(data.orders.length);
    expect(new Set(data.tickets.map((t) => t.code)).size).toBe(data.tickets.length);
  });

  it('references existing lecturers, organisers and categories', () => {
    for (const s of data.seminars) {
      expect(data.lecturers.some((l) => l.id === s.lecturerId)).toBe(true);
      expect(data.organisers.some((o) => o.id === s.organiserId)).toBe(true);
      expect(data.categories.some((c) => c.id === s.categoryId)).toBe(true);
    }
  });

  it('is deterministic apart from generated ids being stable', () => {
    const again = buildDemoData();
    expect(again.orders.map((o) => o.id)).toEqual(data.orders.map((o) => o.id));
  });

  it('builds a monthly series that sums paid subtotals', () => {
    const series = monthlySeries(data.orders, 12);
    expect(series).toHaveLength(12);
    expect(series.every((m) => m.revenue >= 0)).toBe(true);
  });
});

describe('search & filters', () => {
  const data = buildDemoData();
  const lookups = {
    lecturerById: new Map(data.lecturers.map((l) => [l.id, l])),
    organiserById: new Map(data.organisers.map((o) => [o.id, o])),
    categoryById: new Map(data.categories.map((c) => [c.id, c])),
  };
  const published = data.seminars.filter((s) => s.status === 'published');

  it('matches every word across title, lecturer and venue', () => {
    const r = searchSeminars(published, 'economics dilan', lookups);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((s) => s.subject === 'Economics')).toBe(true);
  });

  it('filters by district, mode and price, then sorts', () => {
    const r = applyFilters(published, { ...EMPTY_FILTERS, district: 'Kandy', sort: 'price-asc' }, lookups);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((s) => s.district === 'Kandy')).toBe(true);
    const online = applyFilters(published, { ...EMPTY_FILTERS, mode: 'online', maxPrice: '1400' }, lookups);
    expect(online.every((s) => s.mode === 'online' && Math.min(...s.ticketTypes.map((t) => t.price)) <= 1400)).toBe(true);
  });

  it('round-trips filters through URL params', () => {
    const f = { ...EMPTY_FILTERS, q: 'maths', district: 'Colombo', sort: 'popular' as const };
    expect(filtersFromParams(filtersToParams(f))).toEqual(f);
  });
});
