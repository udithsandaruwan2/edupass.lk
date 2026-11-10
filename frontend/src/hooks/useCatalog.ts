import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import type { Seminar } from '../types';

export const seatsLeft = (s: Seminar) => s.ticketTypes.reduce((n, t) => n + (t.capacity - t.sold), 0);
export const capacityOf = (s: Seminar) => s.ticketTypes.reduce((n, t) => n + t.capacity, 0);
export const soldOf = (s: Seminar) => s.ticketTypes.reduce((n, t) => n + t.sold, 0);
export const fromPrice = (s: Seminar) => Math.min(...s.ticketTypes.map((t) => t.price));
export const isUpcoming = (s: Seminar, now = Date.now()) => new Date(s.startsAt).getTime() > now;

/** Lookup helpers over the demo dataset. */
export function useCatalog() {
  const { data } = useData();
  return useMemo(() => {
    const seminarById = new Map(data.seminars.map((s) => [s.id, s]));
    const lecturerById = new Map(data.lecturers.map((l) => [l.id, l]));
    const organiserById = new Map(data.organisers.map((o) => [o.id, o]));
    const categoryById = new Map(data.categories.map((c) => [c.id, c]));
    const studentById = new Map(data.students.map((s) => [s.id, s]));
    const now = Date.now();

    /** Published seminars that are still ahead, soonest first */
    const listed = data.seminars
      .filter((s) => s.status === 'published' && isUpcoming(s, now))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    const ticketTypeName = (seminarId: string, ticketTypeId: string) =>
      seminarById.get(seminarId)?.ticketTypes.find((t) => t.id === ticketTypeId)?.name ?? 'Ticket';

    return {
      ...data,
      listed,
      seminarById,
      lecturerById,
      organiserById,
      categoryById,
      studentById,
      seminarBySlug: (slug: string) => data.seminars.find((s) => s.slug === slug),
      ticketTypeName,
    };
  }, [data]);
}

export type Catalog = ReturnType<typeof useCatalog>;
